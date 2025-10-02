import type { GlassSettings } from './types';

export const createDefaultGlassSettings = (): GlassSettings => ({
  tint: { r: 240, g: 246, b: 255, a: 0.18 },
  refThickness: 20,
  refFactor: 1.4,
  dispersion: 7,
  fresnelRange: 30,
  fresnelHardness: 20,
  fresnelFactor: 20,
  glareRange: 36,
  glareHardness: 22,
  glareFactor: 90,
  glareConvergence: 55,
  glareOppositeFactor: 80,
  glareAngle: -45,
  blurRadius: 18,
});
