// Footage takes for the trailer and store screenshots. Every take is real play:
// the player bot drives the same input path as a thumb (shown with ?thumb), and
// menus are clicked like a person would. Times come from probe runs
// (node tools/trailer/capture.mjs <take> --probe prints the timeline).
// seconds = game time to run, record = [from, to] ranges saved as frames.
const BUY = '.btn.up-buy.ok';
const CLOSE = { at: 0.9, click: '.modal-back .btn-close' }; // the daily stamp card shows on hub arrival
export const TAKES = {
  // a fresh install's very first run of area 1 (tutorial hints on), then its
  // result screen where the first upgrades are bought
  first: {
    query: 'preset=fresh&stage=1&bot=player&seed=5&thumb=1', seconds: 58,
    record: [[3.6, 6], [10.8, 15], [22, 28.4], [45, 58]],
    actions: [{ at: 50.6, click: `.res-up ${BUY}` }, { at: 52.2, click: `.res-up ${BUY}` }, { at: 53.8, click: `.res-up ${BUY}` }],
  },
  // a few runs in: two more upgrades evolve the water gun
  evolve: {
    query: 'preset=day1&home=upgrade', seconds: 8.5,
    actions: [CLOSE, { at: 2.0, click: `.page-up ${BUY}` }, { at: 3.2, click: `.page-up ${BUY}` }],
  },
  // later: the village boss with a fully grown water cannon
  boss: { query: 'preset=late&stage=20&bot=expert&seed=3&thumb=1', seconds: 93, record: [[81, 93]] },
  // the shelter with the rescued friends
  shelter: { query: 'preset=late&home=shelter', seconds: 7, actions: [CLOSE] },
  // English UI versions of the screenshot moments (same seeds, so the same play)
  firstEn: { query: 'preset=fresh&stage=1&bot=player&seed=5', lang: 'en-US', seconds: 27, record: [[11.9, 12.9], [25.9, 27]] },
  bossEn: { query: 'preset=late&stage=20&bot=expert&seed=3', lang: 'en-US', seconds: 90, record: [[86, 89.5]] },
  shelterEn: { query: 'preset=late&home=shelter', lang: 'en-US', seconds: 5, actions: [CLOSE], record: [[3, 5]] },
  rescueTest: { query: 'preset=fresh&stage=1&bot=player&seed=5&thumb=1', seconds: 14.4, record: [[12.9, 14.4]] },
  bossProbe: { query: 'preset=late&stage=20&bot=expert&seed=3&thumb=1', seconds: 150 },
};
