/**
 * Compress an SVG image using a browserified SVGO version.
 * @param  {string} s - The raw SVG data
 * @param  {string=} name - The filename used for the download link. Defaults to "unnamed.svg"
 */
function compressSVG(s, name) {
    var svgo = new SVGO({
        multipass: true,
        js2svg: {
            attrStart: '=\'',
            attrEnd: '\'',
            regValEntities: /[&'<>]/g
        }
    });
    svgo.optimize(s, function(svg) {
        if (svg.error) {
            setTimeout(function(e) {
                swal("SVGO Error", e, "error");
            }, 500, svg.error);

            window.type = "plain";
            result.set(null, getUri(s), { original: s.length, compressed: null });
            document.body.classList.remove("loading");

            return;
        }
        var uri = getUri(svg.data, "image/svg+xml");
        result.set("lossy", uri, { original: s.length, compressed: svg.data.length })
        result.set("lossless", svg.data, { original: s.length, compressed: svg.data.length, uri: null })
        document.getElementById("lossy-tab").textContent = "data uri";
        document.getElementById("lossless-tab").textContent = "plain svg";
        updateDownloadLink(name || "unnamed.svg");
        document.body.classList.remove("loading");
    })
}


/**
 * Compress an image file (PNG, JPEG or GIF)
 * @param  {File} f - The file to compress
 */
function compressIMG(f) {
    window.type = f.type.split("/")[1];
    // Quick offline conversion
    var r = new FileReader()
    r.addEventListener("load", function(e) {
        var uri = "data:" + f.type + ";base64," + base64ArrayBuffer(e.target.result);
        
        if (f.type != "image/gif") {
            // PNG or JPG (can be compressed in browser)
            canvasFromUri(uri).then(function(canvas) {
                var quality = null;
                if (f.type == "image/jpeg") quality = estimateJpegQuality(canvas, f.size);

                var compressedUri = canvas.toDataURL(f.type, Math.floor(Math.min(quality, 90) * 0.9) / 100);
                var compressedSize = sizeFromBase64(compressedUri);

                if (f.type == "image/jpeg") {
                    result.set("lossless", uri, { original: f.size, compressed: null })
                    result.set("lossy", compressedUri, { original: f.size, compressed: compressedSize })
                } else {
                    if (compressedSize >= f.size) result.set(null, uri, { original: f.size, compressed: f.size });
                    else result.set(null, compressedUri, { original: f.size, compressed: compressedSize });
                }
                updateDownloadLink(f.name || "unnamed." + (f.type == "image/png" ? "png" : "jpg"));
                document.body.classList.remove("loading");

                // Slower online compression
                startUpload(r.result, f.type, quality);
            }, function() {
                // Invalid image
                result.set(null, uri, { original: f.size, compressed: null });
                updateDownloadLink(f.name || "unnamed." + (f.type == "image/png" ? "png" : "jpg"));
                document.body.classList.remove("loading");
            })
        } else {
            // GIF (can't be compressed in browser)
            result.set(null, uri, { original: f.size, compressed: null });
            updateDownloadLink(f.name || "unnamed.gif");
            document.body.classList.remove("loading");
            
            // Slower online compression
            startUpload(e.target.result, f.type, null);
        }
    })
    r.readAsArrayBuffer(f);
}


/**
 * Convert a file to a Data URI.
 * @param  {File} f - The file to convert.
 */
function convertFile(f) {
    cancelUpload();
    document.getElementsByClassName("result")[0].scrollTop = 0;
    // Compress SVG files using SVGO
    if (f.type == "image/svg+xml") {
        confirmFilesize(f.size, 1024*1024*1.5, function(f) {
            document.body.classList.add("loading");
            window.type = "svg";
            var r = new FileReader()
            r.addEventListener("load", function(e) {
                setTimeout(compressSVG, 200, e.target.result, f.name || "unnamed.svg");
            })
            r.readAsBinaryString(f);
        }.bind(this, f));
    }
    else if (f.type == "image/png" || f.type == "image/jpeg" || f.type == "image/gif") {
        confirmFilesize(f.size, 1024*1024*2, function(f) {
            document.body.classList.add("loading");
            setTimeout(compressIMG, 200, f);
        }.bind(this, f), onlinecompression ? "Note that files bigger than 2mb can only be compressed locally." : null);
    } else {
        confirmFilesize(f.size, 1024*1024*10, function(f) {
            document.body.classList.add("loading");
            window.type = "plain";
            var r = new FileReader()
            r.addEventListener("load", function(e) {
                var uri = getUri(e.target.result);
                result.set(null, uri, { original: f.size, compressed: null });
                updateDownloadLink(f.name || "unnamed.txt");
                document.body.classList.remove("loading");
            })
            r.readAsBinaryString(f);
        }.bind(this, f))
    }
}

/**
 * Convert a plain string to a Data URI.
 * @param  {string} s - The string to convert.
 */
function convertString(s) {
    cancelUpload();
    document.getElementsByClassName("result")[0].scrollTop = 0;
    if (s.match(/^(?:[\s\n]*<[?!][^>]+>)*[\s\n]*<svg(?:>|[\s\n])(?:.|\n)*<\/svg\s*>\s*$/i)) {
        confirmFilesize(s.length, 1024*1024*1.5, function(s) {
            document.body.classList.add("loading");
            window.type = "svg";
            setTimeout(compressSVG, 100, s, "clipboard.svg");
        }.bind(this, s));
    } else {
        confirmFilesize(s.length, 1024*1024*10, function(s) {
            window.type = "plain";
            result.set(null, getUri(s), { original: s.length, compressed: null });
            updateDownloadLink("clipboard.txt");
            document.body.classList.remove("loading");
        }.bind(this, s));
    }
}
