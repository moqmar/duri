/**
 * Cancel a running upload (if there is any)
 */
function cancelUpload() {
    window.uploadRequest && window.uploadRequest.abort();
    document.body.classList.remove("uploading");
}

/**
 * Convert an image file using the Duri compression server convert endpoint at CONVERSION_URL
 * @param  {ArrayBuffer} buffer - The file contents
 * @param  {string} type - The MIME type of the file
 * @param  {number=} quality - The original image quality for JPG images
 */
function startUpload(buffer, type, quality) {
    if (typeof CONVERSION_URL != "string") return;
    if (!onlinecompression.enabled()) return;
    if (buffer.byteLength > 1024*1024*2) return;
    if (location.protocol == "file:") return;
    
    // Online conversion

    document.body.classList.add("uploading");
    document.getElementById("progress").style.width = "0%";
    document.getElementById("percentage").innerHTML = 0;
    document.getElementById("progress").classList.add("unknown");
    document.getElementById("percentage").classList.add("unknown");


    window.uploadRequest = new XMLHttpRequest();
    uploadRequest.open("POST", CONVERSION_URL);
    
    uploadRequest.responseType = "arraybuffer";

    uploadRequest.setRequestHeader("Content-Type", type);
    if (type == "image/jpeg") uploadRequest.setRequestHeader("X-DURI-Original-Quality", quality);
    
    uploadRequest.upload.onprogress = uploadRequest.onprogress = function(event) {
        if (event.target instanceof XMLHttpRequest) {
            document.querySelector("#status>span").textContent = "compressing..."
        }
        if (event.lengthComputable) {
            var percent = event.loaded * 100 / event.total;
            document.getElementById("progress").classList.remove("unknown");
            document.getElementById("percentage").classList.remove("unknown");
            document.getElementById("percentage").innerHTML = Math.floor(percent);
            document.getElementById("progress").style.width = (Math.floor(percent * 10) / 10) + "%";
        } else {
            document.getElementById("progress").classList.add("unknown");
            document.getElementById("percentage").classList.add("unknown");
        }
    }
    uploadRequest.onreadystatechange = function() {
        if (uploadRequest.readyState != 4) return;
        if (uploadRequest.status == 200) {
            var uri = "data:" + type + ";base64," + base64ArrayBuffer(uploadRequest.response);
            if (type != "image/jpeg") result.set("lossless", result.get(), result.getInfo());
            result.set("lossy", uri, {
                original: buffer.byteLength,
                compressed: sizeFromBase64(uri)
            })
            document.body.classList.remove("uploading");
        } else {
            document.body.classList.remove("uploading");
            if (uploadRequest.status > 0)
                swal(uploadRequest.status + " " + uploadRequest.statusText, "An error occured during online conversion.", "error");
            else
                swal("No Connection", "You are not connected to the internet or the conversion server is offline.", "error");
        }
    }

    uploadRequest.send(buffer);
}
