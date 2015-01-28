canvas-to-buffer
================

[![Build Status](https://travis-ci.org/binarykitchen/canvas-to-buffer.svg?branch=master)](https://travis-ci.org/binarykitchen/canvas-to-buffer)

A tiny converter to turn any graphic canvas into a buffer. With focus on speed: it does not make an expensive copy and makes clever use of `atob()` and `Uint8Array`.

Following performance tests prove that this module is using the fatest known method:
http://jsperf.com/data-uri-to-buffer-performance/3

Useful scenarios for this module:
* Pipe each canvas from the browser to the server through web sockets at light speed
* Compress a canvas into binary form
* If https://www.npmjs.com/package/canvas is too heavy for you and you only need the `toBuffer` part and/or you care about speed

Furthermore this module is an important part of https://github.com/binarykitchen/videomail-client whose implementation can be seen on https://www.videomail.io

## Example

```js
var Frame  = require('canvas-to-buffer') // I call it a Frame but you can go with i.E. CanvasConverter, whatever
var frame  = new Frame(canvas)           // Drop in any canvas, i.E. from a webcam
var buffer = frame.toBuffer()
```

## Options (example)

```js
var Frame  = require('canvas-to-buffer')
var frame  = new Frame(canvas, {
    quality: 0.4,
    image: {
        types: ['webp', 'png']
    }
})
...
```

The example means, it tries to encode the canvas first as `webp` at the given quality before converting that data into a buffer. If that fails, i.E. the browser does not support it, then it will try again with the `png` format.

### quality

Default: 0.5

Determines the quality when encoding the canvas into an image with the given type.

### image.types

Default: ['webp', 'jpeg']

You know, turning a canvas into binary form requires an image type. No worries this module is able to automatically detect the supported image type in your browser.

But if you want to explicitely specify the image type for whatever reason, this is the option to use.

It can be a string or an array with max two image types.

FYI `webp` images have better compression, but are supported on Google Chrome only. Hence this module automatically falls back to 'jpeg' for any other browsers. Beware that binary data for JPEGs is about 20% larger.

## License

MIT. Copyright (C) [Michael Heuberger](https://binarykitchen.com)
