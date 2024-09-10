import { Canvas } from "canvas";
type MimeType = "image/png" | "image/jpeg" | "image/webp";
declare class Frame {
    private quality;
    private types;
    private canvas;
    static atob?: (str: string) => string;
    constructor(canvas: Canvas, types?: string[], quality?: number);
    private composeMimeType;
    private isMatch;
    private getTestCanvas;
    private canvasSupportsMimeType;
    private figureMimeType;
    private uriToBuffer;
    toBuffer(): Buffer | undefined;
    getMimeType(): MimeType | undefined;
}
export default Frame;
