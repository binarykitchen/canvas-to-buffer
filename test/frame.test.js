const test = require('tape')
const { createCanvas } = require('canvas')
const atob = require('atob')

const Frame = require('./../')

// Add missing function because atob only exists on the browser
Frame.atob = atob

test('frame:', function (t) {
  t.test('arguments', function (tt) {
    tt.test('missing options are fine', function (tt) {
      tt.plan(1)

      tt.doesNotThrow(function () {
        return new Frame()
      })
    })

    tt.test('invalid image type', function (tt) {
      tt.plan(2)

      new Frame(createCanvas(1, 1), {
        image: {
          types: ['bad image type']
        }
      })
      .getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, undefined)
      })
    })

    tt.test('too many image types', function (tt) {
      tt.plan(1)

      tt.throws(function () {
        return new Frame(createCanvas(1, 1), {
          image: {
            types: ['too', 'many', 'image', 'types']
          }
        })
      })
    })

    tt.test('missing image type sets default one', function (tt) {
      tt.plan(8)

      new Frame(createCanvas(1, 1)).getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })

      new Frame(createCanvas(1, 1), {
        image: {}
      }).getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })

      new Frame(createCanvas(1, 1), {
        image: {
          types: null
        }
      }).getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })

      new Frame(createCanvas(1, 1), {
        image: {
          types: []
        }
      }).getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })
    })

    tt.test('one valid image type', function (tt) {
      tt.plan(3)

      var frame

      tt.doesNotThrow(function () {
        frame = new Frame(createCanvas(1, 1), {
          image: {
            types: ['png']
          }
        })
      })

      frame.getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })
    })

    tt.test('first image type is invalid, second image type is valid', function (tt) {
      tt.plan(2)

      var frame = new Frame(createCanvas(1, 1), {
        image: {
          types: ['bad image type', 'png']
        }
      })

      frame.getImageType(function (err, imageType) {
        tt.equal(err, null)
        tt.equal(imageType, 'image/png')
      })
    })
  })

  t.test('toBuffer', function (tt) {
    tt.test('fails without valid image type', function (tt) {
      tt.plan(1)

      var frame = new Frame(createCanvas(1, 1), {
        image: {
          types: ['bad image type']
        }
      })

      var buffer = frame.toBuffer()
      tt.equal(buffer, undefined)
    })

    tt.test('buffer from small canvas has correct contents', function (tt) {
      tt.plan(3)

      var frame = new Frame(createCanvas(1, 1), {
        image: {
          types: ['png']
        }
      })

      frame.toBuffer(function (err, buffer) {
        tt.equal(err, null)
        tt.equal(buffer.length >= 86, true) // cos on travis it's 88 due to different OS
        tt.equal(buffer.toString().indexOf('PNG') > -1, true)
      })
    })

    tt.test('buffer from large canvas has correct PNG contents', function (tt) {
      tt.plan(3)

      var frame = new Frame(createCanvas(1000, 1000), {
        image: {
          types: ['png']
        }
      })

      frame.toBuffer(function (err, buffer) {
        tt.equal(err, null)
        tt.equal(buffer.length, 3975)
        tt.equal(buffer.toString().indexOf('PNG') > -1, true)
      })
    })

    tt.test('buffer from large canvas has correct JPG contents', function (tt) {
      tt.plan(4)

      var frame = new Frame(createCanvas(1000, 1000), {
        image: {
          types: ['jpeg']
        }
      })

      frame.toBuffer(function (err, buffer) {
        tt.equal(err, null)
        tt.equal(buffer.length, 16503)

        // https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format

        const lastTwoBytes = buffer.slice(-2)
        tt.equal(0xFF, lastTwoBytes[0])
        tt.equal(0xD9, lastTwoBytes[1])
      })
    })
  })
})
