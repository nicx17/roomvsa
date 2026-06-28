export type ItemType =
  | 'wardrobe'
  | 'table'
  | 'pot'
  | 'poster'
  | 'bed'
  | 'door'
  | 'ac'
  | 'window'
  | 'tv'
  | 'tubelight'
  | 'chair';

export interface FurnitureItem {
  id: string;
  type: ItemType;
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  woodType?: string;
  color?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  flipX?: boolean;
  isOn?: boolean;
}
