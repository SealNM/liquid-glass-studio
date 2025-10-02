import { useCallback, type FC } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { useDesignStore } from '../store';
import styles from './TopBar.module.scss';

interface TopBarProps {
  onExport?: () => void;
}

export const TopBar: FC<TopBarProps> = ({ onExport }) => {
  const addFrame = useDesignStore((state) => state.addFrame);
  const frames = useDesignStore((state) => state.frames);

  const handleAddFrame = useCallback(() => {
    const widthInput = window.prompt('Frame width (px)', '1080');
    if (!widthInput) {
      return;
    }
    const heightInput = window.prompt('Frame height (px)', '1080');
    if (!heightInput) {
      return;
    }
    const width = Number.parseInt(widthInput, 10);
    const height = Number.parseInt(heightInput, 10);
    if (Number.isNaN(width) || Number.isNaN(height)) {
      window.alert('Please provide valid numeric values for width and height.');
      return;
    }
    addFrame({
      width,
      height,
    });
  }, [addFrame]);

  return (
    <header className={styles.topBar}>
      <div className={styles.titleGroup}>
        <div className={styles.title}>Liquid Glass Studio</div>
        <span className={styles.subtitle}>
          {frames.length} frame{frames.length === 1 ? '' : 's'} in project
        </span>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleAddFrame}>
          <AddIcon fontSize="small" />
          New Frame
        </button>
        <div className={styles.separator} />
        <button
          className={styles.button}
          onClick={() => {
            onExport?.();
          }}
        >
          <DownloadIcon fontSize="small" />
          Export Frame
        </button>
      </div>
    </header>
  );
};
