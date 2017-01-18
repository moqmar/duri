// Get or set the tab.
Object.defineProperty(window, "lossy", {
    get: function() {
        return localStorage.getItem("lossy-" + type) == "false" ? false : true;
    },
    set: function(value) {
        if (value != lossy) document.getElementsByClassName("result")[0].scrollTop = 0;
        localStorage.setItem("lossy-" + window.type, value ? "true" : "false");
        if (value) {
            document.body.classList.add("lossy");
            document.body.classList.remove("lossless");
        } else {
            document.body.classList.remove("lossy");
            document.body.classList.add("lossless");
        }
        try {
            updateDownloadLink();
        } catch (ex) {}
    }
});
