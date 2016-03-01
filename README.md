# Duri

Duri is able to generate a Data URI from any file or text by only using JavaScript in your browser. Images in the formats JPG, PNG, GIF and SVG will be compressed on-the-fly.

For the best compression options for JPG, PNG and GIF, those files will be uploaded to our server. You might want to turn that feature off for reduced bandwidth usage, which will disable GIF and lossy PNG compression and will make compressed JPG images slightly larger.

## Installation
Required are `node.js`, `npm`, `wget`, and (for the server-side conversions) the applications `pngquant`, `imagemagick` and `gifsicle`.

    $ sudo apt-get install pngquant imagemagick gifsicle -y
    $ git clone https://github.com/moqmar/duri.git
    $ cd duri && make

## Server start
You can start the server using a simple `node .` (or `npm start`). You may use the following environment variables to change the server's behaviour:

 Variable     | Description
--------------|-------------
`DURI_HOST`   | Hostname to bind to.
`DURI_PORT`   | Port to bind to.
`DURI_LOG`    | The log level. `error`, `warning`, `info` (default), `verbose` or `debug`
