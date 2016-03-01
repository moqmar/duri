/**
 * @param  {number|string|Blob} bytes - Number of bytes to format, or a String/Blob (in which case the length/size of it is used for the number of bytes)
 * @return {string} The formatted size (e.g. "12.2kb")
 */
function size(bytes) {
    if (bytes.length) bytes = bytes.length;
    if (bytes.size) bytes = bytes.size;
    var index = "b";
    if (bytes > 1024) { bytes /= 1024; index = "kb" }
    if (bytes > 1024) { bytes /= 1024; index = "mb" }
    if (bytes > 1024) { bytes /= 1024; index = "gb" }
    return (Math.floor(bytes * 100) / 100) + index;
}


/**
 * Get a Data URI from a string. Automatically returns the shorter version (URL Encoded or Base 64)
 * @param  {string} s - The String which should be converted
 * @param  {string=} type - The MIME type of the Data URI. Defaults to text/plain.
 * @return {string} The Data URI
 */
function getUri(s, type) {
    var uri = null;
    var uri1 = "data:" + (type || "text/plain") + "," + encodeURIComponent(s)
        .replace(/%20/g, " ")
        .replace(/%3D/g, "=")
        .replace(/%3A/g, ":")
        .replace(/%2F/g, "/");
    try {
        var uri2 = "data:" + (type || "text/plain") + ";base64," + btoa(s);
        uri = uri1.length > uri2.length ? uri2 : uri1;
    } catch (ex) {
        try {
            var ab = new Uint8Array(s.split('').map(function(char) {return char.charCodeAt(0);}));
            var uri2 = "data:" + (type || "text/plain") + ";base64," + base64ArrayBuffer(ab);
            uri = uri1.length > uri2.length ? uri2 : uri1;
        } catch (ex2) {
            uri = uri1;
        }
    }
    return uri;
}


/**
 * Create a Canvas from an URI.
 * @param  {uri} uri - The URL or Data URI from which a Canvas should be created.
 * @return {Promise:Canvas} Returns a Promise which eventually resolves with a Canvas.
 */
function canvasFromUri(uri) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas);
        };
        img.onerror = function(event) {
            reject();
        }
        img.src = uri;
    })
}

/**
 * Guess the quality of a JPG by comparing the file size.
 * @param  {Canvas} canvas - The Canvas containing the image (e.g. created using canvasFromURI).
 * @param  {number} originalSize - The size of the original file, in bytes.
 * @return {[type]}
 */
function estimateJpegQuality(canvas, originalSize) {
    var est = 100; est < 0 && (est = 0);
    for (var q = 0; q <= est; q += 25) {
        s = Math.floor(canvas.toDataURL("image/jpeg", q/100).split(",")[1].split("=")[0].length * 0.75);
        if (s > originalSize) { est = q; break }
    }
    est -= 25; est < 0 && (est = 0);
    for (var q = est + 5; q < est + 25; q += 5) {
        s = Math.floor(canvas.toDataURL("image/jpeg", q/100).split(",")[1].split("=")[0].length * 0.75);
        if (s > originalSize) { est = q; break }
    }
    est -= 5; est < 0 && (est = 0);
    for (var q = est + 1; q < est + 5; q += 1) {
        s = Math.floor(canvas.toDataURL("image/jpeg", q/100).split(",")[1].split("=")[0].length * 0.75);
        if (s > originalSize) { est = q; break }
    }
    return est;
}


/**
 * Calculate the size of the decoded data of a Base 64 String.
 * @param  {string} b64 - The Base 64 encoded String.
 * @return {number} The size of the original data in bytes.
 */
function sizeFromBase64(b64) {
    return Math.floor(b64.split(",")[1].split("=")[0].length * 0.75)
}


/**
 * Convert a Data URI to a Blob.
 * From ebidel/filer.js
 * @param  {string} uri - The Data URI to convert
 * @return {Blob}
 */
function dataUriToBlob(uri) {
    var BASE64_MARKER = ';base64,', parts, contentType, raw;
    if (uri.indexOf(BASE64_MARKER) == -1) {
        parts = uri.split(',');
        contentType = parts[0].split(':')[1];
        return new Blob([decodeURIComponent(parts[1])], {type: contentType});
    }
    parts = uri.split(BASE64_MARKER);
    contentType = parts[0].split(':')[1];
    raw = atob(parts[1]);
    var arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], {type: contentType});
}


/**
 * Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
 * use window.btoa' step. According to my tests, this appears to be a faster approach:
 * http://jsperf.com/encoding-xhr-image-data/5
 * 
 * Also supports strings outside the Latin1 charset!
 * Created by jonleighton (https://gist.github.com/jonleighton/958841)
 * @param  {ArrayBuffer} The ArrayBuffer to convert.
 * @return {string} The Base64 String
 */
function base64ArrayBuffer(arrayBuffer) {
    var base64    = '',
        encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        bytes         = new Uint8Array(arrayBuffer),
        byteLength    = bytes.byteLength,
        byteRemainder = byteLength % 3,
        mainLength    = byteLength - byteRemainder,
        a, b, c, d,
        chunk
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]
        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1
        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }
    return base64
}


/**
 * Select the content of a DOM node.
 * @param  {node=} node - The element to select. If unset, "this" is used.
 */
function selectText(node) {
    node instanceof Node || (node = this);
    var selection = window.getSelection();        
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
}
