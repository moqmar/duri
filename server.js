var process = require("process");
require("colors");

var LOG = { levels: ["error", "warning", "info", "verbose", "debug"] };
LOG.level = LOG.levels.indexOf((process.env.DURI_LOG || "").toLowerCase());
LOG.level == -1 && (LOG.level = LOG.levels.indexOf("info"));
function _(s, l) { if (LOG.level >= LOG.levels.indexOf(l)) console.log(new Date().toISOString().replace(/T|Z|\.\d+/g," ").dim + s); }

var imagemagick = require("imagemagick-stream");
var pngquant = require("pngquant");

var child = require("child_process");
var gifsicle = require("gifsicle");

var express = require('express');
var app = express();

app.use(function(req, res, next) {
    req.ipp = req.ip.replace(/^::ffff:/, "");
    _(req.ipp.dim + "  " + req.originalUrl.dim, "debug");
    if (req.path.match(/^\/(node_modules|server\.js|Makefile|README\.md|package\.json|svgo-browserify-fixes\.txt|\.gitignore)\b/)) {
        _("403 Forbidden  ".red.bold + req.ipp.yellow.bold + "  " + req.originalUrl, "verbose")
        res.type("text/plain").status(404).send("404 Not Found");
    } else next();
})

// Static HTML
app.use(express.static(__dirname));

// POST API
app.post("/convert", function(req, res) {
    var size = 0, stream = null;
    req.on("data", function(data) {
        size += data.length;
        if (size > 1024 * 1024 * 2) {
            res.status(413).end();
            req.unpipe();
            if (stream) stream.unpipe();
        }
    })
    var type = (req.get("content-type") || "").split(";")[0];
    switch (type) {
        case "image/png":
            _("PNG conversion request from " + req.ipp.yellow.bold, "verbose")
            stream = new pngquant(["--quality", "0-20"]);
            stream.on("error", function(e)  {
                console.log(e);
            })
            req.pipe(stream).pipe(res);
            break;
        case "image/jpeg":
            _("JPG conversion request from " + req.ipp.yellow.bold + (" (Original Quality: " + req.get("x-duri-original-quality") + ")").dim, "verbose")
            var stream = imagemagick()
                .set("strip")
                .set("interlace", "Plane")
                .quality(Math.floor(Math.min(req.get("x-duri-original-quality") || 100, 90) * 0.9));
            req.pipe(stream).pipe(res);
            break;
        case "image/gif":
            _("GIF conversion request from " + req.ipp.yellow.bold, "verbose")
            var gif = child.spawn(gifsicle, ["-i", "-O3"], { stdio: ["pipe", "pipe", "inherit"] });
            req.pipe(gif.stdin);
            gif.stdout.pipe(res);
            stream = gif.stdout;
            break;
        default:
            _("Bad Content-Type Header  ".red.bold + req.ipp.yellow.bold + "  " + type, "info")
            res.status(400).type("text/plain").send("Missing or invalid \"content-type\" header.\n\nSupported types:\n- image/png\n- image/jpeg\n- image/gif");
    }
})

// 404 Not Found
app.use(function(req, res) {
    _("404 Not Found  ".red.bold + req.ipp.yellow.bold + "  " + req.originalUrl, "verbose")
    res.type("text/plain").status(404).send("404 Not Found");
})

// Listen
var port = parseInt(process.env.DURI_PORT) || 4399;
var host = process.env.DURI_HOST || "::";
app.listen(port, host, function () {
    _("Duri server now listening at " + ((host.match(/:/) ? "["+host+"]" : host) + ":" + port).yellow.bold, "info")
});
