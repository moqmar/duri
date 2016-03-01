window.CONVERSION_URL = "/convert";

// Drag & Drop
document.addEventListener("dragover", function(event) { event.preventDefault(); })
document.addEventListener("drop", function(event) {
    event.preventDefault();
    if (!event.dataTransfer.files.length) return;
    convertFile(event.dataTransfer.files[0]);
})

// Ctrl+V
document.addEventListener("paste", function(event) {
    event.preventDefault();
    if (!event.clipboardData.items.length) return;
    if (event.clipboardData.items[0].kind == "file") convertFile(event.clipboardData.items[0].getAsFile());
    else {
        var d = event.clipboardData.getData("Text");
        if (d) convertString(d);
    }
})

// Select a file
document.getElementsByTagName("input")[0].addEventListener("change", function(event) {
    if (!event.target.files.length) return;
    setTimeout(convertFile, 200, event.target.files[0]);
    event.target.value = null;
})



// Select complete Data URI on click
document.getElementsByClassName("result")[0].addEventListener("click", selectText)

// Copy complete Data URI on Ctrl+C
document.addEventListener("copy", function(event) {
    if (window.getSelection().type != "Range")
        selectText(document.getElementsByClassName("result")[0]);
})

if (location.protocol != "file:") {
// ZeroClipboard initialization
ZeroClipboard.config({ swfPath: "./lib/ZeroClipboard.swf" });
var zc = new ZeroClipboard(document.getElementById("copy"));
zc.on("ready", function(readyEvent) {
    zc.on("copy", function (event) {
        var clipboard = event.clipboardData;
        clipboard.setData("text/plain", result.get());
    });
    zc.on("aftercopy", function(event) {
        event.target.classList.add("copied");
        setTimeout(function(e) {
            event.target.classList.remove("copied");
        }, 1000);
        document.body.tabIndex = 0;
        document.body.focus();
    });
});

// Sometimes the hover state of ZeroClopboard isn't removed
document.body.addEventListener("mousemove", function(event) {
    if (event.target.tagName != "OBJECT" && event.target.id != "copy") document.getElementById("copy").classList.remove("zeroclipboard-is-hover");
})

} else document.getElementById("copy").style.display = "none";

// IE fix for download button
document.body.addEventListener("click", function(event) {
    if (event.target.download && typeof navigator.msSaveBlob == "function") {
        event.preventDefault();
        var blob = dataUriToBlob(event.target.href);
        navigator.msSaveBlob(blob, event.target.download);
    }
})
