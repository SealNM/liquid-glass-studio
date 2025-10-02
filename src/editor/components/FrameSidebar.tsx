import { useCallback } from 'react';
import clsx from 'clsx';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useDesignStore } from '../store';
import styles from './FrameSidebar.module.scss';

export const FrameSidebar = () => {
  const frames = useDesignStore((state) => state.frames);
  const activeFrameId = useDesignStore((state) => state.activeFrameId);
  const setActiveFrame = useDesignStore((state) => state.setActiveFrame);
  const updateFrame = useDesignStore((state) => state.updateFrame);
  const deleteFrame = useDesignStore((state) => state.deleteFrame);
  const addFrame = useDesignStore((state) => state.addFrame);

  const handleSelect = useCallback(
    (frameId: string) => {
      setActiveFrame(frameId);
    },
    [setActiveFrame],
  );

  const handleRename = useCallback(
    (frameId: string) => {
      const frame = frames.find((item) => item.id === frameId);
      if (!frame) {
        return;
      }
      const newName = window.prompt('Rename frame', frame.name);
      if (!newName) {
        return;
      }
      updateFrame(frameId, { name: newName.trim() });
    },
    [frames, updateFrame],
  );

  const handleDelete = useCallback(
    (frameId: string) => {
      if (frames.length <= 1) {
        window.alert('At least one frame must remain.');
        return;
      }
      const frame = frames.find((item) => item.id === frameId);
      const confirmed = window.confirm(
        `Delete ${frame?.name ?? 'this frame'}? This action cannot be undone.`,
      );
      if (!confirmed) {
        return;
      }
      deleteFrame(frameId);
    },
    [deleteFrame, frames],
  );

  const handleDuplicate = useCallback(
    (frameId: string) => {
      const frame = frames.find((item) => item.id === frameId);
      if (!frame) {
        return;
      }
      const newId = addFrame({
        width: frame.width,
        height: frame.height,
        name: `${frame.name} Copy`,
        background: frame.background,
      });
      setActiveFrame(newId);
    },
    [addFrame, frames, setActiveFrame],
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>Frames</div>
      <div className={styles.frameList}>
        {frames.length === 0 ? (
          <div className={styles.emptyState}>
            No frames yet. Create one from the toolbar to start designing.
          </div>
        ) : (
          frames.map((frame) => (
            <div
              key={frame.id}
              className={clsx(styles.frameItem, {
                [styles.frameItemActive]: frame.id === activeFrameId,
              })}
              onClick={() => handleSelect(frame.id)}
            >
              <div className={styles.frameNameRow}>
                <div className={styles.frameName}>{frame.name}</div>
                <div className={styles.actionRow}>
                  <button
                    className={styles.iconButton}
                    title="Duplicate frame"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDuplicate(frame.id);
                    }}
                  >
                    <ContentCopyIcon fontSize="inherit" />
                  </button>
                  <button
                    className={styles.iconButton}
                    title="Rename frame"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRename(frame.id);
                    }}
                  >
                    <EditIcon fontSize="inherit" />
                  </button>
                  <button
                    className={styles.iconButton}
                    title="Delete frame"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(frame.id);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="inherit" />
                  </button>
                </div>
              </div>
              <div className={styles.frameMeta}>
                {frame.width} × {frame.height} px
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
