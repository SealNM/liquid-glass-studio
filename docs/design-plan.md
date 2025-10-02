# Liquid Glass Design Studio – Feature Expansion Plan

## Goals

- Transform the current single-demo canvas into a lightweight design tool reminiscent of Figma/Canva that focuses on Liquid Glass artwork.
- Allow users to:
  - Create multiple frames with arbitrary pixel sizes.
  - Upload SVG assets ("SSVG" == SVG) and apply the Liquid Glass shader effect to their shapes.
  - Upload and place multiple raster images inside frames, with drag/resize/arrange capabilities.
  - Combine assets into compositions with adjustable layout, stacking order, and global scene controls.
  - Export any frame to PNG/JPG while preserving WebGL-rendered Liquid Glass effects.

## High-Level Architecture

### State Model

Use a dedicated design-state layer managed via React context + reducer (to avoid prop drilling and concentrate undo/redo hooks later).

```ts
interface DesignState {
  frames: Frame[];
  activeFrameId: string | null;
  assets: Record<string, Asset>;
  selection: SelectionState;
  inspector: InspectorState;
  settings: GlobalSettings; // locale, snapping, canvas bg, etc.
}

interface Frame {
  id: string;
  name: string;
  width: number;
  height: number;
  background: FrameBackground; // color | gradient | media asset id
  elements: FrameElement[];
}

interface FrameElementBase {
  id: string;
  frameId: string;
  type: 'image' | 'svg' | 'glass';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  opacity: number;
  lockAspectRatio?: boolean;
}

interface ImageElement extends FrameElementBase {
  type: 'image';
  assetId: string; // reference to raster asset
  fit: 'cover' | 'contain' | 'fill';
}

interface SvgElement extends FrameElementBase {
  type: 'svg';
  assetId: string; // uploaded svg markup
  normalizedPaths: PathData[]; // extracted for hit-testing & masking
  glassSettings?: GlassSettings; // optional overlay config
}

interface GlassElement extends FrameElementBase {
  type: 'glass';
  mask: GlassMask; // geometry defined via editor tools or svg reference
  settings: GlassSettings;
}

interface GlassSettings {
  tint: RGBA;
  refThickness: number;
  refFactor: number;
  dispersion: number;
  fresnel: {
    range: number;
    hardness: number;
    factor: number;
  };
  glare: {
    range: number;
    hardness: number;
    factor: number;
    convergence: number;
    oppositeFactor: number;
    angle: number;
  };
  blurRadius: number;
}
```

Assets table keeps uploaded binaries (images, svg markup) and generated GPU textures/signed distance fields to reuse across frames.

### UI Layout

- **Top Bar**: Frame list dropdown, add/remove frame, export, zoom controls.
- **Left Sidebar**: Asset library (SVG, images, uploaded files) + upload buttons.
- **Center Stage**: Active frame rendered inside zoomable, pannable workspace. Every element uses transform handles (powered by `react-rnd` or `@seolhun/react-moveable`).
- **Right Inspector**: General properties (size, position, rotation, opacity) and Liquid Glass-specific sliders. Use Leva for shader parameters to reuse existing translations but scope to selected glass element.

### Component Breakdown

- `App`: Maintains providers (DesignState, AssetManager, Keyboard shortcuts) and shells out to layout components.
- `FrameStage`: Responsible for viewport, pan/zoom (use CSS transforms + pointer events). Hosts `StageCanvas` overlay used for WebGL rendering.
- `ElementLayer`: Renders children elements using HTML overlays for selection handles. Each glass element also registers geometry with WebGL pipeline.
- `GlassRenderer`: Wraps existing `MultiPassRenderer` to support multiple objects and mask textures instead of single procedural SDF. Converts per-element mask (from SVG path or simple roundrect) into an FBO texture, then composites.
- `AssetManager`: Handles uploads, caching textures. When an SVG is uploaded, parse paths (use `svgson` or native DOMParser) and rasterize to alpha mask canvas for WebGL.
- `ExportManager`: Creates high-resolution output by rendering the WebGL canvas to an offscreen framebuffer, then composing HTML overlays via `html-to-image` fallback for non-glass layers.

### Rendering Strategy

1. **Stage Composition**
   - 2D layout uses regular DOM for interaction.
   - Dedicated WebGL canvas sits atop (absolute positioned) and only draws Liquid Glass elements. Non-glass elements (images, plain SVG) remain in DOM (for crispness and easier layout).

2. **Glass Mask Generation**
   - For shapes defined via SVG: render vector path to a `CanvasRenderingContext2D`, extract grayscale mask, upload as texture uniform `u_maskTexture`.
   - For primitive shapes (rect, ellipse): generate analytic SDF inside shader (reuse existing functions) – supply parameters as uniforms.
   - Store per-element FBO to avoid rerendering mask every frame; update only when transform/shape changes.

3. **Shader Adjustments**
   - Extend `fragment-main.glsl` to sample `u_maskTexture` and discard fragments outside mask.
   - Support array of glass items: iterate in shader via uniform arrays or instanced offscreen pass per element (preferred for flexibility). Proposed approach:
     - Render each glass element into offscreen buffer with its transform matrix.
     - Compose final pass layering them with blur/backdrop references.

4. **Background**
   - Each frame can choose background color or image asset. Background is drawn in DOM and mirrored into WebGL via texture uniform to keep refraction consistent.

### Asset Upload Pipeline

- Files dropzone populates assets store.
- Raster images: create Object URL, store metadata (dimensions), upload to GPU on demand.
- SVG: store raw markup + parsed data (list of paths). Provide user preview thumbnail.
- Provide “Apply Liquid Glass” action that either wraps an SVG element into a `GlassElement` or duplicates it with glass overlay.

### Interaction Basics

- Pan/zoom with space+drag / mouse wheel.
- Selection (single or multi) with bounding boxes.
- Transform handles via `react-rnd` (dependency to add). For rotation, extend with custom handle.
- Keyboard shortcuts: delete, duplicate, bring-to-front/back.

### Export Workflow

1. Trigger export → compute scaling factor (1x / 2x / custom).
2. Create hidden offscreen container replicating frame DOM with positions.
3. Ask `GlassRenderer` to render current glass layers into static bitmap at export resolution (call `renderer.renderFrame` hook).
4. Compose layers using `html-to-image` or `dom-to-image-more` (dependency) – ensure WebGL canvas content merged by drawing onto 2D canvas.
5. Download as PNG or convert to JPG via `canvas.toDataURL('image/jpeg', quality)`.

### Dependencies to Add

- `react-rnd` (drag/resize handles).
- `zustand` or keep with React context? (Prefer `zustand` for global state + devtools).
- `nanoid` for ids.
- `html-to-image` (export).
- Optional: `svg-path-bbox` for measuring path bounds.

## Migration Strategy

1. Refactor `App.tsx` into layout shell that renders new editor scaffolding while preserving existing shader utilities.
2. Extract WebGL renderer into reusable hook/component (`useGlassRenderer`).
3. Incrementally add features:
   - MVP: single frame, import images/SVG, single glass element overlay, export.
   - Iterate to multi-frame + asset library.
4. Update documentation and provide usage examples.

## Open Questions

- How to support arbitrary SVG fill/holes in mask? (Plan: use `Canvas2D` even-odd fill rule and upload as alpha mask texture.)
- Performance with many glass layers → consider batching or reducing blur radius dynamically.
- Undo/redo not in MVP but design state shape allows future integration.

---
This plan provides structure for implementing the requested Figma-like Liquid Glass design experience while reusing the existing shader work.
