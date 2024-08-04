import toBuffer from "typedarray-to-buffer";
import { Canvas } from "canvas";
const isBrowser =
  typeof document !== "undefined" && typeof document.createElement === "function";

const defaultTypes = isBrowser ? ["webp", "jpeg"] : ["png"];

type MimeType = "image/png" | "image/jpeg" | "image/webp";

// cached, used only once for browser environments
let verifiedMimeType: MimeType | undefined;

class Frame {
  private quality: number;
  private types: string[];
  private canvas: Canvas;
  // For Unit tests
  static atob?: (str: string) => string;

  constructor(canvas: Canvas, types = defaultTypes, quality = 0.5) {
    // validate some options this class needs

    if (types.length > 2) {
      throw new Error("Too many image types are specified!");
    }

    this.canvas = canvas;
    this.quality = quality;
    this.types = types;
  }

  private composeMimeType(index: number) {
    let mimeType: MimeType | undefined;

    if (this.types[index]) {
      mimeType = "image/" + this.types[index];
    }

    return mimeType;
  }

  private isMatch(uri: string, imageType: string) {
    return uri.match(imageType);
  }

  // Performance tweak, we do not need a big canvas for finding out the supported image type
  private getTestCanvas() {
    let testCanvas;

    if (isBrowser) {
      testCanvas = document.createElement("canvas");
      testCanvas.width = testCanvas.height = 1;
    } else {
      testCanvas = this.canvas;
    }

    return testCanvas;
  }

  private canvasSupportsMimeType(mimeType: string) {
    try {
      const testCanvas = this.getTestCanvas();
      const uri = testCanvas.toDataURL && testCanvas.toDataURL(mimeType);

      return this.isMatch(uri, mimeType);
    } catch (exc) {
      // Can happen when i.E. a spider is coming. Just be robust here and continue.
      return false;
    }
  }

  private figureMimeType() {
    let mimeType: MimeType | undefined = this.composeMimeType(0);

    if (!mimeType || !this.canvasSupportsMimeType(mimeType)) {
      if (this.types[1]) {
        mimeType = this.composeMimeType(1);

        if (mimeType && !this.canvasSupportsMimeType(mimeType)) {
          mimeType = undefined;
        }
      } else {
        mimeType = undefined;
      }
    }

    return mimeType;
  }

  // this method is proven to be fast, see
  // http://jsperf.com/data-uri-to-buffer-performance/3
  private uriToBuffer(uri: string) {
    const uriSplitted = uri.split(",")[1];
    let bytes: string | undefined;

    if (!uriSplitted) {
      throw new Error("Empty uri string given!");
    } else if (isBrowser) {
      bytes = window.atob(uriSplitted);
    } else {
      // Beware that the atob function might be a static one for server side tests
      bytes = Frame.atob?.(uriSplitted);
    }

    if (!bytes) {
      throw new Error("Byte are empty, something within atob went wrong.");
    }

    const arr = new Uint8Array(bytes.length);

    // http://mrale.ph/blog/2014/12/24/array-length-caching.html
    for (let i = 0, l = bytes.length; i < l; i++) {
      arr[i] = bytes.charCodeAt(i);
    }

    return toBuffer(arr);
  }

  public toBuffer() {
    const mimeType = this.getMimeType();

    let buffer;

    if (mimeType) {
      const uri = this.canvas.toDataURL(mimeType as "image/jpeg", this.quality);
      buffer = this.uriToBuffer(uri);
    }

    return buffer;
  }

  public getMimeType() {
    // on the browser side we do cache it for speed
    if (!verifiedMimeType || !isBrowser) {
      verifiedMimeType = this.figureMimeType();
    }

    return verifiedMimeType;
  }
}

export default Frame;
