// Trailer edit list. Every gameplay cut is a range of a real take (see takes.mjs);
// the first 3 seconds come from a fresh install's very first run of area 1.
// Times are take seconds; subtitle times are trailer seconds.
export const EDL = {
  fps: 30,
  music: { name: 'bgm_forest', vol: 0.5, fadeIn: 0.2, fadeOut: 1.6 },
  segments: [
    { take: 'first', from: 4.25, to: 5.05, zoom: 1.45, lift: -0.05, note: 'first run: dodging a spit droplet' },
    { take: 'first', from: 11.5, to: 13.7, zoom: 1.45, note: 'first run: stop, spray, burst, room wash, puppy freed' },
    { take: 'first', from: 23.4, to: 27.4, zoom: 1.35, note: 'first run room 2: bunny freed, puppy following' },
    { take: 'result', from: 45.8, to: 48.2, note: 'first result screen: rewards come in' },
    { take: 'result', from: 49.7, to: 51.7, note: 'first result screen: buying the first upgrades' },
    { take: 'evolve', from: 1.6, to: 4.2, note: 'a few runs in: the water gun evolves' },
    { take: 'boss', from: 75.6, to: 78.6, zoom: 1.12, lift: -0.22, note: 'area 20 boss: spraying it with a grown water cannon' },
    { take: 'boss', from: 89.4, to: 91.2, zoom: 1.12, lift: -0.22, note: 'area 20 boss: washed away' },
    { take: 'shelter', from: 1.4, to: 5.4, note: 'the shelter' },
    { card: 'end', dur: 3.5, sfx: [{ t: 0.05, n: 'stinger_clear', v: 1 }], note: 'end card' },
  ],
  // segs: [first, last] segment the line covers; from/to (trailer seconds) override either end
  subs: [
    { segs: [0, 1], to: 1.6, ko: '움직이면 피하고, 멈추면 쏴요', en: 'Move to dodge, stop to spray' },
    { segs: [1, 1], from: 1.6, ko: '끈적이를 씻고 강아지를 구해요!', en: 'Wash the goo, free the puppy!' },
    { segs: [2, 2], ko: '구한 친구들은 졸졸 따라와요', en: 'The friends you save tag along' },
    { segs: [3, 4], ko: '져도 동물과 코인은 그대로, 바로 강해져요', en: 'Keep your animals and coins, even if you lose' },
    { segs: [5, 5], ko: '작은 물총이 거대 물대포가 될 때까지', en: 'From a tiny squirt gun to a giant cannon' },
    { segs: [6, 7], ko: '대장 끈적이도 시원하게!', en: 'Even the boss washes away!' },
    { segs: [8, 8], ko: '구한 동물들이 뛰노는 보호소', en: 'A shelter full of the friends you saved' },
    { segs: [9, 9], ko: '광고도 결제도 없이, 물총 구조대', en: 'No ads, no purchases. Splash Rescue' },
  ],
};
