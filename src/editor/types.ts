export type AssetType = 'image' | 'svg';

export interface BaseElement {
  id: string;
  frameId: string;
  type: 'image' | 'svg' | 'glass';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  zIndex: number;
  opacity: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  assetId: string;
  fit: 'cover' | 'contain' | 'fill';
}

export interface SvgElement extends BaseElement {
  type: 'svg';
  assetId: string;
  pathBounds?: {
    width: number;
    height: number;
  };
}

export interface GlassSettings {
  tint: { r: number; g: number; b: number; a: number };
  refThickness: number;
  refFactor: number;
  dispersion: number;
  fresnelRange: number;
  fresnelHardness: number;
  fresnelFactor: number;
  glareRange: number;
  glareHardness: number;
  glareFactor: number;
  glareConvergence: number;
  glareOppositeFactor: number;
  glareAngle: number;
  blurRadius: number;
}

export interface GlassElement extends BaseElement {
  type: 'glass';
  mask: {
    kind: 'svg' | 'rect' | 'ellipse';
    assetId?: string;
    data?: unknown;
  };
  settings: GlassSettings;
}

export type FrameElement = ImageElement | SvgElement | GlassElement;

export interface FrameBackgroundColor {
  type: 'color';
  value: string;
}

export interface FrameBackgroundAsset {
  type: 'asset';
  assetId: string;
  fit: 'cover' | 'contain' | 'fill';
}

export type FrameBackground = FrameBackgroundColor | FrameBackgroundAsset;

export interface Frame {
  id: string;
  name: string;
  width: number;
  height: number;
  background: FrameBackground;
  elements: FrameElement[];
}

export interface AssetBase {
  id: string;
  type: AssetType;
  name: string;
  url: string;
  previewUrl: string;
}

export interface ImageAsset extends AssetBase {
  type: 'image';
  width: number;
  height: number;
}

export interface SvgAsset extends AssetBase {
  type: 'svg';
  markup: string;
}

export type Asset = ImageAsset | SvgAsset;

export interface SelectionState {
  elementIds: string[];
}

export interface DesignSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface DesignState {
  frames: Frame[];
  activeFrameId: string | null;
  assets: Record<string, Asset>;
  selection: SelectionState;
  settings: DesignSettings;
}
