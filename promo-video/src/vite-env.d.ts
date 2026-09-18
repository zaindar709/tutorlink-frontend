/// <reference types="vite/client" />

declare class CropTarget {
  static fromElement(element: Element): Promise<CropTarget>;
}

interface BrowserCaptureMediaStreamTrack extends MediaStreamTrack {
  cropTo(cropTarget: CropTarget | null): Promise<void>;
}
