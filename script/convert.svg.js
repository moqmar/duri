/**
 * Compress an SVG image using a browserified SVGO version.
 * @param  {string} s - The raw SVG data
 * @param  {string=} name - The filename used for the download link. Defaults to "unnamed.svg"
 */
window.compress.svg = function compressSVG(s, name) {
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

        svgo.config.js2svg.attrStart = '="';
        svgo.config.js2svg.attrEnd = '"';
        svgo.config.js2svg.regValEntities = /[&"<>]/g;
        svgo.optimize(s, function(svg) {
            if (!svg.error) result.set("lossless", svg.data, { original: s.length, compressed: svg.data.length, uri: null })
            document.getElementById("lossless-tab").textContent = "plain svg";
        });
    })
}