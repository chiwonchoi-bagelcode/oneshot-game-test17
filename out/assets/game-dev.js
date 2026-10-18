"use strict";
(() => {
  // assets/art/atlas.json
  var atlas_default = { atlases: { sprites: { pages: ["sprites-0.png", "sprites-1.png", "sprites-2.png"], frames: { m_boss_forest_normal: { page: 0, x: 3, y: 3, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_forest_hit: { page: 0, x: 366, y: 3, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_forest_charge: { page: 0, x: 729, y: 3, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_village_normal: { page: 0, x: 1092, y: 3, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_village_hit: { page: 0, x: 1455, y: 3, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_village_charge: { page: 0, x: 3, y: 366, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_lake_normal: { page: 0, x: 366, y: 366, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_lake_hit: { page: 0, x: 729, y: 366, w: 360, h: 360, ax: 180, ay: 330 }, m_boss_lake_charge: { page: 0, x: 1092, y: 366, w: 360, h: 360, ax: 180, ay: 330 }, ob_fencev: { page: 0, x: 1455, y: 366, w: 50, h: 360, ax: 25, ay: 330 }, ob_house: { page: 0, x: 1508, y: 366, w: 360, h: 300, ax: 180, ay: 270 }, ob_house2: { page: 0, x: 3, y: 729, w: 360, h: 300, ax: 180, ay: 270 }, fx_rays: { page: 0, x: 366, y: 729, w: 300, h: 300, ax: 150, ay: 150 }, goostamp_0: { page: 0, x: 669, y: 729, w: 260, h: 260, ax: 130, ay: 130 }, goostamp_1: { page: 0, x: 932, y: 729, w: 260, h: 260, ax: 130, ay: 130 }, goostamp_2: { page: 0, x: 1195, y: 729, w: 260, h: 260, ax: 130, ay: 130 }, goostamp_3: { page: 0, x: 1458, y: 729, w: 260, h: 260, ax: 130, ay: 130 }, m_chunky_normal: { page: 0, x: 1721, y: 729, w: 220, h: 210, ax: 110, ay: 190 }, m_chunky_hit: { page: 0, x: 3, y: 1032, w: 220, h: 210, ax: 110, ay: 190 }, m_chunky_charge: { page: 0, x: 226, y: 1032, w: 220, h: 210, ax: 110, ay: 190 }, dc_treehouse: { page: 0, x: 449, y: 1032, w: 180, h: 210, ax: 90, ay: 196 }, gate_posts: { page: 0, x: 632, y: 1032, w: 280, h: 200, ax: 140, ay: 180 }, ob_tree: { page: 0, x: 915, y: 1032, w: 170, h: 200, ax: 85, ay: 186 }, ob_tree2: { page: 0, x: 1088, y: 1032, w: 170, h: 200, ax: 85, ay: 186 }, border_tree: { page: 0, x: 1261, y: 1032, w: 170, h: 200, ax: 85, ay: 186 }, ob_pine: { page: 0, x: 1434, y: 1032, w: 130, h: 190, ax: 65, ay: 178 }, border_pine: { page: 0, x: 1567, y: 1032, w: 130, h: 190, ax: 65, ay: 178 }, dc_fountain: { page: 0, x: 1700, y: 1032, w: 180, h: 180, ax: 90, ay: 160 }, kid_idle_0: { page: 0, x: 1883, y: 1032, w: 150, h: 180, ax: 72, ay: 168 }, kid_idle_1: { page: 0, x: 3, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_idle_2: { page: 0, x: 156, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_idle_3: { page: 0, x: 309, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_0: { page: 0, x: 462, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_1: { page: 0, x: 615, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_2: { page: 0, x: 768, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_3: { page: 0, x: 921, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_4: { page: 0, x: 1074, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_run_5: { page: 0, x: 1227, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_shoot_0: { page: 0, x: 1380, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_shoot_1: { page: 0, x: 1533, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_hurt_0: { page: 0, x: 1686, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_win_0: { page: 0, x: 1839, y: 1245, w: 150, h: 180, ax: 72, ay: 168 }, kid_win_1: { page: 0, x: 3, y: 1428, w: 150, h: 180, ax: 72, ay: 168 }, kid_win_2: { page: 0, x: 156, y: 1428, w: 150, h: 180, ax: 72, ay: 168 }, kid_win_3: { page: 0, x: 309, y: 1428, w: 150, h: 180, ax: 72, ay: 168 }, kid_sad_0: { page: 0, x: 462, y: 1428, w: 150, h: 180, ax: 72, ay: 168 }, kid_sad_1: { page: 0, x: 615, y: 1428, w: 150, h: 180, ax: 72, ay: 168 }, m_jumper_normal: { page: 0, x: 768, y: 1428, w: 150, h: 180, ax: 75, ay: 160 }, m_jumper_hit: { page: 0, x: 921, y: 1428, w: 150, h: 180, ax: 75, ay: 160 }, m_jumper_charge: { page: 0, x: 1074, y: 1428, w: 150, h: 180, ax: 75, ay: 160 }, ob_well: { page: 0, x: 1227, y: 1428, w: 150, h: 180, ax: 75, ay: 160 }, m_nest_normal: { page: 0, x: 1380, y: 1428, w: 210, h: 170, ax: 105, ay: 148 }, m_nest_hit: { page: 0, x: 1593, y: 1428, w: 210, h: 170, ax: 105, ay: 148 }, m_nest_charge: { page: 0, x: 1806, y: 1428, w: 210, h: 170, ax: 105, ay: 148 }, ob_boulder: { page: 0, x: 3, y: 1611, w: 190, h: 160, ax: 95, ay: 140 }, dc_slide: { page: 0, x: 196, y: 1611, w: 190, h: 160, ax: 95, ay: 146 }, m_splitter_normal: { page: 0, x: 389, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, m_splitter_hit: { page: 0, x: 552, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, m_splitter_charge: { page: 0, x: 715, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, m_dasher_normal: { page: 0, x: 878, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, m_dasher_hit: { page: 0, x: 1041, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, m_dasher_charge: { page: 0, x: 1204, y: 1611, w: 160, h: 160, ax: 80, ay: 140 }, mk_joybase: { page: 0, x: 1367, y: 1611, w: 160, h: 160, ax: 80, ay: 80 }, m_spitter_normal: { page: 0, x: 1530, y: 1611, w: 140, h: 160, ax: 70, ay: 140 }, m_spitter_hit: { page: 0, x: 1673, y: 1611, w: 140, h: 160, ax: 70, ay: 140 }, m_spitter_charge: { page: 0, x: 1816, y: 1611, w: 140, h: 160, ax: 70, ay: 140 }, fx_splash_0: { page: 0, x: 3, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, fx_splash_1: { page: 0, x: 186, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, fx_splash_2: { page: 0, x: 369, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, fx_splash_3: { page: 0, x: 552, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, fx_splash_4: { page: 0, x: 735, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, fx_splash_5: { page: 0, x: 918, y: 1774, w: 180, h: 150, ax: 90, ay: 100 }, cocoon_0: { page: 0, x: 1101, y: 1774, w: 150, h: 150, ax: 75, ay: 130 }, cocoon_1: { page: 0, x: 1254, y: 1774, w: 150, h: 150, ax: 75, ay: 130 }, cocoon_2: { page: 0, x: 1407, y: 1774, w: 150, h: 150, ax: 75, ay: 130 }, m_blob_normal: { page: 0, x: 1560, y: 1774, w: 140, h: 150, ax: 70, ay: 130 }, m_blob_hit: { page: 0, x: 1703, y: 1774, w: 140, h: 150, ax: 70, ay: 130 }, m_blob_charge: { page: 0, x: 1846, y: 1774, w: 140, h: 150, ax: 70, ay: 130 }, ob_cart: { page: 1, x: 3, y: 3, w: 230, h: 140, ax: 115, ay: 120 }, m_flyer_normal_0: { page: 1, x: 236, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, m_flyer_normal_1: { page: 1, x: 419, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, m_flyer_hit_0: { page: 1, x: 602, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, m_flyer_hit_1: { page: 1, x: 785, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, m_flyer_charge_0: { page: 1, x: 968, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, m_flyer_charge_1: { page: 1, x: 1151, y: 3, w: 180, h: 140, ax: 90, ay: 120 }, a_puppy_walk_0: { page: 1, x: 1334, y: 3, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_walk_1: { page: 1, x: 1467, y: 3, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_walk_2: { page: 1, x: 1600, y: 3, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_walk_3: { page: 1, x: 1733, y: 3, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_idle_0: { page: 1, x: 1866, y: 3, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_idle_1: { page: 1, x: 3, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_happy_0: { page: 1, x: 136, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_happy_1: { page: 1, x: 269, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_happy_2: { page: 1, x: 402, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_sleep_0: { page: 1, x: 535, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_sleep_1: { page: 1, x: 668, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_trapped_0: { page: 1, x: 801, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_puppy_trapped_1: { page: 1, x: 934, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_walk_0: { page: 1, x: 1067, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_walk_1: { page: 1, x: 1200, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_walk_2: { page: 1, x: 1333, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_walk_3: { page: 1, x: 1466, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_idle_0: { page: 1, x: 1599, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_idle_1: { page: 1, x: 1732, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_happy_0: { page: 1, x: 1865, y: 146, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_happy_1: { page: 1, x: 3, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_happy_2: { page: 1, x: 136, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_sleep_0: { page: 1, x: 269, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_sleep_1: { page: 1, x: 402, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_trapped_0: { page: 1, x: 535, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_bunny_trapped_1: { page: 1, x: 668, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_walk_0: { page: 1, x: 801, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_walk_1: { page: 1, x: 934, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_walk_2: { page: 1, x: 1067, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_walk_3: { page: 1, x: 1200, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_idle_0: { page: 1, x: 1333, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_idle_1: { page: 1, x: 1466, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_happy_0: { page: 1, x: 1599, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_happy_1: { page: 1, x: 1732, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_happy_2: { page: 1, x: 1865, y: 279, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_sleep_0: { page: 1, x: 3, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_sleep_1: { page: 1, x: 136, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_trapped_0: { page: 1, x: 269, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_squirrel_trapped_1: { page: 1, x: 402, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_walk_0: { page: 1, x: 535, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_walk_1: { page: 1, x: 668, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_walk_2: { page: 1, x: 801, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_walk_3: { page: 1, x: 934, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_idle_0: { page: 1, x: 1067, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_idle_1: { page: 1, x: 1200, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_happy_0: { page: 1, x: 1333, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_happy_1: { page: 1, x: 1466, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_happy_2: { page: 1, x: 1599, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_sleep_0: { page: 1, x: 1732, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_sleep_1: { page: 1, x: 1865, y: 412, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_trapped_0: { page: 1, x: 3, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_fox_trapped_1: { page: 1, x: 136, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_walk_0: { page: 1, x: 269, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_walk_1: { page: 1, x: 402, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_walk_2: { page: 1, x: 535, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_walk_3: { page: 1, x: 668, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_idle_0: { page: 1, x: 801, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_idle_1: { page: 1, x: 934, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_happy_0: { page: 1, x: 1067, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_happy_1: { page: 1, x: 1200, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_happy_2: { page: 1, x: 1333, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_sleep_0: { page: 1, x: 1466, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_sleep_1: { page: 1, x: 1599, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_trapped_0: { page: 1, x: 1732, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_hedgehog_trapped_1: { page: 1, x: 1865, y: 545, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_walk_0: { page: 1, x: 3, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_walk_1: { page: 1, x: 136, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_walk_2: { page: 1, x: 269, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_walk_3: { page: 1, x: 402, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_idle_0: { page: 1, x: 535, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_idle_1: { page: 1, x: 668, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_happy_0: { page: 1, x: 801, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_happy_1: { page: 1, x: 934, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_happy_2: { page: 1, x: 1067, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_sleep_0: { page: 1, x: 1200, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_sleep_1: { page: 1, x: 1333, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_trapped_0: { page: 1, x: 1466, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_fawn_trapped_1: { page: 1, x: 1599, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_walk_0: { page: 1, x: 1732, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_walk_1: { page: 1, x: 1865, y: 678, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_walk_2: { page: 1, x: 3, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_walk_3: { page: 1, x: 136, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_idle_0: { page: 1, x: 269, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_idle_1: { page: 1, x: 402, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_happy_0: { page: 1, x: 535, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_happy_1: { page: 1, x: 668, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_happy_2: { page: 1, x: 801, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_sleep_0: { page: 1, x: 934, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_sleep_1: { page: 1, x: 1067, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_trapped_0: { page: 1, x: 1200, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_kitten_trapped_1: { page: 1, x: 1333, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_walk_0: { page: 1, x: 1466, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_walk_1: { page: 1, x: 1599, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_walk_2: { page: 1, x: 1732, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_walk_3: { page: 1, x: 1865, y: 811, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_idle_0: { page: 1, x: 3, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_idle_1: { page: 1, x: 136, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_happy_0: { page: 1, x: 269, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_happy_1: { page: 1, x: 402, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_happy_2: { page: 1, x: 535, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_sleep_0: { page: 1, x: 668, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_sleep_1: { page: 1, x: 801, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_trapped_0: { page: 1, x: 934, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_duckling_trapped_1: { page: 1, x: 1067, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_walk_0: { page: 1, x: 1200, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_walk_1: { page: 1, x: 1333, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_walk_2: { page: 1, x: 1466, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_walk_3: { page: 1, x: 1599, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_idle_0: { page: 1, x: 1732, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_idle_1: { page: 1, x: 1865, y: 944, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_happy_0: { page: 1, x: 3, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_happy_1: { page: 1, x: 136, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_happy_2: { page: 1, x: 269, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_sleep_0: { page: 1, x: 402, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_sleep_1: { page: 1, x: 535, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_trapped_0: { page: 1, x: 668, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_piglet_trapped_1: { page: 1, x: 801, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_walk_0: { page: 1, x: 934, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_walk_1: { page: 1, x: 1067, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_walk_2: { page: 1, x: 1200, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_walk_3: { page: 1, x: 1333, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_idle_0: { page: 1, x: 1466, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_idle_1: { page: 1, x: 1599, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_happy_0: { page: 1, x: 1732, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_happy_1: { page: 1, x: 1865, y: 1077, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_happy_2: { page: 1, x: 3, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_sleep_0: { page: 1, x: 136, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_sleep_1: { page: 1, x: 269, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_trapped_0: { page: 1, x: 402, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_lamb_trapped_1: { page: 1, x: 535, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_walk_0: { page: 1, x: 668, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_walk_1: { page: 1, x: 801, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_walk_2: { page: 1, x: 934, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_walk_3: { page: 1, x: 1067, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_idle_0: { page: 1, x: 1200, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_idle_1: { page: 1, x: 1333, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_happy_0: { page: 1, x: 1466, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_happy_1: { page: 1, x: 1599, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_happy_2: { page: 1, x: 1732, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_sleep_0: { page: 1, x: 1865, y: 1210, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_sleep_1: { page: 1, x: 3, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_trapped_0: { page: 1, x: 136, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_chick_trapped_1: { page: 1, x: 269, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_walk_0: { page: 1, x: 402, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_walk_1: { page: 1, x: 535, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_walk_2: { page: 1, x: 668, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_walk_3: { page: 1, x: 801, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_idle_0: { page: 1, x: 934, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_idle_1: { page: 1, x: 1067, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_happy_0: { page: 1, x: 1200, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_happy_1: { page: 1, x: 1333, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_happy_2: { page: 1, x: 1466, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_sleep_0: { page: 1, x: 1599, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_sleep_1: { page: 1, x: 1732, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_trapped_0: { page: 1, x: 1865, y: 1343, w: 130, h: 130, ax: 62, ay: 118 }, a_otter_trapped_1: { page: 1, x: 3, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_walk_0: { page: 1, x: 136, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_walk_1: { page: 1, x: 269, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_walk_2: { page: 1, x: 402, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_walk_3: { page: 1, x: 535, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_idle_0: { page: 1, x: 668, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_idle_1: { page: 1, x: 801, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_happy_0: { page: 1, x: 934, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_happy_1: { page: 1, x: 1067, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_happy_2: { page: 1, x: 1200, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_sleep_0: { page: 1, x: 1333, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_sleep_1: { page: 1, x: 1466, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_trapped_0: { page: 1, x: 1599, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_turtle_trapped_1: { page: 1, x: 1732, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_walk_0: { page: 1, x: 1865, y: 1476, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_walk_1: { page: 1, x: 3, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_walk_2: { page: 1, x: 136, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_walk_3: { page: 1, x: 269, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_idle_0: { page: 1, x: 402, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_idle_1: { page: 1, x: 535, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_happy_0: { page: 1, x: 668, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_happy_1: { page: 1, x: 801, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_happy_2: { page: 1, x: 934, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_sleep_0: { page: 1, x: 1067, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_sleep_1: { page: 1, x: 1200, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_trapped_0: { page: 1, x: 1333, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_frog_trapped_1: { page: 1, x: 1466, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_walk_0: { page: 1, x: 1599, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_walk_1: { page: 1, x: 1732, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_walk_2: { page: 1, x: 1865, y: 1609, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_walk_3: { page: 1, x: 3, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_idle_0: { page: 1, x: 136, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_idle_1: { page: 1, x: 269, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_happy_0: { page: 1, x: 402, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_happy_1: { page: 1, x: 535, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_happy_2: { page: 1, x: 668, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_sleep_0: { page: 1, x: 801, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_sleep_1: { page: 1, x: 934, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_trapped_0: { page: 1, x: 1067, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_penguin_trapped_1: { page: 1, x: 1200, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_walk_0: { page: 1, x: 1333, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_walk_1: { page: 1, x: 1466, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_walk_2: { page: 1, x: 1599, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_walk_3: { page: 1, x: 1732, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_idle_0: { page: 1, x: 1865, y: 1742, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_idle_1: { page: 1, x: 3, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_happy_0: { page: 1, x: 136, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_happy_1: { page: 1, x: 269, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_happy_2: { page: 1, x: 402, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_sleep_0: { page: 1, x: 535, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_sleep_1: { page: 1, x: 668, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_trapped_0: { page: 1, x: 801, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, a_panda_trapped_1: { page: 1, x: 934, y: 1875, w: 130, h: 130, ax: 62, ay: 118 }, brush: { page: 1, x: 1067, y: 1875, w: 128, h: 128, ax: 64, ay: 64 }, fx_ring: { page: 1, x: 1198, y: 1875, w: 128, h: 128, ax: 64, ay: 64 }, fx_softring: { page: 1, x: 1329, y: 1875, w: 128, h: 128, ax: 64, ay: 64 }, fx_glow: { page: 1, x: 1460, y: 1875, w: 128, h: 128, ax: 64, ay: 64 }, ob_shellrock: { page: 1, x: 1591, y: 1875, w: 140, h: 120, ax: 70, ay: 104 }, sh_sign: { page: 1, x: 1734, y: 1875, w: 140, h: 120, ax: 70, ay: 110 }, kid_portrait: { page: 1, x: 1877, y: 1875, w: 120, h: 120, ax: 60, ay: 112 }, p_puppy: { page: 2, x: 3, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_bunny: { page: 2, x: 126, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_squirrel: { page: 2, x: 249, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_fox: { page: 2, x: 372, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_hedgehog: { page: 2, x: 495, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_fawn: { page: 2, x: 618, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_kitten: { page: 2, x: 741, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_duckling: { page: 2, x: 864, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_piglet: { page: 2, x: 987, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_lamb: { page: 2, x: 1110, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_chick: { page: 2, x: 1233, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_otter: { page: 2, x: 1356, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_turtle: { page: 2, x: 1479, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_frog: { page: 2, x: 1602, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_penguin: { page: 2, x: 1725, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, p_panda: { page: 2, x: 1848, y: 3, w: 120, h: 120, ax: 60, ay: 60 }, mk_shield: { page: 2, x: 3, y: 126, w: 120, h: 120, ax: 60, ay: 60 }, dc_pond: { page: 2, x: 126, y: 126, w: 200, h: 110, ax: 100, ay: 82 }, ob_rock: { page: 2, x: 329, y: 126, w: 130, h: 110, ax: 65, ay: 96 }, ob_reeds: { page: 2, x: 462, y: 126, w: 90, h: 110, ax: 45, ay: 100 }, mk_hand: { page: 2, x: 555, y: 126, w: 90, h: 110, ax: 30, ay: 12 }, gun_6: { page: 2, x: 648, y: 126, w: 168, h: 104, ax: 46, ay: 54 }, ob_hay: { page: 2, x: 819, y: 126, w: 140, h: 100, ax: 70, ay: 86 }, ob_crate: { page: 2, x: 962, y: 126, w: 120, h: 100, ax: 60, ay: 86 }, m_mini_normal: { page: 2, x: 1085, y: 126, w: 96, h: 96, ax: 48, ay: 84 }, m_mini_hit: { page: 2, x: 1184, y: 126, w: 96, h: 96, ax: 48, ay: 84 }, m_mini_charge: { page: 2, x: 1283, y: 126, w: 96, h: 96, ax: 48, ay: 84 }, ic_pause: { page: 2, x: 1382, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_play: { page: 2, x: 1481, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_close: { page: 2, x: 1580, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_back: { page: 2, x: 1679, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_arrow: { page: 2, x: 1778, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_gear: { page: 2, x: 1877, y: 126, w: 96, h: 96, ax: 48, ay: 48 }, ic_heart: { page: 2, x: 3, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_exit: { page: 2, x: 102, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_home: { page: 2, x: 201, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_map: { page: 2, x: 300, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_shelter: { page: 2, x: 399, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_upgrade: { page: 2, x: 498, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_missions: { page: 2, x: 597, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_daily: { page: 2, x: 696, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_streak: { page: 2, x: 795, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_gift: { page: 2, x: 894, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_music: { page: 2, x: 993, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_sfx: { page: 2, x: 1092, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_vibe: { page: 2, x: 1191, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_lang: { page: 2, x: 1290, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_gfx: { page: 2, x: 1389, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_eye: { page: 2, x: 1488, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_lock: { page: 2, x: 1587, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_check: { page: 2, x: 1686, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_star: { page: 2, x: 1785, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_star_empty: { page: 2, x: 1884, y: 249, w: 96, h: 96, ax: 48, ay: 48 }, ic_info: { page: 2, x: 3, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_reset: { page: 2, x: 102, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_paw: { page: 2, x: 201, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_crown: { page: 2, x: 300, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_goo: { page: 2, x: 399, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_coin: { page: 2, x: 498, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_up_power: { page: 2, x: 597, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_up_range: { page: 2, x: 696, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_up_health: { page: 2, x: 795, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_up_pressure: { page: 2, x: 894, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_up_splash: { page: 2, x: 993, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_thick: { page: 2, x: 1092, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_range: { page: 2, x: 1191, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_multi: { page: 2, x: 1290, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_pierce: { page: 2, x: 1389, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_chain: { page: 2, x: 1488, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_splash: { page: 2, x: 1587, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_turbo: { page: 2, x: 1686, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_keep: { page: 2, x: 1785, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_speed: { page: 2, x: 1884, y: 348, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_shield: { page: 2, x: 3, y: 447, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_trail: { page: 2, x: 102, y: 447, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_magnet: { page: 2, x: 201, y: 447, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_vitality: { page: 2, x: 300, y: 447, w: 96, h: 96, ax: 48, ay: 48 }, ic_skill_heal: { page: 2, x: 399, y: 447, w: 96, h: 96, ax: 48, ay: 48 }, ob_log: { page: 2, x: 498, y: 447, w: 250, h: 90, ax: 125, ay: 74 }, gate_goo: { page: 2, x: 751, y: 447, w: 160, h: 90, ax: 80, ay: 80 }, dc_flowers: { page: 2, x: 914, y: 447, w: 150, h: 90, ax: 75, ay: 74 }, ob_bush: { page: 2, x: 1067, y: 447, w: 120, h: 90, ax: 60, ay: 78 }, border_bush: { page: 2, x: 1190, y: 447, w: 120, h: 90, ax: 60, ay: 78 }, fx_impact_0: { page: 2, x: 1313, y: 447, w: 90, h: 90, ax: 45, ay: 55 }, fx_impact_1: { page: 2, x: 1406, y: 447, w: 90, h: 90, ax: 45, ay: 55 }, fx_impact_2: { page: 2, x: 1499, y: 447, w: 90, h: 90, ax: 45, ay: 55 }, fx_impact_3: { page: 2, x: 1592, y: 447, w: 90, h: 90, ax: 45, ay: 55 }, ob_barrel: { page: 2, x: 1685, y: 447, w: 76, h: 90, ax: 38, ay: 78 }, gun_5: { page: 2, x: 1764, y: 447, w: 132, h: 84, ax: 36, ay: 44 }, dc_cushion: { page: 2, x: 1899, y: 447, w: 130, h: 80, ax: 65, ay: 66 }, mk_joyknob: { page: 2, x: 3, y: 546, w: 80, h: 80, ax: 40, ay: 40 }, dc_ball: { page: 2, x: 86, y: 546, w: 80, h: 80, ax: 40, ay: 70 }, gun_4: { page: 2, x: 169, y: 546, w: 120, h: 74, ax: 50, ay: 39 }, ob_fence: { page: 2, x: 292, y: 546, w: 320, h: 70, ax: 160, ay: 56 }, ob_driftwood: { page: 2, x: 615, y: 546, w: 240, h: 70, ax: 120, ay: 56 }, gun_3: { page: 2, x: 858, y: 546, w: 112, h: 70, ax: 44, ay: 37 }, gun_2: { page: 2, x: 973, y: 546, w: 96, h: 70, ax: 30, ay: 37 }, ob_stump: { page: 2, x: 1072, y: 546, w: 80, h: 70, ax: 40, ay: 56 }, mk_arrow: { page: 2, x: 1155, y: 546, w: 70, h: 70, ax: 35, ay: 35 }, pack_0: { page: 2, x: 1228, y: 546, w: 60, h: 70, ax: 30, ay: 40 }, pack_1: { page: 2, x: 1291, y: 546, w: 60, h: 70, ax: 30, ay: 40 }, pack_2: { page: 2, x: 1354, y: 546, w: 60, h: 70, ax: 30, ay: 40 }, gun_1: { page: 2, x: 1417, y: 546, w: 90, h: 64, ax: 28, ay: 34 }, dc_bowl: { page: 2, x: 1510, y: 546, w: 90, h: 64, ax: 45, ay: 54 }, p_mist: { page: 2, x: 1603, y: 546, w: 64, h: 64, ax: 32, ay: 32 }, mk_help: { page: 2, x: 1670, y: 546, w: 64, h: 60, ax: 32, ay: 56 }, gun_0: { page: 2, x: 1737, y: 546, w: 70, h: 56, ax: 26, ay: 30 }, mk_excl: { page: 2, x: 1810, y: 546, w: 48, h: 56, ax: 24, ay: 52 }, shadow: { page: 2, x: 1861, y: 546, w: 120, h: 48, ax: 60, ay: 24 }, goo_drop_0: { page: 2, x: 1984, y: 546, w: 48, h: 48, ax: 24, ay: 24 }, goo_drop_1: { page: 2, x: 3, y: 629, w: 48, h: 48, ax: 24, ay: 24 }, mk_zzz: { page: 2, x: 54, y: 629, w: 44, h: 40, ax: 22, ay: 38 }, d_flower_0: { page: 2, x: 101, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_flower_1: { page: 2, x: 144, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_flower_2: { page: 2, x: 187, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_flower_3: { page: 2, x: 230, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_flower_4: { page: 2, x: 273, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_tuft: { page: 2, x: 316, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, d_mushroom: { page: 2, x: 359, y: 629, w: 40, h: 40, ax: 20, ay: 34 }, p_bubble: { page: 2, x: 402, y: 629, w: 40, h: 40, ax: 20, ay: 20 }, p_star: { page: 2, x: 445, y: 629, w: 40, h: 40, ax: 20, ay: 20 }, p_heal: { page: 2, x: 488, y: 629, w: 36, h: 40, ax: 18, ay: 22 }, p_sparkle_0: { page: 2, x: 527, y: 629, w: 36, h: 36, ax: 18, ay: 18 }, p_sparkle_1: { page: 2, x: 566, y: 629, w: 36, h: 36, ax: 18, ay: 18 }, p_sparkle_2: { page: 2, x: 605, y: 629, w: 36, h: 36, ax: 18, ay: 18 }, p_xp: { page: 2, x: 644, y: 629, w: 30, h: 36, ax: 15, ay: 20 }, p_heart: { page: 2, x: 677, y: 629, w: 36, h: 34, ax: 18, ay: 17 }, p_coin_0: { page: 2, x: 716, y: 629, w: 34, h: 34, ax: 17, ay: 17 }, p_coin_1: { page: 2, x: 753, y: 629, w: 34, h: 34, ax: 17, ay: 17 }, p_coin_2: { page: 2, x: 790, y: 629, w: 34, h: 34, ax: 17, ay: 17 }, p_coin_3: { page: 2, x: 827, y: 629, w: 34, h: 34, ax: 17, ay: 17 }, p_dust: { page: 2, x: 864, y: 629, w: 40, h: 30, ax: 20, ay: 15 }, d_clover: { page: 2, x: 907, y: 629, w: 30, h: 30, ax: 15, ay: 24 }, p_water: { page: 2, x: 940, y: 629, w: 24, h: 28, ax: 12, ay: 16 }, d_pebble_0: { page: 2, x: 967, y: 629, w: 30, h: 26, ax: 15, ay: 20 }, d_pebble_1: { page: 2, x: 1e3, y: 629, w: 30, h: 26, ax: 15, ay: 20 }, d_shell: { page: 2, x: 1033, y: 629, w: 30, h: 26, ax: 15, ay: 22 }, d_leaf: { page: 2, x: 1066, y: 629, w: 30, h: 22, ax: 15, ay: 16 }, p_goo_violet: { page: 2, x: 1099, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_pink: { page: 2, x: 1124, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_amber: { page: 2, x: 1149, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_indigo: { page: 2, x: 1174, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_plum: { page: 2, x: 1199, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_teal: { page: 2, x: 1224, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_berry: { page: 2, x: 1249, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_goo_royal: { page: 2, x: 1274, y: 629, w: 22, h: 22, ax: 11, ay: 11 }, p_water_s: { page: 2, x: 1299, y: 629, w: 14, h: 16, ax: 7, ay: 9 }, p_petal: { page: 2, x: 1316, y: 629, w: 18, h: 14, ax: 9, ay: 7 }, p_conf_0: { page: 2, x: 1337, y: 629, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_1: { page: 2, x: 1356, y: 629, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_2: { page: 2, x: 1375, y: 629, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_3: { page: 2, x: 1394, y: 629, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_4: { page: 2, x: 1413, y: 629, w: 16, h: 12, ax: 8, ay: 6 } } }, tiles: { pages: ["tiles-0.png"], frames: { g_0: { page: 0, x: 3, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_1: { page: 0, x: 102, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_2: { page: 0, x: 201, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_3: { page: 0, x: 300, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_1: { page: 0, x: 399, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_2: { page: 0, x: 498, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_3: { page: 0, x: 597, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_4: { page: 0, x: 696, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_5: { page: 0, x: 795, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_6: { page: 0, x: 894, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_7: { page: 0, x: 993, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_8: { page: 0, x: 1092, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_9: { page: 0, x: 1191, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_10: { page: 0, x: 1290, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_11: { page: 0, x: 1389, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_12: { page: 0, x: 1488, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_13: { page: 0, x: 1587, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_14: { page: 0, x: 1686, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_15: { page: 0, x: 1785, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_water_1: { page: 0, x: 1884, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_water_2: { page: 0, x: 3, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_3: { page: 0, x: 102, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_4: { page: 0, x: 201, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_5: { page: 0, x: 300, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_6: { page: 0, x: 399, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_7: { page: 0, x: 498, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_8: { page: 0, x: 597, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_9: { page: 0, x: 696, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_10: { page: 0, x: 795, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_11: { page: 0, x: 894, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_12: { page: 0, x: 993, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_13: { page: 0, x: 1092, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_14: { page: 0, x: 1191, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_15: { page: 0, x: 1290, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_1: { page: 0, x: 1389, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_2: { page: 0, x: 1488, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_3: { page: 0, x: 1587, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_4: { page: 0, x: 1686, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_5: { page: 0, x: 1785, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_6: { page: 0, x: 1884, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_7: { page: 0, x: 3, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_8: { page: 0, x: 102, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_9: { page: 0, x: 201, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_10: { page: 0, x: 300, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_11: { page: 0, x: 399, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_12: { page: 0, x: 498, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_13: { page: 0, x: 597, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_14: { page: 0, x: 696, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_15: { page: 0, x: 795, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_1: { page: 0, x: 894, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_2: { page: 0, x: 993, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_3: { page: 0, x: 1092, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_4: { page: 0, x: 1191, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_5: { page: 0, x: 1290, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_6: { page: 0, x: 1389, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_7: { page: 0, x: 1488, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_8: { page: 0, x: 1587, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_9: { page: 0, x: 1686, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_10: { page: 0, x: 1785, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_11: { page: 0, x: 1884, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_12: { page: 0, x: 3, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_13: { page: 0, x: 102, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_14: { page: 0, x: 201, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_15: { page: 0, x: 300, y: 300, w: 96, h: 96, ax: 0, ay: 0 } } } }, points: { gun_0: { muzzle: [39, -2] }, gun_1: { muzzle: [55, -3] }, gun_2: { muzzle: [57, -6] }, gun_3: { muzzle: [66, -3] }, gun_4: { muzzle: [75, -2] }, gun_5: { muzzle: [80, -4] }, gun_6: { muzzle: [106, -6] } } };

  // src/engine/atlas.ts
  var ART_SCALE = 2;
  var META = atlas_default;
  var frames = /* @__PURE__ */ new Map();
  var pages = [];
  async function loadAtlases(onProgress) {
    const list = [];
    for (const [name, a] of Object.entries(META.atlases)) a.pages.forEach((p, idx) => list.push({ atlas: name, idx, url: "assets/art/" + p }));
    let done = 0;
    const imgs = {};
    await Promise.all(list.map(async (it) => {
      var _a;
      const img = new Image();
      img.decoding = "async";
      img.src = it.url;
      await new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("image " + it.url));
      });
      try {
        await img.decode();
      } catch {
      }
      (imgs[_a = it.atlas] || (imgs[_a] = []))[it.idx] = img;
      pages.push(img);
      onProgress(++done / list.length);
    }));
    for (const [name, a] of Object.entries(META.atlases)) {
      for (const [fname, f] of Object.entries(a.frames)) frames.set(fname, { img: imgs[name][f.page], x: f.x, y: f.y, w: f.w, h: f.h, ax: f.ax, ay: f.ay });
    }
  }
  function frame(name) {
    return frames.get(name);
  }
  function point(sprite, key) {
    return META.points[sprite]?.[key] ?? [0, 0];
  }
  var missing = /* @__PURE__ */ new Set();
  function draw(ctx2, name, x, y, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1) {
    const f = frames.get(name);
    if (!f) {
      if (!missing.has(name)) {
        missing.add(name);
        console.warn("missing sprite", name);
      }
      return;
    }
    drawFrame(ctx2, f, x, y, scale, flipX, rot, alpha, sx, sy);
  }
  function drawFrame(ctx2, f, x, y, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1) {
    const k = scale / ART_SCALE;
    if (alpha <= 3e-3) return;
    const prevA = ctx2.globalAlpha;
    if (alpha !== 1) ctx2.globalAlpha = prevA * alpha;
    if (!rot && !flipX && sx === 1 && sy === 1) {
      ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
    } else {
      ctx2.save();
      ctx2.translate(x, y);
      if (rot) ctx2.rotate(rot);
      ctx2.scale((flipX ? -1 : 1) * sx, sy);
      ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
      ctx2.restore();
    }
    if (alpha !== 1) ctx2.globalAlpha = prevA;
  }

  // src/engine/audio.ts
  var LIMITS = {
    goo_hit: { max: 3, gap: 0.05 },
    cocoon_hit: { max: 2, gap: 0.08 },
    pickup_xp: { max: 4, gap: 0.03 },
    pickup_coin: { max: 4, gap: 0.035 },
    coin_tick: { max: 2, gap: 0.03 },
    goo_burst: { max: 4, gap: 0.03 },
    enemy_spit: { max: 3, gap: 0.06 },
    ui_tap: { max: 2, gap: 0.04 }
  };
  var AudioManager = class {
    constructor() {
      this.ctx = null;
      this.sfxGain = null;
      this.musicGain = null;
      this.buffers = /* @__PURE__ */ new Map();
      this.playing = /* @__PURE__ */ new Map();
      this.loopNodes = /* @__PURE__ */ new Map();
      this.manifest = null;
      this.music = null;
      this.fading = [];
      this.musicVol = 0.7;
      this.sfxVol = 0.9;
      this.wantMusic = null;
      this.hidden = false;
      this.duck = 1;
      this.decoded = false;
      this.routeMusic = location.protocol === "http:" || location.protocol === "https:";
    }
    init(manifest) {
      this.manifest = manifest;
      const unlock = () => this.unlock();
      window.addEventListener("pointerdown", unlock, { capture: true });
      window.addEventListener("keydown", unlock, { capture: true });
      document.addEventListener("visibilitychange", () => this.onVisibility());
      window.addEventListener("pagehide", () => this.onVisibility(true));
      window.addEventListener("pageshow", () => this.onVisibility(false));
      window.addEventListener("focus", () => {
        if (!document.hidden) this.resume();
      });
    }
    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
          this.ctx = new AC({ latencyHint: "interactive" });
        } catch {
          return;
        }
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVol;
        this.sfxGain.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVol;
        this.musicGain.connect(this.ctx.destination);
        this.ctx.onstatechange = () => {
          if (this.ctx && this.ctx.state !== "running" && !this.hidden) this.ctx.resume().catch(() => {
          });
        };
        void this.decodeAll();
      }
      this.resume();
    }
    async decodeAll() {
      if (this.decoded || !this.ctx) return;
      this.decoded = true;
      const embedded = window.__SFX__ || {};
      const names = Object.keys(this.manifest?.sfx ?? embedded);
      await Promise.all(names.map(async (name) => {
        try {
          let buf;
          if (embedded[name]) {
            const bin = atob(embedded[name]);
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            buf = u8.buffer;
          } else {
            const r = await fetch("assets/audio/" + this.manifest.sfx[name].file);
            buf = await r.arrayBuffer();
          }
          const ab = await this.ctx.decodeAudioData(buf);
          this.buffers.set(name, ab);
        } catch {
        }
      }));
    }
    resume() {
      if (this.hidden) return;
      if (this.ctx && this.ctx.state !== "running") this.ctx.resume().catch(() => {
      });
      if (this.music && this.music.el.paused && this.wantMusic) this.music.el.play().catch(() => {
      });
    }
    onVisibility(forceHidden) {
      this.hidden = forceHidden ?? document.hidden;
      if (this.hidden) {
        if (this.ctx && this.ctx.state === "running") this.ctx.suspend().catch(() => {
        });
        if (this.music) this.music.el.pause();
        for (const el of this.fading) el.pause();
      } else this.resume();
    }
    setVolumes(music, sfx) {
      this.musicVol = music;
      this.sfxVol = sfx;
      if (this.sfxGain) this.sfxGain.gain.value = sfx;
      this.applyMusicVol();
    }
    applyMusicVol() {
      const v = this.musicVol * this.duck;
      if (this.music) {
        if (this.music.gain && this.ctx) this.music.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.08);
        else this.music.el.volume = Math.max(0, Math.min(1, v));
      }
    }
    play(name, o = {}) {
      if (!this.ctx || !this.sfxGain || this.ctx.state !== "running" || this.sfxVol <= 0) return;
      let buf = this.buffers.get(name);
      if (!buf) {
        const v = [1, 2, 3].map((i) => this.buffers.get(`${name}_${i}`)).filter(Boolean);
        if (!v.length) return;
        buf = v[Math.floor(Math.random() * v.length)];
      }
      const lim = LIMITS[name] ?? { max: 6, gap: 0.015 };
      const st = this.playing.get(name) ?? { n: 0, last: -1 };
      const now = this.ctx.currentTime;
      if (st.n >= lim.max || now - st.last < lim.gap) return;
      st.n++;
      st.last = now;
      this.playing.set(name, st);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const vary = o.vary ?? 0.06;
      src.playbackRate.value = (o.rate ?? 1) * (1 + (Math.random() * 2 - 1) * vary);
      const g = this.ctx.createGain();
      g.gain.value = o.vol ?? 1;
      let node = g;
      if (o.pan && this.ctx.createStereoPanner) {
        const p = this.ctx.createStereoPanner();
        p.pan.value = Math.max(-1, Math.min(1, o.pan));
        g.connect(p);
        node = p;
      }
      src.connect(g);
      node.connect(this.sfxGain);
      src.onended = () => {
        st.n = Math.max(0, st.n - 1);
      };
      src.start();
    }
    loop(name, on, vol = 1, rate = 1) {
      if (!this.ctx || !this.sfxGain) return;
      const cur = this.loopNodes.get(name);
      if (on) {
        if (!cur) {
          const buf = this.buffers.get(name);
          if (!buf) return;
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const g = this.ctx.createGain();
          g.gain.value = 0;
          src.connect(g);
          g.connect(this.sfxGain);
          src.start();
          this.loopNodes.set(name, { src, gain: g });
          g.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.03);
        } else {
          cur.gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
          cur.src.playbackRate.setTargetAtTime(rate, this.ctx.currentTime, 0.05);
        }
      } else if (cur) {
        cur.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
        const src = cur.src;
        this.loopNodes.delete(name);
        setTimeout(() => {
          try {
            src.stop();
          } catch {
          }
        }, 300);
      }
    }
    stopLoops() {
      for (const k of [...this.loopNodes.keys()]) this.loop(k, false);
    }
    music_(name) {
      this.playMusic(name);
    }
    playMusic(name) {
      this.wantMusic = name;
      if (this.music && this.music.name === name) {
        if (this.music.el.paused && !this.hidden) this.music.el.play().catch(() => {
        });
        return;
      }
      if (this.music) {
        const old = this.music;
        this.music = null;
        this.fadeOut(old);
      }
      if (!name || !this.manifest?.music[name]) return;
      const el = new Audio("assets/audio/" + this.manifest.music[name].file);
      el.loop = true;
      el.preload = "auto";
      const m = { name, el };
      if (this.routeMusic && this.ctx && this.musicGain) {
        try {
          m.node = this.ctx.createMediaElementSource(el);
          m.gain = this.ctx.createGain();
          m.gain.gain.value = 0;
          m.node.connect(m.gain);
          m.gain.connect(this.musicGain);
        } catch {
          m.node = void 0;
          m.gain = void 0;
        }
      }
      if (!m.gain) el.volume = 0;
      this.music = m;
      if (!this.hidden) el.play().catch(() => {
      });
      if (m.gain && this.ctx) {
        m.gain.gain.setTargetAtTime(this.duck, this.ctx.currentTime, 0.4);
      } else {
        const start = performance.now();
        const step = () => {
          if (this.music !== m) return;
          const k = Math.min(1, (performance.now() - start) / 900);
          el.volume = Math.max(0, Math.min(1, this.musicVol * this.duck * k));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
    fadeOut(m) {
      this.fading.push(m.el);
      const done = () => {
        m.el.pause();
        m.el.src = "";
        this.fading = this.fading.filter((e) => e !== m.el);
      };
      if (m.gain && this.ctx) {
        m.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
        setTimeout(done, 1200);
        return;
      }
      const v0 = m.el.volume;
      const start = performance.now();
      const step = () => {
        const k = Math.min(1, (performance.now() - start) / 700);
        m.el.volume = Math.max(0, v0 * (1 - k));
        if (k < 1) requestAnimationFrame(step);
        else done();
      };
      requestAnimationFrame(step);
    }
    duckMusic(level2, seconds) {
      this.duck = level2;
      this.applyMusicVol();
      setTimeout(() => {
        this.duck = 1;
        this.applyMusicVol();
      }, seconds * 1e3);
    }
    // the stinger plays on the sfx bus
    stinger(name) {
      this.play(name, { vary: 0 });
    }
  };
  var audio = new AudioManager();

  // src/engine/input.ts
  var DEAD = 9;
  var FULL = 46;
  var InputController = class {
    constructor(el) {
      this.joy = { active: false, ox: 0, oy: 0, x: 0, y: 0, mx: 0, my: 0, everMoved: false };
      this.enabled = false;
      this.pid = -1;
      this.down = (e) => {
        if (!this.enabled) return;
        if (this.pid !== -1 && e.pointerType === "touch") return;
        e.preventDefault();
        this.pid = e.pointerId;
        const j = this.joy;
        j.active = true;
        j.ox = j.x = e.clientX;
        j.oy = j.y = e.clientY;
        j.mx = j.my = 0;
        try {
          this.el.setPointerCapture(e.pointerId);
        } catch {
        }
      };
      this.move = (e) => {
        if (e.pointerId !== this.pid || !this.joy.active) return;
        e.preventDefault();
        const j = this.joy;
        j.x = e.clientX;
        j.y = e.clientY;
        let dx = j.x - j.ox, dy = j.y - j.oy;
        let d = Math.hypot(dx, dy);
        const maxR = FULL * 1.5;
        if (d > maxR) {
          j.ox += dx / d * (d - maxR);
          j.oy += dy / d * (d - maxR);
          dx = j.x - j.ox;
          dy = j.y - j.oy;
          d = maxR;
        }
        if (d < DEAD) {
          j.mx = 0;
          j.my = 0;
          return;
        }
        const k = Math.min(1, 0.45 + 0.55 * (d - DEAD) / (FULL - DEAD));
        j.mx = dx / d * k;
        j.my = dy / d * k;
        j.everMoved = true;
      };
      this.up = (e) => {
        if (e.pointerId === this.pid) this.release();
      };
      this.el = el;
      el.addEventListener("pointerdown", this.down, { passive: false });
      window.addEventListener("pointermove", this.move, { passive: false });
      window.addEventListener("pointerup", this.up);
      window.addEventListener("pointercancel", this.up);
      window.addEventListener("blur", () => this.release());
    }
    release() {
      this.pid = -1;
      const j = this.joy;
      j.active = false;
      j.mx = 0;
      j.my = 0;
    }
  };
  var shared = null;
  function initInput(el) {
    shared = new InputController(el);
    return shared;
  }
  function getInput() {
    return shared;
  }

  // src/engine/quality.ts
  var PRESETS = {
    low: { dprCap: 1, particles: 140, streamFx: false, bgScale: 1, fpsCap: 30, shake: true, glow: false },
    medium: { dprCap: 1.75, particles: 320, streamFx: true, bgScale: 1.5, fpsCap: 60, shake: true, glow: true },
    high: { dprCap: 2.5, particles: 600, streamFx: true, bgScale: 2, fpsCap: 60, shake: true, glow: true }
  };
  var level = "medium";
  var listeners = [];
  function quality() {
    return PRESETS[level];
  }
  function setQuality(l) {
    if (l === level) return;
    level = l;
    for (const f of listeners) f();
  }
  function onQualityChange(f) {
    listeners.push(f);
  }
  function defaultQuality() {
    const mem = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (mem <= 2 || cores <= 2) return "low";
    if (mem >= 6 && cores >= 6 && !/Android|iPhone|iPad/i.test(navigator.userAgent)) return "high";
    return "medium";
  }

  // src/engine/screen.ts
  var screen = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    safe: { top: 0, right: 0, bottom: 0, left: 0 }
  };
  var listeners2 = [];
  function onResize(f) {
    listeners2.push(f);
  }
  var probe = null;
  function readSafe() {
    if (!probe) {
      probe = document.createElement("div");
      probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
      document.body.appendChild(probe);
    }
    const cs = getComputedStyle(probe);
    screen.safe.top = parseFloat(cs.paddingTop) || 0;
    screen.safe.right = parseFloat(cs.paddingRight) || 0;
    screen.safe.bottom = parseFloat(cs.paddingBottom) || 0;
    screen.safe.left = parseFloat(cs.paddingLeft) || 0;
  }
  function initScreen(canvas) {
    screen.canvas = canvas;
    screen.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const resize = () => {
      readSafe();
      screen.w = window.innerWidth;
      screen.h = window.innerHeight;
      screen.dpr = Math.min(window.devicePixelRatio || 1, quality().dprCap);
      canvas.width = Math.round(screen.w * screen.dpr);
      canvas.height = Math.round(screen.h * screen.dpr);
      canvas.style.width = screen.w + "px";
      canvas.style.height = screen.h + "px";
      for (const f of listeners2) f();
    };
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 120));
    onQualityChange(resize);
    resize();
  }

  // src/engine/haptics.ts
  var PATTERNS = {
    tick: 6,
    light: 12,
    medium: 24,
    heavy: [38, 30, 38],
    success: [18, 50, 28],
    fail: [60, 40, 90]
  };
  var enabled = true;
  var last = 0;
  var canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  function setHaptics(on) {
    enabled = on;
  }
  function buzz(kind) {
    if (!enabled || !canVibrate) return;
    const now = performance.now();
    if (kind === "tick" && now - last < 70) return;
    if (now - last < 30) return;
    last = now;
    try {
      navigator.vibrate(PATTERNS[kind]);
    } catch {
    }
  }

  // data/i18n/ko.json
  var ko_default = {
    "app.title": "\uBB3C\uCD1D \uAD6C\uC870\uB300",
    "common.close": "\uB2EB\uAE30",
    "common.back": "\uB4A4\uB85C",
    "common.ok": "\uD655\uC778",
    "common.cancel": "\uCDE8\uC18C",
    "common.yes": "\uB124",
    "common.no": "\uC544\uB2C8\uC694",
    "common.claim": "\uBC1B\uAE30",
    "common.claimed": "\uBC1B\uC74C",
    "common.new": "NEW",
    "common.locked": "\uC7A0\uAE40",
    "common.max": "\uCD5C\uACE0",
    "loading.text": "\uBB3C\uCD1D\uC5D0 \uBB3C \uCC44\uC6B0\uB294 \uC911\u2026",
    "title.tap": "\uB20C\uB7EC\uC11C \uC2DC\uC791",
    "title.play": "\uAD6C\uC870 \uCD9C\uBC1C!",
    "hud.lv": "Lv {n}",
    "hud.room": "{a}/{b}",
    "hint.drag": "\uB04C\uC5B4\uC11C \uC6C0\uC9C1\uC5EC\uC694",
    "hint.stop": "\uC190\uC744 \uB5BC\uBA74 \uBC1C\uC0AC!",
    "hint.rescue": "\uBB3C\uC744 \uBFCC\uB824 \uAD6C\uD574 \uC8FC\uC138\uC694!",
    "hint.gate": "\uCD9C\uAD6C\uB85C \uAC00\uC694!",
    "hint.range": "\uC870\uAE08 \uB354 \uAC00\uAE4C\uC774!",
    "hint.pressure": "\uBA48\uCDB0 \uC788\uC73C\uBA74 \uC218\uC555\uC774 \uCC28\uC694!",
    "toast.pressure": "\uCD5C\uB300 \uC218\uC555!",
    "toast.rescued": "{name} \uAD6C\uCD9C!",
    "toast.brave": "\uC6A9\uAC10\uD55C \uAD6C\uCD9C!",
    "toast.cheer": "\uC751\uC6D0 +{p}",
    "toast.clean": "\uAE68\uB057\uD574\uC84C\uC5B4\uC694!",
    "toast.newMonster": "\uC0C8 \uB048\uC801\uC774",
    "toast.bossPhase": "\uD654\uB0AC\uC5B4\uC694! \uC870\uC2EC!",
    "toast.waveIncoming": "\uB354 \uBAB0\uB824\uC640\uC694!",
    "levelup.title": "\uB808\uBCA8 \uC5C5!",
    "levelup.pick": "\uD558\uB098\uB97C \uACE8\uB77C\uC694",
    "levelup.stack": "{n}\uB2E8\uACC4",
    "skill.thick.name": "\uAD75\uC740 \uBB3C\uC904\uAE30",
    "skill.thick.desc": "\uBB3C\uC904\uAE30 \uD53C\uD574 +22%, \uAD75\uAE30 +15%",
    "skill.range.name": "\uBA40\uB9AC \uC3D8\uAE30",
    "skill.range.desc": "\uC0AC\uAC70\uB9AC +18%",
    "skill.multi.name": "\uAC08\uB798 \uBB3C\uC904\uAE30",
    "skill.multi.desc": "\uBB3C\uC904\uAE30\uAC00 \uD558\uB098 \uB354 \uB098\uC640 \uB2E4\uB978 \uB048\uC801\uC774\uB97C \uC53B\uC5B4\uC694 (\uD53C\uD574 55%)",
    "skill.pierce.name": "\uB6AB\uB294 \uBB3C\uC904\uAE30",
    "skill.pierce.desc": "\uBB3C\uC904\uAE30\uAC00 \uB048\uC801\uC774\uB97C \uB6AB\uACE0 \uB4A4\uC5D0 \uC788\uB294 \uAC83\uAE4C\uC9C0 \uC53B\uC5B4\uC694 (\uD53C\uD574 70%)",
    "skill.chain.name": "\uD295\uAE30\uB294 \uBB3C\uC904\uAE30",
    "skill.chain.desc": "\uB9DE\uC740 \uB048\uC801\uC774 \uC606\uC73C\uB85C \uBB3C\uC774 \uD280\uC5B4\uC694 (\uD53C\uD574 50%)",
    "skill.splash.name": "\uBB3C\uBCF4\uB77C \uD3ED\uBC1C",
    "skill.splash.desc": "\uB048\uC801\uC774\uAC00 \uD130\uC9C8 \uB54C \uBB3C\uBCF4\uB77C \uD53C\uD574 +60%, \uBC94\uC704 +25%",
    "skill.turbo.name": "\uC218\uC555 \uD130\uBCF4",
    "skill.turbo.desc": "\uC218\uC555\uC774 45% \uB354 \uBE68\uB9AC \uCC28\uC694. \uCD5C\uB300 \uC218\uC555 \uC704\uB825 +0.2\uBC30",
    "skill.keep.name": "\uC218\uC555 \uC720\uC9C0",
    "skill.keep.desc": "\uC6C0\uC9C1\uC5EC\uB3C4 \uC218\uC555\uC774 55% \uB35C \uBE60\uC838\uC694",
    "skill.speed.name": "\uBE60\uB978 \uBC1C",
    "skill.speed.desc": "\uC774\uB3D9 \uC18D\uB3C4 +12%, \uB048\uC801\uC774 \uBC14\uB2E5\uC5D0\uC11C \uB35C \uB290\uB824\uC838\uC694",
    "skill.shield.name": "\uAC70\uD488 \uBC29\uD328",
    "skill.shield.desc": "\uACF5\uACA9\uC744 \uD55C \uBC88 \uB9C9\uC544 \uC918\uC694. {s}\uCD08\uB9C8\uB2E4 \uB2E4\uC2DC \uC0DD\uACA8\uC694",
    "skill.trail.name": "\uAC70\uD488 \uAE38",
    "skill.trail.desc": "\uC6C0\uC9C1\uC774\uBA74 \uAC70\uD488\uC774 \uB0A8\uC544\uC694. \uB048\uC801\uC774\uAC00 \uBC1F\uC73C\uBA74 \uD391!",
    "skill.magnet.name": "\uBB3C\uBC29\uC6B8 \uC790\uC11D",
    "skill.magnet.desc": "\uC90D\uB294 \uBC94\uC704 +80%, \uACBD\uD5D8\uCE58 +15%",
    "skill.vitality.name": "\uD2BC\uD2BC\uD55C \uBAB8",
    "skill.vitality.desc": "\uCD5C\uB300 \uCCB4\uB825 +20%, \uCCB4\uB825 20% \uD68C\uBCF5",
    "skill.heal.name": "\uD68C\uBCF5",
    "skill.heal.desc": "\uCCB4\uB825 40% \uD68C\uBCF5",
    "pause.title": "\uC7A0\uAE50 \uC26C\uC5B4\uC694",
    "pause.resume": "\uACC4\uC18D\uD558\uAE30",
    "pause.quit": "\uADF8\uB9CC\uD558\uACE0 \uB098\uAC00\uAE30",
    "pause.quitNote": "\uC9C0\uAE08 \uB098\uAC00\uB3C4 \uAD6C\uD55C \uB3D9\uBB3C\uACFC \uCF54\uC778\uC740 \uADF8\uB300\uB85C \uAC00\uC838\uAC00\uC694.",
    "pause.settings": "\uC124\uC815",
    "revive.title": "\uB048\uC801\uC774\uC5D0 \uB36E\uC600\uC5B4\uC694!",
    "revive.desc": "\uC774\uBC88 \uD310\uC5D0 \uD55C \uBC88, \uB2E4\uC2DC \uC77C\uC5B4\uB0A0 \uC218 \uC788\uC5B4\uC694.",
    "revive.yes": "\uB2E4\uC2DC \uC77C\uC5B4\uB098\uAE30",
    "revive.no": "\uADF8\uB9CC\uD558\uAE30",
    "result.clear": "\uAD6C\uC5ED \uC815\uD654 \uC644\uB8CC!",
    "result.fail": "\uC774\uBC88\uC5D4 \uC5EC\uAE30\uAE4C\uC9C0!",
    "result.quit": "\uC624\uB298\uC740 \uC5EC\uAE30\uAE4C\uC9C0!",
    "result.coins": "\uCF54\uC778",
    "result.animals": "\uAD6C\uD55C \uB3D9\uBB3C",
    "result.washed": "\uC53B\uC5B4 \uB0B8 \uB048\uC801\uC774",
    "result.rooms": "\uC815\uD654\uD55C \uBC29",
    "result.firstClear": "\uCCAB \uC815\uD654 \uBCF4\uB108\uC2A4",
    "result.clearBonus": "\uC815\uD654 \uBCF4\uB108\uC2A4",
    "result.kept": "\uAD6C\uD55C \uB3D9\uBB3C\uACFC \uCF54\uC778\uC740 \uBAA8\uB450 \uB0B4 \uAC70\uC608\uC694!",
    "result.tapSkip": "\uB20C\uB7EC\uC11C \uB118\uAE30\uAE30",
    "result.next": "\uB2E4\uC74C \uAD6C\uC5ED",
    "result.again": "\uD55C \uBC88 \uB354",
    "result.retry": "\uB2E4\uC2DC \uB3C4\uC804",
    "result.map": "\uC9C0\uB3C4",
    "result.home": "\uBCF4\uD638\uC18C\uB85C",
    "result.bond": "\uCE5C\uBC00\uB3C4 {n}",
    "result.newFriend": "\uC0C8 \uCE5C\uAD6C!",
    "result.upgradeHint": "\uCF54\uC778\uC73C\uB85C \uAC15\uD574\uC838\uC694!",
    "result.tip.spitter": "\uD264\uD264 \uB048\uC801\uC774\uC758 \uBB3C\uBC29\uC6B8\uC740 \uBA48\uCD94\uAE30 \uC804\uC5D0 \uD53C\uD574\uC694.",
    "result.tip.contact": "\uB048\uC801\uC774\uAC00 \uBD99\uAE30 \uC804\uC5D0 \uC218\uC555\uC744 \uCC44\uC6CC \uC53B\uC5B4\uC694.",
    "result.tip.dasher": "\uB3CC\uC9C4 \uB048\uC801\uC774\uB294 \uC904\uC774 \uBCF4\uC774\uBA74 \uC606\uC73C\uB85C \uBE44\uCF1C\uC694.",
    "result.tip.jumper": "\uD1B5\uD1B5 \uB048\uC801\uC774\uC758 \uADF8\uB9BC\uC790 \uBC16\uC73C\uB85C \uB098\uAC00\uC694.",
    "result.tip.chunky": "\uC655\uBC29\uC6B8 \uB048\uC801\uC774\uAC00 \uBE5B\uB098\uBA74 \uBB3C\uBC29\uC6B8 \uC0AC\uC774\uB85C \uD53C\uD574\uC694.",
    "result.tip.boss": "\uD0B9 \uB048\uC801\uC774\uAC00 \uB6F0\uC5B4\uC624\uB974\uBA74 \uADF8\uB9BC\uC790\uC5D0\uC11C \uBC97\uC5B4\uB098\uC694.",
    "result.tip.upgrade": "\uBB3C\uC904\uAE30 \uC138\uAE30\uB97C \uC62C\uB9AC\uBA74 \uD6E8\uC52C \uBE68\uB9AC \uC53B\uACA8\uC694.",
    "result.tip.generic": "\uAC15\uD654\uD558\uACE0 \uB2E4\uC2DC \uC624\uBA74 \uAE08\uBC29 \uAE68\uB057\uD574\uC9C8 \uAC70\uC608\uC694.",
    "upgrade.title": "\uAC15\uD654",
    "upgrade.buy": "{n}",
    "upgrade.lv": "Lv {n}",
    "upgrade.maxed": "\uCD5C\uACE0 \uB2E8\uACC4",
    "upgrade.notEnough": "\uCF54\uC778\uC774 \uBD80\uC871\uD574\uC694",
    "upgrade.power.name": "\uBB3C\uC904\uAE30 \uC138\uAE30",
    "upgrade.power.desc": "\uD53C\uD574 +12%, \uAD75\uAE30 +5% (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.range.name": "\uC0AC\uAC70\uB9AC",
    "upgrade.range.desc": "\uC0AC\uAC70\uB9AC +5% (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.health.name": "\uCCB4\uB825",
    "upgrade.health.desc": "\uCD5C\uB300 \uCCB4\uB825 +10% (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.pressure.name": "\uC218\uC555",
    "upgrade.pressure.desc": "\uC218\uC555 \uCC28\uB294 \uC18D\uB3C4 +5%, \uCD5C\uB300 \uC218\uC555 \uC704\uB825 +0.05\uBC30 (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.splash.name": "\uBB3C\uBCF4\uB77C",
    "upgrade.splash.desc": "\uD130\uC9C8 \uB54C \uBB3C\uBCF4\uB77C \uD53C\uD574 +10%, \uBC94\uC704\uB3C4 \uB113\uC5B4\uC838\uC694 (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.stat.power": "\uD53C\uD574 {a} \u2192 {b}",
    "upgrade.stat.range": "\uC0AC\uAC70\uB9AC {a} \u2192 {b}",
    "upgrade.stat.health": "\uCCB4\uB825 {a} \u2192 {b}",
    "upgrade.stat.pressure": "\uCD5C\uB300 \uC218\uC555 {a} \u2192 {b}",
    "upgrade.stat.splash": "\uBB3C\uBCF4\uB77C {a} \u2192 {b}",
    "upgrade.gunNext": "\uB2E4\uC74C \uC9C4\uD654\uAE4C\uC9C0 \uAC15\uD654 {n}\uBC88",
    "upgrade.gunFinal": "\uCD5C\uACE0\uC758 \uBB3C\uB300\uD3EC!",
    "upgrade.dream": "\uC5B8\uC820\uAC00 \uC774 \uBB3C\uB300\uD3EC\uB85C \uC232 \uC804\uCCB4\uB97C \uC53B\uC5B4 \uB0BC \uAC70\uC608\uC694",
    "gun.0": "\uC791\uC740 \uBB3C\uCD1D",
    "gun.1": "\uD38C\uD504 \uBB3C\uCD1D",
    "gun.2": "\uC30D\uBC1C \uBB3C\uCD1D",
    "gun.3": "\uBB3C\uD0F1\uD06C \uBB3C\uCD1D",
    "gun.4": "\uC18C\uBC29 \uD638\uC2A4",
    "gun.5": "\uBB3C\uB300\uD3EC",
    "gun.6": "\uAC70\uB300 \uBB3C\uB300\uD3EC",
    "gun.evolved": "\uBB3C\uCD1D\uC774 \uC9C4\uD654\uD588\uC5B4\uC694!",
    "gun.evolvedDesc": "\uBB3C\uC904\uAE30\uAC00 \uB354 \uAD75\uACE0 \uBA40\uB9AC \uB098\uAC00\uC694.",
    "region.forest": "\uD587\uC0B4 \uC232",
    "region.village": "\uD48D\uCC28 \uB9C8\uC744",
    "region.lake": "\uBC18\uC9DD \uD638\uC218",
    "stage.label": "{r} {n}",
    "stage.short": "{n}\uAD6C\uC5ED",
    "stage.play": "\uCD9C\uBC1C!",
    "stage.animals": "\uB9CC\uB0A0 \uC218 \uC788\uB294 \uB3D9\uBB3C",
    "stage.cleared": "\uC815\uD654 \uC644\uB8CC",
    "stage.best": "\uCD5C\uACE0 \uAE30\uB85D",
    "stage.boss": "\uBCF4\uC2A4",
    "stage.newGoo": "\uC0C8 \uB048\uC801\uC774",
    "stage.locked": "\uC55E \uAD6C\uC5ED\uC744 \uBA3C\uC800 \uC815\uD654\uD574\uC694",
    "stage.help": "\uB3C4\uC6C0 \uBC1B\uAE30: \uC774\uBC88 \uD310\uC740 \uCCB4\uB825 +30%, \uD53C\uD574 +20%",
    "stage.helpOffer": "\uCE5C\uAD6C\uB4E4\uC774 \uC751\uC6D0\uD558\uB7EC \uC654\uC5B4\uC694! \uC774\uBC88 \uD310 \uCCB4\uB825 +30%, \uD53C\uD574 +20%",
    "map.title": "\uC9C0\uB3C4",
    "map.progress": "{a}/{b} \uC815\uD654",
    "nav.upgrade": "\uAC15\uD654",
    "nav.map": "\uBAA8\uD5D8",
    "nav.shelter": "\uBCF4\uD638\uC18C",
    "shelter.title": "\uB3D9\uBB3C \uBCF4\uD638\uC18C",
    "shelter.count": "{a}/{b}\uB9C8\uB9AC",
    "shelter.empty": "\uC544\uC9C1 \uBABB \uB9CC\uB0AC\uC5B4\uC694",
    "shelter.where": "{place}\uC5D0\uC11C \uB9CC\uB0A0 \uC218 \uC788\uC5B4\uC694",
    "shelter.whereStreak": "\uCD9C\uC11D {n}\uC77C\uC9F8\uC5D0 \uB180\uB7EC \uC640\uC694",
    "shelter.gifts": "\uC120\uBB3C",
    "shelter.collect": "\uC120\uBB3C \uBC1B\uAE30",
    "shelter.giftReady": "\uC120\uBB3C {n}\uCF54\uC778\uC774 \uC313\uC600\uC5B4\uC694",
    "shelter.giftNone": "\uB3D9\uBB3C\uB4E4\uC774 \uC120\uBB3C\uC744 \uBAA8\uC73C\uB294 \uC911\uC774\uC5D0\uC694",
    "shelter.giftRate": "\uC2DC\uAC04\uB2F9 {n}\uCF54\uC778 \xB7 \uCD5C\uB300 {h}\uC2DC\uAC04",
    "shelter.bond": "\uCE5C\uBC00\uB3C4 {n}",
    "shelter.bondNext": "{n}\uBC88 \uB354 \uAD6C\uD558\uBA74 \uCE5C\uBC00\uB3C4 \uC5C5",
    "shelter.bondMax": "\uCE5C\uBC00\uB3C4 \uCD5C\uACE0!",
    "shelter.rescued": "\uAD6C\uD55C \uD69F\uC218 {n}",
    "shelter.bonusTitle": "\uD568\uAED8\uD558\uBA74",
    "shelter.decor": "\uAFB8\uBBF8\uAE30",
    "shelter.decorDesc": "\uC120\uBB3C +10%",
    "shelter.decorOwned": "\uC124\uCE58\uD568",
    "shelter.list": "\uB3C4\uAC10",
    "shelter.totalBonus": "\uB3D9\uBB3C \uCE5C\uAD6C \uBCF4\uB108\uC2A4",
    "species.puppy": "\uAC15\uC544\uC9C0",
    "species.bunny": "\uD1A0\uB07C",
    "species.squirrel": "\uB2E4\uB78C\uC950",
    "species.fox": "\uC5EC\uC6B0",
    "species.hedgehog": "\uACE0\uC2B4\uB3C4\uCE58",
    "species.fawn": "\uC544\uAE30 \uC0AC\uC2B4",
    "species.kitten": "\uACE0\uC591\uC774",
    "species.duckling": "\uC624\uB9AC",
    "species.piglet": "\uC544\uAE30 \uB3FC\uC9C0",
    "species.lamb": "\uC544\uAE30 \uC591",
    "species.chick": "\uBCD1\uC544\uB9AC",
    "species.otter": "\uC218\uB2EC",
    "species.turtle": "\uAC70\uBD81\uC774",
    "species.frog": "\uAC1C\uAD6C\uB9AC",
    "species.penguin": "\uD3AD\uADC4",
    "species.panda": "\uD310\uB2E4",
    "bonus.maxHp": "\uCD5C\uB300 \uCCB4\uB825 +{v}",
    "bonus.move": "\uC774\uB3D9 \uC18D\uB3C4 +{v}",
    "bonus.coins": "\uC5BB\uB294 \uCF54\uC778 +{v}",
    "bonus.damage": "\uBB3C\uC904\uAE30 \uD53C\uD574 +{v}",
    "bonus.armor": "\uBC1B\uB294 \uD53C\uD574 -{v}",
    "bonus.range": "\uC0AC\uAC70\uB9AC +{v}",
    "bonus.charge": "\uC218\uC555 \uCC28\uB294 \uC18D\uB3C4 +{v}",
    "bonus.xp": "\uC5BB\uB294 \uACBD\uD5D8\uCE58 +{v}",
    "bonus.gifts": "\uBCF4\uD638\uC18C \uC120\uBB3C +{v}",
    "bonus.rescueHeal": "\uAD6C\uCD9C\uD560 \uB54C \uD68C\uBCF5 +{v}",
    "bonus.splash": "\uBB3C\uBCF4\uB77C +{v}",
    "bonus.pickup": "\uC90D\uB294 \uBC94\uC704 +{v}",
    "bonus.revive": "\uB2E4\uC2DC \uC77C\uC5B4\uB0A0 \uB54C \uCCB4\uB825 +{v}",
    "bonus.gooWalk": "\uB048\uC801\uC774 \uBC14\uB2E5 \uC774\uB3D9 \uC18D\uB3C4 +{v}",
    "bonus.pressureMax": "\uCD5C\uB300 \uC218\uC555 \uC704\uB825 +{v}",
    "bonus.all": "\uD53C\uD574\xB7\uCCB4\uB825\xB7\uCF54\uC778 +{v}",
    "decor.ball": "\uACF5",
    "decor.cushion": "\uD479\uC2E0\uD55C \uCFE0\uC158",
    "decor.bowl": "\uBC25\uADF8\uB987",
    "decor.flowers": "\uAF43\uBC2D",
    "decor.pond": "\uC791\uC740 \uC5F0\uBABB",
    "decor.treehouse": "\uB098\uBB34 \uC9D1",
    "decor.slide": "\uBBF8\uB044\uB7FC\uD2C0",
    "decor.fountain": "\uBD84\uC218",
    "monster.blob": "\uB9D0\uB791 \uB048\uC801\uC774",
    "monster.blob.desc": "\uC2AC\uAE08\uC2AC\uAE08 \uB2E4\uAC00\uC640\uC694",
    "monster.spitter": "\uD264\uD264 \uB048\uC801\uC774",
    "monster.spitter.desc": "\uBB3C\uBC29\uC6B8\uC744 \uBC49\uC5B4\uC694",
    "monster.splitter": "\uCABC\uAC1C \uB048\uC801\uC774",
    "monster.splitter.desc": "\uC53B\uC73C\uBA74 \uB458\uB85C \uB098\uB258\uC5B4\uC694",
    "monster.mini": "\uAF2C\uB9C8 \uB048\uC801\uC774",
    "monster.mini.desc": "\uC791\uACE0 \uBE68\uB77C\uC694",
    "monster.dasher": "\uB3CC\uC9C4 \uB048\uC801\uC774",
    "monster.dasher.desc": "\uC904\uC744 \uAE0B\uACE0 \uB3CC\uC9C4\uD574\uC694",
    "monster.chunky": "\uC655\uBC29\uC6B8 \uB048\uC801\uC774",
    "monster.chunky.desc": "\uBE5B\uB098\uBA74 \uC0AC\uBC29\uC73C\uB85C \uBB3C\uBC29\uC6B8!",
    "monster.nest": "\uB048\uC801\uC774 \uB465\uC9C0",
    "monster.nest.desc": "\uACC4\uC18D \uB048\uC801\uC774\uB97C \uB9CC\uB4E4\uC5B4\uC694",
    "monster.jumper": "\uD1B5\uD1B5 \uB048\uC801\uC774",
    "monster.jumper.desc": "\uADF8\uB9BC\uC790 \uC790\uB9AC\uB85C \uB6F0\uC5B4\uB0B4\uB824\uC694",
    "monster.flyer": "\uB0A0\uAC1C \uB048\uC801\uC774",
    "monster.flyer.desc": "\uB0A0\uC544\uC11C \uC7A5\uC560\uBB3C\uC744 \uB118\uC5B4\uC640\uC694",
    "monster.boss": "\uD0B9 \uB048\uC801\uC774",
    "monster.boss.desc": "\uC774 \uC9C0\uC5ED \uB048\uC801\uC774\uC758 \uC655",
    "mission.wash": "\uB048\uC801\uC774 {n}\uB9C8\uB9AC \uC53B\uAE30",
    "mission.rescue": "\uB3D9\uBB3C {n}\uB9C8\uB9AC \uAD6C\uD558\uAE30",
    "mission.rooms": "\uBC29 {n}\uAC1C \uAE68\uB057\uD558\uAC8C",
    "mission.pressure": "\uCD5C\uB300 \uC218\uC555 {n}\uBC88",
    "mission.clear": "\uAD6C\uC5ED {n}\uACF3 \uC815\uD654\uD558\uAE30",
    "mission.gifts": "\uBCF4\uD638\uC18C \uC120\uBB3C \uBC1B\uAE30",
    "mission.nohit": "\uC548 \uB9DE\uACE0 \uBC29 {n}\uAC1C \uBE44\uC6B0\uAE30",
    "missions.title": "\uC624\uB298\uC758 \uC784\uBB34",
    "missions.all": "\uBAA8\uB450 \uB05D\uB0B4\uBA74",
    "missions.resetIn": "{h}\uC2DC\uAC04 {m}\uBD84 \uB4A4 \uC0C8 \uC784\uBB34",
    "daily.title": "\uC624\uB298\uC758 \uB3C4\uC804",
    "daily.play": "\uB3C4\uC804\uD558\uAE30",
    "daily.reward": "\uCCAB \uC815\uD654 {n}\uCF54\uC778",
    "daily.done": "\uC624\uB298 \uB3C4\uC804 \uC644\uB8CC! \uB2E4\uC2DC \uD558\uBA74 {n}\uCF54\uC778",
    "daily.streak": "\uC5F0\uC18D {n}\uC77C",
    "daily.mod.big": "\uC655\uBC29\uC6B8 \uB0A0",
    "daily.mod.big.desc": "\uB048\uC801\uC774\uAC00 \uD06C\uACE0 \uB2E8\uB2E8\uD574\uC694. \uCF54\uC778 2\uBC30!",
    "daily.mod.fast": "\uB0A0\uC318 \uB0A0",
    "daily.mod.fast.desc": "\uB048\uC801\uC774\uAC00 \uBE68\uB77C\uC694. \uB0B4 \uBB3C\uC904\uAE30\uB3C4 1.3\uBC30!",
    "daily.mod.swarm": "\uC6B0\uAE00\uC6B0\uAE00 \uB0A0",
    "daily.mod.swarm.desc": "\uB048\uC801\uC774\uAC00 \uC794\uB729! \uCF54\uC778 1.5\uBC30",
    "daily.mod.rain": "\uBB3C\uBC29\uC6B8 \uBE44",
    "daily.mod.rain.desc": "\uBB3C\uBC29\uC6B8\uC774 \uBE68\uB77C\uC694. \uCF54\uC778 1.5\uBC30",
    "streak.title": "\uCD9C\uC11D \uB3C4\uC7A5",
    "streak.day": "{n}\uC77C\uC9F8",
    "streak.today": "\uC624\uB298\uC758 \uC120\uBB3C",
    "streak.tomorrow": "\uB0B4\uC77C \uC120\uBB3C",
    "streak.visitor": "{name}\uC774(\uAC00) \uB180\uB7EC \uC640\uC694!",
    "streak.tomorrowHint": "\uB0B4\uC77C \uB2E4\uC2DC \uC624\uBA74 {gift}",
    "streak.coins": "{n}\uCF54\uC778",
    "unlock.upgrades": "\uAC15\uD654\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.shelter": "\uBCF4\uD638\uC18C\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.missions": "\uC624\uB298\uC758 \uC784\uBB34\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.daily": "\uC624\uB298\uC758 \uB3C4\uC804\uC774 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.decor": "\uBCF4\uD638\uC18C \uAFB8\uBBF8\uAE30\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.region": "{name}\uC5D0 \uAC08 \uC218 \uC788\uC5B4\uC694!",
    "settings.title": "\uC124\uC815",
    "settings.music": "\uBC30\uACBD\uC74C",
    "settings.sfx": "\uD6A8\uACFC\uC74C",
    "settings.vibration": "\uC9C4\uB3D9",
    "settings.language": "\uC5B8\uC5B4",
    "settings.lang.auto": "\uAE30\uAE30 \uC124\uC815",
    "settings.lang.ko": "\uD55C\uAD6D\uC5B4",
    "settings.lang.en": "English",
    "settings.graphics": "\uADF8\uB798\uD53D",
    "settings.gfx.low": "\uB0AE\uC74C",
    "settings.gfx.medium": "\uBCF4\uD1B5",
    "settings.gfx.high": "\uB192\uC74C",
    "settings.gfxNote": "\uB0AE\uC74C\uC740 \uBC30\uD130\uB9AC\uB97C \uC544\uAEF4\uC694",
    "settings.contrast": "\uBB3C\uBC29\uC6B8 \uC798 \uBCF4\uC774\uAC8C",
    "settings.contrastNote": "\uC801\uC758 \uBB3C\uBC29\uC6B8\uC744 \uB178\uB780 \uD14C\uB450\uB9AC\uB85C \uD45C\uC2DC\uD574\uC694",
    "settings.on": "\uCF2C",
    "settings.off": "\uB054",
    "settings.reset": "\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uD558\uAE30",
    "settings.resetConfirm": "\uBAA8\uB4E0 \uC9C4\uD589 \uC0C1\uD669\uC774 \uC9C0\uC6CC\uC838\uC694. \uC815\uB9D0 \uCC98\uC74C\uBD80\uD130 \uD560\uAE4C\uC694?",
    "settings.resetYes": "\uCC98\uC74C\uBD80\uD130",
    "settings.credits": "\uB9CC\uB4E0 \uC774",
    "settings.creditsText": "\uAE30\uD68D\xB7\uAC1C\uBC1C\xB7\uC544\uD2B8\xB7\uC0AC\uC6B4\uB4DC: \uBB3C\uCD1D \uAD6C\uC870\uB300 \uD300\n\uAE00\uAF34: Jua, Fredoka (SIL Open Font License)\n\uC545\uAE30 \uC74C\uC6D0: FluidR3 GM (MIT)",
    "settings.version": "\uBC84\uC804 {v}",
    "time.hm": "{h}\uC2DC\uAC04 {m}\uBD84",
    "time.m": "{m}\uBD84",
    "coins.n": "{n}"
  };

  // data/i18n/en.json
  var en_default = {
    "app.title": "Splash Rescue",
    "common.close": "Close",
    "common.back": "Back",
    "common.ok": "OK",
    "common.cancel": "Cancel",
    "common.yes": "Yes",
    "common.no": "No",
    "common.claim": "Claim",
    "common.claimed": "Claimed",
    "common.new": "NEW",
    "common.locked": "Locked",
    "common.max": "MAX",
    "loading.text": "Filling the water gun\u2026",
    "title.tap": "Tap to start",
    "title.play": "Start rescue!",
    "hud.lv": "Lv {n}",
    "hud.room": "{a}/{b}",
    "hint.drag": "Drag to move",
    "hint.stop": "Let go to spray!",
    "hint.rescue": "Spray to set it free!",
    "hint.gate": "Head to the exit!",
    "hint.range": "Get a bit closer!",
    "hint.pressure": "Stay still to build pressure!",
    "toast.pressure": "Full pressure!",
    "toast.rescued": "{name} rescued!",
    "toast.brave": "Brave rescue!",
    "toast.cheer": "Cheer +{p}",
    "toast.clean": "All clean!",
    "toast.newMonster": "New goo",
    "toast.bossPhase": "It's angry! Careful!",
    "toast.waveIncoming": "More goo coming!",
    "levelup.title": "Level up!",
    "levelup.pick": "Pick one",
    "levelup.stack": "Tier {n}",
    "skill.thick.name": "Thick Stream",
    "skill.thick.desc": "Stream damage +22%, width +15%",
    "skill.range.name": "Long Reach",
    "skill.range.desc": "Reach +18%",
    "skill.multi.name": "Split Stream",
    "skill.multi.desc": "An extra stream washes another goo (55% damage)",
    "skill.pierce.name": "Piercing Stream",
    "skill.pierce.desc": "The stream goes through and hits goo behind (70% damage)",
    "skill.chain.name": "Bouncing Stream",
    "skill.chain.desc": "Water bounces to a nearby goo (50% damage)",
    "skill.splash.name": "Big Splash",
    "skill.splash.desc": "Bursting goo splashes harder: +60% damage, +25% area",
    "skill.turbo.name": "Pressure Turbo",
    "skill.turbo.desc": "Pressure fills 45% faster. Full-pressure power +0.2x",
    "skill.keep.name": "Steady Pressure",
    "skill.keep.desc": "Moving drains 55% less pressure",
    "skill.speed.name": "Quick Feet",
    "skill.speed.desc": "Move speed +12%, less slowed by goo",
    "skill.shield.name": "Bubble Shield",
    "skill.shield.desc": "Blocks one hit. Comes back every {s}s",
    "skill.trail.name": "Bubble Trail",
    "skill.trail.desc": "Moving leaves bubbles that pop on goo",
    "skill.magnet.name": "Drop Magnet",
    "skill.magnet.desc": "Pickup range +80%, XP +15%",
    "skill.vitality.name": "Toughness",
    "skill.vitality.desc": "Max HP +20%, heal 20%",
    "skill.heal.name": "Heal",
    "skill.heal.desc": "Heal 40% HP",
    "pause.title": "Paused",
    "pause.resume": "Resume",
    "pause.quit": "Leave this run",
    "pause.quitNote": "Animals and coins you got so far are kept.",
    "pause.settings": "Settings",
    "revive.title": "Covered in goo!",
    "revive.desc": "You can get back up once per run.",
    "revive.yes": "Get back up",
    "revive.no": "End run",
    "result.clear": "Area cleaned up!",
    "result.fail": "Good try!",
    "result.quit": "Run ended",
    "result.coins": "Coins",
    "result.animals": "Rescued",
    "result.washed": "Goo washed",
    "result.rooms": "Rooms cleaned",
    "result.firstClear": "First clear bonus",
    "result.clearBonus": "Clear bonus",
    "result.kept": "You keep every animal and coin!",
    "result.tapSkip": "Tap to skip",
    "result.next": "Next area",
    "result.again": "Play again",
    "result.retry": "Try again",
    "result.map": "Map",
    "result.home": "To shelter",
    "result.bond": "Bond {n}",
    "result.newFriend": "New friend!",
    "result.upgradeHint": "Power up with coins!",
    "result.tip.spitter": "Dodge Spitter droplets before you stop.",
    "result.tip.contact": "Build pressure before goo gets close.",
    "result.tip.dasher": "When a Dasher shows its line, step aside.",
    "result.tip.jumper": "Step out of the Bouncer's landing ring.",
    "result.tip.chunky": "When Chunky glows, slip between its droplets.",
    "result.tip.boss": "When the King jumps, leave its shadow.",
    "result.tip.upgrade": "More Stream Power washes goo much faster.",
    "result.tip.generic": "Power up and come back \u2014 it will be clean in no time.",
    "upgrade.title": "Upgrades",
    "upgrade.buy": "{n}",
    "upgrade.lv": "Lv {n}",
    "upgrade.maxed": "Maxed",
    "upgrade.notEnough": "Not enough coins",
    "upgrade.power.name": "Stream Power",
    "upgrade.power.desc": "Damage +12%, width +5% per level",
    "upgrade.range.name": "Reach",
    "upgrade.range.desc": "Reach +5% per level",
    "upgrade.health.name": "Health",
    "upgrade.health.desc": "Max HP +10% per level",
    "upgrade.pressure.name": "Pressure",
    "upgrade.pressure.desc": "Fills 5% faster, full-pressure power +0.05x per level",
    "upgrade.splash.name": "Splash",
    "upgrade.splash.desc": "Burst splash damage +10% and wider per level",
    "upgrade.stat.power": "Damage {a} \u2192 {b}",
    "upgrade.stat.range": "Reach {a} \u2192 {b}",
    "upgrade.stat.health": "HP {a} \u2192 {b}",
    "upgrade.stat.pressure": "Full pressure {a} \u2192 {b}",
    "upgrade.stat.splash": "Splash {a} \u2192 {b}",
    "upgrade.gunNext": "{n} more upgrades to evolve",
    "upgrade.gunFinal": "The ultimate cannon!",
    "upgrade.dream": "One day this cannon will wash a whole forest",
    "gun.0": "Tiny Squirt",
    "gun.1": "Pump Blaster",
    "gun.2": "Twin Blaster",
    "gun.3": "Tank Blaster",
    "gun.4": "Fire Hose",
    "gun.5": "Water Cannon",
    "gun.6": "Mega Cannon",
    "gun.evolved": "Your water gun evolved!",
    "gun.evolvedDesc": "The stream is thicker and reaches farther.",
    "region.forest": "Sunny Forest",
    "region.village": "Windmill Village",
    "region.lake": "Sparkle Lake",
    "stage.label": "{r} {n}",
    "stage.short": "Area {n}",
    "stage.play": "Go!",
    "stage.animals": "Animals here",
    "stage.cleared": "Cleaned",
    "stage.best": "Best",
    "stage.boss": "Boss",
    "stage.newGoo": "New goo",
    "stage.locked": "Clean the previous area first",
    "stage.help": "Helper on: this run +30% HP, +20% damage",
    "stage.helpOffer": "Your friends came to cheer! This run: +30% HP, +20% damage",
    "map.title": "Map",
    "map.progress": "{a}/{b} cleaned",
    "nav.upgrade": "Upgrades",
    "nav.map": "Adventure",
    "nav.shelter": "Shelter",
    "shelter.title": "Animal Shelter",
    "shelter.count": "{a}/{b} friends",
    "shelter.empty": "Not met yet",
    "shelter.where": "Found in {place}",
    "shelter.whereStreak": "Visits on login day {n}",
    "shelter.gifts": "Gifts",
    "shelter.collect": "Collect gifts",
    "shelter.giftReady": "{n} coins of gifts waiting",
    "shelter.giftNone": "Your friends are gathering gifts",
    "shelter.giftRate": "{n} coins/hour \xB7 up to {h}h",
    "shelter.bond": "Bond {n}",
    "shelter.bondNext": "Rescue {n} more to raise bond",
    "shelter.bondMax": "Max bond!",
    "shelter.rescued": "Rescued {n} times",
    "shelter.bonusTitle": "Bonus",
    "shelter.decor": "Decorate",
    "shelter.decorDesc": "Gifts +10%",
    "shelter.decorOwned": "Placed",
    "shelter.list": "Album",
    "shelter.totalBonus": "Friend bonuses",
    "species.puppy": "Puppy",
    "species.bunny": "Bunny",
    "species.squirrel": "Squirrel",
    "species.fox": "Fox",
    "species.hedgehog": "Hedgehog",
    "species.fawn": "Fawn",
    "species.kitten": "Kitten",
    "species.duckling": "Duckling",
    "species.piglet": "Piglet",
    "species.lamb": "Lamb",
    "species.chick": "Chick",
    "species.otter": "Otter",
    "species.turtle": "Turtle",
    "species.frog": "Frog",
    "species.penguin": "Penguin",
    "species.panda": "Panda",
    "bonus.maxHp": "Max HP +{v}",
    "bonus.move": "Move speed +{v}",
    "bonus.coins": "Coins +{v}",
    "bonus.damage": "Stream damage +{v}",
    "bonus.armor": "Damage taken -{v}",
    "bonus.range": "Reach +{v}",
    "bonus.charge": "Pressure fill speed +{v}",
    "bonus.xp": "XP +{v}",
    "bonus.gifts": "Shelter gifts +{v}",
    "bonus.rescueHeal": "Heal on rescue +{v}",
    "bonus.splash": "Splash +{v}",
    "bonus.pickup": "Pickup range +{v}",
    "bonus.revive": "Revive HP +{v}",
    "bonus.gooWalk": "Speed on goo +{v}",
    "bonus.pressureMax": "Full-pressure power +{v}",
    "bonus.all": "Damage, HP, coins +{v}",
    "decor.ball": "Ball",
    "decor.cushion": "Cushion",
    "decor.bowl": "Food Bowl",
    "decor.flowers": "Flower Bed",
    "decor.pond": "Little Pond",
    "decor.treehouse": "Tree House",
    "decor.slide": "Slide",
    "decor.fountain": "Fountain",
    "monster.blob": "Blobby",
    "monster.blob.desc": "Hops toward you",
    "monster.spitter": "Spitter",
    "monster.spitter.desc": "Spits goo droplets",
    "monster.splitter": "Splitter",
    "monster.splitter.desc": "Splits in two when washed",
    "monster.mini": "Mini",
    "monster.mini.desc": "Small and quick",
    "monster.dasher": "Dasher",
    "monster.dasher.desc": "Draws a line, then dashes",
    "monster.chunky": "Chunky",
    "monster.chunky.desc": "Glows, then sprays all around",
    "monster.nest": "Goo Nest",
    "monster.nest.desc": "Keeps making goo",
    "monster.jumper": "Bouncer",
    "monster.jumper.desc": "Lands where its shadow is",
    "monster.flyer": "Flutter",
    "monster.flyer.desc": "Flies over obstacles",
    "monster.boss": "King Goo",
    "monster.boss.desc": "King of all the goo here",
    "mission.wash": "Wash {n} goo",
    "mission.rescue": "Rescue {n} animals",
    "mission.rooms": "Clean {n} rooms",
    "mission.pressure": "Reach full pressure {n} times",
    "mission.clear": "Clean up {n} areas",
    "mission.gifts": "Collect shelter gifts",
    "mission.nohit": "Clear {n} rooms without a hit",
    "missions.title": "Today's Tasks",
    "missions.all": "Finish all",
    "missions.resetIn": "New tasks in {h}h {m}m",
    "daily.title": "Daily Challenge",
    "daily.play": "Play",
    "daily.reward": "{n} coins on first clear",
    "daily.done": "Done today! Replays give {n} coins",
    "daily.streak": "{n}-day streak",
    "daily.mod.big": "Big Goo Day",
    "daily.mod.big.desc": "Goo is big and tough. Double coins!",
    "daily.mod.fast": "Speedy Day",
    "daily.mod.fast.desc": "Goo is fast. Your stream is 1.3x too!",
    "daily.mod.swarm": "Swarm Day",
    "daily.mod.swarm.desc": "Lots of goo! 1.5x coins",
    "daily.mod.rain": "Droplet Day",
    "daily.mod.rain.desc": "Faster droplets. 1.5x coins",
    "streak.title": "Daily Stamps",
    "streak.day": "Day {n}",
    "streak.today": "Today's gift",
    "streak.tomorrow": "Tomorrow",
    "streak.visitor": "{name} comes to visit!",
    "streak.tomorrowHint": "Come back tomorrow for {gift}",
    "streak.coins": "{n} coins",
    "unlock.upgrades": "Upgrades unlocked!",
    "unlock.shelter": "Shelter unlocked!",
    "unlock.missions": "Daily tasks unlocked!",
    "unlock.daily": "Daily Challenge unlocked!",
    "unlock.decor": "Shelter decorating unlocked!",
    "unlock.region": "{name} is now open!",
    "settings.title": "Settings",
    "settings.music": "Music",
    "settings.sfx": "Sound effects",
    "settings.vibration": "Vibration",
    "settings.language": "Language",
    "settings.lang.auto": "Device",
    "settings.lang.ko": "\uD55C\uAD6D\uC5B4",
    "settings.lang.en": "English",
    "settings.graphics": "Graphics",
    "settings.gfx.low": "Low",
    "settings.gfx.medium": "Medium",
    "settings.gfx.high": "High",
    "settings.gfxNote": "Low saves battery",
    "settings.contrast": "High-visibility droplets",
    "settings.contrastNote": "Enemy droplets get a bright yellow ring",
    "settings.on": "On",
    "settings.off": "Off",
    "settings.reset": "Reset progress",
    "settings.resetConfirm": "All progress will be erased. Start over?",
    "settings.resetYes": "Start over",
    "settings.credits": "Credits",
    "settings.creditsText": "Design, code, art, sound: Splash Rescue team\nFonts: Jua, Fredoka (SIL Open Font License)\nInstrument samples: FluidR3 GM (MIT)",
    "settings.version": "Version {v}",
    "time.hm": "{h}h {m}m",
    "time.m": "{m}m",
    "coins.n": "{n}"
  };

  // src/i18n/index.ts
  var TABLES = { ko: ko_default, en: en_default };
  var lang = "en";
  var listeners3 = [];
  function deviceLang() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const l of list) {
      const k = l.toLowerCase().slice(0, 2);
      if (k === "ko") return "ko";
      if (k === "en") return "en";
    }
    return "en";
  }
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    for (const f of listeners3) f();
  }
  function t(key, params) {
    let s = TABLES[lang][key] ?? TABLES.en[key];
    if (s === void 0) {
      if (true) console.warn("missing string", key);
      return key;
    }
    if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => params[k] !== void 0 ? String(params[k]) : `{${k}}`);
    return s;
  }
  function num(n) {
    return Math.round(n).toLocaleString(lang === "ko" ? "ko-KR" : "en-US");
  }
  function pct(f) {
    const v = Math.round(f * 1e3) / 10;
    return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}%`;
  }

  // src/meta/save.ts
  var KEY = "splash-rescue-save";
  var SAVE_VERSION = 1;
  function newSave() {
    return {
      v: SAVE_VERSION,
      installId: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: Date.now(),
      coins: 0,
      coinsEarned: 0,
      upgrades: { power: 0, range: 0, health: 0, pressure: 0, splash: 0 },
      rescued: {},
      seen: [],
      cleared: {},
      attempts: {},
      decor: [],
      giftsAt: Date.now(),
      streak: { day: 0, lastDate: "", claimedToday: false, consecutive: 0 },
      missions: { date: "", ids: [], progress: [], claimed: [], allClaimed: false },
      daily: { date: "", cleared: false, streak: 0, lastClearDate: "" },
      stats: { runs: 0, wins: 0, washed: 0, rooms: 0, playSeconds: 0, sessions: 0, lastSession: 0 },
      flags: {},
      settings: { music: 0.7, sfx: 0.9, vibration: true, lang: "auto", quality: "auto", contrast: false },
      dayOffset: 0,
      lastStage: 1
    };
  }
  var data = newSave();
  var dirty = false;
  var timer = 0;
  var listeners4 = [];
  function save() {
    return data;
  }
  function loadSave() {
    let fresh = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        data = migrate(parsed);
        fresh = false;
      }
    } catch {
      data = newSave();
    }
    return { data, fresh };
  }
  function migrate(p) {
    const base = newSave();
    const out = { ...base, ...p };
    out.upgrades = { ...base.upgrades, ...p.upgrades || {} };
    out.settings = { ...base.settings, ...p.settings || {} };
    out.stats = { ...base.stats, ...p.stats || {} };
    out.streak = { ...base.streak, ...p.streak || {} };
    out.daily = { ...base.daily, ...p.daily || {} };
    out.missions = { ...base.missions, ...p.missions || {} };
    out.flags = { ...p.flags || {} };
    out.v = SAVE_VERSION;
    return out;
  }
  function markDirty() {
    dirty = true;
    if (!timer) timer = window.setTimeout(flush, 400);
  }
  function flush() {
    timer = 0;
    if (!dirty) return;
    dirty = false;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
    }
    for (const f of listeners4) f(data);
  }

  // src/services/analytics.ts
  var DebugBuffer = class {
    constructor() {
      this.name = "debug";
      this.events = [];
    }
    track(name, params, ctx2) {
      this.events.push({ name, params, t: ctx2.t });
      if (this.events.length > 300) this.events.shift();
      if (true) console.debug("[analytics]", name, params);
    }
  };
  var RemotePlaceholder = class {
    constructor() {
      this.name = "remote";
      this.queue = [];
    }
    track(name, params, ctx2) {
      this.queue.push({ name, params, ctx: ctx2 });
      if (this.queue.length > 500) this.queue.shift();
    }
  };
  var debugBuffer = new DebugBuffer();
  var remote = new RemotePlaceholder();
  var providers = [debugBuffer, remote];
  var ctx = { installId: "", session: 0, t: 0, build: "1.0.0" };
  function initAnalytics(installId, session, build) {
    ctx.installId = installId;
    ctx.session = session;
    ctx.build = build;
  }
  function track(name, params = {}) {
    ctx.t = Date.now();
    for (const p of providers) {
      try {
        p.track(name, params, ctx);
      } catch {
      }
    }
  }

  // src/services/platform.ts
  var GuestAuth = class {
    constructor() {
      this.me = null;
    }
    current() {
      return this.me;
    }
    async signInSilently() {
      this.me = this.me ?? { id: "guest", displayName: "Guest", provider: "guest" };
      return this.me;
    }
    async signIn() {
      return this.signInSilently();
    }
    async signOut() {
      this.me = null;
    }
  };
  var LocalOnlyCloudSave = class {
    async pull() {
      return null;
    }
    async push() {
      return true;
    }
  };
  var auth = new GuestAuth();
  var cloud = new LocalOnlyCloudSave();

  // src/ui/dom.ts
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === void 0 || v === false) continue;
      if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "class") el.className = String(v);
      else if (k === "style") el.setAttribute("style", String(v));
      else if (k === "html") el.innerHTML = String(v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, String(v));
    }
    for (const c of kids) if (c !== null && c !== void 0 && c !== false) el.append(c instanceof Node ? c : document.createTextNode(c));
    return el;
  }
  var pageSize = /* @__PURE__ */ new Map();
  function icon(name, size, cls = "") {
    const el = document.createElement("span");
    el.className = "ico " + cls;
    setIcon(el, name, size);
    return el;
  }
  function setIcon(el, name, size) {
    const f = frame(name);
    el.style.width = el.style.height = size + "px";
    if (!f) {
      el.style.backgroundImage = "none";
      return;
    }
    const src = f.img.src;
    let ps = pageSize.get(src);
    if (!ps) {
      ps = [f.img.naturalWidth, f.img.naturalHeight];
      pageSize.set(src, ps);
    }
    const k = size / Math.max(f.w, f.h);
    const ox = (size - f.w * k) / 2, oy = (size - f.h * k) / 2;
    el.style.backgroundImage = `url("${src}")`;
    el.style.backgroundSize = `${ps[0] * k}px ${ps[1] * k}px`;
    el.style.backgroundPosition = `${-f.x * k + ox}px ${-f.y * k + oy}px`;
    el.style.backgroundRepeat = "no-repeat";
  }
  function once(fn, ms = 450) {
    let busy = false;
    return () => {
      if (busy) return;
      busy = true;
      fn();
      setTimeout(() => busy = false, ms);
    };
  }

  // src/ui/modal.ts
  var stack = [];
  var layer;
  function initModals(root) {
    layer = root;
  }
  function openModal(body, o) {
    const existing = stack.find((m) => m.id === o.id);
    if (existing) return existing.el;
    const closeBtn = o.closable !== false ? h("button", { class: "btn-close", "aria-label": t("common.close"), onclick: () => closeModal(o.id) }, icon("ic_close", 26)) : null;
    const head = o.title ? h("div", { class: "modal-head" }, o.titleIcon ? icon(o.titleIcon, 34, "modal-ticon") : null, h("div", { class: "modal-title" }, o.title), closeBtn) : closeBtn ? h("div", { class: "modal-head bare" }, closeBtn) : null;
    const scroller = h("div", { class: "modal-body" + (o.noPad ? " nopad" : "") }, body);
    const card = h("div", { class: "modal-card " + (o.cls ?? "") }, head, scroller);
    const back = h("div", { class: "modal-back" }, card);
    back.addEventListener("pointerdown", (e) => {
      if (e.target === back && o.closable !== false) closeModal(o.id);
    });
    layer.appendChild(back);
    requestAnimationFrame(() => back.classList.add("show"));
    stack.push({ id: o.id, el: back, opts: o, openedAt: performance.now() });
    audio.play("ui_open", { vol: 0.6 });
    return back;
  }
  function closeModal(id, silent = false) {
    const i = stack.findIndex((m2) => m2.id === id);
    if (i < 0) return;
    const m = stack[i];
    if (performance.now() - m.openedAt < 220) return;
    stack.splice(i, 1);
    m.el.classList.remove("show");
    m.el.classList.add("hide");
    m.el.style.pointerEvents = "none";
    setTimeout(() => m.el.remove(), 220);
    if (!silent) audio.play("ui_close", { vol: 0.5 });
    m.opts.onClose?.();
  }

  // virtual:levels
  var levels_default = [{ id: "forest-01", stage: 1, region: "forest", intro: "blob", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 100, y: 210 }, { t: "tree", x: 482, y: 380 }, { t: "pine", x: 86, y: 610 }, { t: "bush", x: 478, y: 690 }, { t: "rock", x: 168, y: 430 }, { t: "stump", x: 440, y: 170 }], goo: [{ x: 190, y: 560, r: 80 }, { x: 390, y: 520, r: 72 }, { x: 288, y: 330, r: 84 }, { x: 140, y: 300, r: 56 }, { x: 430, y: 740, r: 52 }, { x: 290, y: 640, r: 50 }], monsters: [{ t: "blob", x: 205, y: 545 }, { t: "blob", x: 375, y: 560 }, { t: "spitter", x: 288, y: 300 }], animals: [{ s: "puppy", x: 288, y: 445 }], start: { x: 288, y: 850 } }, { terrain: [".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", "......##....", "......##....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 110, y: 360 }, { t: "tree", x: 470, y: 230 }, { t: "log", x: 380, y: 520 }, { t: "bush", x: 130, y: 660 }, { t: "rock", x: 450, y: 720 }, { t: "pine", x: 90, y: 160 }], goo: [{ x: 180, y: 250, r: 90 }, { x: 400, y: 350, r: 82 }, { x: 250, y: 520, r: 76 }, { x: 450, y: 620, r: 56 }, { x: 300, y: 190, r: 64 }, { x: 180, y: 760, r: 48 }], monsters: [{ t: "blob", x: 210, y: 430 }, { t: "blob", x: 340, y: 400 }, { t: "blob", x: 420, y: 300 }, { t: "spitter", x: 190, y: 240 }, { t: "blob", x: 290, y: 280, w: 1 }, { t: "blob", x: 170, y: 500, w: 1 }], animals: [{ s: "bunny", x: 150, y: 175 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 96, y: 470 }, { t: "tree", x: 480, y: 470 }, { t: "rock", x: 200, y: 280 }, { t: "rock", x: 376, y: 280 }, { t: "bush", x: 288, y: 670 }, { t: "pine", x: 480, y: 150 }, { t: "pine", x: 92, y: 160 }], goo: [{ x: 288, y: 340, r: 110 }, { x: 130, y: 620, r: 72 }, { x: 450, y: 630, r: 72 }, { x: 288, y: 170, r: 72 }], monsters: [{ t: "blob", x: 240, y: 390 }, { t: "blob", x: 336, y: 390 }, { t: "spitter", x: 288, y: 210 }, { t: "blob", x: 140, y: 580, w: 1 }, { t: "blob", x: 440, y: 580, w: 1 }, { t: "spitter", x: 288, y: 380, w: 1 }], animals: [{ s: "squirrel", x: 288, y: 290 }], start: { x: 288, y: 860 } }] }];

  // src/config/balance.ts
  var ROOM = {
    width: 576,
    height: 960,
    tile: 48,
    wall: 48,
    // border thickness that frames the play area
    gateWidth: 110
  };
  var PLAYER = {
    maxHp: 100,
    radius: 20,
    moveSpeed: 255,
    accel: 2600,
    gooSlow: 0.62,
    // speed multiplier while standing on goo
    invuln: 0.9,
    dps: 34,
    range: 250,
    streamWidth: 12,
    streamSpeed: 2600,
    // how fast a fresh stream reaches its target
    fireDelay: 0.05,
    // seconds after stopping before water comes out
    aimTurnRate: 16,
    pressureCharge: 1.1,
    // seconds standing still to reach full pressure
    pressureMax: 1.8,
    // damage multiplier at full pressure
    pressureWidth: 0.6,
    // extra width fraction at full pressure
    pressureDrainMove: 5,
    // per second while moving
    pressureKeepOnHit: 0.25,
    pickupRadius: 64,
    streamClean: 0.75,
    // goo cleaned along the stream = width * this
    impactClean: 24,
    burstClean: 66,
    burstDamage: 0.25,
    // fraction of dps dealt instantly around a washed monster
    burstRadius: 70,
    reviveHp: 0.6,
    revivesPerRun: 1
  };
  var RESCUE = {
    cheerDamagePerAnimal: 0.06,
    cheerMaxAnimals: 6,
    healOnRescue: 0.1,
    // of max hp
    braveRescueCoins: 8,
    // rescued while monsters are still around
    rescueCoins: 10,
    rescueXp: 3,
    cocoonHp: 55,
    cocoonRadius: 30
  };
  function xpToNext(level2) {
    const n = level2 - 1;
    return Math.round(6 + 6 * n + 1.4 * n * n);
  }
  var MONSTERS = {
    blob: { r: 26, hp: 40, speed: 74, contact: 12, xp: 2, coins: 2 },
    spitter: { r: 26, hp: 52, speed: 34, contact: 10, xp: 3, coins: 3, cooldown: 2.6, telegraph: 0.65, bulletSpeed: 200, bulletDmg: 13, bulletR: 13 },
    splitter: { r: 31, hp: 58, speed: 60, contact: 12, xp: 3, coins: 3 },
    mini: { r: 17, hp: 18, speed: 108, contact: 8, xp: 1, coins: 1 },
    dasher: { r: 26, hp: 55, speed: 60, contact: 16, xp: 3, coins: 3, cooldown: 1.5, telegraph: 0.8 },
    chunky: { r: 44, hp: 210, speed: 42, contact: 18, xp: 8, coins: 8, cooldown: 3.6, telegraph: 0.85, bulletSpeed: 190, bulletDmg: 14, bulletR: 14 },
    nest: { r: 40, hp: 240, speed: 0, contact: 10, xp: 8, coins: 8, cooldown: 4.2, telegraph: 0.7 },
    jumper: { r: 28, hp: 70, speed: 50, contact: 14, xp: 4, coins: 4, cooldown: 2.9, telegraph: 0.75, bulletDmg: 18 },
    flyer: { r: 22, hp: 44, speed: 95, contact: 11, xp: 3, coins: 3, cooldown: 3.2, telegraph: 0.5, bulletSpeed: 170, bulletDmg: 11, bulletR: 12 },
    boss: { r: 78, hp: 1700, speed: 55, contact: 22, xp: 30, coins: 60, cooldown: 2.2, telegraph: 0.9, bulletSpeed: 200, bulletDmg: 15, bulletR: 15 }
  };
  var MONSTER_RULES = {
    spawnRise: 0.6,
    // seconds rising from the ground, harmless
    roomStartDelay: 0.9,
    // grace time when entering a room
    waveDelay: 1.1,
    dashSpeed: 560,
    dashTime: 0.5,
    jumpTime: 0.7,
    jumpShock: 64,
    nestMaxChildren: 3,
    chunkyRing: 8,
    hopMove: 0.46,
    hopRest: 0.32,
    minScale: 0.55
    // monsters shrink to this as they get washed
  };
  function stageScale(stage) {
    const s = Math.max(1, stage) - 1;
    const hp = 0.62 * Math.pow(1.092, s) * (1 + 0.015 * s);
    const dmg = 0.5 + 0.06 * s + 12e-4 * s * s;
    const coin = 1 + 0.12 * s;
    return { hp, dmg, coin };
  }
  var REWARDS = {
    roomClearCoins: 6,
    // times coin scale
    stageFirstClear: (stage) => 60 + 25 * stage,
    stageReplayClear: (stage) => 20 + 6 * stage,
    starCoins: 30,
    coinDropSpread: 0.25,
    healDropChance: 0.06,
    // chance a washed monster drops a heart-shaped water drop
    healDropAmount: 0.12
  };
  var UPGRADES = [
    { id: "power", max: 40, base: 40, growth: 1.2, per: 0.12 },
    { id: "range", max: 20, base: 50, growth: 1.24, per: 0.05 },
    { id: "health", max: 30, base: 40, growth: 1.2, per: 0.1 },
    { id: "pressure", max: 15, base: 70, growth: 1.3, per: 0.05 },
    { id: "splash", max: 20, base: 60, growth: 1.27, per: 0.1 }
  ];
  var GUN_TIERS = [
    { at: 0, dmg: 1, width: 1, splash: 1, range: 0 },
    { at: 3, dmg: 1.12, width: 1.32, splash: 1.15, range: 10 },
    { at: 8, dmg: 1.25, width: 1.62, splash: 1.3, range: 20 },
    { at: 15, dmg: 1.42, width: 1.95, splash: 1.5, range: 35 },
    { at: 25, dmg: 1.62, width: 2.35, splash: 1.72, range: 50 },
    { at: 38, dmg: 1.85, width: 2.8, splash: 1.95, range: 70 },
    { at: 55, dmg: 2.15, width: 3.5, splash: 2.3, range: 100 }
  ];
  function gunTierFor(totalLevels) {
    let t2 = 0;
    for (let i = 0; i < GUN_TIERS.length; i++) if (totalLevels >= GUN_TIERS[i].at) t2 = i;
    return t2;
  }
  var SKILLS = [
    { id: "thick", max: 5, weight: 10 },
    { id: "range", max: 3, weight: 7 },
    { id: "multi", max: 2, weight: 7 },
    { id: "pierce", max: 2, weight: 6 },
    { id: "chain", max: 2, weight: 6 },
    { id: "splash", max: 3, weight: 7 },
    { id: "turbo", max: 3, weight: 7 },
    { id: "keep", max: 2, weight: 5 },
    { id: "speed", max: 3, weight: 6 },
    { id: "shield", max: 3, weight: 6 },
    { id: "trail", max: 3, weight: 5 },
    { id: "magnet", max: 2, weight: 4 },
    { id: "vitality", max: 4, weight: 6 },
    { id: "heal", max: 99, weight: 0 }
    // offered when hurt, see skillWeight
  ];
  var SKILL_VALUES = {
    thickDmg: 0.22,
    thickWidth: 0.15,
    rangeAdd: 0.18,
    multiDmg: 0.55,
    pierceDmg: 0.7,
    chainDmg: 0.5,
    chainRange: 150,
    splashDmg: 0.6,
    splashRadius: 0.25,
    turboCharge: 0.45,
    turboMax: 0.2,
    keepDrain: 0.55,
    speedAdd: 0.12,
    speedGoo: 0.12,
    shieldRegen: [9, 7, 5.5],
    trailEvery: 0.28,
    trailDmg: 0.35,
    trailRadius: 34,
    magnetRadius: 0.8,
    magnetXp: 0.15,
    vitalityHp: 0.2,
    vitalityHeal: 0.2,
    heal: 0.4
  };
  function skillWeight(def, stacks, hpRatio) {
    if (def.id === "heal") return hpRatio < 0.8 ? 9 + (1 - hpRatio) * 12 : 0;
    if (stacks >= def.max) return 0;
    return def.weight;
  }
  var SPECIES = [
    { id: "puppy", bonus: "maxHp", per: 0.05, region: "forest" },
    { id: "bunny", bonus: "move", per: 0.03, region: "forest" },
    { id: "squirrel", bonus: "coins", per: 0.06, region: "forest" },
    { id: "fox", bonus: "damage", per: 0.04, region: "forest" },
    { id: "hedgehog", bonus: "armor", per: 0.03, region: "forest" },
    { id: "fawn", bonus: "range", per: 0.03, region: "forest" },
    { id: "kitten", bonus: "charge", per: 0.05, region: "village" },
    { id: "duckling", bonus: "xp", per: 0.06, region: "village" },
    { id: "piglet", bonus: "gifts", per: 0.1, region: "village" },
    { id: "lamb", bonus: "rescueHeal", per: 0.15, region: "village" },
    { id: "chick", bonus: "splash", per: 0.05, region: "village" },
    { id: "otter", bonus: "pickup", per: 0.08, region: "lake" },
    { id: "turtle", bonus: "revive", per: 0.08, region: "lake" },
    { id: "frog", bonus: "gooWalk", per: 0.05, region: "lake" },
    { id: "penguin", bonus: "pressureMax", per: 0.03, region: "special" },
    { id: "panda", bonus: "all", per: 0.02, region: "special" }
  ];
  var ASSIST = {
    // after this many failed attempts in a row on a stage, offer a helper boost
    failsBeforeHelp: 2,
    helpHp: 0.3,
    helpDamage: 0.2
  };

  // src/sim/rng.ts
  var Rng = class {
    constructor(seed) {
      this.s = seed >>> 0 || 1;
    }
    next() {
      let t2 = this.s += 1831565813;
      t2 = Math.imul(t2 ^ t2 >>> 15, t2 | 1);
      t2 ^= t2 + Math.imul(t2 ^ t2 >>> 7, t2 | 61);
      return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
    }
    range(a, b) {
      return a + (b - a) * this.next();
    }
    int(a, b) {
      return Math.floor(this.range(a, b + 1));
    }
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    }
    chance(p) {
      return this.next() < p;
    }
  };
  function hashString(s) {
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return h2 >>> 0;
  }

  // src/data/obstacles.ts
  var OBSTACLES = {
    tree: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_tree", foot: 18 },
    pine: { shape: "circle", r: 26, blocksShots: true, sprite: "ob_pine", foot: 16 },
    bush: { shape: "circle", r: 24, blocksShots: false, sprite: "ob_bush", foot: 14 },
    rock: { shape: "circle", r: 26, blocksShots: true, sprite: "ob_rock", foot: 14 },
    boulder: { shape: "circle", r: 40, blocksShots: true, sprite: "ob_boulder", foot: 20 },
    stump: { shape: "circle", r: 20, blocksShots: true, sprite: "ob_stump", foot: 12 },
    log: { shape: "rect", w: 112, h: 34, blocksShots: true, sprite: "ob_log", foot: 17 },
    fence: { shape: "rect", w: 144, h: 18, blocksShots: false, sprite: "ob_fence", foot: 9 },
    fencev: { shape: "rect", w: 18, h: 144, blocksShots: false, sprite: "ob_fencev", foot: 72 },
    house: { shape: "rect", w: 150, h: 96, blocksShots: true, sprite: "ob_house", foot: 48 },
    barrel: { shape: "circle", r: 20, blocksShots: true, sprite: "ob_barrel", foot: 12 },
    crate: { shape: "rect", w: 46, h: 40, blocksShots: true, sprite: "ob_crate", foot: 20 },
    hay: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_hay", foot: 16 },
    well: { shape: "circle", r: 32, blocksShots: true, sprite: "ob_well", foot: 18 },
    cart: { shape: "rect", w: 104, h: 52, blocksShots: true, sprite: "ob_cart", foot: 26 },
    reeds: { shape: "circle", r: 22, blocksShots: false, sprite: "ob_reeds", foot: 12 },
    lilyrock: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_shellrock", foot: 16 },
    driftwood: { shape: "rect", w: 110, h: 30, blocksShots: true, sprite: "ob_driftwood", foot: 15 }
  };

  // src/render/background.ts
  var COLS = ROOM.width / ROOM.tile;
  var ROWS = ROOM.height / ROOM.tile;
  var T = ROOM.tile;
  var REGION_LOOK = {
    forest: { base: ".", edge: "#3f7a2a", borderA: "border_tree", borderB: "border_pine", borderLow: "border_bush", fill: "#3f7a2a", path: "#" },
    village: { base: ".", edge: "#4a7f32", borderA: "border_tree", borderB: "border_bush", borderLow: "border_bush", fill: "#4a7f32", path: "c" },
    lake: { base: ".", edge: "#3d7d4a", borderA: "border_tree", borderB: "ob_reeds", borderLow: "ob_reeds", fill: "#3d7d4a", path: "s" }
  };
  function cellAt(room, c, r) {
    c = Math.max(0, Math.min(COLS - 1, c));
    r = Math.max(0, Math.min(ROWS - 1, r));
    return room.terrain?.[r]?.[c] ?? ".";
  }
  function buildBackground(room, region, seedKey, scale) {
    const cv = document.createElement("canvas");
    cv.width = Math.round(ROOM.width * scale);
    cv.height = Math.round(ROOM.height * scale);
    const ctx2 = cv.getContext("2d");
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = "high";
    ctx2.scale(scale, scale);
    const seed = hashString(seedKey);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const h2 = (seed ^ Math.imul(c + 1, 73856093) ^ Math.imul(r + 1, 19349663)) >>> 0;
      const v = h2 % 10;
      const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
      if (f) ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, c * T, r * T, T + 0.5, T + 0.5);
    }
    const kinds = [["s", "sand"], ["#", "path"], ["c", "cobble"], ["w", "water"]];
    for (const [ch, name] of kinds) {
      for (let j = 0; j <= ROWS; j++) for (let i = 0; i <= COLS; i++) {
        let m = 0;
        if (cellAt(room, i - 1, j - 1) === ch) m |= 1;
        if (cellAt(room, i, j - 1) === ch) m |= 2;
        if (cellAt(room, i - 1, j) === ch) m |= 4;
        if (cellAt(room, i, j) === ch) m |= 8;
        if (!m) continue;
        const f = frame(`t_${name}_${m}`);
        if (f) ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, (i - 0.5) * T, (j - 0.5) * T, T + 0.5, T + 0.5);
      }
    }
    const rng = new Rng(seed ^ 2654435769);
    const decor = region === "lake" ? ["d_shell", "d_tuft", "d_pebble_0", "d_flower_3", "d_clover", "d_tuft"] : region === "village" ? ["d_flower_0", "d_flower_1", "d_tuft", "d_pebble_1", "d_clover", "d_flower_4", "d_leaf"] : ["d_flower_0", "d_flower_2", "d_tuft", "d_mushroom", "d_pebble_0", "d_clover", "d_flower_1", "d_tuft", "d_leaf"];
    const n = 46;
    for (let i = 0; i < n; i++) {
      const x = rng.range(ROOM.wall + 10, ROOM.width - ROOM.wall - 10), y = rng.range(ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
      const ch = cellAt(room, Math.floor(x / T), Math.floor(y / T));
      if (ch !== ".") continue;
      const f = frame(rng.pick(decor));
      if (f) drawFrame(ctx2, f, x, y, rng.range(0.85, 1.15), rng.chance(0.5));
    }
    for (const d of room.decor ?? []) {
      const f = frame(d.t);
      if (f) drawFrame(ctx2, f, d.x, d.y);
    }
    const g1 = ctx2.createLinearGradient(0, 0, ROOM.wall * 1.6, 0);
    g1.addColorStop(0, "rgba(20,50,10,0.45)");
    g1.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g1;
    ctx2.fillRect(0, 0, ROOM.wall * 1.6, ROOM.height);
    const g2 = ctx2.createLinearGradient(ROOM.width, 0, ROOM.width - ROOM.wall * 1.6, 0);
    g2.addColorStop(0, "rgba(20,50,10,0.45)");
    g2.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g2;
    ctx2.fillRect(ROOM.width - ROOM.wall * 1.6, 0, ROOM.wall * 1.6, ROOM.height);
    const g3 = ctx2.createLinearGradient(0, 0, 0, ROOM.wall * 1.6);
    g3.addColorStop(0, "rgba(20,50,10,0.4)");
    g3.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g3;
    ctx2.fillRect(0, 0, ROOM.width, ROOM.wall * 1.6);
    const g4 = ctx2.createLinearGradient(0, ROOM.height, 0, ROOM.height - ROOM.wall * 1.6);
    g4.addColorStop(0, "rgba(20,50,10,0.4)");
    g4.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g4;
    ctx2.fillRect(0, ROOM.height - ROOM.wall * 1.6, ROOM.width, ROOM.wall * 1.6);
    return cv;
  }
  function buildStatics(room, region, seedKey) {
    const out = [];
    const rng = new Rng(hashString(seedKey) ^ 5369127);
    const look = REGION_LOOK[region];
    for (const o of room.obstacles) {
      const def = OBSTACLES[o.t];
      if (!def) continue;
      let name = def.sprite;
      if (o.t === "tree" && Math.round(o.x + o.y) % 2) name = "ob_tree2";
      if (o.t === "house" && Math.round(o.x) % 2) name = "ob_house2";
      out.push({ name, x: o.x, y: o.y + def.foot, flip: o.t !== "house" && o.t !== "gate" && rng.chance(0.5), scale: 1, sortY: o.y + def.foot * 0.5 });
    }
    const side = (x) => {
      for (let y = 30; y < ROOM.height + 40; y += rng.range(58, 74)) {
        const nm = rng.chance(0.55) ? look.borderA : look.borderB;
        out.push({ name: nm, x: x + rng.range(-10, 10), y, flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: y });
      }
    };
    side(16);
    side(ROOM.width - 16);
    for (let x = 70; x < ROOM.width - 50; x += rng.range(58, 70)) {
      if (Math.abs(x - ROOM.width / 2) < 140) continue;
      out.push({ name: rng.chance(0.6) ? look.borderA : look.borderB, x, y: 34 + rng.range(-6, 6), flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: 34 });
    }
    for (let x = 60; x < ROOM.width - 40; x += rng.range(50, 64)) {
      if (Math.abs(x - ROOM.width / 2) < 70) continue;
      out.push({ name: look.borderLow, x, y: ROOM.height - 8, flip: rng.chance(0.5), scale: rng.range(0.9, 1.1), sortY: ROOM.height + 100 });
    }
    return out;
  }

  // src/render/particles.ts
  var Particles = class {
    constructor() {
      this.list = [];
      this.texts = [];
      this.cache = /* @__PURE__ */ new Map();
    }
    fr(name) {
      let f = this.cache.get(name);
      if (f === void 0) {
        f = frame(name) ?? null;
        this.cache.set(name, f);
      }
      return f;
    }
    spawn(name, x, y, o = {}) {
      const cap = quality().particles;
      let p;
      for (const q of this.list) if (!q.alive) {
        p = q;
        break;
      }
      if (!p) {
        if (this.list.length >= cap) return null;
        p = {};
        this.list.push(p);
      }
      const frames2 = Array.isArray(name) ? name.map((n) => this.fr(n)).filter(Boolean) : null;
      Object.assign(p, {
        f: Array.isArray(name) ? frames2[0] ?? null : this.fr(name),
        frames: frames2,
        fps: 12,
        x,
        y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        g: 0,
        drag: 0,
        life: 0,
        max: 0.6,
        scale: 1,
        scale1: 1,
        rot: 0,
        vr: 0,
        alpha: 1,
        fadeIn: 0,
        additive: false,
        ground: false,
        alive: true,
        flip: false
      }, o);
      return p;
    }
    text(text, x, y, color = "#ffffff", size = 22, life = 0.9, stroke = "#3a2416") {
      let t2 = this.texts.find((q) => !q.alive);
      if (!t2) {
        if (this.texts.length > 40) return;
        t2 = {};
        this.texts.push(t2);
      }
      Object.assign(t2, { text, x, y, vy: -60, life: 0, max: life, color, size, alive: true, stroke });
    }
    update(dt) {
      for (const p of this.list) {
        if (!p.alive) continue;
        p.life += dt;
        if (p.life >= p.max) {
          p.alive = false;
          continue;
        }
        if (p.drag) {
          const k = Math.max(0, 1 - p.drag * dt);
          p.vx *= k;
          p.vy *= k;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.g) {
          p.vz -= p.g * dt;
          p.z += p.vz * dt;
          if (p.z < 0) {
            p.z = 0;
            p.vz = -p.vz * 0.35;
            p.vx *= 0.6;
            p.vy *= 0.6;
          }
        }
        p.rot += p.vr * dt;
        if (p.frames && p.frames.length) p.f = p.frames[Math.min(p.frames.length - 1, Math.floor(p.life * p.fps))];
      }
      for (const t2 of this.texts) {
        if (!t2.alive) continue;
        t2.life += dt;
        t2.y += t2.vy * dt;
        t2.vy *= 1 - dt * 2.5;
        if (t2.life >= t2.max) t2.alive = false;
      }
    }
    draw(ctx2, ground) {
      for (const p of this.list) {
        if (!p.alive || p.ground !== ground || !p.f) continue;
        const k = p.life / p.max;
        let a = p.alpha * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1);
        if (p.fadeIn && p.life < p.fadeIn) a *= p.life / p.fadeIn;
        const s = p.scale + (p.scale1 - p.scale) * k;
        if (p.additive) {
          ctx2.globalCompositeOperation = "lighter";
        }
        drawFrame(ctx2, p.f, p.x, p.y - p.z, s, p.flip, p.rot, a);
        if (p.additive) ctx2.globalCompositeOperation = "source-over";
      }
    }
    drawTexts(ctx2, font) {
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.lineJoin = "round";
      for (const t2 of this.texts) {
        if (!t2.alive) continue;
        const k = t2.life / t2.max;
        const pop = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : k < 0.25 ? 1.1 - (k - 0.15) / 0.1 * 0.1 : 1;
        ctx2.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
        ctx2.font = `${Math.round(t2.size * pop)}px ${font}`;
        ctx2.lineWidth = Math.max(3, t2.size * 0.22);
        ctx2.strokeStyle = t2.stroke;
        ctx2.strokeText(t2.text, t2.x, t2.y);
        ctx2.fillStyle = t2.color;
        ctx2.fillText(t2.text, t2.x, t2.y);
      }
      ctx2.globalAlpha = 1;
    }
    clear() {
      for (const p of this.list) p.alive = false;
      for (const t2 of this.texts) t2.alive = false;
    }
    count() {
      let n = 0;
      for (const p of this.list) if (p.alive) n++;
      return n;
    }
  };

  // src/render/roomView.ts
  var GOO_COLOR = {
    blob: "violet",
    mini: "amber",
    spitter: "pink",
    splitter: "amber",
    dasher: "indigo",
    chunky: "plum",
    nest: "berry",
    jumper: "teal",
    flyer: "berry",
    boss: "royal"
  };
  var BOSS_COLOR = { forest: "royal", village: "amber", lake: "teal" };
  var RoomView = class {
    constructor(sim, region, seedKey) {
      this.gooScale = 0.75;
      this.fx = new Particles();
      this.time = 0;
      this.scale = 1;
      this.offX = 0;
      this.offY = 0;
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.hurtFlash = 0;
      this.vis = /* @__PURE__ */ new Map();
      this.rng = new Rng(77);
      this.cleanWave = null;
      this.gateFade = 1;
      this.blooms = 0;
      this.runDist = 0;
      this.lastPX = 0;
      this.lastPY = 0;
      this.sortBuf = [];
      this.font = '"Fredoka","Jua",sans-serif';
      this.showRange = 0;
      this.winTimer = 0;
      this.slowmo = 0;
      this.muzzleX = 0;
      this.muzzleY = 0;
      this.sim = sim;
      this.region = region;
      this.bgScale = quality().bgScale;
      this.bg = buildBackground(sim.def, region, seedKey, this.bgScale);
      this.statics = buildStatics(sim.def, region, seedKey);
      this.statics.push({ name: "gate_posts", x: ROOM.width / 2, y: ROOM.wall + 6, flip: false, scale: 1, sortY: ROOM.wall });
      this.brush = frame("brush") ?? null;
      this.stamps = [0, 1, 2, 3].map((i) => frame(`goostamp_${i}`) ?? null);
      this.goo = document.createElement("canvas");
      this.goo.width = Math.round(ROOM.width * this.gooScale);
      this.goo.height = Math.round(ROOM.height * this.gooScale);
      this.gooCtx = this.goo.getContext("2d");
      this.paintGoo();
      this.lastPX = sim.player.x;
      this.lastPY = sim.player.y;
    }
    // Goo layer: union of organic splats, given thickness (dark lower rim, light
    // upper rim), gloss and bubbles. Washing erases straight through it.
    paintGoo() {
      const g = this.gooCtx;
      const s = this.gooScale;
      const r = new Rng(this.sim.def.goo.length * 31 + 5);
      const W = this.goo.width, H = this.goo.height;
      const mask = document.createElement("canvas");
      mask.width = W;
      mask.height = H;
      const m = mask.getContext("2d");
      m.scale(s, s);
      m.fillStyle = "#fff";
      const blob = (x, y, rad) => {
        const n = 18;
        const ph = r.range(0, 6.28), ph2 = r.range(0, 6.28);
        m.beginPath();
        for (let i = 0; i <= n; i++) {
          const a = i / n * Math.PI * 2;
          const k = 1 + 0.1 * Math.sin(a * 3 + ph) + 0.06 * Math.sin(a * 5 + ph2);
          const px = x + Math.cos(a) * rad * k, py = y + Math.sin(a) * rad * k * 0.92;
          if (i === 0) m.moveTo(px, py);
          else m.lineTo(px, py);
        }
        m.closePath();
        m.fill();
      };
      for (const b of this.sim.def.goo) {
        blob(b.x, b.y, b.r);
        const n = Math.max(2, Math.round(b.r / 34));
        for (let i = 0; i < n; i++) {
          const a = r.range(0, 6.28), d = b.r * r.range(0.7, 0.95);
          blob(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, b.r * r.range(0.22, 0.38));
        }
      }
      const tint = (col) => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const x = c.getContext("2d");
        x.drawImage(mask, 0, 0);
        x.globalCompositeOperation = "source-in";
        x.fillStyle = col;
        x.fillRect(0, 0, W, H);
        return c;
      };
      g.clearRect(0, 0, W, H);
      g.drawImage(tint("#e9d8ff"), 0, -3 * s);
      g.drawImage(tint("#6e3fae"), 0, 5 * s);
      g.drawImage(tint("#b385ea"), 0, 0);
      g.save();
      g.globalCompositeOperation = "source-atop";
      g.scale(s, s);
      for (const b of this.sim.def.goo) {
        const gr = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.05, b.x, b.y, b.r * 1.1);
        gr.addColorStop(0, "rgba(255,255,255,0.32)");
        gr.addColorStop(0.5, "rgba(255,255,255,0.06)");
        gr.addColorStop(1, "rgba(90,40,150,0.18)");
        g.fillStyle = gr;
        g.beginPath();
        g.arc(b.x, b.y, b.r * 1.3, 0, Math.PI * 2);
        g.fill();
        for (let i = 0; i < Math.round(b.r / 14); i++) {
          const a = r.range(0, 6.28), d = r.range(0, b.r * 0.8), x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d, rr = r.range(2.5, 6.5);
          g.fillStyle = "rgba(235,215,255,0.55)";
          g.beginPath();
          g.arc(x, y, rr, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(255,255,255,0.75)";
          g.beginPath();
          g.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.35, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "rgba(255,255,255,0.4)";
        g.beginPath();
        g.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.42, b.r * 0.28, b.r * 0.09, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    erase(x, y, r) {
      const g = this.gooCtx;
      const s = this.gooScale;
      const b = this.brush;
      if (!b) return;
      g.globalCompositeOperation = "destination-out";
      const k = r * 2 * s / b.w * 1.25;
      g.drawImage(b.img, b.x, b.y, b.w, b.h, x * s - b.w * k / 2, y * s - b.h * k / 2, b.w * k, b.h * k);
      g.globalCompositeOperation = "source-over";
    }
    layout(l) {
      const availH = l.viewH - l.top - l.bottom;
      this.scale = Math.min(l.viewW / ROOM.width, availH / ROOM.height);
      this.offX = (l.viewW - ROOM.width * this.scale) / 2;
      this.offY = l.top + Math.max(0, (availH - ROOM.height * this.scale) * 0.4);
    }
    worldToScreen(x, y) {
      return [this.offX + x * this.scale, this.offY + y * this.scale];
    }
    // ------------------------------------------------------------------ events → effects
    onEvent(e) {
      const fx = this.fx;
      const r = this.rng;
      switch (e.t) {
        case "hit": {
          const v = this.vis.get(e.id);
          if (v) {
            v.vy -= 2.4;
            v.vx += 2;
          }
          const m = this.sim.monsters.find((q) => q.id === e.id);
          const col = GOO_COLOR[e.kind];
          for (let i = 0; i < 2; i++) fx.spawn(`p_goo_${col}`, e.x + r.range(-16, 16), e.y + r.range(-10, 10), { z: 18, vz: r.range(80, 200), vx: r.range(-90, 90), vy: r.range(-30, 40), g: 600, max: 0.7, scale: r.range(0.7, 1.1) });
          if (m) fx.spawn("p_water_s", e.x, e.y, { z: 10, vz: 140, vx: r.range(-120, 120), g: 700, max: 0.5 });
          break;
        }
        case "burst": {
          const col = e.boss ? BOSS_COLOR[this.region] : GOO_COLOR[e.kind];
          const big = e.r > 40;
          const n = big ? 22 : 12;
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], e.x, e.y + e.r * 0.4, { fps: 16, max: 0.4, scale: e.r / 24, ground: false });
          fx.spawn("fx_softring", e.x, e.y + e.r * 0.3, { max: 0.45, scale: e.r / 30, scale1: e.r / 10, ground: true, alpha: 0.8 });
          for (let i = 0; i < n; i++) {
            const a = r.range(0, 6.28), sp = r.range(120, 320) * (big ? 1.4 : 1);
            fx.spawn(`p_goo_${col}`, e.x, e.y, { z: 20, vz: r.range(150, 380), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 900, max: r.range(0.5, 0.9), scale: r.range(0.8, 1.5), drag: 1.5 });
          }
          for (let i = 0; i < n; i++) {
            const a = r.range(0, 6.28), sp = r.range(90, 260);
            fx.spawn("p_water", e.x, e.y, { z: 16, vz: r.range(200, 420), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 1e3, max: r.range(0.45, 0.8), scale: r.range(0.6, 1.1) });
          }
          for (let i = 0; i < (big ? 8 : 4); i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-e.r, e.r), e.y + r.range(-e.r, e.r * 0.5), { fps: 8, max: 0.45, scale: r.range(0.8, 1.3), vy: -40 });
          for (let i = 0; i < 3; i++) fx.spawn("p_bubble", e.x + r.range(-20, 20), e.y + r.range(-10, 10), { vy: r.range(-70, -30), vx: r.range(-30, 30), max: r.range(0.8, 1.3), scale: r.range(0.6, 1) });
          this.shake = Math.max(this.shake, e.boss ? 14 : big ? 6 : 2.5);
          if (e.combo >= 3) fx.text(`x${e.combo}`, e.x, e.y - e.r - 14, e.combo >= 6 ? "#ffe066" : "#ffffff", 22 + Math.min(14, e.combo * 1.5), 0.8);
          if (e.boss) {
            this.slowmo = 0.6;
            for (let i = 0; i < 30; i++) fx.spawn(["p_conf_0", "p_conf_1", "p_conf_2", "p_conf_3", "p_conf_4"][i % 5], e.x, e.y, { z: 40, vz: r.range(300, 600), vx: r.range(-300, 300), vy: r.range(-200, 100), g: 600, vr: r.range(-8, 8), max: 1.6, drag: 1 });
          }
          this.vis.delete(-1);
          break;
        }
        case "clean": {
          this.erase(e.x, e.y, e.r);
          if (this.blooms < 70 && r.chance(0.1)) {
            this.blooms++;
            const a = r.range(0, 6.28), d = r.range(0, e.r * 0.7);
            this.addBloom(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d);
          }
          break;
        }
        case "cleanWave":
          this.cleanWave = { x: e.x, y: e.y, r: 0 };
          break;
        case "cocoonHit": {
          for (let i = 0; i < 2; i++) fx.spawn("p_goo_violet", e.x + r.range(-20, 20), e.y, { z: 30, vz: r.range(80, 180), vx: r.range(-80, 80), g: 600, max: 0.6 });
          break;
        }
        case "rescue": {
          fx.spawn("fx_rays", e.x, e.y - 20, { max: 1.1, scale: 0.5, scale1: 1.1, alpha: 0.9, vr: 0.6, additive: quality().glow });
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], e.x, e.y + 10, { fps: 14, max: 0.45, scale: 1.6 });
          for (let i = 0; i < 10; i++) fx.spawn("p_heart", e.x, e.y - 20, { z: 10, vz: r.range(120, 280), vx: r.range(-140, 140), vy: r.range(-60, 30), g: 260, max: r.range(0.9, 1.4), scale: r.range(0.7, 1.2), drag: 1 });
          for (let i = 0; i < 12; i++) fx.spawn("p_goo_violet", e.x, e.y - 10, { z: 20, vz: r.range(150, 350), vx: r.range(-220, 220), vy: r.range(-120, 120), g: 900, max: 0.8, drag: 1.2 });
          for (let i = 0; i < 6; i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-40, 40), e.y + r.range(-60, 10), { fps: 8, max: 0.6, scale: r.range(1, 1.6) });
          this.slowmo = 0.45;
          this.shake = Math.max(this.shake, 4);
          break;
        }
        case "playerHit": {
          this.hurtFlash = 1;
          this.shake = Math.max(this.shake, 7);
          for (let i = 0; i < 8; i++) fx.spawn("p_goo_violet", e.x, e.y - 30, { z: 20, vz: r.range(100, 240), vx: r.range(-150, 150), vy: r.range(-60, 60), g: 800, max: 0.7 });
          fx.text(`-${e.dmg}`, e.x, e.y - 70, "#ffd0e8", 24, 0.8, "#6d2aa0");
          break;
        }
        case "shieldPop": {
          fx.spawn("fx_ring", e.x, e.y - 24, { max: 0.35, scale: 0.6, scale1: 1.4, alpha: 0.9 });
          for (let i = 0; i < 8; i++) fx.spawn("p_bubble", e.x + r.range(-30, 30), e.y - 24 + r.range(-30, 30), { vx: r.range(-80, 80), vy: r.range(-80, 40), max: 0.6, scale: r.range(0.5, 0.9) });
          break;
        }
        case "pressureFull": {
          fx.spawn("fx_ring", e.x, e.y + 4, { max: 0.4, scale: 0.4, scale1: 1.2, alpha: 0.85, ground: true });
          for (let i = 0; i < 6; i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-30, 30), e.y - r.range(10, 60), { fps: 8, max: 0.5, vy: -60 });
          break;
        }
        case "spit": {
          fx.spawn("p_goo_pink", e.x, e.y - 20, { z: 10, vz: 120, vx: r.range(-40, 40), g: 500, max: 0.4, scale: 0.7 });
          break;
        }
        case "land": {
          fx.spawn("fx_softring", e.x, e.y, { max: 0.45, scale: e.r / 50, scale1: e.r / 26, ground: true, alpha: 0.9 });
          for (let i = 0; i < 10; i++) {
            const a = r.range(0, 6.28);
            fx.spawn("p_dust", e.x + Math.cos(a) * e.r * 0.6, e.y + Math.sin(a) * e.r * 0.3, { vx: Math.cos(a) * 80, vy: Math.sin(a) * 40, max: 0.5, scale: r.range(0.8, 1.3) });
          }
          this.shake = Math.max(this.shake, 6);
          break;
        }
        case "split":
          fx.spawn("fx_softring", e.x, e.y, { max: 0.3, scale: 0.6, scale1: 1.4, ground: true });
          break;
        case "pickup": {
          if (e.kind === "coin") fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], this.sim.player.x + r.range(-10, 10), this.sim.player.y - 40, { fps: 10, max: 0.3, scale: 0.6 });
          if (e.kind === "heal") {
            fx.text("+HP", this.sim.player.x, this.sim.player.y - 70, "#ffb3c6", 20, 0.8);
            for (let i = 0; i < 4; i++) fx.spawn("p_heart", this.sim.player.x + r.range(-20, 20), this.sim.player.y - 30, { vy: -80, max: 0.7, scale: 0.6 });
          }
          break;
        }
        case "roomClear":
          this.winTimer = 1.3;
          break;
        case "gateOpen": {
          for (let i = 0; i < 16; i++) fx.spawn("p_goo_violet", ROOM.width / 2 + r.range(-60, 60), ROOM.wall, { z: 30, vz: r.range(150, 300), vx: r.range(-200, 200), vy: r.range(-40, 120), g: 800, max: 0.8 });
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], ROOM.width / 2, ROOM.wall + 10, { fps: 14, max: 0.45, scale: 2 });
          break;
        }
        case "trailPop": {
          fx.spawn("fx_ring", e.x, e.y, { max: 0.25, scale: 0.3, scale1: 0.7, alpha: 0.8, ground: true });
          for (let i = 0; i < 4; i++) fx.spawn("p_water_s", e.x, e.y, { z: 6, vz: 140, vx: r.range(-100, 100), vy: r.range(-60, 60), g: 600, max: 0.4 });
          break;
        }
        default:
          break;
      }
    }
    addBloom(x, y) {
      if (x < ROOM.wall + 8 || x > ROOM.width - ROOM.wall - 8 || y < ROOM.wall + 8 || y > ROOM.height - ROOM.wall - 8) return;
      if (this.sim.world.isWaterAt(x, y)) return;
      const names = ["d_flower_0", "d_flower_1", "d_flower_2", "d_flower_3", "d_flower_4", "d_clover"];
      const f = frame(names[this.rng.int(0, names.length - 1)]);
      if (!f) return;
      const g = this.bg.getContext("2d");
      g.save();
      g.setTransform(this.bgScale, 0, 0, this.bgScale, 0, 0);
      drawFrame(g, f, x, y, this.rng.range(0.85, 1.2), this.rng.chance(0.5));
      g.restore();
      this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], x, y - 8, { fps: 10, max: 0.3, scale: 0.6 });
    }
    // ------------------------------------------------------------------ update
    update(dt) {
      this.time += dt;
      this.fx.update(dt);
      const sim = this.sim;
      const p = sim.player;
      for (const m of sim.monsters) {
        let v = this.vis.get(m.id);
        if (!m.alive) {
          if (v) this.vis.delete(m.id);
          continue;
        }
        if (!v) {
          v = { sx: 1, sy: 1, vx: 0, vy: 0, rise0: Math.max(m.rise, 0.01), seen: true };
          this.vis.set(m.id, v);
        }
        const k = 170, c = 9;
        v.vx += (-(v.sx - 1) * k - v.vx * c) * dt;
        v.vy += (-(v.sy - 1) * k - v.vy * c) * dt;
        v.sx += v.vx * dt;
        v.sy += v.vy * dt;
        if (m.hitTime < 0.1) {
          v.vx += (this.rng.next() - 0.5) * 40 * dt * 10;
          v.vy += (this.rng.next() - 0.5) * 40 * dt * 10;
        }
      }
      if (this.cleanWave) {
        const w = this.cleanWave;
        w.r += dt * 1300;
        const g = this.gooCtx;
        g.save();
        g.globalCompositeOperation = "destination-out";
        g.beginPath();
        g.arc(w.x * this.gooScale, w.y * this.gooScale, w.r * this.gooScale, 0, Math.PI * 2);
        g.fill();
        g.restore();
        for (let i = 0; i < 3; i++) {
          const a = this.rng.range(0, 6.28);
          const x = w.x + Math.cos(a) * w.r, y = w.y + Math.sin(a) * w.r;
          if (x > ROOM.wall && x < ROOM.width - ROOM.wall && y > ROOM.wall && y < ROOM.height - ROOM.wall) this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], x, y, { fps: 10, max: 0.35, scale: 0.9 });
        }
        if (w.r > 1500) {
          this.cleanWave = null;
          this.gooCtx.clearRect(0, 0, this.goo.width, this.goo.height);
        }
      }
      if (sim.gateOpen) this.gateFade = Math.max(0, this.gateFade - dt * 2.5);
      const d = Math.hypot(p.x - this.lastPX, p.y - this.lastPY);
      this.runDist += d;
      this.lastPX = p.x;
      this.lastPY = p.y;
      if (p.moving && d > 0 && this.rng.chance(0.12)) this.fx.spawn("p_dust", p.x - p.vx * 0.03, p.y + 4, { max: 0.35, scale: 0.6, vy: -10, ground: true });
      for (const s of sim.segs) {
        if (s.kind === 2 || !s.hit) continue;
        if (this.rng.chance(quality().streamFx ? 0.7 : 0.35)) {
          const back = Math.atan2(s.y0 - s.y1, s.x0 - s.x1);
          const a = back + this.rng.range(-1.1, 1.1);
          this.fx.spawn("p_water_s", s.x1, s.y1, { z: 8, vz: this.rng.range(60, 200), vx: Math.cos(a) * this.rng.range(80, 220), vy: Math.sin(a) * this.rng.range(40, 140), g: 800, max: 0.4, scale: this.rng.range(0.8, 1.4) * Math.min(2, s.w / 14) });
        }
        if (this.rng.chance(0.25)) this.fx.spawn("p_mist", s.x1, s.y1, { max: 0.5, scale: 0.4 * Math.min(2.2, s.w / 12), scale1: 0.9 * Math.min(2.2, s.w / 12), alpha: 0.6, vy: -20 });
      }
      if (p.pressure >= 1 && sim.segs.length && this.rng.chance(0.3)) {
        const s = sim.segs[0];
        const t2 = this.rng.next();
        this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], s.x0 + (s.x1 - s.x0) * t2, s.y0 + (s.y1 - s.y0) * t2, { fps: 12, max: 0.25, scale: 0.6 });
      }
      if (this.shake > 0 && quality().shake) {
        this.shake = Math.max(0, this.shake - dt * 40);
        this.shakeX = (this.rng.next() - 0.5) * this.shake;
        this.shakeY = (this.rng.next() - 0.5) * this.shake;
      } else {
        this.shakeX = this.shakeY = 0;
        this.shake = 0;
      }
      this.hurtFlash = Math.max(0, this.hurtFlash - dt * 2.4);
      this.winTimer = Math.max(0, this.winTimer - dt);
      this.slowmo = Math.max(0, this.slowmo - dt);
      if (!p.firing && !p.moving && sim.state === "fight" && p.stillTime > 0.25) this.showRange = Math.min(1, this.showRange + dt * 3);
      else this.showRange = Math.max(0, this.showRange - dt * 4);
    }
    // ------------------------------------------------------------------ render
    render(ctx2, dpr, viewW, viewH) {
      const sim = this.sim;
      const s = this.scale;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.fillStyle = REGION_LOOK[this.region].fill;
      ctx2.fillRect(0, 0, viewW, viewH);
      ctx2.setTransform(dpr * s, 0, 0, dpr * s, dpr * (this.offX + this.shakeX), dpr * (this.offY + this.shakeY));
      ctx2.imageSmoothingEnabled = true;
      ctx2.drawImage(this.bg, 0, 0, ROOM.width, ROOM.height);
      ctx2.globalAlpha = 0.93;
      ctx2.drawImage(this.goo, 0, 0, ROOM.width, ROOM.height);
      ctx2.globalAlpha = 1;
      this.fx.draw(ctx2, true);
      this.drawMarks(ctx2);
      this.drawRangeAndPressure(ctx2);
      const sh = frame("shadow");
      if (sh) {
        for (const m of sim.monsters) if (m.alive) {
          const k = m.rise > 0 ? 1 - m.rise / MONSTER_RULES.spawnRise : 1;
          let sx = m.x, sy = m.y + m.r * 0.55;
          if (m.kind === "jumper" && m.state === 2) {
            const mm = m;
            void mm;
          }
          drawFrame(ctx2, sh, sx, sy, m.r * 2.3 * this.sim.scaleOf(m) * Math.max(0, Math.min(1, k)) / 60, false, 0, 0.9);
        }
        drawFrame(ctx2, sh, sim.player.x, sim.player.y + 5, 0.85);
        for (const f of sim.followers) drawFrame(ctx2, sh, f.x, f.y + 2, 0.55, false, 0, 0.8);
        for (const c of sim.cocoons) if (!c.freed) drawFrame(ctx2, sh, c.x, c.y + 24, 1.1, false, 0, 0.8);
      }
      this.drawPickups(ctx2);
      this.drawSorted(ctx2);
      this.drawStreams(ctx2);
      this.fx.draw(ctx2, false);
      this.drawBullets(ctx2);
      this.fx.drawTexts(ctx2, this.font);
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      const p = sim.player;
      const low = p.hp / sim.run.stats.maxHp < 0.3 && sim.state === "fight";
      const a = Math.max(this.hurtFlash * 0.55, low ? 0.18 + Math.sin(this.time * 5) * 0.08 : 0);
      if (a > 0.01) {
        const g = ctx2.createRadialGradient(viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.35, viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.7);
        g.addColorStop(0, "rgba(170,70,220,0)");
        g.addColorStop(1, `rgba(150,50,200,${a})`);
        ctx2.fillStyle = g;
        ctx2.fillRect(0, 0, viewW, viewH);
      }
    }
    drawMarks(ctx2) {
      for (const k of this.sim.marks) {
        if (k.kind === "land") {
          const prog = Math.max(0, Math.min(1, 1 - k.t / 0.8));
          ctx2.save();
          ctx2.fillStyle = `rgba(170,80,230,${0.18 + prog * 0.2})`;
          ctx2.strokeStyle = "rgba(255,255,255,0.85)";
          ctx2.lineWidth = 3;
          ctx2.beginPath();
          ctx2.ellipse(k.x, k.y, k.r, k.r * 0.62, 0, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.stroke();
          ctx2.fillStyle = `rgba(140,50,200,${0.35 + prog * 0.25})`;
          ctx2.beginPath();
          ctx2.ellipse(k.x, k.y, k.r * prog, k.r * 0.62 * prog, 0, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.restore();
        } else if (k.kind === "dash" && k.x2 !== void 0) {
          const pulse = 0.55 + Math.sin(this.time * 18) * 0.25;
          ctx2.save();
          ctx2.lineCap = "round";
          ctx2.strokeStyle = `rgba(120,110,240,${0.35 * pulse + 0.15})`;
          ctx2.lineWidth = k.r * 1.5;
          ctx2.beginPath();
          ctx2.moveTo(k.x, k.y + 10);
          ctx2.lineTo(k.x2, k.y2 + 10);
          ctx2.stroke();
          ctx2.setLineDash([14, 12]);
          ctx2.lineDashOffset = -this.time * 80;
          ctx2.strokeStyle = `rgba(255,255,255,${0.8 * pulse})`;
          ctx2.lineWidth = 4;
          ctx2.beginPath();
          ctx2.moveTo(k.x, k.y + 10);
          ctx2.lineTo(k.x2, k.y2 + 10);
          ctx2.stroke();
          ctx2.restore();
        } else if (k.kind === "spawn") {
          const st = this.stamps[0];
          const prog = 1 - Math.max(0, k.t - MONSTER_RULES.spawnRise) / 1.1;
          if (st) drawFrame(ctx2, st, k.x, k.y + k.r * 0.5, k.r * 1.6 * Math.max(0.2, prog) / 112, false, this.time, 0.85);
        }
      }
    }
    drawRangeAndPressure(ctx2) {
      const p = this.sim.player;
      const st = this.sim.run.stats;
      if (this.showRange > 0.01) {
        ctx2.save();
        ctx2.globalAlpha = this.showRange * 0.55;
        ctx2.strokeStyle = "#ffffff";
        ctx2.lineWidth = 3;
        ctx2.setLineDash([10, 12]);
        ctx2.lineDashOffset = -this.time * 20;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y - 14, st.range, st.range, 0, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.restore();
      }
      if (p.pressure > 0.02) {
        const full = p.pressure >= 1;
        ctx2.save();
        ctx2.lineCap = "round";
        ctx2.strokeStyle = "rgba(30,60,110,0.35)";
        ctx2.lineWidth = 7;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y + 4, 30, 15, 0, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.strokeStyle = full ? `rgba(255,255,255,${0.85 + Math.sin(this.time * 20) * 0.15})` : "#6fd6ff";
        ctx2.lineWidth = full ? 6 : 5;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y + 4, 30, 15, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.pressure);
        ctx2.stroke();
        if (full && quality().glow) {
          ctx2.globalCompositeOperation = "lighter";
          ctx2.globalAlpha = 0.35 + Math.sin(this.time * 12) * 0.1;
          draw(ctx2, "fx_glow", p.x, p.y + 2, 0.9, false, 0, 1, 1, 0.5);
        }
        ctx2.restore();
      }
    }
    drawPickups(ctx2) {
      const t2 = this.time;
      for (const k of this.sim.pickups) {
        if (!k.alive) continue;
        const bob = 5 + Math.sin(t2 * 6 + k.x) * 3;
        if (k.kind === "coin") draw(ctx2, `p_coin_${Math.floor(t2 * 10 + k.x) % 4}`, k.x, k.y - bob, 0.9);
        else if (k.kind === "xp") draw(ctx2, "p_xp", k.x, k.y - bob, 0.8);
        else draw(ctx2, "p_heal", k.x, k.y - bob, 1);
      }
      for (const b of this.sim.bubbles) if (b.alive) draw(ctx2, "p_bubble", b.x, b.y - 8 + Math.sin(t2 * 4 + b.x) * 2, 0.9, false, 0, Math.min(1, b.life * 2));
    }
    drawSorted(ctx2) {
      const sim = this.sim;
      const buf = this.sortBuf;
      buf.length = 0;
      for (const s of this.statics) buf.push({ y: s.sortY, k: 0, o: s });
      for (const m of sim.monsters) if (m.alive) buf.push({ y: m.y + m.r * 0.5, k: 1, o: m });
      for (const c of sim.cocoons) if (!c.freed) buf.push({ y: c.y + 20, k: 2, o: c });
      for (const f of sim.followers) buf.push({ y: f.y, k: 3, o: f });
      buf.push({ y: sim.player.y, k: 4, o: sim.player });
      buf.sort((a, b) => a.y - b.y);
      for (const it of buf) {
        if (it.k === 0) {
          const s = it.o;
          draw(ctx2, s.name, s.x, s.y, s.scale, s.flip);
          if (s.name === "gate_posts") this.drawGate(ctx2);
        } else if (it.k === 1) this.drawMonster(ctx2, it.o);
        else if (it.k === 2) this.drawCocoon(ctx2, it.o);
        else if (it.k === 3) this.drawFollower(ctx2, it.o);
        else this.drawPlayer(ctx2);
      }
    }
    drawGate(ctx2) {
      const x = ROOM.width / 2, y = ROOM.wall + 2;
      if (this.gateFade > 0) {
        const k = this.gateFade;
        draw(ctx2, "gate_goo", x, y, 1 + (1 - k) * 0.2, false, 0, k, 1 + Math.sin(this.time * 3) * 0.02, k);
      } else if (this.sim.gateOpen && this.sim.state !== "done") {
        const bob = Math.sin(this.time * 6) * 8;
        draw(ctx2, "mk_arrow", x, y + 70 + bob, 0.9, false, 0, 0.95);
      }
    }
    drawMonster(ctx2, m) {
      const v = this.vis.get(m.id);
      let rise = 1;
      if (m.rise > 0) rise = 1 - m.rise / Math.max(MONSTER_RULES.spawnRise, v?.rise0 ?? 0.6);
      if (rise <= 0) {
        const st = this.stamps[1];
        if (st) drawFrame(ctx2, st, m.x, m.y + m.r * 0.5, m.r * 1.5 / 112, false, this.time * 0.5, 0.9);
        return;
      }
      rise = Math.min(1, Math.max(0, rise));
      const telegraph = m.state === 1 && (m.kind === "spitter" || m.kind === "dasher" || m.kind === "chunky" || m.kind === "nest" || m.kind === "jumper" || m.kind === "boss");
      const expr = m.hitTime < 0.16 ? "hit" : telegraph ? "charge" : "normal";
      let name;
      if (m.boss) name = `m_boss_${this.region}_${expr}`;
      else if (m.kind === "flyer") name = `m_flyer_${expr}_${Math.floor(this.time * 8 + m.id) % 2}`;
      else name = `m_${m.kind}_${expr}`;
      const sc = this.sim.scaleOf(m) * (m.r / baseR(m.kind));
      let sx = v ? v.sx : 1, sy = v ? v.sy : 1;
      let lift = 0;
      if ((m.kind === "blob" || m.kind === "mini") && m.state === 1) {
        const ph = Math.sin(Math.min(1, 1 - m.timer / MONSTER_RULES.hopMove) * Math.PI);
        lift = ph * 12;
        sy *= 1 + ph * 0.12;
        sx *= 1 - ph * 0.08;
      } else if (telegraph) {
        const k = 1 + Math.sin(this.time * 30) * 0.04;
        sx *= k * (m.kind === "spitter" ? 1.12 : 1.05);
        sy *= (m.kind === "jumper" ? 0.85 : 1.08) / k;
      } else {
        const br = Math.sin(this.time * 4 + m.id) * 0.03;
        sx *= 1 + br;
        sy *= 1 - br;
      }
      if (m.kind === "jumper" && m.state === 2) {
        const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime;
        lift = Math.sin(k * Math.PI) * 120;
        sy *= 1.1;
        sx *= 0.92;
      }
      if (m.boss && m.state === 3) {
        const k = 1 - Math.max(0, m.timer) / 0.85;
        lift = Math.sin(k * Math.PI) * 220;
      }
      if (m.kind === "flyer") lift = 34 + Math.sin(this.time * 3 + m.id) * 6;
      if (m.kind === "dasher" && m.state === 2) {
        sx *= 1.18;
        sy *= 0.86;
      }
      const flip = this.sim.player.x < m.x;
      const by = m.y + m.r * 0.6 - lift;
      const s2 = sc * (0.3 + 0.7 * rise);
      draw(ctx2, name, m.x, by + (1 - rise) * 10, s2, flip, 0, rise < 1 ? 0.5 + rise * 0.5 : 1, sx, sy * (0.4 + 0.6 * rise));
      if (m.hitTime < 0.07 && quality().glow) {
        ctx2.globalCompositeOperation = "lighter";
        draw(ctx2, name, m.x, by, s2, flip, 0, 0.32, sx, sy);
        ctx2.globalCompositeOperation = "source-over";
      }
      if (m.boss) this.drawBossBar(ctx2, m);
    }
    drawBossBar(ctx2, m) {
      const w = 180, x = m.x - w / 2, y = m.y - m.r * 2.1;
      ctx2.save();
      ctx2.fillStyle = "rgba(58,36,22,0.8)";
      roundRect(ctx2, x - 3, y - 3, w + 6, 16, 8);
      ctx2.fill();
      ctx2.fillStyle = "#e2c2ff";
      roundRect(ctx2, x, y, w * Math.max(0, m.hp / m.maxHp), 10, 5);
      ctx2.fill();
      ctx2.restore();
    }
    drawCocoon(ctx2, c) {
      const k = Math.max(0, c.hp / c.maxHp);
      const wob = c.hitTime < 0.15 ? Math.sin(this.time * 50) * 0.05 : 0;
      const f = Math.floor(this.time * 3 + c.id) % 2;
      const pulse = 0.5 + Math.sin(this.time * 4 + c.id) * 0.5;
      ctx2.save();
      ctx2.strokeStyle = `rgba(255,244,170,${0.55 + pulse * 0.4})`;
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      ctx2.ellipse(c.x, c.y + 26, 40 + pulse * 5, 15 + pulse * 2, 0, 0, Math.PI * 2);
      ctx2.stroke();
      ctx2.restore();
      if (quality().glow) {
        ctx2.globalCompositeOperation = "lighter";
        draw(ctx2, "fx_glow", c.x, c.y + 4, 1 + pulse * 0.15, false, 0, 0.22 + pulse * 0.12);
        ctx2.globalCompositeOperation = "source-over";
      }
      draw(ctx2, `a_${c.species}_trapped_${f}`, c.x, c.y + 28, 1.08);
      const idx = k > 0.66 ? 0 : k > 0.33 ? 1 : 2;
      draw(ctx2, `cocoon_${idx}`, c.x, c.y + 32, 0.95 + k * 0.15, false, 0, 0.4 + k * 0.5, 1 + wob, 1 - wob);
      const bob = Math.sin(this.time * 3 + c.id) * 4;
      draw(ctx2, "mk_help", c.x + 28, c.y - 52 + bob, 1);
    }
    drawFollower(ctx2, f) {
      let name;
      let lift = 0;
      const id = f.idx * 1.7;
      if (f.joy > 0 || this.winTimer > 0) {
        name = `a_${f.species}_happy_${Math.floor(this.time * 10 + id) % 3}`;
      } else if (f.moving) name = `a_${f.species}_walk_${Math.floor(this.time * 10 + id) % 4}`;
      else if (f.cheer > 0.4 && Math.sin(this.time * 4 + id) > 0.6) {
        name = `a_${f.species}_happy_${Math.floor(this.time * 10) % 3}`;
      } else name = `a_${f.species}_idle_${Math.sin(this.time * 0.9 + id) > 0.96 ? 1 : 0}`;
      if (f.joy > 0) lift = Math.abs(Math.sin(f.joy * 9)) * 12;
      draw(ctx2, name, f.x, f.y + 4 - lift, 0.88, f.facing < 0);
    }
    drawPlayer(ctx2) {
      const sim = this.sim;
      const p = sim.player;
      const t2 = this.time;
      const tier = sim.run.stats.gunTier;
      let name;
      const speed = Math.hypot(p.vx, p.vy);
      if (sim.state === "dead") name = `kid_sad_${Math.floor(t2 * 2) % 2}`;
      else if (p.hurtTime < 0.32) name = "kid_hurt_0";
      else if (speed > 30) name = `kid_run_${Math.floor(this.runDist / 22) % 6}`;
      else if (p.firing) name = `kid_shoot_${Math.floor(t2 * 10) % 2}`;
      else if (this.winTimer > 0) name = `kid_win_${Math.floor((1.3 - this.winTimer) * 8) % 4}`;
      else name = `kid_idle_${Math.floor(t2 * 4) % 4}`;
      const flip = p.facing < 0;
      const blink = p.invuln > 0 && p.hurtTime < 1.2 && Math.floor(t2 * 16) % 2 === 0;
      const alpha = blink ? 0.45 : 1;
      const S = 0.9;
      const dead = sim.state === "dead";
      const pack = tier >= 5 ? 2 : tier >= 3 ? 1 : 0;
      if (!dead) draw(ctx2, `pack_${pack}`, p.x - p.facing * 13 * S, p.y - 30 * S, S * (tier >= 5 ? 1.05 : 0.95), flip, 0, alpha);
      let aim = p.firing ? p.aim : p.facing > 0 ? 0.35 : Math.PI - 0.35;
      if (!p.firing && speed > 30) aim = p.facing > 0 ? 0.15 : Math.PI - 0.15;
      if (this.winTimer > 0 && !p.firing && speed < 30) aim = p.facing > 0 ? -0.9 : Math.PI + 0.9;
      const hx = p.x + p.facing * 6 * S, hy = p.y - 22 * S;
      const left = Math.cos(aim) < 0;
      const behind = Math.sin(aim) < -0.55;
      const gunName = `gun_${tier}`;
      const gs = S * (1 + 0.04 * tier);
      if (!dead && behind) draw(ctx2, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
      draw(ctx2, name, p.x, p.y + 6, S, flip, 0, alpha);
      if (!dead && !behind) draw(ctx2, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
      if (p.shield) draw(ctx2, "mk_shield", p.x, p.y - 26, 0.62 + Math.sin(t2 * 4) * 0.02, false, 0, 0.9);
      const [mx, my] = point(gunName, "muzzle");
      const k = gs / 2;
      const myy = left ? -my : my;
      this.muzzleX = hx + (Math.cos(aim) * mx - Math.sin(aim) * myy) * k;
      this.muzzleY = hy + (Math.sin(aim) * mx + Math.cos(aim) * myy) * k;
      void GUN_TIERS;
    }
    drawStreams(ctx2) {
      const sim = this.sim;
      const t2 = this.time;
      const q = quality();
      const pr = sim.player.pressure;
      for (const s of sim.segs) {
        const x0 = s.kind === 2 ? s.x0 : this.muzzleX, y0 = s.kind === 2 ? s.y0 : this.muzzleY;
        const x1 = s.x1, y1 = s.y1;
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len < 2) continue;
        const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
        const wob = Math.sin(t2 * 9 + s.kind) * Math.min(6, len * 0.02);
        const cx = (x0 + x1) / 2 + nx * wob, cy = (y0 + y1) / 2 + ny * wob + len * 0.05;
        const w = s.w;
        ctx2.save();
        ctx2.lineCap = "round";
        ctx2.lineJoin = "round";
        const path = () => {
          ctx2.beginPath();
          ctx2.moveTo(x0, y0);
          ctx2.quadraticCurveTo(cx, cy, x1, y1);
        };
        if (q.glow) {
          path();
          ctx2.strokeStyle = `rgba(140,220,255,${0.22 + pr * 0.18})`;
          ctx2.lineWidth = w * 2.1;
          ctx2.stroke();
        }
        path();
        ctx2.strokeStyle = "rgba(28,98,170,0.9)";
        ctx2.lineWidth = w + 3;
        ctx2.stroke();
        path();
        ctx2.strokeStyle = pr >= 1 ? "#8fe2ff" : "#55c2f5";
        ctx2.lineWidth = w;
        ctx2.stroke();
        path();
        ctx2.strokeStyle = "rgba(210,245,255,0.95)";
        ctx2.lineWidth = w * 0.5;
        ctx2.stroke();
        if (q.streamFx) {
          path();
          ctx2.setLineDash([w * 1.4, w * 1.6]);
          ctx2.lineDashOffset = -t2 * (700 + pr * 500);
          ctx2.strokeStyle = "rgba(255,255,255,0.9)";
          ctx2.lineWidth = Math.max(2, w * 0.22);
          ctx2.stroke();
          ctx2.setLineDash([]);
        }
        if (s.kind !== 2) {
          ctx2.fillStyle = "rgba(235,250,255,0.9)";
          ctx2.beginPath();
          ctx2.arc(x0, y0, w * 0.6, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.restore();
        if (s.hit) {
          const f = Math.floor(t2 * 20 + s.kind) % 4;
          draw(ctx2, `fx_impact_${f}`, x1, y1 + 6, 0.6 + w / 22, false, Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2);
        }
      }
    }
    drawBullets(ctx2) {
      const t2 = this.time;
      const sh = frame("shadow");
      for (const b of this.sim.bullets) {
        if (!b.alive) continue;
        if (sh) drawFrame(ctx2, sh, b.x, b.y + 16, b.r / 30, false, 0, 0.7);
        draw(ctx2, `goo_drop_${Math.floor(t2 * 8 + b.x * 0.1) % 2}`, b.x, b.y, b.r / 7.5 * 1);
      }
    }
  };
  function baseR(kind) {
    const R = { blob: 26, mini: 17, spitter: 26, splitter: 30, dasher: 26, chunky: 44, nest: 40, jumper: 28, flyer: 22, boss: 75 };
    return R[kind] ?? 26;
  }
  function roundRect(ctx2, x, y, w, h2, r) {
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h2, r);
    ctx2.arcTo(x + w, y + h2, x, y + h2, r);
    ctx2.arcTo(x, y + h2, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }

  // src/sim/nav.ts
  var NAV_CELL = 24;
  var NAV_COLS = ROOM.width / NAV_CELL;
  var NAV_ROWS = ROOM.height / NAV_CELL;
  var FlowField = class {
    constructor(world, inflate = 16) {
      this.blocked = new Uint8Array(NAV_COLS * NAV_ROWS);
      this.dist = new Int32Array(NAV_COLS * NAV_ROWS);
      this.queue = new Int32Array(NAV_COLS * NAV_ROWS);
      for (let r = 0; r < NAV_ROWS; r++) for (let c = 0; c < NAV_COLS; c++) {
        const x = c * NAV_CELL + NAV_CELL / 2, y = r * NAV_CELL + NAV_CELL / 2;
        this.blocked[r * NAV_COLS + c] = world.overlapsSolid(x, y, inflate, true) ? 1 : 0;
      }
    }
    build(tx, ty) {
      const d = this.dist;
      d.fill(-1);
      let c = clampi(Math.floor(tx / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(ty / NAV_CELL), 0, NAV_ROWS - 1);
      let head = 0, tail = 0;
      const start = r * NAV_COLS + c;
      d[start] = 0;
      this.queue[tail++] = start;
      while (head < tail) {
        const i = this.queue[head++];
        const ci = i % NAV_COLS, ri = (i - ci) / NAV_COLS;
        const nd = d[i] + 1;
        if (ci > 0) this.visit(i - 1, nd, tail) && tail++;
        if (ci < NAV_COLS - 1) this.visit(i + 1, nd, tail) && tail++;
        if (ri > 0) this.visit(i - NAV_COLS, nd, tail) && tail++;
        if (ri < NAV_ROWS - 1) this.visit(i + NAV_COLS, nd, tail) && tail++;
      }
    }
    visit(i, nd, tail) {
      if (this.dist[i] !== -1 || this.blocked[i]) return false;
      this.dist[i] = nd;
      this.queue[tail] = i;
      return true;
    }
    // Direction (unit) to move from (x,y) toward the target along the field. Returns null if no path.
    dir(x, y, out) {
      const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
      const i = r * NAV_COLS + c;
      let best = this.dist[i] < 0 ? 1e9 : this.dist[i], bx = 0, by = 0, found = false;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= NAV_COLS || rr >= NAV_ROWS) continue;
        const j = rr * NAV_COLS + cc;
        const v = this.dist[j];
        if (v < 0) continue;
        if (dr && dc && (this.blocked[r * NAV_COLS + cc] || this.blocked[rr * NAV_COLS + c])) continue;
        const cost = v + (dr && dc ? 0.41 : 0);
        if (cost < best) {
          best = cost;
          bx = cc * NAV_CELL + NAV_CELL / 2 - x;
          by = rr * NAV_CELL + NAV_CELL / 2 - y;
          found = true;
        }
      }
      if (!found) return false;
      const l = Math.hypot(bx, by) || 1;
      out.x = bx / l;
      out.y = by / l;
      return true;
    }
    reachable(x, y) {
      const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
      return this.dist[r * NAV_COLS + c] >= 0;
    }
  };
  function clampi(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  // src/sim/bot.ts
  var BOT_EXPERT = { name: "expert", reaction: 0.06, margin: 16, horizon: 0.7, greed: 0, mistakes: 0, rescue: true };
  var BOT_PLAYER = { name: "player", reaction: 0.16, margin: 8, horizon: 0.5, greed: 0.25, mistakes: 0.06, rescue: true };
  var BOT_NOVICE = { name: "novice", reaction: 0.26, margin: 2, horizon: 0.38, greed: 0.45, mistakes: 0.14, rescue: false };
  var SKILL_PRIORITY = ["thick", "multi", "splash", "pierce", "chain", "turbo", "vitality", "shield", "keep", "range", "speed", "trail", "magnet", "heal"];
  var Bot = class {
    constructor(profile, seed) {
      this.timer = 0;
      this.cur = { mx: 0, my: 0 };
      this.nav = null;
      this.navSim = null;
      this.navTimer = 0;
      this.navTarget = { x: 0, y: 0 };
      this.dodgeHold = 0;
      this.profile = profile;
      this.rng = new Rng(seed);
    }
    chooseSkill(options, hpRatio) {
      if (hpRatio < 0.45 && options.includes("heal")) return "heal";
      let best = options[0], bi = 99;
      for (const o of options) {
        const i = SKILL_PRIORITY.indexOf(o);
        if (i >= 0 && i < bi) {
          bi = i;
          best = o;
        }
      }
      return best;
    }
    decide(sim, dt) {
      this.timer -= dt;
      this.dodgeHold -= dt;
      if (this.timer > 0) return this.cur;
      this.timer = this.profile.reaction * (0.8 + this.rng.next() * 0.4);
      this.cur = this.think(sim);
      return this.cur;
    }
    threatAt(sim, x, y, t0) {
      const pr = sim.player.r;
      const H = this.profile.horizon;
      const M = this.profile.margin;
      let danger = 0;
      for (const b of sim.bullets) {
        if (!b.alive) continue;
        const rx = b.x - x, ry = b.y - (y - 6), vx = b.vx, vy = b.vy;
        const vv = vx * vx + vy * vy;
        let t2 = vv > 0 ? -(rx * vx + ry * vy) / vv : 0;
        t2 = Math.max(t0, Math.min(H, t2));
        const cx = rx + vx * t2, cy = ry + vy * t2;
        const d = Math.hypot(cx, cy);
        const lim = b.r + pr + M;
        if (d < lim) danger += (lim - d) / lim * 2 + (1 - t2 / H);
      }
      for (const m of sim.monsters) {
        if (!m.alive || m.rise > 0.3) continue;
        const d = Math.hypot(m.x - x, m.y - y) - m.r * sim.scaleOf(m) - pr;
        const lim = (m.kind === "dasher" && m.state === 2 ? 60 : 34) + M;
        if (d < lim) danger += (lim - d) / lim * 1.6;
      }
      for (const k of sim.marks) {
        if (k.kind === "land") {
          const d = Math.hypot(k.x - x, k.y - y);
          if (d < k.r + pr + M) danger += 2.5;
        } else if (k.kind === "dash" && k.x2 !== void 0) {
          const d = segDist(x, y, k.x, k.y, k.x2, k.y2);
          if (d < k.r + pr + M + 6) danger += 2.2;
        }
      }
      return danger;
    }
    think(sim) {
      const p = sim.player;
      const P = this.profile;
      if (sim.state === "dead" || sim.state === "done") return { mx: 0, my: 0 };
      const danger = this.threatAt(sim, p.x, p.y, 0);
      const greedy = p.pressure > 0.7 && this.rng.next() < P.greed;
      if (danger > 0.35 && !greedy || this.dodgeHold > 0) {
        if (this.dodgeHold > 0 && danger <= 0.35) return this.cur;
        return this.dodge(sim);
      }
      if (this.rng.next() < P.mistakes) {
        const a = this.rng.next() * Math.PI * 2;
        return { mx: Math.cos(a) * 0.8, my: Math.sin(a) * 0.8 };
      }
      const range = sim.run.stats.range;
      if (sim.state === "clear") {
        const c = sim.cocoons.find((cc) => !cc.freed);
        if (c) return this.approach(sim, c.x, c.y, range * 0.7);
        if (sim.pickupsLeft() > 0 && sim.stateTime < 1.4) return { mx: 0, my: 0 };
        if (sim.gateOpen) return this.moveTo(sim, ROOM.width / 2, ROOM.wall - 20);
        return { mx: 0, my: 0 };
      }
      const nx = p.x, ny = p.y - 14;
      let inRange = false;
      let nearest = null;
      for (const m of sim.monsters) {
        if (!m.alive || m.rise > 0) continue;
        const d = Math.hypot(m.x - nx, m.y - ny) - m.r;
        if (!nearest || d < nearest.d) nearest = { x: m.x, y: m.y, d };
        if (d <= range && sim.world.lineOfSight(nx, ny, m.x, m.y)) inRange = true;
      }
      if (P.rescue) {
        const few = sim.aliveCount() <= 2;
        for (const c of sim.cocoons) {
          if (c.freed) continue;
          const d = Math.hypot(c.x - nx, c.y - ny);
          if (few && d > range * 0.8 && this.threatAt(sim, c.x, c.y + 60, 0) < 0.5) return this.approach(sim, c.x, c.y, range * 0.7);
        }
      }
      if (inRange) return { mx: 0, my: 0 };
      if (nearest) return this.approach(sim, nearest.x, nearest.y, range * 0.8);
      return { mx: 0, my: 0 };
    }
    dodge(sim) {
      const p = sim.player;
      const speed = sim.run.stats.moveSpeed;
      let best = { mx: 0, my: 0 }, bestScore = -1e9;
      const N = 16;
      for (let i = 0; i <= N; i++) {
        let mx = 0, my = 0;
        if (i < N) {
          const a = i / N * Math.PI * 2;
          mx = Math.cos(a);
          my = Math.sin(a);
        }
        const step = i < N ? 0.28 : 0;
        const x = p.x + mx * speed * step, y = p.y + my * speed * step;
        if (i < N && sim.world.overlapsSolid(x, y, p.r, true)) continue;
        let score = -this.threatAt(sim, x, y, step * 0.6) * 10;
        score -= Math.abs(x - ROOM.width / 2) * 4e-3 + Math.abs(y - ROOM.height * 0.6) * 2e-3;
        if (sim.goo.at(x, y)) score -= 0.6;
        if (i === N) score += 0.5;
        if (score > bestScore) {
          bestScore = score;
          best = { mx, my };
        }
      }
      this.dodgeHold = 0.12;
      return best;
    }
    approach(sim, tx, ty, stopDist) {
      const p = sim.player;
      const d = Math.hypot(tx - p.x, ty - p.y);
      if (d < stopDist && sim.world.lineOfSight(p.x, p.y - 14, tx, ty)) return { mx: 0, my: 0 };
      return this.moveTo(sim, tx, ty);
    }
    moveTo(sim, tx, ty) {
      const p = sim.player;
      if (sim.world.lineOfSight(p.x, p.y, tx, ty) && !this.blockedLine(sim, p.x, p.y, tx, ty)) {
        const dx2 = tx - p.x, dy2 = ty - p.y;
        const d2 = Math.hypot(dx2, dy2) || 1;
        return { mx: dx2 / d2, my: dy2 / d2 };
      }
      if (!this.nav || this.navSim !== sim) {
        this.nav = new FlowField(sim.world, p.r + 2);
        this.navSim = sim;
        this.navTimer = 0;
      }
      this.navTimer -= this.profile.reaction;
      if (this.navTimer <= 0 || Math.hypot(this.navTarget.x - tx, this.navTarget.y - ty) > 40) {
        this.nav.build(tx, Math.max(ROOM.wall + 24, ty));
        this.navTarget = { x: tx, y: ty };
        this.navTimer = 0.5;
      }
      const o = { x: 0, y: 0 };
      if (this.nav.dir(p.x, p.y, o)) return { mx: o.x, my: o.y };
      const dx = tx - p.x, dy = ty - p.y;
      const d = Math.hypot(dx, dy) || 1;
      return { mx: dx / d, my: dy / d };
    }
    blockedLine(sim, x0, y0, x1, y1) {
      const d = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.ceil(d / 20);
      for (let i = 1; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        if (y < ROOM.wall + sim.player.r) break;
        if (sim.world.overlapsSolid(x, y, sim.player.r - 2, true)) return true;
      }
      return false;
    }
  };
  function segDist(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    let t2 = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
    t2 = Math.max(0, Math.min(1, t2));
    return Math.hypot(px - (x0 + dx * t2), py - (y0 + dy * t2));
  }

  // src/sim/goo.ts
  var GOO_CELL = 16;
  var GOO_COLS = ROOM.width / GOO_CELL;
  var GOO_ROWS = ROOM.height / GOO_CELL;
  var GooGrid = class {
    constructor(blobs) {
      this.cells = new Uint8Array(GOO_COLS * GOO_ROWS);
      this.initial = 0;
      this.remaining = 0;
      for (const b of blobs) this.stamp(b.x, b.y, b.r);
      this.initial = this.count();
      this.remaining = this.initial;
    }
    stamp(x, y, r) {
      const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
      const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
      const rr = r * 0.92 * (r * 0.92);
      for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
        const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy <= rr) this.cells[row * GOO_COLS + col] = 1;
      }
    }
    count() {
      let n = 0;
      for (let i = 0; i < this.cells.length; i++) n += this.cells[i];
      return n;
    }
    at(x, y) {
      const c = Math.floor(x / GOO_CELL), r = Math.floor(y / GOO_CELL);
      if (c < 0 || r < 0 || c >= GOO_COLS || r >= GOO_ROWS) return false;
      return this.cells[r * GOO_COLS + c] === 1;
    }
    // Returns number of cells cleaned.
    clean(x, y, r) {
      const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
      const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
      const rr = r * r;
      let n = 0;
      for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
        const i = row * GOO_COLS + col;
        if (!this.cells[i]) continue;
        const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy <= rr) {
          this.cells[i] = 0;
          n++;
        }
      }
      this.remaining -= n;
      return n;
    }
    clearAll() {
      this.cells.fill(0);
      this.remaining = 0;
    }
    cleanRatio() {
      return this.initial === 0 ? 1 : 1 - this.remaining / this.initial;
    }
  };

  // src/sim/world.ts
  var COLS2 = ROOM.width / ROOM.tile;
  var ROWS2 = ROOM.height / ROOM.tile;
  var StaticWorld = class {
    constructor(room) {
      this.colliders = [];
      this.water = new Uint8Array(COLS2 * ROWS2);
      this.minX = ROOM.wall;
      this.maxX = ROOM.width - ROOM.wall;
      this.minY = ROOM.wall;
      this.maxY = ROOM.height - ROOM.wall;
      for (const o of room.obstacles) {
        const def = OBSTACLES[o.t];
        if (!def) continue;
        this.colliders.push({
          kind: def.shape,
          x: o.x,
          y: o.y,
          r: def.r ?? 0,
          w: def.w ?? 0,
          h: def.h ?? 0,
          blocksShots: def.blocksShots,
          type: o.t
        });
      }
      if (room.terrain) {
        for (let row = 0; row < ROWS2; row++) {
          const line = room.terrain[row] || "";
          for (let col = 0; col < COLS2; col++) if (line[col] === "w") this.water[row * COLS2 + col] = 1;
        }
      }
    }
    isWaterAt(x, y) {
      const c = Math.floor(x / ROOM.tile), r = Math.floor(y / ROOM.tile);
      if (c < 0 || r < 0 || c >= COLS2 || r >= ROWS2) return false;
      return this.water[r * COLS2 + c] === 1;
    }
    // Push a circle out of walls, obstacles and (optionally) water. Returns true if it collided.
    resolve(p, r, solidWater, ignoreObstacles = false) {
      let hit = false;
      if (p.x < this.minX + r) {
        p.x = this.minX + r;
        hit = true;
      }
      if (p.x > this.maxX - r) {
        p.x = this.maxX - r;
        hit = true;
      }
      if (p.y < this.minY + r) {
        p.y = this.minY + r;
        hit = true;
      }
      if (p.y > this.maxY - r) {
        p.y = this.maxY - r;
        hit = true;
      }
      if (!ignoreObstacles) {
        for (const c of this.colliders) {
          if (c.kind === "circle") {
            const dx = p.x - c.x, dy = p.y - c.y;
            const rr = r + c.r;
            const d2 = dx * dx + dy * dy;
            if (d2 < rr * rr) {
              const d = Math.sqrt(d2) || 1e-3;
              p.x = c.x + dx / d * rr;
              p.y = c.y + dy / d * rr;
              hit = true;
            }
          } else if (pushOutRect(p, r, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h)) hit = true;
        }
      }
      if (solidWater) {
        const t2 = ROOM.tile;
        const c0 = Math.floor((p.x - r) / t2), c1 = Math.floor((p.x + r) / t2);
        const r0 = Math.floor((p.y - r) / t2), r1 = Math.floor((p.y + r) / t2);
        for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
          if (col < 0 || row < 0 || col >= COLS2 || row >= ROWS2) continue;
          if (this.water[row * COLS2 + col]) {
            if (pushOutRect(p, r, col * t2, row * t2, t2, t2)) hit = true;
          }
        }
      }
      return hit;
    }
    overlapsSolid(x, y, r, solidWater = true) {
      if (x < this.minX + r || x > this.maxX - r || y < this.minY + r || y > this.maxY - r) return true;
      for (const c of this.colliders) {
        if (c.kind === "circle") {
          const dx = x - c.x, dy = y - c.y, rr = r + c.r;
          if (dx * dx + dy * dy < rr * rr) return true;
        } else {
          const cx = clamp(x, c.x - c.w / 2, c.x + c.w / 2), cy = clamp(y, c.y - c.h / 2, c.y + c.h / 2);
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy < r * r) return true;
        }
      }
      if (solidWater) {
        const t2 = ROOM.tile;
        for (let row = Math.floor((y - r) / t2); row <= Math.floor((y + r) / t2); row++)
          for (let col = Math.floor((x - r) / t2); col <= Math.floor((x + r) / t2); col++) {
            if (col < 0 || row < 0 || col >= COLS2 || row >= ROWS2) continue;
            if (this.water[row * COLS2 + col]) {
              const cx = clamp(x, col * t2, col * t2 + t2), cy = clamp(y, row * t2, row * t2 + t2);
              const dx = x - cx, dy = y - cy;
              if (dx * dx + dy * dy < r * r) return true;
            }
          }
      }
      return false;
    }
    // Distance along a ray until it hits a shot-blocking obstacle or wall. Returns maxDist if clear.
    rayBlock(x, y, dx, dy, maxDist) {
      let best = maxDist;
      if (dx > 0) best = Math.min(best, (this.maxX - x) / dx);
      if (dx < 0) best = Math.min(best, (this.minX - x) / dx);
      if (dy > 0) best = Math.min(best, (this.maxY - y) / dy);
      if (dy < 0) best = Math.min(best, (this.minY - y) / dy);
      for (const c of this.colliders) {
        if (!c.blocksShots) continue;
        const d = c.kind === "circle" ? rayCircle(x, y, dx, dy, c.x, c.y, c.r * 0.85) : rayRect(x, y, dx, dy, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        if (d >= 0 && d < best) best = d;
      }
      return Math.max(0, best);
    }
    lineOfSight(x0, y0, x1, y1) {
      const dx = x1 - x0, dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      if (len < 1) return true;
      return this.rayBlock(x0, y0, dx / len, dy / len, len) >= len - 1;
    }
  };
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function pushOutRect(p, r, rx, ry, rw, rh) {
    const cx = clamp(p.x, rx, rx + rw), cy = clamp(p.y, ry, ry + rh);
    const dx = p.x - cx, dy = p.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return false;
    if (d2 > 1e-4) {
      const d = Math.sqrt(d2);
      p.x = cx + dx / d * r;
      p.y = cy + dy / d * r;
    } else {
      const left = p.x - rx, right = rx + rw - p.x, top = p.y - ry, bottom = ry + rh - p.y;
      const m = Math.min(left, right, top, bottom);
      if (m === left) p.x = rx - r;
      else if (m === right) p.x = rx + rw + r;
      else if (m === top) p.y = ry - r;
      else p.y = ry + rh + r;
    }
    return true;
  }
  function rayCircle(ox, oy, dx, dy, cx, cy, r) {
    const fx = ox - cx, fy = oy - cy;
    const b = fx * dx + fy * dy;
    const c = fx * fx + fy * fy - r * r;
    if (c < 0) return 0;
    const disc = b * b - c;
    if (disc < 0) return -1;
    const t2 = -b - Math.sqrt(disc);
    return t2 >= 0 ? t2 : -1;
  }
  function rayRect(ox, oy, dx, dy, rx, ry, rw, rh) {
    let tmin = -Infinity, tmax = Infinity;
    if (Math.abs(dx) < 1e-9) {
      if (ox < rx || ox > rx + rw) return -1;
    } else {
      let t1 = (rx - ox) / dx, t2 = (rx + rw - ox) / dx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (Math.abs(dy) < 1e-9) {
      if (oy < ry || oy > ry + rh) return -1;
    } else {
      let t1 = (ry - oy) / dy, t2 = (ry + rh - oy) / dy;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (tmax < 0 || tmin > tmax) return -1;
    return tmin < 0 ? 0 : tmin;
  }

  // src/sim/stats.ts
  function upgradeTotal(up) {
    let t2 = 0;
    for (const d of UPGRADES) t2 += up[d.id] || 0;
    return t2;
  }
  function bondBonus(meta, kind) {
    let v = 0;
    for (const s of SPECIES) {
      const lv = meta.bonds[s.id] || 0;
      if (!lv) continue;
      if (s.bonus === kind) v += s.per * lv;
      if (s.bonus === "all" && (kind === "damage" || kind === "maxHp" || kind === "coins")) v += s.per * lv;
    }
    return v;
  }
  function per(id) {
    return UPGRADES.find((u) => u.id === id).per;
  }
  function computeStats(meta, skills, cheer) {
    const up = meta.upgrades;
    const tier = gunTierFor(upgradeTotal(up));
    const T2 = GUN_TIERS[tier];
    const sk = (id) => skills[id] || 0;
    const dmgMul = (1 + per("power") * (up.power || 0)) * T2.dmg * (1 + bondBonus(meta, "damage")) * (1 + SKILL_VALUES.thickDmg * sk("thick")) * (meta.assist ? 1 + ASSIST.helpDamage : 1);
    const cheerMul = 1 + RESCUE.cheerDamagePerAnimal * Math.min(cheer, RESCUE.cheerMaxAnimals);
    const hpMul = (1 + per("health") * (up.health || 0)) * (1 + bondBonus(meta, "maxHp")) * (1 + SKILL_VALUES.vitalityHp * sk("vitality")) * (meta.assist ? 1 + ASSIST.helpHp : 1);
    const rangeMul = (1 + per("range") * (up.range || 0)) * (1 + bondBonus(meta, "range")) * (1 + SKILL_VALUES.rangeAdd * sk("range"));
    const splashMul = (1 + per("splash") * (up.splash || 0)) * T2.splash * (1 + bondBonus(meta, "splash"));
    const shield = sk("shield");
    return {
      maxHp: Math.round(PLAYER.maxHp * hpMul),
      moveSpeed: PLAYER.moveSpeed * (1 + bondBonus(meta, "move")) * (1 + SKILL_VALUES.speedAdd * sk("speed")),
      gooSlow: Math.min(0.95, PLAYER.gooSlow + SKILL_VALUES.speedGoo * sk("speed") + bondBonus(meta, "gooWalk")),
      dps: PLAYER.dps * dmgMul * cheerMul,
      range: (PLAYER.range + T2.range) * rangeMul,
      width: PLAYER.streamWidth * T2.width * (1 + 0.05 * (up.power || 0)) * (1 + SKILL_VALUES.thickWidth * sk("thick")),
      pressureCharge: PLAYER.pressureCharge / ((1 + per("pressure") * (up.pressure || 0)) * (1 + bondBonus(meta, "charge")) * (1 + SKILL_VALUES.turboCharge * sk("turbo"))),
      pressureMax: (PLAYER.pressureMax + per("pressure") * (up.pressure || 0) + SKILL_VALUES.turboMax * sk("turbo")) * (1 + bondBonus(meta, "pressureMax")),
      pressureDrain: PLAYER.pressureDrainMove * Math.pow(1 - SKILL_VALUES.keepDrain, sk("keep")),
      invuln: PLAYER.invuln,
      pickupRadius: PLAYER.pickupRadius * (1 + bondBonus(meta, "pickup")) * (1 + SKILL_VALUES.magnetRadius * sk("magnet")),
      burstRadius: PLAYER.burstRadius * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk("splash")),
      burstDmg: PLAYER.burstDamage * splashMul * (1 + SKILL_VALUES.splashDmg * sk("splash")),
      burstClean: PLAYER.burstClean * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk("splash")),
      armor: Math.max(0.5, 1 - bondBonus(meta, "armor")),
      xpMult: (1 + bondBonus(meta, "xp")) * (1 + SKILL_VALUES.magnetXp * sk("magnet")),
      coinMult: 1 + bondBonus(meta, "coins"),
      multi: sk("multi"),
      pierce: sk("pierce"),
      chain: sk("chain"),
      shieldRegen: shield ? SKILL_VALUES.shieldRegen[Math.min(shield, 3) - 1] : 0,
      trail: sk("trail"),
      rescueHeal: RESCUE.healOnRescue * (1 + bondBonus(meta, "rescueHeal")),
      reviveHp: Math.min(1, PLAYER.reviveHp + bondBonus(meta, "revive")),
      gunTier: tier,
      cheerPer: RESCUE.cheerDamagePerAnimal
    };
  }

  // src/sim/run.ts
  var NO_MODS = { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1, playerDps: 1, bigMonsters: false, coinMul: 1 };
  function createRun(level2, meta, opts) {
    const stats = computeStats(meta, {}, 0);
    return {
      level: level2,
      stage: level2.stage,
      scaleStage: level2.tier ?? level2.stage,
      roomIndex: 0,
      xpLevel: 1,
      xp: 0,
      pendingLevelUps: 0,
      skills: {},
      skillOrder: [],
      coins: 0,
      rescued: [],
      washed: 0,
      roomsCleared: 0,
      hp: stats.maxHp,
      revives: opts.revives,
      shield: false,
      hits: 0,
      dmgBy: {},
      pressureFulls: 0,
      meta,
      stats,
      time: 0,
      mods: opts.mods ?? NO_MODS,
      known: opts.known.slice(),
      seed: opts.seed,
      rng: new Rng(opts.seed ^ 1540483477),
      bestCombo: 0,
      daily: !!opts.daily,
      cleanSum: 0
    };
  }
  function runScale(run) {
    return stageScale(run.scaleStage);
  }
  function refreshStats(run) {
    const old = run.stats;
    const s = computeStats(run.meta, run.skills, run.rescued.length);
    s.dps *= run.mods.playerDps;
    if (s.maxHp > old.maxHp) run.hp += s.maxHp - old.maxHp;
    run.hp = Math.min(run.hp, s.maxHp);
    run.stats = s;
    return s;
  }
  function addXp(run, amount) {
    run.xp += amount * run.stats.xpMult;
    while (run.xp >= xpToNext(run.xpLevel + run.pendingLevelUps)) {
      run.xp -= xpToNext(run.xpLevel + run.pendingLevelUps);
      run.pendingLevelUps++;
    }
  }
  function xpProgress(run) {
    return Math.min(1, run.xp / xpToNext(run.xpLevel + run.pendingLevelUps));
  }
  function rollSkillChoices(run, count = 3) {
    const hpRatio = run.hp / run.stats.maxHp;
    const pool = SKILLS.map((d) => ({ id: d.id, w: skillWeight(d, run.skills[d.id] || 0, hpRatio) })).filter((p) => p.w > 0);
    const out = [];
    while (out.length < count && pool.length) {
      const total = pool.reduce((a, p) => a + p.w, 0);
      let r = run.rng.next() * total;
      let i = 0;
      for (; i < pool.length - 1; i++) {
        r -= pool[i].w;
        if (r <= 0) break;
      }
      out.push(pool[i].id);
      pool.splice(i, 1);
    }
    return out;
  }
  function applySkill(run, id) {
    if (id === "heal") {
      run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.4);
    } else {
      run.skills[id] = (run.skills[id] || 0) + 1;
      run.skillOrder.push(id);
      if (id === "shield") run.shield = true;
    }
    const before = run.stats.maxHp;
    refreshStats(run);
    if (id === "vitality") run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.2);
    void before;
    run.pendingLevelUps = Math.max(0, run.pendingLevelUps - 1);
    run.xpLevel++;
  }

  // src/sim/room.ts
  var TAU = Math.PI * 2;
  var GATE_X = ROOM.width / 2;
  var RoomSim = class {
    constructor(run, roomIndex, seed) {
      this.monsters = [];
      this.bullets = [];
      this.cocoons = [];
      this.followers = [];
      this.pickups = [];
      this.bubbles = [];
      this.segs = [];
      this.events = [];
      this.marks = [];
      this.state = "fight";
      this.time = 0;
      this.stateTime = 0;
      this.gateOpen = false;
      this.wave = 0;
      this.maxWave = 0;
      this.waveTimer = -1;
      this.nextId = 1;
      this.navTimer = 0;
      this.targetTimer = 0;
      this.target = null;
      this.multiAim = [];
      this.cleanTimer = 0;
      this.trailPts = [];
      this.comboTimer = 0;
      this.combo = 0;
      this.killQueue = [];
      this.tmp = { x: 0, y: 0 };
      this.hitThisRoom = false;
      this.cleanedCells = 0;
      this.run = run;
      this.def = run.level.rooms[roomIndex];
      this.isLast = roomIndex === run.level.rooms.length - 1;
      this.rng = new Rng(seed);
      this.world = new StaticWorld(this.def);
      this.goo = new GooGrid(this.def.goo);
      this.nav = new FlowField(this.world, 18);
      const st = this.def.start ?? { x: GATE_X, y: ROOM.height - ROOM.wall - 70 };
      this.player = {
        x: st.x,
        y: st.y,
        vx: 0,
        vy: 0,
        r: PLAYER.radius,
        hp: run.hp,
        invuln: 1,
        moving: false,
        stillTime: 0,
        firing: false,
        aim: -Math.PI / 2,
        pressure: 0,
        pressureFullSent: false,
        streamLen: 0,
        facing: 1,
        shield: run.shield,
        shieldTimer: 0,
        trailTimer: 0,
        onGoo: false,
        hurtTime: 99
      };
      for (const mp of this.def.monsters) {
        const w = mp.w ?? 0;
        this.maxWave = Math.max(this.maxWave, w);
        if (w === 0) this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.roomStartDelay + MONSTER_RULES.spawnRise + this.rng.range(0, 0.25), 0, 0, mp.v ?? 0);
      }
      for (const a of this.def.animals) {
        const hp = RESCUE.cocoonHp * Math.sqrt(runScale(run).hp);
        this.cocoons.push({ id: this.nextId++, species: a.s, x: a.x, y: a.y, r: RESCUE.cocoonRadius, hp, maxHp: hp, freed: false, hitTime: 99 });
      }
      run.rescued.forEach((s, i) => {
        this.followers.push({ species: s, x: st.x + (i % 2 ? 16 : -16), y: st.y + 34 + i * 30, vx: 0, joy: 0, idx: i, moving: false, cheer: 0, facing: 1 });
      });
      for (let i = 0; i < 60; i++) this.trailPts.push(st.x, st.y + 300 - i * 5);
      this.nav.build(this.player.x, this.player.y);
    }
    // ---------------------------------------------------------------- spawning
    spawnMonster(kind, x, y, rise, wave, parent = 0, variant = 0) {
      const base = MONSTERS[kind];
      const sc = runScale(this.run);
      const mods = this.run.mods;
      const big = mods.bigMonsters && kind !== "boss" ? 1.35 : 1;
      const hp = base.hp * sc.hp * mods.monsterHp * (big > 1 ? 1.6 : 1);
      const m = {
        id: this.nextId++,
        kind,
        x,
        y,
        vx: 0,
        vy: 0,
        r: base.r * big,
        hp,
        maxHp: hp,
        speed: base.speed * mods.monsterSpeed * (big > 1 ? 0.8 : 1),
        contact: base.contact * sc.dmg * mods.monsterDmg,
        state: 0,
        timer: this.rng.range(0, 0.4),
        cd: (base.cooldown ?? 2) * this.rng.range(0.5, 1),
        rise,
        tx: x,
        ty: y,
        alive: true,
        boss: kind === "boss",
        parent,
        hitTime: 99,
        phase: 0,
        pattern: 0,
        airborne: kind === "flyer",
        wave,
        variant
      };
      this.monsters.push(m);
      return m;
    }
    spawnWave(w) {
      for (const mp of this.def.monsters) if ((mp.w ?? 0) === w) {
        this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.spawnRise, w, 0, mp.v ?? 0);
      }
    }
    emit(e) {
      this.events.push(e);
    }
    drain() {
      const e = this.events;
      this.events = [];
      return e;
    }
    aliveCount() {
      let n = 0;
      for (const m of this.monsters) if (m.alive) n++;
      return n;
    }
    // ---------------------------------------------------------------- main step
    step(dt, input) {
      this.time += dt;
      this.stateTime += dt;
      if (this.state === "dead") {
        this.updatePickups(dt);
        return;
      }
      this.updatePlayer(dt, input);
      this.navTimer -= dt;
      if (this.navTimer <= 0) {
        this.nav.build(this.player.x, this.player.y);
        this.navTimer = 0.2;
      }
      this.updateMonsters(dt);
      this.updateBullets(dt);
      this.updateStream(dt);
      this.processKills();
      this.updateTrail(dt);
      this.updatePickups(dt);
      this.updateFollowers(dt);
      this.updateMarks(dt);
      this.updateFlow(dt);
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
      this.run.time += dt;
    }
    // ---------------------------------------------------------------- player
    updatePlayer(dt, input) {
      const p = this.player;
      const s = this.run.stats;
      const mag = Math.hypot(input.mx, input.my);
      const wasMoving = p.moving;
      p.moving = mag > 0.05;
      p.onGoo = this.goo.at(p.x, p.y + 8);
      const speed = s.moveSpeed * (p.onGoo ? s.gooSlow : 1) * Math.min(1, mag);
      const tvx = p.moving ? input.mx / mag * speed : 0, tvy = p.moving ? input.my / mag * speed : 0;
      const dvx = tvx - p.vx, dvy = tvy - p.vy;
      const dl = Math.hypot(dvx, dvy);
      const maxDv = PLAYER.accel * dt;
      if (dl <= maxDv) {
        p.vx = tvx;
        p.vy = tvy;
      } else {
        p.vx += dvx / dl * maxDv;
        p.vy += dvy / dl * maxDv;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (this.gateOpen && Math.abs(p.x - GATE_X) < ROOM.gateWidth / 2 && p.y < ROOM.wall + p.r + 4) {
        this.state = "done";
        this.emit({ t: "exit" });
      }
      this.world.resolve(p, p.r, true);
      if (Math.abs(p.vx) > 12) p.facing = p.vx > 0 ? 1 : -1;
      p.invuln = Math.max(0, p.invuln - dt);
      p.hurtTime += dt;
      if (p.moving) {
        p.stillTime = 0;
        p.pressure = Math.max(0, p.pressure - s.pressureDrain * dt);
        if (p.pressure < 0.95) p.pressureFullSent = false;
        if (p.firing) {
          p.firing = false;
          p.streamLen = 0;
          this.emit({ t: "fireStop" });
        }
        const lx = this.trailPts[this.trailPts.length - 2], ly = this.trailPts[this.trailPts.length - 1];
        if (Math.hypot(p.x - lx, p.y - ly) > 6) {
          this.trailPts.push(p.x, p.y);
          if (this.trailPts.length > 800) this.trailPts.splice(0, 2);
        }
      } else {
        p.stillTime += dt;
      }
      void wasMoving;
      if (s.shieldRegen > 0 && !p.shield) {
        p.shieldTimer += dt;
        if (p.shieldTimer >= s.shieldRegen) {
          p.shield = true;
          p.shieldTimer = 0;
          this.emit({ t: "shieldUp" });
        }
      }
      if (s.trail > 0 && p.moving && this.state === "fight") {
        p.trailTimer -= dt;
        if (p.trailTimer <= 0) {
          p.trailTimer = SKILL_VALUES.trailEvery;
          this.bubbles.push({ x: p.x, y: p.y + 6, life: 2.2, alive: true });
        }
      }
    }
    hurtPlayer(dmg, src, fx, fy) {
      const p = this.player;
      if (p.invuln > 0 || this.state === "dead" || this.state === "done") return;
      if (p.shield) {
        p.shield = false;
        p.shieldTimer = 0;
        p.invuln = 0.6;
        this.emit({ t: "shieldPop", x: p.x, y: p.y });
        return;
      }
      const d = Math.max(1, Math.round(dmg * this.run.stats.armor));
      p.hp -= d;
      p.invuln = this.run.stats.invuln;
      p.hurtTime = 0;
      p.pressure *= PLAYER.pressureKeepOnHit;
      p.pressureFullSent = false;
      this.run.hits++;
      this.hitThisRoom = true;
      this.run.dmgBy[src] = (this.run.dmgBy[src] || 0) + d;
      const dx = p.x - fx, dy = p.y - fy;
      const l = Math.hypot(dx, dy) || 1;
      p.vx += dx / l * 160;
      p.vy += dy / l * 160;
      this.emit({ t: "playerHit", dmg: d, src, x: p.x, y: p.y });
      if (p.hp <= 0) {
        p.hp = 0;
        this.state = "dead";
        this.stateTime = 0;
        p.firing = false;
        p.streamLen = 0;
        this.segs.length = 0;
        this.emit({ t: "dead" });
      }
    }
    revive(frac) {
      const p = this.player;
      p.hp = Math.max(1, Math.round(this.run.stats.maxHp * frac));
      p.invuln = 2.2;
      this.state = this.aliveCount() > 0 || this.waveTimer >= 0 || this.wave < this.maxWave ? "fight" : "clear";
      this.stateTime = 0;
      for (const b of this.bullets) b.alive = false;
      for (const m of this.monsters) {
        if (!m.alive) continue;
        const dx = m.x - p.x, dy = m.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 220) {
          m.x += dx / d * (220 - d);
          m.y += dy / d * (220 - d);
          this.world.resolve(m, m.r, !m.airborne, m.airborne);
        }
        if (m.state !== 0 && m.kind !== "boss") {
          m.state = 0;
          m.cd = 1.5;
        }
      }
    }
    // ---------------------------------------------------------------- targeting + stream
    candidates() {
      const out = [];
      for (const m of this.monsters) {
        if (!m.alive || m.rise > 0 || m.kind === "jumper" && m.state === 2 || m.boss && m.state === 3) continue;
        out.push({ kind: "m", m, x: m.x, y: m.y, r: m.r * this.scaleOf(m) });
      }
      for (const c of this.cocoons) if (!c.freed) out.push({ kind: "c", c, x: c.x, y: c.y, r: c.r });
      return out;
    }
    scaleOf(m) {
      return MONSTER_RULES.minScale + (1 - MONSTER_RULES.minScale) * (m.hp / m.maxHp);
    }
    pickTargets() {
      const p = this.player;
      const range = this.run.stats.range;
      const nx = p.x, ny = p.y - 14;
      const list = this.candidates().map((t2) => ({ t: t2, d: Math.hypot(t2.x - nx, t2.y - ny) - t2.r })).filter((o) => o.d <= range).map((o) => ({ ...o, los: this.world.lineOfSight(nx, ny, o.t.x, o.t.y) }));
      list.sort((a, b) => a.los === b.los ? a.d - b.d : a.los ? -1 : 1);
      if (this.target && list.length) {
        const cur = list.find((o) => o.t.m && o.t.m === this.target.m || o.t.c && o.t.c === this.target.c);
        if (cur && cur.los === list[0].los && cur.d < list[0].d * 1.25 + 20) {
          list.splice(list.indexOf(cur), 1);
          list.unshift(cur);
        }
      }
      return list.map((o) => o.t);
    }
    updateStream(dt) {
      const p = this.player;
      const s = this.run.stats;
      this.segs.length = 0;
      const canFire = !p.moving && p.stillTime >= PLAYER.fireDelay && (this.state === "fight" || this.state === "clear");
      if (!canFire) {
        if (p.firing) {
          p.firing = false;
          this.emit({ t: "fireStop" });
        }
        p.streamLen = 0;
        return;
      }
      this.targetTimer -= dt;
      let targets = null;
      if (this.targetTimer <= 0 || !this.targetValid()) {
        targets = this.pickTargets();
        this.targetTimer = 0.12;
        this.target = targets[0] ?? null;
      }
      if (!this.target) {
        if (p.firing) {
          p.firing = false;
          this.emit({ t: "fireStop" });
        }
        p.streamLen = 0;
        p.pressure = Math.max(0, p.pressure - dt * 0.6);
        return;
      }
      const nx = p.x, ny = p.y - 14;
      const tgt = this.target;
      const want = Math.atan2(tgt.y - ny, tgt.x - nx);
      if (!p.firing) {
        p.firing = true;
        p.aim = want;
        p.streamLen = 0;
        this.emit({ t: "fireStart" });
      }
      p.aim = turnToward(p.aim, want, PLAYER.aimTurnRate * dt);
      p.facing = Math.cos(p.aim) >= 0 ? 1 : -1;
      p.streamLen = Math.min(s.range + 40, p.streamLen + PLAYER.streamSpeed * dt);
      p.pressure = Math.min(1, p.pressure + dt / s.pressureCharge);
      if (p.pressure >= 1 && !p.pressureFullSent) {
        p.pressureFullSent = true;
        this.run.pressureFulls++;
        this.emit({ t: "pressureFull", x: p.x, y: p.y });
      }
      const pressMul = 1 + (s.pressureMax - 1) * Math.pow(p.pressure, 1.4);
      const dps = s.dps * pressMul;
      const width = s.width * (1 + PLAYER.pressureWidth * p.pressure);
      const ox = nx + Math.cos(p.aim) * 26, oy = ny + Math.sin(p.aim) * 26;
      const main = this.castStream(ox, oy, p.aim, Math.min(p.streamLen, s.range + 30), dps * dt, width, 0, s.pierce);
      if (s.chain > 0 && main) {
        let from = main;
        const hitSet = /* @__PURE__ */ new Set([main]);
        for (let k = 0; k < s.chain; k++) {
          let best = null, bd = SKILL_VALUES.chainRange;
          for (const m of this.monsters) {
            if (!m.alive || m.rise > 0 || hitSet.has(m)) continue;
            const d = Math.hypot(m.x - from.x, m.y - from.y);
            if (d < bd) {
              bd = d;
              best = m;
            }
          }
          if (!best) break;
          hitSet.add(best);
          this.damageMonster(best, dps * dt * SKILL_VALUES.chainDmg);
          this.segs.push({ x0: from.x, y0: from.y, x1: best.x, y1: best.y, w: width * 0.55, kind: 2, hit: true });
          from = best;
        }
      }
      if (s.multi > 0) {
        if (!targets) targets = this.pickTargets();
        const others = targets.filter((t2) => !(t2.m && t2.m === tgt.m) && !(t2.c && t2.c === tgt.c));
        for (let k = 0; k < s.multi; k++) {
          const t2 = others[k];
          if (!t2) {
            this.multiAim[k] = p.aim;
            continue;
          }
          const w2 = Math.atan2(t2.y - ny, t2.x - nx);
          this.multiAim[k] = turnToward(this.multiAim[k] ?? p.aim, w2, PLAYER.aimTurnRate * dt);
          this.castStream(ox, oy, this.multiAim[k], Math.min(p.streamLen, s.range + 30), dps * dt * SKILL_VALUES.multiDmg, width * 0.7, 1, 0);
        }
      }
      this.cleanTimer -= dt;
      if (this.cleanTimer <= 0) {
        this.cleanTimer = 0.05;
        for (const seg of this.segs) {
          if (seg.kind === 2) continue;
          const len = Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0);
          const rr = Math.max(10, seg.w * PLAYER.streamClean);
          for (let d = 30; d < len; d += 26) {
            const x = seg.x0 + (seg.x1 - seg.x0) * d / len, y = seg.y0 + (seg.y1 - seg.y0) * d / len;
            const n = this.goo.clean(x, y, rr);
            if (n > 0) {
              this.cleanedCells += n;
              this.emit({ t: "clean", x, y, r: rr * 1.15 });
            }
          }
          const ir = PLAYER.impactClean + seg.w * 1.2;
          this.cleanedCells += this.goo.clean(seg.x1, seg.y1, ir);
          this.emit({ t: "clean", x: seg.x1, y: seg.y1, r: ir * 1.1 });
        }
      }
    }
    targetValid() {
      const t2 = this.target;
      if (!t2) return false;
      if (t2.m) return t2.m.alive && t2.m.rise <= 0;
      if (t2.c) return !t2.c.freed;
      return false;
    }
    // Ray-casts one stream, applies damage, appends render segments. Returns first monster hit.
    castStream(ox, oy, ang, len, dmg, width, kind, pierce) {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const block = this.world.rayBlock(ox, oy, dx, dy, len);
      const hits = [];
      for (const m of this.monsters) {
        if (!m.alive || m.rise > 0 || m.kind === "jumper" && m.state === 2 || m.boss && m.state === 3) continue;
        const r = m.r * this.scaleOf(m) + width * 0.3;
        const d = rayCircle(ox, oy, dx, dy, m.x, m.y, r);
        if (d >= 0 && d <= block) hits.push({ d, m, r });
      }
      for (const c of this.cocoons) {
        if (c.freed) continue;
        const d = rayCircle(ox, oy, dx, dy, c.x, c.y, c.r + width * 0.3);
        if (d >= 0 && d <= block) hits.push({ d, c, r: c.r });
      }
      hits.sort((a, b) => a.d - b.d);
      let first = null;
      let endD = block;
      let hitAny = false;
      const maxHits = 1 + pierce;
      for (let i = 0; i < hits.length && i < maxHits; i++) {
        const h2 = hits[i];
        const mul = i === 0 ? 1 : SKILL_VALUES.pierceDmg;
        if (h2.m) {
          this.damageMonster(h2.m, dmg * mul);
          if (!first) first = h2.m;
        }
        if (h2.c) this.damageCocoon(h2.c, dmg * mul);
        hitAny = true;
        endD = h2.d + h2.r * 0.6;
        if (i === maxHits - 1 || i === hits.length - 1) {
          if (pierce > 0 && i < maxHits - 1) endD = block;
        }
      }
      if (pierce > 0 && hitAny && hits.length < maxHits) endD = block;
      this.segs.push({ x0: ox, y0: oy, x1: ox + dx * endD, y1: oy + dy * endD, w: width, kind, hit: hitAny || endD < len - 2 });
      return first;
    }
    damageMonster(m, dmg) {
      if (!m.alive) return;
      m.hp -= dmg;
      if (m.hitTime > 0.09) this.emit({ t: "hit", id: m.id, x: m.x, y: m.y, kind: m.kind });
      m.hitTime = 0;
      if (m.boss && m.phase === 0 && m.hp < m.maxHp * 0.5) {
        m.phase = 1;
        this.emit({ t: "bossPhase", phase: 1 });
      }
      if (m.hp <= 0) {
        m.alive = false;
        this.killQueue.push(m);
      }
    }
    damageCocoon(c, dmg) {
      if (c.freed) return;
      c.hp -= dmg;
      if (c.hitTime > 0.12) this.emit({ t: "cocoonHit", id: c.id, x: c.x, y: c.y });
      c.hitTime = 0;
      if (c.hp <= 0) this.freeCocoon(c);
    }
    freeCocoon(c) {
      c.freed = true;
      const run = this.run;
      const brave = this.aliveCount() > 0;
      const first = !run.known.includes(c.species) && !run.rescued.includes(c.species);
      run.rescued.push(c.species);
      const idx = this.followers.length;
      this.followers.push({ species: c.species, x: c.x, y: c.y, vx: 0, joy: 1.1, idx, moving: false, cheer: 0, facing: 1 });
      const healed = refreshStats(run).rescueHeal;
      this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * healed);
      const sc = runScale(run);
      this.dropCoins(c.x, c.y, Math.round((RESCUE.rescueCoins + (brave ? RESCUE.braveRescueCoins : 0)) * sc.coin * run.stats.coinMult * run.mods.coinMul));
      this.dropXp(c.x, c.y, RESCUE.rescueXp);
      this.goo.clean(c.x, c.y, 70);
      this.emit({ t: "clean", x: c.x, y: c.y, r: 80 });
      this.emit({ t: "rescue", species: c.species, x: c.x, y: c.y, brave, first });
    }
    processKills() {
      let guard = 0;
      while (this.killQueue.length && guard++ < 200) {
        const m = this.killQueue.shift();
        this.onKilled(m);
      }
    }
    onKilled(m) {
      const run = this.run;
      const s = run.stats;
      const sc = runScale(run);
      run.washed++;
      this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
      this.comboTimer = 2.2;
      run.bestCombo = Math.max(run.bestCombo, this.combo);
      const r = m.r;
      this.emit({ t: "burst", x: m.x, y: m.y, r, kind: m.kind, boss: m.boss, combo: this.combo });
      const br = s.burstRadius * (m.r > 40 ? 1.3 : 1);
      for (const o of this.monsters) {
        if (!o.alive || o === m || o.rise > 0) continue;
        const d = Math.hypot(o.x - m.x, o.y - m.y) - o.r;
        if (d < br) this.damageMonster(o, s.dps * s.burstDmg);
      }
      const cr = s.burstClean * (m.r > 40 ? 1.5 : 1) * (m.boss ? 2 : 1);
      this.cleanedCells += this.goo.clean(m.x, m.y, cr);
      this.emit({ t: "clean", x: m.x, y: m.y, r: cr * 1.1 });
      const base = MONSTERS[m.kind];
      const coinBonus = this.combo >= 3 ? 1 : 0;
      this.dropCoins(m.x, m.y, Math.max(1, Math.round((base.coins + coinBonus) * sc.coin * s.coinMult * run.mods.coinMul)));
      this.dropXp(m.x, m.y, base.xp);
      if (this.rng.chance(REWARDS.healDropChance) && !m.parent) this.pickups.push(this.makePickup("heal", m.x, m.y, REWARDS.healDropAmount));
      if (m.kind === "splitter") {
        this.emit({ t: "split", x: m.x, y: m.y });
        for (const sgn of [-1, 1]) {
          const c = this.spawnMonster("mini", m.x + sgn * 20, m.y, 0.18, m.wave, m.id);
          c.vx = sgn * 220;
          c.vy = -60;
        }
      }
    }
    makePickup(kind, x, y, value) {
      const a = this.rng.range(0, TAU), sp = this.rng.range(90, 220);
      return { kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, value, magnet: false, age: 0, alive: true };
    }
    dropCoins(x, y, total) {
      const n = Math.min(6, Math.max(1, Math.ceil(total / 3)));
      let left = total;
      for (let i = 0; i < n; i++) {
        const v = i === n - 1 ? left : Math.floor(total / n);
        left -= v;
        if (v > 0) this.pickups.push(this.makePickup("coin", x, y, v));
      }
    }
    dropXp(x, y, total) {
      const n = Math.min(5, Math.max(1, Math.round(total)));
      for (let i = 0; i < n; i++) this.pickups.push(this.makePickup("xp", x, y, total / n));
    }
    // ---------------------------------------------------------------- monsters
    updateMonsters(dt) {
      const p = this.player;
      for (const m of this.monsters) {
        if (!m.alive) continue;
        m.hitTime += dt;
        if (m.rise > 0) {
          m.rise -= dt;
          continue;
        }
        switch (m.kind) {
          case "blob":
          case "mini":
            this.hopChase(m, dt);
            break;
          case "splitter":
            this.walkChase(m, dt, 1);
            break;
          case "spitter":
            this.spitter(m, dt);
            break;
          case "dasher":
            this.dasher(m, dt);
            break;
          case "chunky":
            this.chunky(m, dt);
            break;
          case "nest":
            this.nest(m, dt);
            break;
          case "jumper":
            this.jumper(m, dt);
            break;
          case "flyer":
            this.flyer(m, dt);
            break;
          case "boss":
            this.boss(m, dt);
            break;
        }
        const slow = m.hitTime < 0.1 && !m.boss ? 0.55 : 1;
        m.x += m.vx * dt * slow;
        m.y += m.vy * dt * slow;
        if (!(m.kind === "jumper" && m.state === 2) && !(m.boss && m.state === 3)) this.world.resolve(m, m.r * 0.9, !m.airborne, m.airborne);
        if (this.state === "fight" && !(m.kind === "jumper" && m.state === 2) && !(m.boss && m.state === 3)) {
          const rr = m.r * this.scaleOf(m) * 0.85 + p.r;
          const dx = p.x - m.x, dy = p.y - m.y;
          if (dx * dx + dy * dy < rr * rr) this.hurtPlayer(m.contact, m.kind, m.x, m.y);
        }
      }
      const ms = this.monsters;
      for (let i = 0; i < ms.length; i++) {
        const a = ms[i];
        if (!a.alive || a.rise > 0) continue;
        const fa = a.boss || a.kind === "nest";
        for (let j = i + 1; j < ms.length; j++) {
          const b = ms[j];
          if (!b.alive || b.rise > 0) continue;
          const fb = b.boss || b.kind === "nest";
          if (fa && fb) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const rr = (a.r + b.r) * 0.8;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = rr - d;
            const ka = fa ? 0 : fb ? 1 : 0.5, kb = 1 - ka;
            a.x -= dx / d * push * ka;
            a.y -= dy / d * push * ka;
            b.x += dx / d * push * kb;
            b.y += dy / d * push * kb;
          }
        }
      }
    }
    seekDir(m) {
      const p = this.player;
      const o = this.tmp;
      const dx = p.x - m.x, dy = p.y - m.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 140 || m.airborne || this.world.lineOfSight(m.x, m.y, p.x, p.y)) {
        o.x = dx / d;
        o.y = dy / d;
        return o;
      }
      if (!this.nav.dir(m.x, m.y, o)) {
        o.x = dx / d;
        o.y = dy / d;
      }
      return o;
    }
    hopChase(m, dt) {
      m.timer -= dt;
      if (m.state === 0) {
        m.vx *= 0.8;
        m.vy *= 0.8;
        if (m.timer <= 0) {
          m.state = 1;
          m.timer = MONSTER_RULES.hopMove;
        }
      } else {
        const dir = this.seekDir(m);
        const sp = m.speed * 1.75;
        m.vx = dir.x * sp;
        m.vy = dir.y * sp;
        if (m.timer <= 0) {
          m.state = 0;
          m.timer = MONSTER_RULES.hopRest * this.rng.range(0.8, 1.3);
        }
      }
    }
    walkChase(m, dt, mul) {
      const dir = this.seekDir(m);
      m.vx += (dir.x * m.speed * mul - m.vx) * Math.min(1, dt * 4);
      m.vy += (dir.y * m.speed * mul - m.vy) * Math.min(1, dt * 4);
    }
    fireBullet(m, ang, speedMul = 1) {
      const base = MONSTERS[m.kind];
      const sc = runScale(this.run);
      const sp = (base.bulletSpeed ?? 200) * speedMul * this.run.mods.bulletSpeed;
      const r = base.bulletR ?? 13;
      this.bullets.push({
        x: m.x + Math.cos(ang) * (m.r * 0.8),
        y: m.y + Math.sin(ang) * (m.r * 0.8) - 6,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        r,
        dmg: (base.bulletDmg ?? 12) * sc.dmg * this.run.mods.monsterDmg,
        life: 6,
        src: m.kind,
        alive: true
      });
    }
    aimAt(m) {
      return Math.atan2(this.player.y - m.y, this.player.x - m.x);
    }
    spitter(m, dt) {
      const p = this.player;
      const base = MONSTERS.spitter;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (m.state === 0) {
        let want = 0;
        if (d < 210) want = -1;
        else if (d > 400) want = 1;
        const dir = want === 1 ? this.seekDir(m) : { x: (p.x - m.x) / (d || 1), y: (p.y - m.y) / (d || 1) };
        m.vx += (dir.x * m.speed * want - m.vx) * Math.min(1, dt * 3);
        m.vy += (dir.y * m.speed * want - m.vy) * Math.min(1, dt * 3);
        m.cd -= dt;
        if (m.cd <= 0 && d < 560 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          m.vx = 0;
          m.vy = 0;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.aimAt(m);
          if (m.variant === 1) {
            this.fireBullet(m, a - 0.26);
            this.fireBullet(m, a);
            this.fireBullet(m, a + 0.26);
          } else this.fireBullet(m, a);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.85, 1.15);
        }
      }
    }
    dasher(m, dt) {
      const p = this.player;
      const base = MONSTERS.dasher;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        if (m.cd <= 0 && d < 380 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          const a = this.aimAt(m);
          m.tx = Math.cos(a);
          m.ty = Math.sin(a);
          this.marks.push({ kind: "dash", x: m.x, y: m.y, x2: m.x + m.tx * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, y2: m.y + m.ty * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, t: base.telegraph, r: m.r });
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx *= 0.7;
        m.vy *= 0.7;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.state = 2;
          m.timer = MONSTER_RULES.dashTime;
          this.emit({ t: "dash", id: m.id });
        }
      } else if (m.state === 2) {
        m.vx = m.tx * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed;
        m.vy = m.ty * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed;
        m.timer -= dt;
        const nx = m.x + m.vx * dt, ny = m.y + m.vy * dt;
        if (m.timer <= 0 || this.world.overlapsSolid(nx, ny, m.r * 0.9, true)) {
          m.state = 3;
          m.timer = base.cooldown;
          m.vx *= 0.2;
          m.vy *= 0.2;
        }
      } else {
        m.vx *= 0.85;
        m.vy *= 0.85;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = 0.6 + this.rng.range(0, 0.6);
        }
      }
    }
    chunky(m, dt) {
      const base = MONSTERS.chunky;
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        if (m.cd <= 0 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else {
        m.vx *= 0.8;
        m.vy *= 0.8;
        m.timer -= dt;
        if (m.timer <= 0) {
          const n = m.variant === 1 ? 12 : MONSTER_RULES.chunkyRing;
          const off = this.rng.range(0, TAU);
          for (let i = 0; i < n; i++) this.fireBullet(m, off + i / n * TAU, 0.9);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.9, 1.1);
        }
      }
    }
    nest(m, dt) {
      const base = MONSTERS.nest;
      m.vx = 0;
      m.vy = 0;
      const children = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
      if (m.state === 0) {
        m.cd -= dt;
        if (m.cd <= 0 && children < MONSTER_RULES.nestMaxChildren && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else {
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.rng.range(0, TAU);
          const x = clamp(m.x + Math.cos(a) * (m.r + 30), 80, ROOM.width - 80), y = clamp(m.y + Math.sin(a) * (m.r + 30), 80, ROOM.height - 80);
          this.spawnMonster("blob", x, y, 0.35, m.wave, m.id);
          this.emit({ t: "spawn", id: m.id, kind: "blob" });
          m.state = 0;
          m.cd = base.cooldown;
        }
      }
    }
    jumper(m, dt) {
      const p = this.player;
      const base = MONSTERS.jumper;
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        const d = Math.hypot(p.x - m.x, p.y - m.y);
        if (m.cd <= 0 && d < 460 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          m.tx = p.x;
          m.ty = p.y;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.tx = clamp(p.x, ROOM.wall + m.r, ROOM.width - ROOM.wall - m.r);
          m.ty = clamp(p.y, ROOM.wall + m.r, ROOM.height - ROOM.wall - m.r);
          m.state = 2;
          m.timer = MONSTER_RULES.jumpTime;
          m.sx = m.x;
          m.sy = m.y;
          this.marks.push({ kind: "land", x: m.tx, y: m.ty, t: MONSTER_RULES.jumpTime, r: MONSTER_RULES.jumpShock });
        }
      } else if (m.state === 2) {
        m.timer -= dt;
        const mm = m;
        const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime;
        m.vx = 0;
        m.vy = 0;
        m.x = mm.sx + (m.tx - mm.sx) * k;
        m.y = mm.sy + (m.ty - mm.sy) * k;
        if (m.timer <= 0) {
          m.state = 3;
          m.timer = 0.5;
          this.world.resolve(m, m.r * 0.9, true);
          this.emit({ t: "land", x: m.x, y: m.y, r: MONSTER_RULES.jumpShock });
          const d = Math.hypot(p.x - m.x, p.y - m.y);
          if (d < MONSTER_RULES.jumpShock + p.r && this.state === "fight") this.hurtPlayer(base.bulletDmg * runScale(this.run).dmg * this.run.mods.monsterDmg, "jumper", m.x, m.y);
        }
      } else {
        m.timer -= dt;
        m.vx = 0;
        m.vy = 0;
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.85, 1.2);
        }
      }
    }
    flyer(m, dt) {
      const p = this.player;
      const base = MONSTERS.flyer;
      m.timer += dt;
      const dx = p.x - m.x, dy = p.y - m.y;
      const d = Math.hypot(dx, dy) || 1;
      const want = d > 170 ? 1 : -0.4;
      const perpX = -dy / d, perpY = dx / d;
      const wob = Math.sin(m.timer * 2.6 + m.id) * 0.9;
      m.vx += (dx / d * want * m.speed + perpX * wob * m.speed - m.vx) * Math.min(1, dt * 2.5);
      m.vy += (dy / d * want * m.speed + perpY * wob * m.speed - m.vy) * Math.min(1, dt * 2.5);
      m.cd -= dt;
      if (m.cd <= 0 && this.state === "fight" && d < 480) {
        this.fireBullet(m, this.aimAt(m), 1);
        this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
        m.cd = base.cooldown * this.rng.range(0.8, 1.2);
      }
    }
    boss(m, dt) {
      const p = this.player;
      const base = MONSTERS.boss;
      const fast = m.phase === 1 ? 0.7 : 1;
      if (m.state === 0) {
        this.walkChase(m, dt, 0.8);
        m.cd -= dt;
        if (m.cd <= 0 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph * fast;
          m.pattern = (m.pattern + 1) % 4;
          m.tx = p.x;
          m.ty = p.y;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx *= 0.8;
        m.vy *= 0.8;
        m.timer -= dt;
        if (m.timer <= 0) {
          const pat = m.pattern;
          if (pat === 0) {
            m.state = 2;
            m.timer = 0.9;
            m.k = 0;
          } else if (pat === 1) {
            const minions = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
            const n = Math.min(3, 6 - minions);
            for (let i = 0; i < n; i++) {
              const a = i / 3 * TAU + this.rng.range(0, 1);
              this.spawnMonster(m.phase ? "splitter" : "blob", clamp(m.x + Math.cos(a) * 110, 90, ROOM.width - 90), clamp(m.y + Math.sin(a) * 110, 90, ROOM.height - 90), 0.4, m.wave, m.id);
            }
            this.emit({ t: "spawn", id: m.id, kind: "blob" });
            m.state = 0;
            m.cd = base.cooldown * fast;
          } else if (pat === 2) {
            m.state = 3;
            m.timer = 0.85;
            m.tx = clamp(p.x, 130, ROOM.width - 130);
            m.ty = clamp(p.y, 130, ROOM.height - 130);
            m.sx = m.x;
            m.sy = m.y;
            this.marks.push({ kind: "land", x: m.tx, y: m.ty, t: 0.85, r: 120 });
          } else {
            m.state = 4;
            m.timer = 0;
            m.k = 0;
          }
        }
      } else if (m.state === 2) {
        const mm = m;
        m.timer -= dt;
        m.vx = 0;
        m.vy = 0;
        const shotsDone = mm.k;
        const due = Math.floor((0.9 - m.timer) / 0.3) + 1;
        if (shotsDone < Math.min(3, due)) {
          const n = m.phase ? 14 : 11;
          const off = shotsDone * 0.22;
          for (let i = 0; i < n; i++) this.fireBullet(m, off + i / n * TAU, 0.85);
          mm.k++;
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
        }
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = base.cooldown * fast;
        }
      } else if (m.state === 3) {
        const mm = m;
        m.timer -= dt;
        const k = 1 - Math.max(0, m.timer) / 0.85;
        m.x = mm.sx + (m.tx - mm.sx) * k;
        m.y = mm.sy + (m.ty - mm.sy) * k;
        m.vx = 0;
        m.vy = 0;
        if (m.timer <= 0) {
          this.world.resolve(m, m.r * 0.9, true);
          this.emit({ t: "land", x: m.x, y: m.y, r: 120 });
          if (Math.hypot(p.x - m.x, p.y - m.y) < 120 + p.r && this.state === "fight") this.hurtPlayer(base.contact * runScale(this.run).dmg * this.run.mods.monsterDmg, "boss", m.x, m.y);
          const n = m.phase ? 12 : 8;
          for (let i = 0; i < n; i++) this.fireBullet(m, i / n * TAU + 0.2, 0.75);
          m.state = 0;
          m.cd = base.cooldown * fast;
        }
      } else if (m.state === 4) {
        const mm = m;
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.aimAt(m);
          this.fireBullet(m, a - 0.22, 1.1);
          this.fireBullet(m, a, 1.1);
          this.fireBullet(m, a + 0.22, 1.1);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          mm.k++;
          m.timer = 0.55;
          if (mm.k >= (m.phase ? 4 : 3)) {
            m.state = 0;
            m.cd = base.cooldown * fast;
          }
        }
      }
    }
    // ---------------------------------------------------------------- bullets
    updateBullets(dt) {
      const p = this.player;
      for (const b of this.bullets) {
        if (!b.alive) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0) {
          b.alive = false;
          continue;
        }
        if (b.x < ROOM.wall - 10 || b.x > ROOM.width - ROOM.wall + 10 || b.y < ROOM.wall - 10 || b.y > ROOM.height - ROOM.wall + 10) {
          b.alive = false;
          continue;
        }
        for (const c of this.world.colliders) {
          if (!c.blocksShots) continue;
          if (c.kind === "circle") {
            const dx2 = b.x - c.x, dy2 = b.y - c.y;
            if (dx2 * dx2 + dy2 * dy2 < c.r * 0.8 * (c.r * 0.8)) {
              b.alive = false;
              break;
            }
          } else if (Math.abs(b.x - c.x) < c.w / 2 && Math.abs(b.y - c.y) < c.h / 2) {
            b.alive = false;
            break;
          }
        }
        if (!b.alive) continue;
        const rr = b.r * 0.8 + p.r * 0.85;
        const dx = b.x - p.x, dy = b.y - (p.y - 6);
        if (dx * dx + dy * dy < rr * rr && this.state === "fight") {
          if (p.invuln <= 0) {
            b.alive = false;
            this.hurtPlayer(b.dmg, b.src, b.x - b.vx * 0.05, b.y - b.vy * 0.05);
          }
        }
        for (const s of this.segs) {
          if (s.kind === 2) continue;
          if (distToSeg(b.x, b.y, s.x0, s.y0, s.x1, s.y1) < s.w * 0.5 + b.r * 0.5) {
            b.alive = false;
            break;
          }
        }
      }
      if (this.bullets.length > 64) this.bullets = this.bullets.filter((b) => b.alive);
    }
    // ---------------------------------------------------------------- trail bubbles
    updateTrail(dt) {
      if (!this.bubbles.length) return;
      const s = this.run.stats;
      for (const b of this.bubbles) {
        if (!b.alive) continue;
        b.life -= dt;
        if (b.life <= 0) {
          b.alive = false;
          continue;
        }
        for (const m of this.monsters) {
          if (!m.alive || m.rise > 0 || m.airborne) continue;
          if (Math.hypot(m.x - b.x, m.y - b.y) < m.r + 12) {
            b.alive = false;
            for (const o of this.monsters) {
              if (o.alive && o.rise <= 0 && Math.hypot(o.x - b.x, o.y - b.y) < SKILL_VALUES.trailRadius + o.r)
                this.damageMonster(o, s.dps * SKILL_VALUES.trailDmg * s.trail);
            }
            this.goo.clean(b.x, b.y, 40);
            this.emit({ t: "trailPop", x: b.x, y: b.y });
            this.emit({ t: "clean", x: b.x, y: b.y, r: 44 });
            break;
          }
        }
      }
      this.processKills();
      if (this.bubbles.length > 40) this.bubbles = this.bubbles.filter((b) => b.alive);
    }
    // ---------------------------------------------------------------- pickups
    updatePickups(dt) {
      const p = this.player;
      const s = this.run.stats;
      const allMagnet = this.state === "clear" || this.state === "done";
      for (const k of this.pickups) {
        if (!k.alive) continue;
        k.age += dt;
        const dx = p.x - k.x, dy = p.y - 8 - k.y;
        const d = Math.hypot(dx, dy) || 1;
        if (!k.magnet && k.age > 0.45 && (d < s.pickupRadius || allMagnet && k.age > 0.5)) k.magnet = true;
        if (k.magnet && this.state !== "dead") {
          const sp = Math.min(1100, 260 + k.age * 900);
          k.vx = dx / d * sp;
          k.vy = dy / d * sp;
          if (d < p.r + 12) {
            this.collect(k);
            continue;
          }
        } else {
          const f = Math.max(0, 1 - dt * 4.5);
          k.vx *= f;
          k.vy *= f;
        }
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        if (!k.magnet) {
          k.x = clamp(k.x, ROOM.wall + 10, ROOM.width - ROOM.wall - 10);
          k.y = clamp(k.y, ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
        }
      }
      if (this.pickups.length > 80) this.pickups = this.pickups.filter((k) => k.alive);
    }
    collect(k) {
      k.alive = false;
      const run = this.run;
      if (k.kind === "coin") run.coins += k.value;
      else if (k.kind === "xp") addXp(run, k.value);
      else if (k.kind === "heal") this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * k.value);
      this.emit({ t: "pickup", kind: k.kind, value: k.value, x: k.x, y: k.y });
    }
    pickupsLeft() {
      let n = 0;
      for (const k of this.pickups) if (k.alive) n++;
      return n;
    }
    // ---------------------------------------------------------------- followers
    updateFollowers(dt) {
      const p = this.player;
      const pts = this.trailPts;
      const n = pts.length / 2;
      for (const f of this.followers) {
        if (f.joy > 0) {
          f.joy -= dt;
          continue;
        }
        const back = Math.min(n - 1, (f.idx + 1) * 7);
        let tx = pts[(n - 1 - back) * 2], ty = pts[(n - 1 - back) * 2 + 1];
        if (!p.moving) {
          const a = Math.PI / 2 + (f.idx % 2 ? 1 : -1) * (0.9 + Math.floor(f.idx / 2) * 0.45);
          const rr = 46 + Math.floor(f.idx / 2) * 14;
          const gx = p.x + Math.cos(a) * rr, gy = p.y + Math.sin(a) * rr * 0.8;
          const mix = Math.min(1, p.stillTime * 1.5);
          tx = tx + (gx - tx) * mix;
          ty = ty + (gy - ty) * mix;
        }
        const dx = tx - f.x, dy = ty - f.y;
        const d = Math.hypot(dx, dy);
        const sp = Math.min(d * 7, 480);
        if (d > 2) {
          f.x += dx / d * sp * dt;
          f.y += dy / d * sp * dt;
        }
        f.moving = sp > 30;
        if (Math.abs(dx) > 3) f.facing = dx > 0 ? 1 : -1;
        if (p.firing && !f.moving) f.cheer += dt;
        else f.cheer = 0;
      }
    }
    // ---------------------------------------------------------------- telegraph marks
    updateMarks(dt) {
      for (const k of this.marks) k.t -= dt;
      if (this.marks.length) this.marks = this.marks.filter((k) => k.t > 0);
    }
    // ---------------------------------------------------------------- room flow
    updateFlow(dt) {
      if (this.state === "fight") {
        if (this.aliveCount() === 0) {
          if (this.wave < this.maxWave) {
            if (this.waveTimer < 0) {
              this.waveTimer = MONSTER_RULES.waveDelay;
              for (const mp of this.def.monsters) if ((mp.w ?? 0) === this.wave + 1) {
                this.marks.push({ kind: "spawn", x: mp.x, y: mp.y, t: MONSTER_RULES.waveDelay + MONSTER_RULES.spawnRise, r: MONSTERS[mp.t].r });
                this.emit({ t: "spawnMark", x: mp.x, y: mp.y, delay: MONSTER_RULES.waveDelay });
              }
            }
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
              this.wave++;
              this.waveTimer = -1;
              this.spawnWave(this.wave);
            }
          } else {
            this.state = "clear";
            this.stateTime = 0;
            this.run.roomsCleared++;
            for (const b of this.bullets) b.alive = false;
            this.emit({ t: "roomClear" });
            this.emit({ t: "cleanWave", x: this.player.x, y: this.player.y });
            this.goo.clearAll();
            this.run.cleanSum += 1;
            for (const c of this.cocoons) if (!c.freed) c.hp = Math.min(c.hp, c.maxHp * 0.3);
          }
        }
      } else if (this.state === "clear") {
        if (!this.gateOpen && this.stateTime > 0.7) {
          this.gateOpen = true;
          this.emit({ t: "gateOpen" });
        }
      }
    }
    cocoonsLeft() {
      return this.cocoons.filter((c) => !c.freed).length;
    }
  };
  function turnToward(a, b, max) {
    let d = b - a;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    if (Math.abs(d) <= max) return b;
    return a + Math.sign(d) * max;
  }
  function distToSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    let t2 = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
    t2 = clamp(t2, 0, 1);
    return Math.hypot(px - (x0 + dx * t2), py - (y0 + dy * t2));
  }

  // src/game/play.ts
  var DT = 1 / 60;
  var PlayScreen = class {
    constructor(o, uiRoot, onDone) {
      this.acc = 0;
      this.paused = "none";
      this.hud = {};
      this.ribbonQ = [];
      this.ribbonBusy = false;
      this.revivesUsed = 0;
      this.lastHp = -1;
      this.lastCoins = -1;
      this.lastXp = -1;
      this.lastFriends = -1;
      this.lastLv = -1;
      this.hintState = { moved: false, fired: false, pressureShown: false, rescueShown: false, gateShown: false, idleTime: 0, rangeShown: 0 };
      this.wasFiring = false;
      this.roomStart = 0;
      this.coinStreak = 0;
      this.coinStreakT = 0;
      this.finished = false;
      this.stageBanner = 0;
      this.introShown = false;
      this.o = o;
      this.onDone = onDone;
      this.run = createRun(o.level, o.meta, { known: o.known, seed: o.seed, mods: o.daily?.mods, revives: o.revives, daily: !!o.daily });
      this.input = getInput();
      this.input.release();
      this.input.joy.everMoved = false;
      this.input.enabled = !o.bot;
      this.bot = o.bot ? new Bot(o.bot, o.seed) : null;
      this.ui = h("div", { class: "play-ui" });
      uiRoot.appendChild(this.ui);
      this.buildHud();
      this.hint = h("div", { class: "hint" });
      this.banner = h("div", { class: "banner" });
      this.fade = h("div", { class: "fade" });
      this.ribbon = h("div", { class: "ribbon" });
      this.ui.append(this.hint, this.banner, this.ribbon, this.fade);
      this.enterRoom(0);
      track("run_start", { stage: o.level.stage, attempt: o.attempt, daily: !!o.daily, assist: o.meta.assist, gunTier: this.run.stats.gunTier });
    }
    // ---------------------------------------------------------------- HUD
    buildHud() {
      const pauseBtn = h("button", { class: "btn-icon hud-pause", "aria-label": t("pause.title"), onclick: once(() => this.openPause()) }, icon("ic_pause", 30));
      const hpFill = h("div", { class: "bar-fill hp" });
      const hpText = h("div", { class: "bar-text" });
      const hp = h("div", { class: "hud-hp" }, icon("ic_heart", 30, "hud-hp-ic"), h("div", { class: "bar" }, hpFill, hpText));
      const coinText = h("span", { class: "num" }, "0");
      const coins = h("div", { class: "hud-coins pill" }, icon("p_coin_0", 26), coinText);
      const xpFill = h("div", { class: "bar-fill xp" });
      const lv = h("div", { class: "hud-lv" }, "Lv 1");
      const xp = h("div", { class: "hud-xp" }, lv, h("div", { class: "bar thin" }, xpFill));
      const rooms = h("div", { class: "hud-rooms" });
      const friends = h("div", { class: "hud-friends" });
      const top = h("div", { class: "hud-top" }, pauseBtn, hp, coins);
      const hud = h("div", { class: "hud" }, top, h("div", { class: "hud-row2" }, xp, rooms), friends);
      this.ui.appendChild(hud);
      Object.assign(this.hud, { hpFill, hpText, coinText, xpFill, lv, rooms, friends, coins, hp, root: hud });
      this.joyEl = h("div", { class: "joy" }, h("div", { class: "joy-knob" }));
      this.ui.appendChild(this.joyEl);
    }
    hudHeight() {
      const r = this.hud.root?.getBoundingClientRect();
      return r ? r.bottom + 4 : 90;
    }
    updateHud() {
      const p = this.sim.player;
      const st = this.run.stats;
      const hp = Math.ceil(p.hp);
      if (hp !== this.lastHp) {
        if (this.lastHp >= 0 && hp < this.lastHp) {
          this.hud.hp.classList.remove("shake");
          void this.hud.hp.offsetWidth;
          this.hud.hp.classList.add("shake");
        }
        this.lastHp = hp;
        this.hud.hpFill.style.width = `${Math.max(0, Math.min(100, p.hp / st.maxHp * 100))}%`;
        this.hud.hpText.textContent = `${num(hp)} / ${num(st.maxHp)}`;
        this.hud.hpFill.classList.toggle("low", p.hp / st.maxHp < 0.3);
      }
      if (this.run.coins !== this.lastCoins) {
        if (this.lastCoins >= 0) {
          this.hud.coins.classList.remove("pop");
          void this.hud.coins.offsetWidth;
          this.hud.coins.classList.add("pop");
        }
        this.lastCoins = this.run.coins;
        this.hud.coinText.textContent = num(this.run.coins);
      }
      const xp = Math.round(xpProgress(this.run) * 100);
      const lvShown = this.run.xpLevel + this.run.pendingLevelUps;
      if (xp !== this.lastXp || lvShown !== this.lastLv) {
        this.lastXp = xp;
        this.lastLv = lvShown;
        this.hud.xpFill.style.width = `${xp}%`;
        this.hud.lv.textContent = t("hud.lv", { n: lvShown });
      }
      if (this.run.rescued.length !== this.lastFriends) {
        this.lastFriends = this.run.rescued.length;
        this.hud.friends.replaceChildren(...this.run.rescued.map((s) => icon(`p_${s}`, 34, "friend")));
      }
    }
    updateRoomDots() {
      const n = this.run.level.rooms.length;
      this.hud.rooms.replaceChildren(...Array.from({ length: n }, (_, i) => h("span", { class: "dot" + (i < this.run.roomIndex ? " done" : i === this.run.roomIndex ? " cur" : "") + (i === n - 1 && this.run.level.boss ? " boss" : "") })));
    }
    // ---------------------------------------------------------------- rooms
    enterRoom(i) {
      this.run.roomIndex = i;
      this.sim = new RoomSim(this.run, i, this.o.seed * 131 + i * 17);
      this.view = new RoomView(this.sim, this.run.level.region, `${this.run.level.id}:${i}`);
      this.layout();
      this.roomStart = this.run.time;
      this.lastHp = -1;
      this.updateRoomDots();
      audio.playMusic(this.run.level.boss && i === this.run.level.rooms.length - 1 ? "bgm_boss" : `bgm_${this.run.level.region}`);
      if (this.o.newMonster && !this.introShown && this.sim.def.monsters.some((m) => m.t === this.o.newMonster)) {
        this.introShown = true;
        const k = this.o.newMonster;
        setTimeout(() => this.showBanner(t("toast.newMonster"), t(`monster.${k}`), t(`monster.${k}.desc`), `m_${k === "boss" ? "boss_" + this.run.level.region : k === "flyer" ? "flyer" : k}_normal${k === "flyer" ? "_0" : ""}`), 500);
      }
      if (i === 0 && !this.o.tutorial) {
        setTimeout(() => this.showBanner(t(`region.${this.run.level.region}`), this.o.daily ? t("daily.title") : t("stage.short", { n: (this.run.level.stage - 1) % 10 + 1 }), "", null), 150);
      }
    }
    layout() {
      if (!this.view) return;
      const top = this.hudHeight();
      this.view.layout({ viewW: screen.w, viewH: screen.h, top, bottom: Math.max(6, screen.safe.bottom * 0.6) });
    }
    nextRoom() {
      this.paused = "transition";
      audio.loop("spray_loop", false);
      audio.play("whoosh", { vol: 0.7 });
      this.fade.classList.add("on");
      this.run.hp = this.sim.player.hp;
      this.run.shield = this.sim.player.shield;
      setTimeout(() => {
        this.enterRoom(this.run.roomIndex + 1);
        this.fade.classList.remove("on");
        this.paused = "none";
      }, 380);
    }
    // ---------------------------------------------------------------- loop
    frame(dtReal) {
      if (this.finished) return;
      const v = this.view;
      let scale = 1;
      if (v.slowmo > 0) scale = 0.35;
      if (this.paused === "none") {
        this.acc += Math.min(0.1, dtReal) * scale;
        let steps = 0;
        while (this.acc >= DT && steps < 6) {
          this.acc -= DT;
          steps++;
          const input = this.bot ? this.bot.decide(this.sim, DT) : { mx: this.input.joy.mx, my: this.input.joy.my };
          this.sim.step(DT, input);
          for (const e of this.sim.drain()) this.onEvent(e);
          if (this.paused !== "none") break;
        }
        this.afterStep();
      }
      v.update(Math.min(0.05, dtReal) * (this.paused === "none" ? scale : this.paused === "cards" || this.paused === "pause" ? 0 : 1));
      v.render(screen.ctx, screen.dpr, screen.w, screen.h);
      this.drawJoystick();
      this.updateHud();
      this.updateHints(dtReal);
      const p = this.sim.player;
      if (p.firing && this.paused === "none") audio.loop("spray_loop", true, 0.32 + p.pressure * 0.25, 0.9 + p.pressure * 0.25);
      else audio.loop("spray_loop", false);
      this.coinStreakT -= dtReal;
      if (this.coinStreakT <= 0) this.coinStreak = 0;
    }
    drawJoystick() {
      const j = this.input.joy;
      if (j.active && !this.bot) {
        this.joyEl.style.display = "block";
        this.joyEl.style.transform = `translate(${j.ox}px, ${j.oy}px)`;
        const knob = this.joyEl.firstChild;
        const dx = Math.max(-46, Math.min(46, j.x - j.ox)), dy = Math.max(-46, Math.min(46, j.y - j.oy));
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
      } else this.joyEl.style.display = "none";
      void draw;
    }
    afterStep() {
      const sim = this.sim;
      if (sim.state === "clear" && this.run.pendingLevelUps > 0 && (sim.pickupsLeft() === 0 || sim.stateTime > 1.6) && this.paused === "none" && !(sim.isLast && sim.state === "clear" && false)) {
        if (!sim.isLast) this.showCards();
        else this.run.pendingLevelUps = 0;
      }
      if (sim.state === "dead" && this.paused === "none" && sim.stateTime > 0.9) this.onDeath();
    }
    // ---------------------------------------------------------------- events
    onEvent(e) {
      this.view.onEvent(e);
      const run = this.run;
      switch (e.t) {
        case "hit":
          audio.play("goo_hit", { vol: 0.45, rate: e.kind === "chunky" || e.kind === "boss" ? 0.75 : e.kind === "mini" ? 1.3 : 1 });
          break;
        case "burst": {
          const big = e.r > 40;
          audio.play(big ? "goo_burst_big" : "goo_burst", { vol: 0.9, rate: 1 + Math.min(8, e.combo - 1) * 0.045, vary: 0.04 });
          buzz(big ? "medium" : "light");
          if (e.boss) {
            audio.stinger("stinger_clear");
            buzz("heavy");
          }
          break;
        }
        case "fireStart":
          audio.play("spray_start", { vol: 0.6 });
          if (!this.hintState.fired) {
            this.hintState.fired = true;
            track("tutorial_step", { step: "first_spray", t: Math.round(run.time) });
          }
          break;
        case "pressureFull":
          audio.play("pressure_full", { vol: 0.7 });
          buzz("tick");
          if (this.o.tutorial && !this.hintState.pressureShown) {
            this.hintState.pressureShown = true;
            this.announce(t("toast.pressure"), t("hint.pressure"), "small");
          }
          break;
        case "cocoonHit":
          audio.play("cocoon_hit", { vol: 0.6 });
          break;
        case "rescue": {
          audio.play("rescue", { vol: 1, vary: 0 });
          audio.duckMusic(0.45, 1.6);
          setTimeout(() => audio.play(`chirp_${1 + run.rescued.length % 3}`, { vol: 0.9 }), 350);
          buzz("success");
          const name = t(`species.${e.species}`);
          const cheer = run.rescued.length <= RESCUE.cheerMaxAnimals ? t("toast.cheer", { p: pct(RESCUE.cheerDamagePerAnimal) }) : "";
          this.announce(t("toast.rescued", { name }), [e.brave ? t("toast.brave") : "", cheer].filter(Boolean).join(" \xB7 "), "rescue");
          track("animal_rescue", { species: e.species, stage: run.stage, first: e.first, brave: e.brave });
          if (run.rescued.length === 1 && this.o.tutorial) track("tutorial_step", { step: "first_rescue", t: Math.round(run.time) });
          break;
        }
        case "playerHit":
          audio.play("player_hit", { vol: 0.9 });
          buzz("heavy");
          break;
        case "shieldPop":
          audio.play("shield_pop", { vol: 0.9 });
          buzz("light");
          break;
        case "spit":
          audio.play("enemy_spit", { vol: e.kind === "boss" || e.kind === "chunky" ? 0.8 : 0.5 });
          break;
        case "telegraph":
          if (e.kind === "chunky" || e.kind === "boss" || e.kind === "jumper" || e.kind === "dasher") audio.play("enemy_charge", { vol: 0.5 });
          break;
        case "dash":
          audio.play("enemy_dash", { vol: 0.6 });
          break;
        case "land":
          audio.play("enemy_land", { vol: 0.8 });
          buzz("light");
          break;
        case "split":
          audio.play("goo_split", { vol: 0.6 });
          break;
        case "pickup": {
          if (e.kind === "coin") {
            this.coinStreak++;
            this.coinStreakT = 0.4;
            audio.play("pickup_coin", { vol: 0.45, rate: 1 + Math.min(10, this.coinStreak) * 0.03, vary: 0.02 });
          } else if (e.kind === "xp") audio.play("pickup_xp", { vol: 0.35, rate: 1 + Math.min(12, this.coinStreak) * 0.02 });
          else audio.play("heal", { vol: 0.8 });
          break;
        }
        case "roomClear": {
          audio.play("room_clear", { vol: 0.9 });
          buzz("success");
          this.announce(t("toast.clean"), "", "clean");
          track("room_clear", { stage: run.stage, room: run.roomIndex, seconds: Math.round(run.time - this.roomStart), hit: this.sim.hitThisRoom });
          if (run.stage === 1 && run.roomIndex === 0 && this.o.tutorial) track("tutorial_step", { step: "first_room", t: Math.round(run.time) });
          break;
        }
        case "gateOpen":
          audio.play("gate_open", { vol: 0.8 });
          break;
        case "exit": {
          if (this.sim.isLast) this.finish("clear");
          else this.nextRoom();
          break;
        }
        case "bossPhase":
          audio.play("boss_roar", { vol: 0.9 });
          this.announce(t("toast.bossPhase"), "", "warn");
          buzz("medium");
          break;
        case "spawnMark":
          break;
        case "trailPop":
          audio.play("shield_pop", { vol: 0.35, rate: 1.4 });
          break;
        case "dead":
          audio.loop("spray_loop", false);
          audio.play("player_hit", { vol: 1, rate: 0.8 });
          buzz("fail");
          break;
        default:
          break;
      }
    }
    // ---------------------------------------------------------------- tutorial hints
    updateHints(dt) {
      const hs = this.hintState;
      const sim = this.sim;
      const p = sim.player;
      if (this.input.joy.everMoved && !hs.moved) {
        hs.moved = true;
        track("tutorial_step", { step: "move", t: Math.round(this.run.time) });
      }
      let text = "";
      let wx = p.x, wy = p.y - 120;
      let showHand = false;
      const tut = this.o.tutorial && !this.bot;
      if (tut && !hs.moved && this.paused === "none") {
        text = t("hint.drag");
        showHand = true;
        wy = p.y + 30;
      } else if (tut && hs.moved && !hs.fired && p.moving && sim.state === "fight" && this.run.time > 1.5) {
        text = t("hint.stop");
      } else if (tut && sim.state === "fight" && this.run.roomIndex === 0) {
        const c = sim.cocoons.find((cc) => !cc.freed);
        if (c && Math.hypot(c.x - p.x, c.y - p.y) < 380 && !hs.rescueShown && hs.fired) {
          text = t("hint.rescue");
          wx = c.x;
          wy = c.y - 110;
          if (this.run.time > 25) hs.rescueShown = true;
        }
      }
      if (!text && sim.state === "fight" && !p.moving && !p.firing && p.stillTime > 1.2 && this.o.firstRuns < 4 && !this.bot) {
        text = t("hint.range");
        hs.rangeShown += dt;
      }
      if (!text && sim.gateOpen && sim.state === "clear" && this.o.firstRuns < 3 && !this.bot) {
        hs.idleTime += p.moving ? 0 : dt;
        if (hs.idleTime > 2.2 && sim.cocoonsLeft() === 0) {
          text = t("hint.gate");
          wx = ROOM.width / 2;
          wy = ROOM.wall + 150;
        }
      }
      if (text) {
        const [sx, sy] = this.view.worldToScreen(wx, wy);
        if (this.hint.dataset.text !== text) {
          this.hint.dataset.text = text;
          this.hint.replaceChildren(...showHand ? [icon("mk_hand", 54, "hint-hand")] : [], h("span", {}, text));
        }
        this.hint.style.transform = `translate(${Math.round(Math.max(90, Math.min(screen.w - 90, sx)))}px, ${Math.round(Math.max(this.hudHeight() + 30, Math.min(screen.h - 60, sy)))}px) translate(-50%, -50%)`;
        this.hint.classList.add("show");
        this.hint.classList.toggle("with-hand", showHand);
      } else {
        this.hint.classList.remove("show");
        this.hint.dataset.text = "";
      }
    }
    // One big message at a time, in the upper middle of the screen.
    announce(title, sub = "", cls = "") {
      if (this.ribbonQ.length >= 2) this.ribbonQ.shift();
      this.ribbonQ.push({ title, sub, cls });
      if (!this.ribbonBusy) this.nextRibbon();
    }
    nextRibbon() {
      const it = this.ribbonQ.shift();
      if (!it) {
        this.ribbonBusy = false;
        return;
      }
      this.ribbonBusy = true;
      this.ribbon.className = "ribbon " + it.cls;
      this.ribbon.replaceChildren(h("div", { class: "ribbon-title" }, it.title), it.sub ? h("div", { class: "ribbon-sub" }, it.sub) : "");
      void this.ribbon.offsetWidth;
      this.ribbon.classList.add("show");
      setTimeout(() => this.ribbon.classList.remove("show"), 1150);
      setTimeout(() => this.nextRibbon(), 1400);
    }
    showBanner(title, sub, desc, sprite) {
      this.banner.replaceChildren(
        ...sprite ? [icon(sprite, 64, "banner-ic")] : [],
        h("div", { class: "banner-txt" }, h("div", { class: "banner-title" }, title), sub ? h("div", { class: "banner-sub" }, sub) : null, desc ? h("div", { class: "banner-desc" }, desc) : null)
      );
      this.banner.classList.remove("show");
      void this.banner.offsetWidth;
      this.banner.classList.add("show");
      clearTimeout(this.stageBanner);
      this.stageBanner = window.setTimeout(() => this.banner.classList.remove("show"), 2600);
    }
    // ---------------------------------------------------------------- level-up cards
    showCards() {
      const choices = rollSkillChoices(this.run);
      if (!choices.length) {
        this.run.pendingLevelUps = 0;
        return;
      }
      this.paused = "cards";
      this.input.release();
      audio.loop("spray_loop", false);
      audio.play("level_up", { vol: 0.9 });
      buzz("medium");
      const lvl = this.run.xpLevel + 1;
      const pick = (id) => {
        if (!ready) return;
        ready = false;
        audio.play("card_pick", { vol: 0.9 });
        this.run.hp = this.sim.player.hp;
        applySkill(this.run, id);
        this.sim.player.hp = this.run.hp;
        if (id === "shield") {
          this.sim.player.shield = true;
        }
        track("skill_pick", { skill: id, options: choices.join(","), level: lvl });
        if (this.o.tutorial && lvl === 2) track("tutorial_step", { step: "first_skill", t: Math.round(this.run.time) });
        const card = body.querySelector(`[data-skill="${id}"]`);
        card?.classList.add("picked");
        setTimeout(() => {
          closeModal("levelup", true);
          this.paused = "none";
          this.lastHp = -1;
        }, 380);
      };
      let ready = false;
      setTimeout(() => ready = true, 350);
      const cards = choices.map((id) => {
        const stacks = this.run.skills[id] || 0;
        const max = SKILLS.find((s) => s.id === id).max;
        const desc = t(`skill.${id}.desc`, id === "shield" ? { s: SKILL_VALUES.shieldRegen[Math.min(2, stacks)] } : void 0);
        return h(
          "button",
          { class: "skill-card", "data-skill": id, onclick: () => pick(id) },
          icon(`ic_skill_${id}`, 64, "skill-ic"),
          h(
            "div",
            { class: "skill-txt" },
            h("div", { class: "skill-name" }, t(`skill.${id}.name`)),
            h("div", { class: "skill-desc" }, desc),
            id !== "heal" ? h("div", { class: "skill-dots" }, ...Array.from({ length: max }, (_, k) => h("span", { class: "sdot" + (k < stacks ? " on" : k === stacks ? " next" : "") }))) : null
          )
        );
      });
      const body = h("div", { class: "levelup" }, h("div", { class: "levelup-sub" }, t("levelup.pick")), ...cards);
      openModal(body, { id: "levelup", title: t("levelup.title"), titleIcon: "p_star", closable: false, cls: "modal-levelup" });
      void xpToNext;
    }
    // ---------------------------------------------------------------- pause / revive / end
    openPause() {
      if (this.paused !== "none" || this.finished) return;
      this.paused = "pause";
      this.input.release();
      audio.loop("spray_loop", false);
      const body = h(
        "div",
        { class: "pause" },
        h("button", { class: "btn btn-primary big", onclick: once(() => {
          closeModal("pause");
        }) }, icon("ic_play", 30), t("pause.resume")),
        h("button", { class: "btn btn-plain", onclick: once(() => this.o.onSettings()) }, icon("ic_gear", 28), t("pause.settings")),
        h("div", { class: "pause-note" }, t("pause.quitNote")),
        h("button", { class: "btn btn-warn", onclick: once(() => {
          closeModal("pause", true);
          this.finish("quit");
        }) }, icon("ic_exit", 28), t("pause.quit"))
      );
      openModal(body, { id: "pause", title: t("pause.title"), onClose: () => {
        if (this.paused === "pause") this.paused = "none";
      } });
    }
    // pause when the app goes to the background
    autoPause() {
      if (this.paused === "none" && !this.finished && !this.bot) this.openPause();
    }
    onDeath() {
      if (this.run.revives > 0 && !this.bot) {
        this.paused = "revive";
        const body = h(
          "div",
          { class: "revive" },
          h("div", { class: "revive-art" }, icon("kid_sad_0", 120)),
          h("div", { class: "revive-desc" }, t("revive.desc")),
          h("button", { class: "btn btn-primary big", onclick: once(() => {
            closeModal("revive", true);
            this.doRevive();
          }) }, icon("ic_heart", 30), t("revive.yes")),
          h("button", { class: "btn btn-plain", onclick: once(() => {
            closeModal("revive", true);
            this.finish("fail");
          }) }, t("revive.no"))
        );
        openModal(body, { id: "revive", title: t("revive.title"), closable: false });
      } else if (this.run.revives > 0 && this.bot) {
        this.doRevive();
      } else this.finish("fail");
    }
    doRevive() {
      this.run.revives--;
      this.revivesUsed++;
      this.sim.revive(this.run.stats.reviveHp);
      audio.play("revive", { vol: 1 });
      buzz("success");
      this.view.fx.spawn("fx_ring", this.sim.player.x, this.sim.player.y - 20, { max: 0.6, scale: 0.5, scale1: 3, alpha: 0.9 });
      this.paused = "none";
      track("revive", { stage: this.run.stage, room: this.run.roomIndex });
    }
    finish(result) {
      if (this.finished) return;
      this.finished = true;
      this.paused = "end";
      audio.loop("spray_loop", false);
      this.input.enabled = false;
      this.input.release();
      this.run.hp = this.sim.player.hp;
      refreshStats(this.run);
      const src = Object.entries(this.run.dmgBy).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const out = { run: this.run, result, seconds: Math.round(this.run.time), deathSource: src, revivesUsed: this.revivesUsed, roomsCleared: this.run.roomsCleared };
      track("run_end", { stage: this.run.stage, result, rooms: this.run.roomsCleared, seconds: out.seconds, rescued: this.run.rescued.length, coins: this.run.coins, washed: this.run.washed, hits: this.run.hits, deathSource: src, revivesUsed: this.revivesUsed, level: this.run.xpLevel, daily: this.run.daily });
      this.onDone(out);
    }
    // keep rendering the last frame under the result screen
    renderIdle(dt) {
      this.view.update(dt * 0.5);
      this.view.render(screen.ctx, screen.dpr, screen.w, screen.h);
    }
    destroy() {
      this.input.enabled = false;
      this.ui.remove();
      audio.loop("spray_loop", false);
    }
  };

  // src/app.ts
  var LEVELS = levels_default.slice().sort((a, b) => a.stage - b.stage);
  var App = class {
    constructor(fresh) {
      this.scene = null;
      this.ui = document.getElementById("ui");
      this.params = new URLSearchParams(location.search);
      this.last = 0;
      this.acc = 0;
      this.capture = this.params.has("capture");
      this.fresh = fresh;
      onResize(() => this.scene?.layout?.());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.scene?.autoPause?.();
      });
    }
    start() {
      const stage = Number(this.params.get("stage") || 1);
      this.playStage(stage);
      if (this.capture) {
        window.__advance = (n, dt = 1 / 30) => {
          for (let i = 0; i < n; i++) this.scene?.frame(dt);
        };
        return;
      }
      const loop = (ts) => {
        requestAnimationFrame(loop);
        const dt = this.last ? Math.min(0.1, (ts - this.last) / 1e3) : 1 / 60;
        this.last = ts;
        const cap = quality().fpsCap;
        this.acc += dt;
        if (cap < 60 && this.acc < 1 / cap - 2e-3) return;
        const step = this.acc;
        this.acc = 0;
        this.scene?.frame(step);
      };
      requestAnimationFrame(loop);
    }
    metaPower() {
      const s = save();
      return { upgrades: { ...s.upgrades }, bonds: {}, assist: false };
    }
    playStage(stage) {
      const level2 = LEVELS.find((l) => l.stage === stage) ?? LEVELS[0];
      this.scene?.destroy();
      const botName = this.params.get("bot");
      const bot = botName === "expert" ? BOT_EXPERT : botName === "novice" ? BOT_NOVICE : botName ? BOT_PLAYER : void 0;
      const seed = Number(this.params.get("seed") || Math.floor(Math.random() * 1e6));
      const play = new PlayScreen({
        level: level2,
        meta: this.metaPower(),
        known: [],
        seed,
        attempt: 1,
        tutorial: stage === 1,
        firstRuns: 0,
        bot,
        newMonster: level2.intro ?? null,
        revives: 1,
        onSettings: () => {
        }
      }, this.ui, (r) => this.onPlayDone(play, r));
      this.scene = { frame: (dt) => play.frame(dt), layout: () => play.layout(), destroy: () => play.destroy(), autoPause: () => play.autoPause() };
      play.layout();
    }
    onPlayDone(play, r) {
      const box = h(
        "div",
        { style: "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff6e2;border:4px solid #3a2416;border-radius:20px;padding:20px;font-size:22px;text-align:center" },
        `${r.result} \xB7 ${r.run.coins} coins \xB7 ${r.run.rescued.length} animals`,
        h("br"),
        h("button", { class: "btn btn-primary", onclick: () => {
          box.remove();
          this.playStage(r.run.stage);
        } }, "Again")
      );
      this.ui.appendChild(box);
      this.scene = { frame: (dt) => play.renderIdle(dt), destroy: () => play.destroy() };
      void screen;
    }
  };

  // src/main.ts
  async function boot() {
    const t0 = performance.now();
    const { data: data2, fresh } = loadSave();
    setLang(data2.settings.lang === "auto" ? deviceLang() : data2.settings.lang);
    setQuality(data2.settings.quality === "auto" ? defaultQuality() : data2.settings.quality);
    setHaptics(data2.settings.vibration);
    const loading = document.getElementById("loading");
    const fill = loading.querySelector(".load-fill");
    const text = loading.querySelector(".load-text");
    text.textContent = t("loading.text");
    const sub = loading.querySelector(".load-sub");
    if (sub) sub.textContent = t("app.title") === "Splash Rescue" ? "" : "Splash Rescue";
    loading.querySelector(".load-logo").textContent = t("app.title");
    const canvas = document.getElementById("game");
    initScreen(canvas);
    initInput(canvas);
    initModals(document.getElementById("modals"));
    await Promise.all([
      loadAtlases((k) => {
        fill.style.width = `${Math.round(10 + k * 85)}%`;
      }),
      document.fonts ? Promise.race([Promise.all([document.fonts.load("20px Fredoka"), document.fonts.load("20px Jua", "\uAC00")]), new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve()
    ]);
    fill.style.width = "100%";
    audio.init(window.__AUDIO_MANIFEST__ ?? null);
    audio.setVolumes(data2.settings.music, data2.settings.sfx);
    data2.stats.sessions++;
    const gapH = data2.stats.lastSession ? (Date.now() - data2.stats.lastSession) / 36e5 : 0;
    data2.stats.lastSession = Date.now();
    markDirty();
    initAnalytics(data2.installId, data2.stats.sessions, "1.0.0");
    if (fresh) track("install", { lang: document.documentElement.lang, quality: quality().dprCap });
    track("session_start", { session: data2.stats.sessions, daysSinceInstall: Math.floor((Date.now() - data2.createdAt) / 864e5), gapHours: Math.round(gapH) });
    track("load_complete", { ms: Math.round(performance.now() - t0) });
    void auth.signInSilently();
    const app = new App(fresh);
    window.__APP__ = app;
    loading.classList.add("done");
    setTimeout(() => loading.remove(), 500);
    app.start();
    const sessionStart = Date.now();
    window.addEventListener("pagehide", () => {
      save().stats.playSeconds += Math.round((Date.now() - sessionStart) / 1e3);
      markDirty();
      flush();
      track("session_end", { seconds: Math.round((Date.now() - sessionStart) / 1e3) });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flush();
    });
  }
  boot().catch((e) => {
    console.error(e);
    const el = document.querySelector("#loading .load-text");
    if (el) el.textContent = "Error: " + (e && e.message ? e.message : e);
    track("error", { message: String(e && e.message) });
  });
})();
