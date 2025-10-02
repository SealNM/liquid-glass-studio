import { useMemo, useState, useEffect } from 'react';
import { useDesignStore } from '../store';
import type { FrameElement, GlassElement, GlassSettings, ImageElement } from '../types';
import styles from './InspectorPanel.module.scss';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;

const hexToRgb = (hex: string, fallback: { r: number; g: number; b: number }) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return fallback;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return fallback;
  }
  return { r, g, b };
};

export const InspectorPanel = () => {
  const frames = useDesignStore((state) => state.frames);
  const activeFrameId = useDesignStore((state) => state.activeFrameId);
  const selection = useDesignStore((state) => state.selection);
  const updateFrame = useDesignStore((state) => state.updateFrame);
  const updateElement = useDesignStore((state) => state.updateElement);

  const frame = useMemo(() => frames.find((item) => item.id === activeFrameId) ?? null, [
    activeFrameId,
    frames,
  ]);

  const [dimensions, setDimensions] = useState({ width: frame?.width ?? 0, height: frame?.height ?? 0 });
  const [background, setBackground] = useState(
    frame?.background.type === 'color' ? frame.background.value : '#ffffff',
  );

  useEffect(() => {
    if (frame) {
      setDimensions({ width: frame.width, height: frame.height });
      if (frame.background.type === 'color') {
        setBackground(frame.background.value);
      }
    }
  }, [frame]);

  const selectedElements = useMemo(() => {
    if (!frame) {
      return [] as FrameElement[];
    }
    return frame.elements.filter((element) => selection.elementIds.includes(element.id));
  }, [frame, selection.elementIds]);

  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const isMultiSelection = selectedElements.length > 1;

  const handleElementChange = (updates: Partial<FrameElement>) => {
    if (!frame || !selectedElement) {
      return;
    }
    updateElement(frame.id, selectedElement.id, updates);
  };

  const handleGlassSettingChange = <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => {
    if (!frame || !selectedElement || selectedElement.type !== 'glass') {
      return;
    }
    updateElement(frame.id, selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        [key]: value,
      },
    });
  };

  if (!frame) {
    return (
      <aside className={styles.inspector}>
        <div className={styles.sectionTitle}>Inspector</div>
        <div className={styles.helper}>Select a frame or element to edit its properties.</div>
      </aside>
    );
  }

  return (
    <aside className={styles.inspector}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Frame</div>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <span className={styles.label}>Name</span>
            <input
              className={styles.input}
              value={frame.name}
              onChange={(event) => {
                updateFrame(frame.id, { name: event.target.value });
              }}
              placeholder="Frame name"
            />
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.label}>Dimensions</span>
            <div className={styles.numberInputs}>
              <input
                type="number"
                className={styles.input}
                value={dimensions.width}
                min={1}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  if (!Number.isNaN(value)) {
                    setDimensions((prev) => ({ ...prev, width: value }));
                    updateFrame(frame.id, { width: value });
                  }
                }}
              />
              <input
                type="number"
                className={styles.input}
                value={dimensions.height}
                min={1}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  if (!Number.isNaN(value)) {
                    setDimensions((prev) => ({ ...prev, height: value }));
                    updateFrame(frame.id, { height: value });
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.label}>Background</span>
            <input
              type="color"
              className={styles.input}
              value={background}
              onChange={(event) => {
                const value = event.target.value;
                setBackground(value);
                updateFrame(frame.id, {
                  background: {
                    type: 'color',
                    value,
                  },
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Element</div>
        {!selectedElement && !isMultiSelection ? (
          <div className={styles.helper}>Select an element to adjust its properties.</div>
        ) : null}
        {isMultiSelection ? (
          <div className={styles.helper}>
            {selectedElements.length} elements selected. Group alignment tools are coming soon.
          </div>
        ) : null}
        {selectedElement && !isMultiSelection ? (
          <div className={styles.fieldGroup}>
            <div className={styles.fieldRow}>
              <span className={styles.label}>Type</span>
              <div className={styles.badge}>{selectedElement.type.toUpperCase()}</div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.label}>Position</span>
              <div className={styles.numberInputs}>
                <input
                  type="number"
                  className={styles.input}
                  value={selectedElement.position.x}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({
                        position: { ...selectedElement.position, x: next },
                      });
                    }
                  }}
                />
                <input
                  type="number"
                  className={styles.input}
                  value={selectedElement.position.y}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({
                        position: { ...selectedElement.position, y: next },
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.label}>Size</span>
              <div className={styles.numberInputs}>
                <input
                  type="number"
                  className={styles.input}
                  value={selectedElement.size.width}
                  min={1}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({
                        size: { ...selectedElement.size, width: next },
                      });
                    }
                  }}
                />
                <input
                  type="number"
                  className={styles.input}
                  value={selectedElement.size.height}
                  min={1}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({
                        size: { ...selectedElement.size, height: next },
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.inlineRow}>
              <div className={styles.fieldRow}>
                <span className={styles.label}>Rotation</span>
                <input
                  type="number"
                  className={styles.input}
                  value={Math.round(selectedElement.rotation)}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({ rotation: next });
                    }
                  }}
                />
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.label}>Z-Index</span>
                <input
                  type="number"
                  className={styles.input}
                  value={selectedElement.zIndex}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      handleElementChange({ zIndex: next });
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.label}>Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(selectedElement.opacity * 100)}
                className={styles.slider}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);
                  if (!Number.isNaN(next)) {
                    handleElementChange({ opacity: clamp(next / 100, 0, 1) });
                  }
                }}
              />
            </div>

            {selectedElement.type === 'image' ? (
              <div className={styles.fieldRow}>
                <span className={styles.label}>Image Fit</span>
                <select
                  className={styles.select}
                  value={(selectedElement as ImageElement).fit}
                  onChange={(event) => {
                    handleElementChange({ fit: event.target.value as ImageElement['fit'] });
                  }}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Stretch</option>
                </select>
              </div>
            ) : null}

            {selectedElement.type === 'glass' ? (
              <div className={styles.fieldGroup}>
                <div className={styles.subheading}>Liquid Glass</div>
                <div className={styles.fieldRow}>
                  <span className={styles.label}>Tint</span>
                  <div className={styles.inlineRow}>
                    <input
                      type="color"
                      className={styles.input}
                      value={rgbToHex(
                        selectedElement.settings.tint.r,
                        selectedElement.settings.tint.g,
                        selectedElement.settings.tint.b,
                      )}
                      onChange={(event) => {
                        const rgb = hexToRgb(event.target.value, selectedElement.settings.tint);
                        handleGlassSettingChange('tint', {
                          ...selectedElement.settings.tint,
                          ...rgb,
                        });
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(selectedElement.settings.tint.a * 100)}
                      className={styles.slider}
                      onChange={(event) => {
                        const alpha = Number.parseInt(event.target.value, 10);
                        if (!Number.isNaN(alpha)) {
                          handleGlassSettingChange('tint', {
                            ...selectedElement.settings.tint,
                            a: clamp(alpha / 100, 0, 1),
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.label}>Blur Radius</span>
                  <input
                    type="range"
                    min={4}
                    max={96}
                    value={Math.round((selectedElement as GlassElement).settings.blurRadius)}
                    className={styles.slider}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      if (!Number.isNaN(next)) {
                        handleGlassSettingChange('blurRadius', next);
                      }
                    }}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.label}>Refraction</span>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    value={Math.round((selectedElement as GlassElement).settings.refFactor * 100)}
                    className={styles.slider}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      if (!Number.isNaN(next)) {
                        handleGlassSettingChange('refFactor', clamp(next / 100, 1, 3));
                      }
                    }}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.label}>Glare Angle</span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={(selectedElement as GlassElement).settings.glareAngle}
                    className={styles.slider}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      if (!Number.isNaN(next)) {
                        handleGlassSettingChange('glareAngle', next);
                      }
                    }}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.label}>Glare Strength</span>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={(selectedElement as GlassElement).settings.glareFactor}
                    className={styles.slider}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      if (!Number.isNaN(next)) {
                        handleGlassSettingChange('glareFactor', next);
                      }
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
};
