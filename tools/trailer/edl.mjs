// Trailer edit list. Every gameplay cut is a range of a real take (see takes.mjs);
// the first 3 seconds come from a fresh install's very first run of area 1.
// Times are take seconds; subtitle times are trailer seconds.
export const EDL = {
  fps: 30,
  music: { name: 'bgm_forest', vol: 0.5, fadeIn: 0.2, fadeOut: 1.6 },
  segments: [
    { take: 'first', from: 4.25, to: 5.05, zoom: 1.45, lift: -0.05, note: 'first run: dodging a spit droplet' },
    { take: 'first', from: 11.5, to: 13.7, zoom: 1.45, note: 'first run: stop, spray, burst, room wash, puppy freed' },
    { take: 'first', from: 23.2, to: 27.2, zoom: 1.35, note: 'first run room 2: bunny freed, puppy following' },
    { take: 'first', from: 50.2, to: 54.4, note: 'first result screen: buying the first upgrades' },
    { take: 'evolve', from: 1.6, to: 5.2, note: 'a few runs in: the water gun evolves' },
    { take: 'boss', from: 85.5, to: 90.5, zoom: 1.2, lift: 0.18, note: 'area 20 boss with a grown water cannon' },
    { take: 'shelter', from: 1.4, to: 5.4, note: 'the shelter' },
    { card: 'end', dur: 3.5, sfx: [{ t: 0.05, n: 'stinger_clear', v: 1 }], note: 'end card' },
  ],
  subs: [
    { from: 0, to: 1.6, ko: '움직이면 피하고, 멈추면 쏴요', en: 'Move to dodge, stop to spray' },
    { from: 1.6, to: 3.0, ko: '끈적이를 씻고 강아지를 구해요!', en: 'Wash the goo, free the puppy!' },
    { from: 3.0, to: 7.0, ko: '구한 친구들은 졸졸 따라와요', en: 'The friends you save tag along' },
    { from: 7.0, to: 11.2, ko: '져도 동물과 코인은 그대로, 바로 강해져요', en: 'Keep your animals and coins, even if you lose' },
    { from: 11.2, to: 14.8, ko: '작은 물총이 거대 물대포가 될 때까지', en: 'From a tiny squirt gun to a giant cannon' },
    { from: 14.8, to: 19.8, ko: '대장 끈적이도 시원하게!', en: 'Even the boss washes away!' },
    { from: 19.8, to: 23.8, ko: '구한 동물들이 뛰노는 보호소', en: 'A shelter full of the friends you saved' },
    { from: 23.8, to: 27.3, ko: '광고도 결제도 없이, 물총 구조대', en: 'No ads, no purchases. Splash Rescue' },
  ],
};
