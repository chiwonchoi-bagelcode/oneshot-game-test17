// How thick a stream is drawn. The real width (used for hits) keeps compounding
// with tier, upgrades, cards and pressure; on screen it grows 1:1 while small
// (early upgrades must read as a big jump) and then eases toward a ceiling, so a
// late-game cannon looks mighty without hiding the room behind a wall of water.
export function visualWidth(w: number): number {
  return w < 30 ? w : 30 + 26 * (1 - Math.exp(-(w - 30) / 45));
}
