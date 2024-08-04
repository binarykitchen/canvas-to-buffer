import test from "tape";
import { createCanvas } from "canvas";
import atob from "atob";

import Frame from "../src/index";

// Add missing function because atob only exists on the browser
Frame.atob = atob;

test("frame:", function (t) {
  t.test("arguments", function (tt) {
    tt.test("invalid mime type", function (tt) {
      tt.plan(1);

      const frame = new Frame(createCanvas(1, 1), ["bad image type"]);

      const mimeType = frame.getMimeType();
      tt.equal(mimeType, undefined);
    });

    tt.test("too many image types", function (tt) {
      tt.plan(1);

      tt.throws(function () {
        return new Frame(createCanvas(1, 1), ["too", "many", "image", "types"]);
      });
    });

    tt.test("missing image type sets default one", function (tt) {
      tt.plan(1);

      const frame = new Frame(createCanvas(1, 1));

      const mimeType = frame.getMimeType();
      tt.equal(mimeType, "image/png");
    });

    tt.test("one valid image type", function (tt) {
      tt.plan(1);

      const frame = new Frame(createCanvas(1, 1), ["png"]);
      const mimeType = frame.getMimeType();
      tt.equal(mimeType, "image/png");
    });

    tt.test("first image type is invalid, second image type is valid", function (tt) {
      tt.plan(1);

      const frame = new Frame(createCanvas(1, 1), ["bad image type", "png"]);

      const mimeType = frame.getMimeType();
      tt.equal(mimeType, "image/png");
    });
  });

  t.test("toBuffer", function (tt) {
    tt.test("fails without valid image type", function (tt) {
      tt.plan(1);

      const frame = new Frame(createCanvas(1, 1), ["bad image type"]);
      const buffer = frame.toBuffer();

      tt.equal(buffer, undefined);
    });

    tt.test("buffer from small canvas has correct contents", function (tt) {
      tt.plan(2);

      const frame = new Frame(createCanvas(1, 1), ["png"]);

      const buffer = frame.toBuffer();
      tt.equal(buffer && buffer.length >= 86, true); // cos on travis it's 88 due to different OS
      tt.equal(buffer && buffer.toString().indexOf("PNG") > -1, true);
    });

    tt.test("buffer from large canvas has correct PNG contents", function (tt) {
      tt.plan(2);

      const frame = new Frame(createCanvas(1000, 1000), ["png"]);

      const buffer = frame.toBuffer();
      tt.equal(buffer && buffer.length, 3975);
      tt.equal(buffer && buffer.toString().indexOf("PNG") > -1, true);
    });
  });
});
