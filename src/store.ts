import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FurnitureItem, ItemType } from './types';
import { configSchema } from './schema';

export interface RoomState {
  dimensions: { width: number; length: number; height: number };
  theme: string;
  wallColor: string;
  floorColor: string;
  lightColor: string;
  envLightIntensity: number;
  ceilingLightIntensity: number;
  windowTint: string;
  windowOpacity: number;
  items: FurnitureItem[];
  selectedId: string | null;

  setDimensions: (dims: { width: number; length: number; height: number }) => void;
  setTheme: (theme: string) => void;
  setWallColor: (color: string) => void;
  setFloorColor: (color: string) => void;
  setLightColor: (color: string) => void;
  setEnvLightIntensity: (intensity: number) => void;
  setCeilingLightIntensity: (intensity: number) => void;
  setWindowTint: (color: string) => void;
  setWindowOpacity: (opacity: number) => void;
  setItems: (items: FurnitureItem[]) => void;
  setSelectedId: (id: string | null) => void;

  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  removeItem: (id: string) => void;
  addItem: (type: ItemType) => void;
  copyItem: (id: string) => void;
  clearItems: () => void;
  loadConfig: (config: any) => void;
}

const defaultItems: FurnitureItem[] = [
  { id: '1', type: 'wardrobe', position: [-1.4, 1.05, -1.1], size: [1.2, 2.2, 0.6], rotation: [0, 0, 0], woodType: 'oak' },
  { id: '2', type: 'bed', position: [0.6, 0.2, -0.4], size: [1.4, 0.5, 2.0], rotation: [0, 0, 0], woodType: 'walnut', secondaryColor: '#a0522d', tertiaryColor: '#f8fafc' },
  { id: '3', type: 'table', position: [-1.4, 0.315, 0.8], size: [1.2, 0.73, 0.6], rotation: [0, Math.PI / 2, 0], woodType: 'white' },
  { id: '4', type: 'door', position: [0.5, 1.0, 1.45], size: [0.9, 2.1, 0.1], rotation: [0, Math.PI, 0], woodType: 'white' },
  { id: '5', type: 'window', position: [-2.15, 1.2, 0], size: [1.07, 1.5, 0.08], rotation: [0, Math.PI / 2, 0] },
];

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      dimensions: { width: 4.2, length: 3.0, height: 3.3 },
      theme: 'warm',
      wallColor: '#d6dfeb',
      floorColor: '#e2e8f0',
      lightColor: '#ffffff',
      envLightIntensity: 0.6,
      ceilingLightIntensity: 2.5,
      windowTint: '#1e3a8a',
      windowOpacity: 0.8,
      items: defaultItems,
      selectedId: null,

      setDimensions: (dims) => set({ dimensions: dims }),
      setTheme: (theme) => set({ theme }),
      setWallColor: (wallColor) => set({ wallColor }),
      setFloorColor: (floorColor) => set({ floorColor }),
      setLightColor: (lightColor) => set({ lightColor }),
      setEnvLightIntensity: (envLightIntensity) => set({ envLightIntensity }),
      setCeilingLightIntensity: (ceilingLightIntensity) => set({ ceilingLightIntensity }),
      setWindowTint: (windowTint) => set({ windowTint }),
      setWindowOpacity: (windowOpacity) => set({ windowOpacity }),
      setItems: (items) => set({ items }),
      setSelectedId: (selectedId) => set({ selectedId }),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),

      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          return {
            items: newItems,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        }),

      addItem: (type) => {
        const newItem: FurnitureItem = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          type,
          position: [0, 1, 0],
          size: [1, 1, 1],
          rotation: [0, 0, 0],
        };
        if (type === 'bed') newItem.size = [1.4, 0.5, 2.0];
        if (type === 'wardrobe') newItem.size = [1.2, 2.2, 0.6];
        if (type === 'table') newItem.size = [1.2, 0.73, 0.6];
        if (type === 'pot') newItem.size = [0.4, 0.6, 0.4];
        if (type === 'poster') newItem.size = [1.2, 1.2, 0.05];
        if (type === 'door') newItem.size = [0.9, 2.1, 0.1];
        if (type === 'chair') newItem.size = [0.4, 0.85, 0.45];
        if (type === 'ac') {
          newItem.size = [0.8, 0.3, 0.2];
          newItem.position = [0, get().dimensions.height - 0.4, 0];
        }
        if (type === 'window') {
          newItem.size = [1.07, 1.5, 0.08];
          newItem.position = [0, 1.2, 0];
        }
        if (type === 'tv') {
          newItem.size = [1.44, 0.81, 0.04];
          newItem.position = [0, 1.2, 0];
        }
        if (type === 'tubelight') {
          newItem.size = [1.2, 0.05, 0.05];
          newItem.position = [0, get().dimensions.height - 0.2, 0];
          newItem.isOn = true;
          newItem.color = '#ffffff';
        }
        
        const isFloorItem = ['wardrobe', 'table', 'pot', 'bed', 'chair', 'door'].includes(type);
        if (isFloorItem) {
          newItem.position[1] = newItem.size[1] / 2 - 0.05;
        }

        set((state) => ({ items: [...state.items, newItem] }));
      },

      copyItem: (id) =>
        set((state) => {
          const itemToCopy = state.items.find((item) => item.id === id);
          if (!itemToCopy) return state;
          const newItem = {
            ...itemToCopy,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            position: [
              itemToCopy.position[0] + 0.2,
              itemToCopy.position[1],
              itemToCopy.position[2] + 0.2,
            ] as [number, number, number],
          };
          return { items: [...state.items, newItem] };
        }),

      clearItems: () => set({ items: [], selectedId: null }),

      loadConfig: (config) => {
        set((state) => ({
          dimensions: config.dimensions ?? state.dimensions,
          theme: config.theme ?? state.theme,
          wallColor: config.wallColor ?? state.wallColor,
          floorColor: config.floorColor ?? state.floorColor,
          lightColor: config.lightColor ?? state.lightColor,
          envLightIntensity: config.envLightIntensity ?? state.envLightIntensity,
          ceilingLightIntensity: config.ceilingLightIntensity ?? state.ceilingLightIntensity,
          windowTint: config.windowTint ?? state.windowTint,
          windowOpacity: config.windowOpacity ?? state.windowOpacity,
          items: config.items ?? state.items,
        }));
      },
    }),
    {
      name: 'room-vsa-storage',
      merge: (persistedState: any, currentState) => {
        // Run the entire loaded state through our schema when rehydrating
        if (!persistedState) return currentState;
        const result = configSchema.safeParse(persistedState);
        if (result.success) {
          return { ...currentState, ...result.data };
        }
        return currentState;
      },
    }
  )
);
