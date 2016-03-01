window.CONVERSION_URL = "/convert";


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


// Enable/Disable online compression
window.onlinecompression = {
    enabled: function() {
        return localStorage.getItem("onlinecompression") == "false" ? false : true;
    },
    toggle: function() {
        if (onlinecompression.enabled()) {
            swal({
                title: "Disable online compression?",
                text: "For the best compression options for JPG, PNG and GIF, those files will be uploaded to our server. Disabling this feature will disable GIF and lossy PNG compression and will make compressed JPG images slightly larger.",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, disable it!",
                closeOnConfirm: false
            }, function() {
                localStorage.setItem("onlinecompression", "false");
                swal("Online compression disabled", "The online compression feature has been successfully disabled!", "success");
                document.body.classList.add("oc-off");
                document.body.classList.remove("oc-on");
            });
        } else {
            localStorage.setItem("onlinecompression", "true");
            swal(
                "Online compression enabled",
                "The online compression feature has been successfully enabled. Enjoy even smaller JPG, PNG and GIF files!",
                "success"
            );
            document.body.classList.remove("oc-off");
            document.body.classList.add("oc-on");
        }
    }
}
