// Obstacle catalog shared by the simulation (collision) and the renderer (sprites).
export interface ObstacleType {
  shape: 'circle' | 'rect';
  r?: number; w?: number; h?: number;
  blocksShots: boolean;
  sprite: string;
  // sprite anchor: sprite bottom-center sits this many units below the collider center
  foot: number;
}

export const OBSTACLES: Record<string, ObstacleType> = {
  tree: { shape: 'circle', r: 30, blocksShots: true, sprite: 'ob_tree', foot: 18 },
  pine: { shape: 'circle', r: 26, blocksShots: true, sprite: 'ob_pine', foot: 16 },
  bush: { shape: 'circle', r: 24, blocksShots: false, sprite: 'ob_bush', foot: 14 },
  rock: { shape: 'circle', r: 26, blocksShots: true, sprite: 'ob_rock', foot: 14 },
  boulder: { shape: 'circle', r: 40, blocksShots: true, sprite: 'ob_boulder', foot: 20 },
  stump: { shape: 'circle', r: 20, blocksShots: true, sprite: 'ob_stump', foot: 12 },
  log: { shape: 'rect', w: 112, h: 34, blocksShots: true, sprite: 'ob_log', foot: 17 },
  fence: { shape: 'rect', w: 144, h: 18, blocksShots: false, sprite: 'ob_fence', foot: 9 },
  fencev: { shape: 'rect', w: 18, h: 144, blocksShots: false, sprite: 'ob_fencev', foot: 72 },
  house: { shape: 'rect', w: 150, h: 96, blocksShots: true, sprite: 'ob_house', foot: 48 },
  barrel: { shape: 'circle', r: 20, blocksShots: true, sprite: 'ob_barrel', foot: 12 },
  crate: { shape: 'rect', w: 46, h: 40, blocksShots: true, sprite: 'ob_crate', foot: 20 },
  hay: { shape: 'circle', r: 30, blocksShots: true, sprite: 'ob_hay', foot: 16 },
  well: { shape: 'circle', r: 32, blocksShots: true, sprite: 'ob_well', foot: 18 },
  cart: { shape: 'rect', w: 104, h: 52, blocksShots: true, sprite: 'ob_cart', foot: 26 },
  reeds: { shape: 'circle', r: 22, blocksShots: false, sprite: 'ob_reeds', foot: 12 },
  lilyrock: { shape: 'circle', r: 30, blocksShots: true, sprite: 'ob_shellrock', foot: 16 },
  driftwood: { shape: 'rect', w: 110, h: 30, blocksShots: true, sprite: 'ob_driftwood', foot: 15 },
};

export const DECOR_TYPES = ['flower', 'flower2', 'tuft', 'mushroom', 'pebble', 'clover', 'shell', 'leaf'];
