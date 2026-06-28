import { z } from 'zod';

export const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
export const hexColorSchema = z
  .string()
  .regex(hexColorRegex, 'Invalid hex color');

export const itemTypeSchema = z.enum([
  'wardrobe',
  'table',
  'pot',
  'poster',
  'bed',
  'door',
  'ac',
  'window',
  'tv',
  'tubelight',
  'chair',
]);

export const dimensionsSchema = z.object({
  width: z.number().min(2).max(100),
  length: z.number().min(2).max(100),
  height: z.number().min(2).max(100),
});

export const furnitureItemSchema = z.object({
  id: z.string().max(100),
  type: itemTypeSchema,
  position: z.tuple([z.number(), z.number(), z.number()]),
  size: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number()]),
  woodType: z.string().max(50).optional(),
  color: hexColorSchema.optional(),
  secondaryColor: hexColorSchema.optional(),
  tertiaryColor: hexColorSchema.optional(),
  flipX: z.boolean().optional(),
  isOn: z.boolean().optional(),
});

export const configSchema = z.object({
  dimensions: dimensionsSchema.optional(),
  theme: z.string().max(50).optional(),
  wallColor: hexColorSchema.optional(),
  floorColor: hexColorSchema.optional(),
  lightColor: hexColorSchema.optional(),
  envLightIntensity: z.number().min(0).max(5).optional(),
  ceilingLightIntensity: z.number().min(0).max(10).optional(),
  windowTint: hexColorSchema.optional(),
  windowOpacity: z.number().min(0).max(1).optional(),
  items: z.array(furnitureItemSchema).max(100).optional(),
});
