import { useCallback, useRef } from 'react';
import UploadIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import BlurOnIcon from '@mui/icons-material/BlurOnOutlined';
import { nanoid } from 'nanoid';
import { useDesignStore } from '../store';
import type { Asset, FrameElement, GlassElement, ImageAsset, SvgAsset } from '../types';
import { createDefaultGlassSettings } from '../glassDefaults';
import styles from './AssetLibrary.module.scss';

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const loadImageMeta = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (err) => reject(err);
    img.src = url;
  });

export const AssetLibrary = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const assets = useDesignStore((state) => state.assets);
  const registerAsset = useDesignStore((state) => state.registerAsset);
  const unregisterAsset = useDesignStore((state) => state.unregisterAsset);
  const addElement = useDesignStore((state) => state.addElement);
  const activeFrameId = useDesignStore((state) => state.activeFrameId);
  const setSelection = useDesignStore((state) => state.setSelection);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        const id = nanoid();
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          try {
            const meta = await loadImageMeta(url);
            const asset: ImageAsset = {
              id,
              type: 'image',
              name: file.name,
              url,
              previewUrl: url,
              width: meta.width,
              height: meta.height,
            };
            registerAsset(asset);
          } catch (err) {
            console.error('Failed to load image meta', err);
            URL.revokeObjectURL(url);
          }
        } else if (file.type === 'image/svg+xml') {
          try {
            const markup = await readFileAsText(file);
            const blob = new Blob([markup], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const asset: SvgAsset = {
              id,
              type: 'svg',
              name: file.name,
              url,
              previewUrl: url,
              markup,
            };
            registerAsset(asset);
          } catch (err) {
            console.error('Failed to parse svg', err);
          }
        }
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [registerAsset],
  );

  const handleAddToFrame = useCallback(
    (asset: Asset) => {
      if (!activeFrameId) {
        window.alert('Create or select a frame before adding assets.');
        return;
      }

      const baseSize = 240;
      const element: FrameElement =
        asset.type === 'image'
          ? {
              id: nanoid(),
              frameId: activeFrameId,
              type: 'image',
              assetId: asset.id,
              position: { x: 40, y: 40 },
              size: {
                width: Math.min(baseSize, asset.width),
                height: Math.min(baseSize, asset.height),
              },
              rotation: 0,
              zIndex: 1,
              opacity: 1,
              fit: 'cover',
            }
          : {
              id: nanoid(),
              frameId: activeFrameId,
              type: 'svg',
              assetId: asset.id,
              position: { x: 60, y: 60 },
              size: { width: baseSize, height: baseSize },
              rotation: 0,
              zIndex: 1,
              opacity: 1,
            };

      addElement(activeFrameId, element);
    },
    [activeFrameId, addElement],
  );

  const handleAddGlassToFrame = useCallback(
    (asset: SvgAsset) => {
      if (!activeFrameId) {
        window.alert('Create or select a frame before adding assets.');
        return;
      }

      const element: GlassElement = {
        id: nanoid(),
        frameId: activeFrameId,
        type: 'glass',
        mask: {
          kind: 'svg',
          assetId: asset.id,
        },
        settings: createDefaultGlassSettings(),
        position: { x: 72, y: 72 },
        size: { width: 280, height: 280 },
        rotation: 0,
        zIndex: 3,
        opacity: 1,
      };

      addElement(activeFrameId, element);
      setSelection({ elementIds: [element.id] });
    },
    [activeFrameId, addElement, setSelection],
  );

  const handleRemoveAsset = useCallback(
    (assetId: string) => {
      const ok = window.confirm('Remove asset from library? Elements using it will also be removed.');
      if (ok) {
        unregisterAsset(assetId);
      }
    },
    [unregisterAsset],
  );

  return (
    <section className={styles.assetLibrary}>
      <div className={styles.headerRow}>
        <span className={styles.title}>Assets</span>
        <button
          className={styles.uploadButton}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UploadIcon fontSize="small" /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,image/svg+xml"
          multiple
          hidden
          onChange={(event) => handleUpload(event.target.files)}
        />
      </div>

      <div className={styles.assetGrid}>
        {Object.values(assets).length === 0 ? (
          <div className={styles.emptyState}>Upload images or SVGs to build your library.</div>
        ) : (
          Object.values(assets).map((asset) => (
            <div
              key={asset.id}
              className={styles.assetCard}
              onClick={() => handleAddToFrame(asset)}
            >
              {asset.type === 'image' ? (
                <img src={asset.previewUrl} className={styles.assetThumb} alt={asset.name} />
              ) : (
                <img src={asset.previewUrl} className={styles.assetThumb} alt={asset.name} />
              )}
              <div className={styles.assetActions}>
                <button
                  className={styles.iconButton}
                  type="button"
                  title="Add to frame"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToFrame(asset);
                  }}
                >
                  <AddPhotoIcon sx={{ fontSize: 16 }} />
                </button>
                {asset.type === 'svg' ? (
                  <button
                    className={styles.iconButton}
                    type="button"
                    title="Add as Liquid Glass"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddGlassToFrame(asset);
                    }}
                  >
                    <BlurOnIcon sx={{ fontSize: 16 }} />
                  </button>
                ) : null}
                <button
                  className={styles.iconButton}
                  type="button"
                  title="Delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveAsset(asset.id);
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
              <span className={styles.assetLabel}>{asset.name}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
