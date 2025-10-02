import { useCallback, useRef } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import styles from './App.module.scss';
import { TopBar } from './editor/components/TopBar';
import { FrameSidebar } from './editor/components/FrameSidebar';
import { StageView } from './editor/components/StageView';
import { InspectorPanel } from './editor/components/InspectorPanel';
import { AssetLibrary } from './editor/components/AssetLibrary';
import { useDesignStore } from './editor/store';

function App() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const frames = useDesignStore((state) => state.frames);
  const activeFrameId = useDesignStore((state) => state.activeFrameId);

  const handleExport = useCallback(async () => {
    const node = frameRef.current;
    if (!node) {
      window.alert('There is no frame to export.');
      return;
    }

    const frame = frames.find((item) => item.id === activeFrameId);
    const defaultName = frame?.name?.replace(/\s+/g, '-').toLowerCase() || 'frame';
    const format = window.prompt('Export format (png / jpg)', 'png')?.toLowerCase();
    if (!format) {
      return;
    }

    try {
      const fileName = `${defaultName}.${format === 'jpg' ? 'jpg' : 'png'}`;
      const dataUrl =
        format === 'jpg' || format === 'jpeg'
          ? await toJpeg(node, { quality: 0.95, pixelRatio: 2 })
          : await toPng(node, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export frame', error);
      window.alert('Export failed. Check console for details.');
    }
  }, [activeFrameId, frames]);

  return (
    <div className={styles.editorRoot}>
      <TopBar onExport={handleExport} />
      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <FrameSidebar />
          <AssetLibrary />
        </div>
        <div className={styles.stageArea}>
          <StageView frameRef={frameRef} />
        </div>
        <div className={styles.rightColumn}>
          <InspectorPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
