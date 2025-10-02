import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  Asset,
  DesignSettings,
  DesignState,
  Frame,
  FrameBackground,
  FrameElement,
  SelectionState,
} from './types';

const defaultSettings: DesignSettings = {
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
};

const createDefaultFrame = (): Frame => ({
  id: nanoid(),
  name: 'Frame 1',
  width: 800,
  height: 600,
  background: {
    type: 'color',
    value: '#f5f5f5',
  },
  elements: [],
});

const initialFrame = createDefaultFrame();

interface DesignStoreActions {
  addFrame: (payload?: Partial<Omit<Frame, 'id' | 'elements'>>) => string;
  updateFrame: (frameId: string, payload: Partial<Omit<Frame, 'id' | 'elements'>>) => void;
  deleteFrame: (frameId: string) => void;
  setActiveFrame: (frameId: string | null) => void;
  addElement: (frameId: string, element: FrameElement) => void;
  updateElement: (frameId: string, elementId: string, payload: Partial<FrameElement>) => void;
  deleteElement: (frameId: string, elementId: string) => void;
  registerAsset: (asset: Asset) => void;
  unregisterAsset: (assetId: string) => void;
  setSelection: (selection: SelectionState) => void;
  updateSettings: (settings: Partial<DesignSettings>) => void;
  reset: () => void;
}

type DesignStore = DesignState & DesignStoreActions;

export const useDesignStore = create<DesignStore>()((set, get) => ({
  frames: [initialFrame],
  activeFrameId: initialFrame.id,
  assets: {},
  selection: {
    elementIds: [],
  },
  settings: defaultSettings,

  addFrame: (payload?: Partial<Omit<Frame, 'id' | 'elements'>>) => {
    const frameId = nanoid();
    const existingCount = get().frames.length;
    const background: FrameBackground = payload?.background
      ? { ...payload.background }
      : {
          type: 'color',
          value: '#ffffff',
        };
    const frame: Frame = {
      id: frameId,
      name: payload?.name ?? `Frame ${existingCount + 1}`,
      width: payload?.width ?? 800,
      height: payload?.height ?? 600,
      background,
      elements: [],
    };
    set((state) => ({
      frames: [...state.frames, frame],
      activeFrameId: frame.id,
    }));
    return frameId;
  },

  updateFrame: (frameId: string, payload: Partial<Omit<Frame, 'id' | 'elements'>>) => {
    set((state) => {
      const { background, ...rest } = payload;
      return {
        frames: state.frames.map((frame) =>
          frame.id === frameId
            ? {
                ...frame,
                ...rest,
                background: background ? { ...background } : frame.background,
              }
            : frame,
        ),
      };
    });
  },

  deleteFrame: (frameId: string) => {
    set((state) => {
      if (state.frames.length <= 1) {
        return {};
      }
      const frames = state.frames.filter((frame) => frame.id !== frameId);
      const activeFrameId =
        state.activeFrameId === frameId ? (frames.length > 0 ? frames[0].id : null) : state.activeFrameId;
      return {
        frames,
        activeFrameId,
      };
    });
  },

  setActiveFrame: (frameId: string | null) => {
    set(() => ({
      activeFrameId: frameId,
    }));
  },

  addElement: (frameId: string, element: FrameElement) => {
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              elements: [...frame.elements, element],
            }
          : frame,
      ),
    }));
  },

  updateElement: (
    frameId: string,
    elementId: string,
    payload: Partial<FrameElement>,
  ) => {
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              elements: frame.elements.map((element) =>
                element.id === elementId
                  ? {
                      ...element,
                      ...payload,
                    } as FrameElement
                  : element,
              ),
            }
          : frame,
      ),
    }));
  },

  deleteElement: (frameId: string, elementId: string) => {
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              elements: frame.elements.filter((element) => element.id !== elementId),
            }
          : frame,
      ),
      selection:
        state.selection.elementIds.includes(elementId)
          ? {
              elementIds: state.selection.elementIds.filter((id) => id !== elementId),
            }
          : state.selection,
    }));
  },

  registerAsset: (asset: Asset) => {
    set((state) => ({
      assets: {
        ...state.assets,
        [asset.id]: asset,
      },
    }));
  },

  unregisterAsset: (assetId: string) => {
    set((state) => ({
      assets: Object.fromEntries(
        Object.entries(state.assets).filter(([id]) => id !== assetId),
      ),
      frames: state.frames.map((frame) => ({
        ...frame,
        elements: frame.elements.filter((element) => {
          if (element.type === 'image' || element.type === 'svg') {
            return element.assetId !== assetId;
          }
          if (element.type === 'glass') {
            return element.mask.assetId !== assetId;
          }
          return true;
        }),
      })),
    }));
  },

  setSelection: (selection: SelectionState) => {
    set(() => ({
      selection,
    }));
  },

  updateSettings: (settings: Partial<DesignSettings>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...settings,
      },
    }));
  },

  reset: () => {
    const fresh = createDefaultFrame();
    set({
      frames: [fresh],
      activeFrameId: fresh.id,
      assets: {},
      selection: {
        elementIds: [],
      },
      settings: defaultSettings,
    });
  },
}));
