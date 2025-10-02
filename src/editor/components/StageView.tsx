import {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { Rnd } from 'react-rnd';
import { useDesignStore } from '../store';
import { nanoid } from 'nanoid';
import type { FrameElement, GlassElement, ImageElement } from '../types';
import styles from './StageView.module.scss';

interface StageViewProps {
  frameRef?: MutableRefObject<HTMLDivElement | null>;
}

const fitToObjectFit = (fit: 'cover' | 'contain' | 'fill') => {
  switch (fit) {
    case 'cover':
      return 'cover';
    case 'contain':
      return 'contain';
    case 'fill':
    default:
      return 'fill';
  }
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export const StageView = ({ frameRef }: StageViewProps) => {
  const frames = useDesignStore((state) => state.frames);
  const activeFrameId = useDesignStore((state) => state.activeFrameId);
  const assets = useDesignStore((state) => state.assets);
  const updateElement = useDesignStore((state) => state.updateElement);
  const setSelection = useDesignStore((state) => state.setSelection);
  const selection = useDesignStore((state) => state.selection);
  const settings = useDesignStore((state) => state.settings);
  const deleteElement = useDesignStore((state) => state.deleteElement);
  const addElement = useDesignStore((state) => state.addElement);

  const frame = useMemo(() => frames.find((item) => item.id === activeFrameId) ?? null, [
    activeFrameId,
    frames,
  ]);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const panStartRef = useRef(pan);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!frameRef) {
      return;
    }
    const node = canvasRef.current;
    frameRef.current = node;
    return () => {
      if (frameRef.current === node) {
        frameRef.current = null;
      }
    };
  }, [frameRef]);

  const applySnap = useCallback(
    (value: number) => {
      if (!settings.snapToGrid || settings.gridSize <= 0) {
        return value;
      }
      return Math.round(value / settings.gridSize) * settings.gridSize;
    },
    [settings.gridSize, settings.snapToGrid],
  );

  const dragGrid = useMemo<[number, number] | undefined>(() => {
    if (!settings.snapToGrid || settings.gridSize <= 0) {
      return undefined;
    }
    return [settings.gridSize, settings.gridSize];
  }, [settings.gridSize, settings.snapToGrid]);

  const isSelected = useCallback(
    (elementId: string) => selection.elementIds.includes(elementId),
    [selection.elementIds],
  );

  const handleStageClick = useCallback(() => {
    if (isPanning || selection.elementIds.length === 0) {
      return;
    }
    setSelection({ elementIds: [] });
  }, [isPanning, selection.elementIds, setSelection]);

  const beginPan = useCallback(
    (event: ReactMouseEvent<HTMLElement> | MouseEvent) => {
      if (!spacePressed) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      panStartRef.current = pan;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      setIsPanning(true);
    },
    [pan, spacePressed],
  );

  const updatePanPosition = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (!isPanning) {
        return;
      }
      event.preventDefault();
      const deltaX = event.clientX - pointerStartRef.current.x;
      const deltaY = event.clientY - pointerStartRef.current.y;
      setPan({
        x: panStartRef.current.x + deltaX,
        y: panStartRef.current.y + deltaY,
      });
    },
    [isPanning],
  );

  const endPan = useCallback(() => {
    if (!isPanning) {
      return;
    }
    setIsPanning(false);
  }, [isPanning]);

  useEffect(() => {
    const handleMouseUp = () => {
      endPan();
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [endPan]);

  useEffect(() => {
    if (!spacePressed && isPanning) {
      setIsPanning(false);
    }
  }, [spacePressed, isPanning]);

  const adjustZoom = useCallback(
    (delta: number) => {
      setZoom((prev) => clampNumber(prev + delta, MIN_ZOOM, MAX_ZOOM));
    },
    [],
  );

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (event.ctrlKey) {
        event.preventDefault();
        adjustZoom(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
        return;
      }
      if (spacePressed) {
        event.preventDefault();
        setPan((prev) => ({
          x: prev.x - event.deltaX,
          y: prev.y - event.deltaY,
        }));
      }
    },
    [adjustZoom, spacePressed],
  );

  const duplicateSelectedElements = useCallback(() => {
    if (!frame || selection.elementIds.length === 0) {
      return;
    }

    const clones: string[] = [];
    const offset = settings.gridSize > 0 ? settings.gridSize : 24;

    selection.elementIds.forEach((id) => {
      const original = frame.elements.find((element) => element.id === id);
      if (!original) {
        return;
      }

      let clone: FrameElement;
      if (original.type === 'image') {
        clone = {
          ...original,
          id: nanoid(),
          frameId: frame.id,
          position: {
            x: original.position.x + offset,
            y: original.position.y + offset,
          },
          size: { ...original.size },
        };
      } else if (original.type === 'svg') {
        clone = {
          ...original,
          id: nanoid(),
          frameId: frame.id,
          position: {
            x: original.position.x + offset,
            y: original.position.y + offset,
          },
          size: { ...original.size },
        };
      } else {
        clone = {
          ...original,
          id: nanoid(),
          frameId: frame.id,
          position: {
            x: original.position.x + offset,
            y: original.position.y + offset,
          },
          size: { ...original.size },
          mask: { ...original.mask },
          settings: {
            ...original.settings,
            tint: { ...original.settings.tint },
          },
        };
      }

      clones.push(clone.id);
      addElement(frame.id, clone);
    });

    if (clones.length > 0) {
      setSelection({ elementIds: clones });
    }
  }, [addElement, frame, selection.elementIds, setSelection, settings.gridSize]);

  const nudgeSelectedElements = useCallback(
    (dx: number, dy: number) => {
      if (!frame || selection.elementIds.length === 0) {
        return;
      }

      selection.elementIds.forEach((id) => {
        const element = frame.elements.find((item) => item.id === id);
        if (!element) {
          return;
        }
        const nextX = applySnap(element.position.x + dx);
        const nextY = applySnap(element.position.y + dy);
        updateElement(frame.id, id, {
          position: {
            x: nextX,
            y: nextY,
          },
        });
      });
    },
    [applySnap, frame, selection.elementIds, updateElement],
  );

  const removeSelectedElements = useCallback(() => {
    if (!frame || selection.elementIds.length === 0) {
      return;
    }
    selection.elementIds.forEach((id) => {
      deleteElement(frame.id, id);
    });
    setSelection({ elementIds: [] });
  }, [deleteElement, frame, selection.elementIds, setSelection]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (event.code === 'Space') {
        if (!event.repeat) {
          event.preventDefault();
          setSpacePressed(true);
        }
        return;
      }

      if (!frame) {
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selection.elementIds.length > 0) {
        event.preventDefault();
        removeSelectedElements();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selection.elementIds.length > 0) {
        event.preventDefault();
        duplicateSelectedElements();
        return;
      }

      const step = event.shiftKey ? 10 : 1;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          nudgeSelectedElements(0, -step);
          break;
        case 'ArrowDown':
          event.preventDefault();
          nudgeSelectedElements(0, step);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          nudgeSelectedElements(-step, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          nudgeSelectedElements(step, 0);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    duplicateSelectedElements,
    frame,
    nudgeSelectedElements,
    removeSelectedElements,
    selection.elementIds.length,
  ]);

  const handleElementPointerDown = useCallback(
    (elementId: string) => {
      setSelection({ elementIds: [elementId] });
    },
    [setSelection],
  );

  if (!frame) {
    return (
      <div className={styles.stage}>
        <div className={styles.noFrame}>
          Create a frame to start designing your Liquid Glass composition.
        </div>
      </div>
    );
  }

  const backgroundStyle: CSSProperties = {
    width: frame.width,
    height: frame.height,
    background:
      frame.background.type === 'color'
        ? frame.background.value
        : 'rgba(255, 255, 255, 0.9)',
  };

  if (frame.background.type === 'asset') {
    const bgAsset = assets[frame.background.assetId];
    if (bgAsset?.type === 'image') {
      backgroundStyle.backgroundImage = `url(${bgAsset.url})`;
      backgroundStyle.backgroundSize =
        frame.background.fit === 'fill'
          ? '100% 100%'
          : frame.background.fit === 'cover'
            ? 'cover'
            : 'contain';
      backgroundStyle.backgroundPosition = 'center';
      backgroundStyle.backgroundRepeat = 'no-repeat';
    }
  }

  const elements = frame.elements;

  const renderGlassElement = (element: GlassElement) => {
    const glass = element.settings;
    const tintColor = `rgba(${glass.tint.r}, ${glass.tint.g}, ${glass.tint.b}, ${Math.min(1, glass.tint.a)})`;
    const highlight = `rgba(255, 255, 255, ${Math.min(0.9, 0.25 + glass.glareFactor / 180)})`;
    const outline = `rgba(255, 255, 255, ${Math.min(0.65, glass.fresnelFactor / 120)})`;
    const shadowStrength = 0.35 + glass.glareHardness / 220;
    const blurRadius = Math.max(8, glass.blurRadius);
    const saturation = 1 + glass.refFactor * 0.18;

    return (
      <div
        className={styles.glassElement}
        style={{
          backdropFilter: `saturate(${saturation}) blur(${blurRadius}px)`,
          WebkitBackdropFilter: `saturate(${saturation}) blur(${blurRadius}px)`,
          background: `linear-gradient(${glass.glareAngle}deg, ${highlight} 0%, ${tintColor} 45%, rgba(255,255,255,0.08) 100%)`,
          boxShadow: `0 22px 46px rgba(8, 18, 36, ${shadowStrength}), inset 0 1px 0 ${outline}`,
          borderColor: outline,
        }}
      >
        <span
          className={styles.glassSheen}
          style={{
            background: `radial-gradient(circle at 25% 20%, rgba(255,255,255,${Math.min(0.5, 0.18 + glass.glareRange / 180)}), transparent 60%)`,
            transform: `rotate(${glass.glareAngle}deg) translateY(-12%)`,
          }}
        />
      </div>
    );
  };

  const workspaceClassName = `${styles.workspace} ${
    spacePressed ? (isPanning ? styles.workspaceGrabbing : styles.workspaceGrab) : ''
  }`;

  return (
    <div className={styles.stage} onMouseDown={handleStageClick}>
      <div className={workspaceClassName} onWheel={handleWheel}>
        {settings.showGrid ? <div className={styles.gridBackground} /> : null}
        <div className={styles.frameWrapper}>
          <div
            className={styles.frameViewport}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
            }}
            onMouseDown={beginPan}
            onMouseMove={updatePanPosition}
            onMouseUp={endPan}
            onMouseLeave={endPan}
          >
            <div className={styles.frameCanvas} style={backgroundStyle} ref={canvasRef}>
              <div className={styles.elementsLayer}>
                {elements.length === 0 ? (
                  <div className={styles.placeholder}>Drop images or SVG assets here</div>
                ) : null}
                {elements.map((element) => {
                  const selected = isSelected(element.id);

                  const asset =
                    element.type === 'image' || element.type === 'svg'
                      ? assets[element.assetId]
                      : element.type === 'glass'
                        ? element.mask.assetId
                          ? assets[element.mask.assetId]
                          : null
                        : null;

                  const commonProps = {
                    size: {
                      width: element.size.width,
                      height: element.size.height,
                    },
                    position: {
                      x: element.position.x,
                      y: element.position.y,
                    },
                  };

                  const content = (() => {
                    if (element.type === 'image' && asset?.type === 'image') {
                      return (
                        <img
                          src={asset.url}
                          style={{ objectFit: fitToObjectFit((element as ImageElement).fit) }}
                          draggable={false}
                        />
                      );
                    }
                    if (element.type === 'svg' && asset?.type === 'svg') {
                      return (
                        <div
                          style={{ width: '100%', height: '100%' }}
                          dangerouslySetInnerHTML={{ __html: asset.markup }}
                        />
                      );
                    }
                    if (element.type === 'glass') {
                      return renderGlassElement(element);
                    }
                    return null;
                  })();

                  return (
                    <Rnd
                      key={element.id}
                      bounds="parent"
                      enableResizing
                      {...commonProps}
                      dragGrid={dragGrid}
                      resizeGrid={dragGrid}
                      disableDragging={spacePressed}
                      scale={zoom}
                      style={{
                        zIndex: element.zIndex,
                        opacity: element.opacity,
                      }}
                      onDragStop={(e, d) => {
                        updateElement(frame.id, element.id, {
                          position: {
                            x: applySnap(d.x),
                            y: applySnap(d.y),
                          },
                        });
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        updateElement(frame.id, element.id, {
                          size: {
                            width: Math.max(1, applySnap(ref.offsetWidth)),
                            height: Math.max(1, applySnap(ref.offsetHeight)),
                          },
                          position: {
                            x: applySnap(position.x),
                            y: applySnap(position.y),
                          },
                        });
                      }}
                      className={`${styles.element} ${selected ? styles.elementSelected : ''} ${element.type === 'glass' ? styles.glassWrapper : ''}`}
                      onMouseDown={(event) => {
                        if (spacePressed) {
                          beginPan(event);
                          return;
                        }
                        event.stopPropagation();
                        handleElementPointerDown(element.id);
                      }}
                    >
                      {content}
                      <span className={styles.elementLabel}>{element.type.toUpperCase()}</span>
                    </Rnd>
                  );
                })}
              </div>
              <div className={styles.frameOverlay} />
            </div>
          </div>
        </div>
        <div
          className={styles.viewportHud}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className={styles.zoomControl}>
            <button
              type="button"
              className={styles.hudButton}
              onClick={() => adjustZoom(-ZOOM_STEP)}
            >
              −
            </button>
            <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className={styles.hudButton}
              onClick={() => adjustZoom(ZOOM_STEP)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={styles.hudButton}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
};
