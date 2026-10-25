import type { BlockType } from '@/types/storefront';
import { BANNER_BLOCKS } from '@/features/storefront/blockDefs/banner';
import { PRODUCT_BLOCKS } from '@/features/storefront/blockDefs/products';
import { CONTENT_BLOCKS } from '@/features/storefront/blockDefs/content';
import { INFO_BLOCKS } from '@/features/storefront/blockDefs/info';
import type { BlockDef } from '@/features/storefront/types';

export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  ...BANNER_BLOCKS,
  ...PRODUCT_BLOCKS,
  ...CONTENT_BLOCKS,
  ...INFO_BLOCKS,
};

export const BLOCK_ORDER = Object.keys(BLOCK_DEFS) as BlockType[];
