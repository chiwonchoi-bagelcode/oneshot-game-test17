// Footage takes for the trailer and store screenshots. Every take is real play:
// the player bot drives the same input path as a thumb (shown with ?thumb), and
// menus are clicked like a person would. Times come from probe runs
// (node tools/trailer/capture.mjs <take> --probe prints the timeline).
// seconds = game time to run, record = [from, to] ranges saved as frames.
const BUY = '.btn.up-buy.ok';
const CLOSE = { at: 0.9, click: '.modal-back .btn-close' }; // the daily stamp card shows on hub arrival
export const TAKES = {
  // a fresh install's very first run of area 1 (tutorial hints on)
  first: { query: 'preset=fresh&stage=1&bot=player&seed=5&thumb=1', seconds: 28.6, record: [[3.6, 6], [10.8, 15], [22, 28.6]] },
  // the first result screen: the rows come in, then a thumb scrolls to the
  // upgrades and buys two (the buttons start below the fold on a phone)
  result: {
    query: 'preset=fresh&stage=1&bot=player&seed=5&thumb=1', seconds: 52.8, record: [[45.6, 52.8]],
    actions: [
      ...Array.from({ length: 12 }, (_, i) => ({ at: 49.3 + i * 0.05, eval: "document.querySelector('.res-body').scrollBy(0, 46)" })),
      { at: 50.3, click: `.res-up ${BUY}` }, { at: 50.95, click: `.res-up ${BUY}` },
    ],
  },
  // a few runs in: two more upgrades evolve the water gun
  evolve: {
    query: 'preset=day1&home=upgrade', seconds: 8.5,
    actions: [CLOSE, { at: 2.0, click: `.page-up ${BUY}` }, { at: 3.2, click: `.page-up ${BUY}` }],
  },
  // later: the village boss with a fully grown water cannon
  // (the bot sprays the boss without a break from 74.2 to 79.2 s, and wins at 90.2 s)
  boss: { query: 'preset=late&stage=20&bot=expert&seed=3', seconds: 92, record: [[74, 80], [88.8, 92]] },
  // the shelter with the rescued friends
  shelter: { query: 'preset=late&home=shelter', seconds: 7, actions: [CLOSE] },
  // English UI versions of the screenshot moments (same seeds, so the same play)
  firstEn: { query: 'preset=fresh&stage=1&bot=player&seed=5', lang: 'en-US', seconds: 14, record: [[11.9, 14]] },
  bossEn: { query: 'preset=late&stage=20&bot=expert&seed=3', lang: 'en-US', seconds: 80, record: [[75, 80]] },
  shelterEn: { query: 'preset=late&home=shelter', lang: 'en-US', seconds: 5, actions: [CLOSE], record: [[3, 5]] },
};
