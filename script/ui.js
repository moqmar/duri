/**
 * Manage the resulting Data URI(s).
 * @type {Object}
 */
window.result = {
    /**
     * Set the resulting Data URI.
     * Example: result.set("lossless", "data:text/plain,", { original: 1234, compressed: null })
     * @param {string|null} type - "lossy", "lossless" or null (only one version)
     * @param {string} uri - The resulting Data URI.
     * @param {object} info - Information to display - must contain "original" with the size of the original content in bytes, can contain "compressed" with the size of the compressed content.
     */
    set: function(type, uri, info) {

        // Data URI
        var e = null;
        if (type == null) {
            e = document.getElementsByClassName("result")[0];
        } else {
            if (document.getElementsByClassName("result")[0].childNodes[0]
             && document.getElementsByClassName("result")[0].childNodes[0].nodeType == 3)
                document.getElementsByClassName("result")[0].innerHTML = "";
            e = document.querySelector(".result span." + type);
            if (!e) {
                e = document.createElement("span");
                e.className = type;
                document.getElementsByClassName("result")[0].appendChild(e);
            }
        }
        e.textContent = uri;

        // Information
        var i = null;
        if (type == null) {
            i = document.getElementById("info");
        } else {
            if (document.getElementById("info").childNodes[0]
             && document.getElementById("info").childNodes[0].nodeType == 3)
                document.getElementById("info").innerHTML = "";
            i = document.querySelector("#info span." + type);
            if (!i) {
                i = document.createElement("span");
                i.className = type;
                document.getElementById("info").appendChild(i);
            }
        }
        i.innerHTML =
            "Original: <strong>" + size(info.original) + "</strong>" +
            (info.compressed ? 
                info.compressed == info.original ? " &nbsp; Already compressed" :
                " &nbsp; Compressed: <strong>" + size(info.compressed) + "</strong>"
                : "") +
            (info.uri === null ? "" : " &nbsp; URI: <strong>" + size(info.uri || uri.length) + "</strong>") +
            (info.compressed && info.original != info.compressed ? "<br><a class='download'>download optimized file</a> &nbsp; " : "<br>");

        if (type == "lossless" && (info.original == info.compressed || !info.compressed))
            document.getElementById("lossless-tab").textContent = "original (" + size(info.original) + ")";
        else if (type == "lossless")
            document.getElementById("lossless-tab").textContent = "lossless (" + size(info.original) + ")";
        
        if (type == "lossy")
            document.getElementById("lossy-tab").textContent = "lossy (" + size(info.compressed) + ")";

        if (type == null) result.info = info;
        else (result.info = {} || result.info)[type] = info;

        document.body.classList.add("has-result");
        if (type == null) { document.body.classList.remove("lossy");
                            document.body.classList.remove("lossless"); }
        if (type != null) { document.body.classList.add(lossy ? "lossy" : "lossless");
                            document.body.classList.remove(lossy ? "lossless" : "lossy"); }

        try {
            updateDownloadLink();
        } catch (ex) {}
    },
    /**
     * @return {string} Get the resulting Data URI.
     */
    get: function() {
        if (window.type == "svg") return document.querySelector(".result .lossy").innerHTML;
        else return document.querySelector("body.lossy .result .lossy, body.lossless .result .lossless, body:not(.lossy):not(.lossless) .result").innerHTML;
    },
    /**
     * @return {Object} Get the resulting information object.
     */
    getInfo: function() {
        return (result.info[window.lossy ? "lossy" : "lossless"] || result.info)
    },
    info: null
}


/**
 * Update the download link to the current result.
 * @param  {string=} filename - The filename for the download. If unset, the filename won't be changed.
 */
function updateDownloadLink(filename) {
    if (filename) window.lastFilename = filename;
    var l = document.getElementsByClassName("download");
    for (var i = 0; i < l.length;  i++) {
        l[i].download = window.lastFilename;
        l[i].href = result.get();
    }
}


function confirmFilesize(s, max, callback, additional) {
    if (s > max) swal({
        title: "Large File",
        text: "The file you are trying to convert is very large (" + size(s) + ")\n\nThis will probably take a long time or even crash your browser." + (additional ? "\n" + additional : "") + "\n\nAre you sure you want to continue?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Continue",
        closeOnConfirm: true
    }, setTimeout.bind(window, callback, 200));
    else callback();
}
