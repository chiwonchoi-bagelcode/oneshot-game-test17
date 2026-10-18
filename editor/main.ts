// Level editor (development tool). One screen: stage list + rooms on the left,
// the room canvas in the middle (drag to place/move, paint terrain), properties
// on the right. Validate runs the same checks as tools/validate.ts plus quick
// bot playthroughs; Test play opens the dev build on the edited level.
import levelsData from 'virtual:levels';
import { MONSTERS, ROOM, SPECIES, STAGE_COUNT, type MonsterKind, type SpeciesId } from '../src/config/balance';
import { OBSTACLES } from '../src/data/obstacles';
import { draw, frame, loadAtlases } from '../src/engine/atlas';
import { buildBackground } from '../src/render/background';
import { validateLevel, type Issue } from '../src/sim/validate';
import { simulateStage, ZERO_META } from '../src/sim/playthrough';
import { BOT_EXPERT, BOT_PLAYER } from '../src/sim/bot';
import type { LevelDef, LevelRoom, Region } from '../src/sim/types';

type Sel = { kind: 'monster' | 'animal' | 'obstacle' | 'goo' | 'start'; i: number } | null;
type Tool = 'select' | 'monster' | 'animal' | 'obstacle' | 'goo' | 'terrain' | 'erase';

const STORE = 'splash-editor-levels';
let levels: LevelDef[] = load();
let cur = 0, room = 0, sel: Sel = null, tool: Tool = 'select';
let brush = { monster: 'blob' as MonsterKind, animal: 'puppy' as SpeciesId, obstacle: 'tree', terrain: '#', wave: 0 };
let bg: HTMLCanvasElement | null = null; let bgKey = '';
let issues: Issue[] = [];
let dirty = false;
const cv = document.getElementById('room') as HTMLCanvasElement;
const ctx = cv.getContext('2d')!;
const K = 0.75; // canvas px per world unit
cv.width = ROOM.width * K; cv.height = ROOM.height * K;

function load(): LevelDef[] {
  try { const s = localStorage.getItem(STORE); if (s) return JSON.parse(s); } catch { /* fall back */ }
  return JSON.parse(JSON.stringify(levelsData)).sort((a: LevelDef, b: LevelDef) => a.stage - b.stage);
}
function persist() { dirty = true; try { localStorage.setItem(STORE, JSON.stringify(levels)); } catch { /* full */ } }
const L = () => levels[cur];
const R = (): LevelRoom => L().rooms[room];
const $ = (id: string) => document.getElementById(id)!;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag); Object.assign(e, props); for (const k of kids) e.append(k); return e;
}

// ---------------------------------------------------------------- lists
function renderList() {
  const list = $('levels'); list.replaceChildren();
  levels.forEach((lv, i) => {
    const b = el('button', { className: 'lv' + (i === cur ? ' on' : ''), onclick: () => { cur = i; room = 0; sel = null; refresh(); } },
      el('b', {}, `${lv.stage}`), ` ${lv.id}`, el('small', {}, ` · ${lv.rooms.length} rooms${lv.boss ? ' · boss' : ''}${lv.intro ? ' · new ' + lv.intro : ''}`));
    list.append(b);
  });
  const tabs = $('rooms'); tabs.replaceChildren();
  L().rooms.forEach((_, i) => tabs.append(el('button', { className: 'tab' + (i === room ? ' on' : ''), onclick: () => { room = i; sel = null; refresh(); } }, `Room ${i + 1}`)));
  tabs.append(el('button', { className: 'tab add', title: 'Add room (copy of current)', onclick: () => { L().rooms.splice(room + 1, 0, JSON.parse(JSON.stringify(R()))); room++; persist(); refresh(); } }, '+'));
  if (L().rooms.length > 1) tabs.append(el('button', { className: 'tab del', title: 'Delete room', onclick: () => { if (confirm('Delete this room?')) { L().rooms.splice(room, 1); room = Math.max(0, room - 1); persist(); refresh(); } } }, '×'));
}

function renderPalette() {
  const p = $('palette'); p.replaceChildren();
  const toolBtn = (t: Tool, label: string) => el('button', { className: 'tool' + (tool === t ? ' on' : ''), onclick: () => { tool = t; renderPalette(); } }, label);
  p.append(toolBtn('select', 'Select / Move'), toolBtn('monster', 'Goo'), toolBtn('animal', 'Animal'), toolBtn('obstacle', 'Obstacle'), toolBtn('goo', 'Goo floor'), toolBtn('terrain', 'Paint terrain'), toolBtn('erase', 'Erase'));
  const sub = el('div', { className: 'sub' });
  const pick = (items: string[], curv: string, set: (v: string) => void, sprite?: (v: string) => string) => items.map((v) => {
    const b = el('button', { className: 'chip' + (v === curv ? ' on' : ''), onclick: () => { set(v); renderPalette(); } });
    if (sprite) { const c = el('canvas', { width: 36, height: 36 }); const g = c.getContext('2d')!; g.setTransform(1, 0, 0, 1, 18, 30); draw(g, sprite(v), 0, 0, 0.3); b.append(c); }
    b.append(el('span', {}, v)); return b;
  });
  if (tool === 'monster') { sub.append(...pick(Object.keys(MONSTERS), brush.monster, (v) => (brush.monster = v as MonsterKind), (v) => v === 'boss' ? `m_boss_${L().region}_normal` : v === 'flyer' ? 'm_flyer_normal_0' : `m_${v}_normal`)); sub.append(el('label', {}, 'wave ', el('input', { type: 'number', min: 0, max: 3, value: brush.wave, onchange: (e: Event) => (brush.wave = Number((e.target as HTMLInputElement).value)) }))); }
  if (tool === 'animal') sub.append(...pick(SPECIES.map((s) => s.id), brush.animal, (v) => (brush.animal = v as SpeciesId), (v) => `a_${v}_idle_0`));
  if (tool === 'obstacle') sub.append(...pick(Object.keys(OBSTACLES), brush.obstacle, (v) => (brush.obstacle = v), (v) => OBSTACLES[v].sprite));
  if (tool === 'terrain') sub.append(...pick(['.', '#', 'c', 's', 'w'], brush.terrain, (v) => (brush.terrain = v)).map((b, i) => { b.title = ['grass', 'dirt path', 'cobble', 'sand', 'water (blocks walking)'][i]; return b; }));
  p.append(sub);
}

function renderProps() {
  const p = $('props'); p.replaceChildren();
  const lv = L();
  const field = (label: string, value: string | number, on: (v: string) => void, type = 'text') => el('label', { className: 'f' }, label, el('input', { type, value: String(value), onchange: (e: Event) => { on((e.target as HTMLInputElement).value); persist(); refresh(); } }));
  p.append(el('h3', {}, 'Stage'),
    field('id', lv.id, (v) => (lv.id = v)), field('stage #', lv.stage, (v) => (lv.stage = Number(v)), 'number'),
    el('label', { className: 'f' }, 'region', (() => { const s = el('select', { onchange: (e: Event) => { lv.region = (e.target as HTMLSelectElement).value as Region; bgKey = ''; persist(); refresh(); } }); for (const r of ['forest', 'village', 'lake']) s.append(el('option', { value: r, selected: lv.region === r }, r)); return s; })()),
    field('intro goo', lv.intro ?? '', (v) => (lv.intro = (v || undefined) as MonsterKind | undefined)),
    field('difficulty tier', lv.tier ?? '', (v) => (lv.tier = v ? Number(v) : undefined), 'number'),
    el('label', { className: 'f' }, 'boss stage', el('input', { type: 'checkbox', checked: !!lv.boss, onchange: (e: Event) => { lv.boss = (e.target as HTMLInputElement).checked || undefined; persist(); refresh(); } })));
  if (!sel) { p.append(el('p', { className: 'hint' }, 'Click an item to edit it. Drag to move. Delete key removes it. Mouse wheel on goo floor changes its size.')); return; }
  const r = R();
  p.append(el('h3', {}, `Selected ${sel.kind}`));
  const obj = (sel.kind === 'monster' ? r.monsters : sel.kind === 'animal' ? r.animals : sel.kind === 'obstacle' ? r.obstacles : sel.kind === 'goo' ? r.goo : [r.start ?? { x: 288, y: 860 }])[sel.i] as unknown as Record<string, number | string>;
  if (!obj) return;
  for (const k of Object.keys(obj)) p.append(field(k, obj[k], (v) => { obj[k] = isNaN(Number(v)) || k === 't' || k === 's' ? v : Number(v); }, typeof obj[k] === 'number' ? 'number' : 'text'));
  if (sel.kind === 'monster') { if (!('w' in obj)) p.append(field('w (wave)', 0, (v) => (obj.w = Number(v)), 'number')); if (!('v' in obj)) p.append(field('v (variant)', 0, (v) => (obj.v = Number(v)), 'number')); }
}

function renderIssues() {
  const box = $('issues'); box.replaceChildren();
  if (!issues.length) { box.append(el('div', { className: 'ok' }, 'No problems found.')); return; }
  for (const i of issues) box.append(el('div', { className: i.level }, `${i.level === 'error' ? '✖' : '!'} ${i.room >= 0 ? `Room ${i.room + 1}: ` : ''}${i.msg}`));
}

function refresh() { renderList(); renderPalette(); renderProps(); issues = validateLevel(L()); renderIssues(); drawRoom(); }

// ---------------------------------------------------------------- canvas
function drawRoom() {
  const r = R(); const key = JSON.stringify(r.terrain) + L().region + cur + ':' + room;
  if (key !== bgKey) { bg = buildBackground(r, L().region, `${L().id}:${room}`, K); bgKey = key; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.drawImage(bg!, 0, 0);
  ctx.setTransform(K, 0, 0, K, 0, 0);
  for (const [i, g] of r.goo.entries()) {
    ctx.fillStyle = 'rgba(180,120,235,0.55)'; ctx.strokeStyle = sel?.kind === 'goo' && sel.i === i ? '#fff' : 'rgba(110,60,170,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  const items: { y: number; f: () => void }[] = [];
  r.obstacles.forEach((o, i) => { const d = OBSTACLES[o.t]; if (d) items.push({ y: o.y, f: () => { draw(ctx, d.sprite, o.x, o.y + d.foot, 1); if (sel?.kind === 'obstacle' && sel.i === i) ring(o.x, o.y, (d.r ?? Math.max(d.w ?? 30, d.h ?? 30) / 2) + 6); } }); });
  r.monsters.forEach((m, i) => items.push({ y: m.y, f: () => { const def = MONSTERS[m.t]; draw(ctx, m.t === 'boss' ? `m_boss_${L().region}_normal` : m.t === 'flyer' ? 'm_flyer_normal_0' : `m_${m.t}_normal`, m.x, m.y + def.r * 0.6, 1, false, 0, (m.w ?? 0) > 0 ? 0.65 : 1); if (m.w) label(`w${m.w}`, m.x, m.y - def.r - 6); if (m.v) label('v1', m.x + def.r, m.y); if (sel?.kind === 'monster' && sel.i === i) ring(m.x, m.y, def.r + 6); } }));
  r.animals.forEach((a, i) => items.push({ y: a.y, f: () => { draw(ctx, `a_${a.s}_trapped_0`, a.x, a.y + 28, 1.05); draw(ctx, 'cocoon_0', a.x, a.y + 32, 1, false, 0, 0.6); if (sel?.kind === 'animal' && sel.i === i) ring(a.x, a.y, 36); } }));
  items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
  const st = r.start ?? { x: 288, y: 860 };
  draw(ctx, 'kid_idle_0', st.x, st.y + 6, 0.9); if (sel?.kind === 'start') ring(st.x, st.y, 26);
  draw(ctx, 'gate_posts', ROOM.width / 2, ROOM.wall + 6, 1);
  // play-area border + issue markers
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeRect(ROOM.wall, ROOM.wall, ROOM.width - ROOM.wall * 2, ROOM.height - ROOM.wall * 2); ctx.setLineDash([]);
  for (const i of issues) { const m = i.msg.match(/\((\d+),(\d+)\)/); if (m && i.room === room) { ctx.strokeStyle = i.level === 'error' ? '#ff3b3b' : '#ffb000'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(+m[1], +m[2], 40, 0, Math.PI * 2); ctx.stroke(); } }
}
function ring(x: number, y: number, r: number) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
function label(s: string, x: number, y: number) { ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, y); ctx.fillStyle = '#ffe066'; ctx.fillText(s, x, y); }

function world(e: PointerEvent): [number, number] { const b = cv.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * ROOM.width, ((e.clientY - b.top) / b.height) * ROOM.height]; }

function hit(x: number, y: number): Sel {
  const r = R(); const st = r.start ?? { x: 288, y: 860 };
  if (Math.hypot(st.x - x, st.y - y) < 26) return { kind: 'start', i: 0 };
  for (let i = r.monsters.length - 1; i >= 0; i--) if (Math.hypot(r.monsters[i].x - x, r.monsters[i].y - y) < MONSTERS[r.monsters[i].t].r + 8) return { kind: 'monster', i };
  for (let i = r.animals.length - 1; i >= 0; i--) if (Math.hypot(r.animals[i].x - x, r.animals[i].y - y) < 36) return { kind: 'animal', i };
  for (let i = r.obstacles.length - 1; i >= 0; i--) { const d = OBSTACLES[r.obstacles[i].t]; const rr = d.r ?? Math.max(d.w ?? 30, d.h ?? 30) / 2; if (Math.hypot(r.obstacles[i].x - x, r.obstacles[i].y - y) < rr + 6) return { kind: 'obstacle', i }; }
  for (let i = r.goo.length - 1; i >= 0; i--) if (Math.hypot(r.goo[i].x - x, r.goo[i].y - y) < r.goo[i].r) return { kind: 'goo', i };
  return null;
}

function target(s: Sel): { x: number; y: number } | null {
  if (!s) return null; const r = R();
  if (s.kind === 'start') { r.start ||= { x: 288, y: 860 }; return r.start; }
  return (s.kind === 'monster' ? r.monsters : s.kind === 'animal' ? r.animals : s.kind === 'obstacle' ? r.obstacles : r.goo)[s.i] ?? null;
}

function remove(s: Sel) {
  if (!s || s.kind === 'start') return; const r = R();
  (s.kind === 'monster' ? r.monsters : s.kind === 'animal' ? r.animals : s.kind === 'obstacle' ? r.obstacles : r.goo).splice(s.i, 1);
}

function paint(x: number, y: number) {
  const r = R(); const cols = ROOM.width / ROOM.tile, rows = ROOM.height / ROOM.tile;
  r.terrain ||= Array.from({ length: rows }, () => '.'.repeat(cols));
  const c = Math.floor(x / ROOM.tile), rr = Math.floor(y / ROOM.tile);
  if (c < 0 || rr < 0 || c >= cols || rr >= rows) return;
  const line = r.terrain[rr].split(''); if (line[c] === brush.terrain) return; line[c] = brush.terrain; r.terrain[rr] = line.join('');
  drawRoom();
}

let dragging: { s: Sel; ox: number; oy: number } | null = null; let painting = false;
cv.addEventListener('pointerdown', (e) => {
  const [x, y] = world(e); cv.setPointerCapture(e.pointerId);
  const r = R(); const rx = Math.round(x), ry = Math.round(y);
  if (tool === 'terrain') { painting = true; paint(x, y); return; }
  if (tool === 'erase') { remove(hit(x, y)); sel = null; persist(); refresh(); return; }
  if (tool === 'monster') { const m: { t: MonsterKind; x: number; y: number; w?: number } = { t: brush.monster, x: rx, y: ry }; if (brush.wave) m.w = brush.wave; r.monsters.push(m); sel = { kind: 'monster', i: r.monsters.length - 1 }; }
  else if (tool === 'animal') { r.animals.push({ s: brush.animal, x: rx, y: ry }); sel = { kind: 'animal', i: r.animals.length - 1 }; }
  else if (tool === 'obstacle') { r.obstacles.push({ t: brush.obstacle, x: rx, y: ry }); sel = { kind: 'obstacle', i: r.obstacles.length - 1 }; }
  else if (tool === 'goo') { r.goo.push({ x: rx, y: ry, r: 70 }); sel = { kind: 'goo', i: r.goo.length - 1 }; }
  else sel = hit(x, y);
  const t = target(sel); if (t) dragging = { s: sel, ox: t.x - x, oy: t.y - y };
  persist(); refresh();
});
cv.addEventListener('pointermove', (e) => {
  const [x, y] = world(e);
  if (painting) { paint(x, y); return; }
  if (!dragging) return; const t = target(dragging.s); if (!t) return;
  t.x = Math.round(Math.max(0, Math.min(ROOM.width, x + dragging.ox))); t.y = Math.round(Math.max(0, Math.min(ROOM.height, y + dragging.oy)));
  drawRoom();
});
cv.addEventListener('pointerup', () => { if (dragging || painting) { persist(); refresh(); } dragging = null; painting = false; });
cv.addEventListener('wheel', (e) => { if (sel?.kind === 'goo') { e.preventDefault(); const g = R().goo[sel.i]; g.r = Math.max(20, Math.min(240, g.r - Math.sign(e.deltaY) * 5)); persist(); drawRoom(); renderProps(); } }, { passive: false });
window.addEventListener('keydown', (e) => {
  if ((e.target as HTMLElement).tagName === 'INPUT') return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { remove(sel); sel = null; persist(); refresh(); }
  if (e.key === 'd' && sel && sel.kind !== 'start') { const t = target(sel)!; const r = R(); const copy = { ...t, x: t.x + 30, y: t.y + 30 }; (sel.kind === 'monster' ? r.monsters : sel.kind === 'animal' ? r.animals : sel.kind === 'obstacle' ? r.obstacles : r.goo).push(copy as never); persist(); refresh(); }
});

// ---------------------------------------------------------------- actions
$('validate').onclick = async () => {
  issues = validateLevel(L()); renderIssues();
  const box = $('issues');
  if (issues.some((i) => i.level === 'error')) return;
  box.append(el('div', { className: 'run' }, 'Running bot playthroughs…'));
  await new Promise((r) => setTimeout(r, 30));
  let profile: Record<string, unknown> = {};
  try { profile = JSON.parse((await (await fetch('profile.json')).text())).stages ?? {}; } catch { /* zero power */ }
  const meta = (profile[String(L().stage)] as typeof ZERO_META) ?? ZERO_META;
  const res: string[] = [];
  for (const bot of [BOT_EXPERT, BOT_PLAYER]) {
    let wins = 0, t = 0;
    for (let s = 1; s <= 3; s++) { const r = simulateStage(L(), meta, bot, s * 13); if (r.cleared) wins++; t += r.time; }
    res.push(`${bot.name}: cleared ${wins}/3, avg ${Math.round(t / 3)}s`);
  }
  box.lastChild!.textContent = 'Bots at the expected power — ' + res.join(' · ');
};
$('test').onclick = () => { localStorage.setItem('splash-editor-test', JSON.stringify({ level: L(), room })); window.open('dev.html?editor=1', '_blank'); };
$('export').onclick = () => download(`stage-${String(L().stage).padStart(2, '0')}.json`, JSON.stringify(L(), null, 1));
$('exportAll').onclick = () => download('levels.json', JSON.stringify(levels, null, 1));
$('reset').onclick = () => { if (confirm('Discard local edits and reload the built-in levels?')) { localStorage.removeItem(STORE); levels = JSON.parse(JSON.stringify(levelsData)).sort((a: LevelDef, b: LevelDef) => a.stage - b.stage); cur = 0; room = 0; sel = null; refresh(); } };
$('newStage').onclick = () => { const lv: LevelDef = { id: `custom-${levels.length + 1}`, stage: Math.min(STAGE_COUNT + 1, levels.length + 1), region: 'forest', rooms: [{ obstacles: [], goo: [], monsters: [{ t: 'blob', x: 288, y: 400 }], animals: [], start: { x: 288, y: 860 } }] }; levels.push(lv); cur = levels.length - 1; room = 0; persist(); refresh(); };
($('import') as HTMLInputElement).onchange = async (e) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const list: LevelDef[] = Array.isArray(data) ? data : [data];
    for (const lv of list) { const i = levels.findIndex((x) => x.stage === lv.stage); if (i >= 0) levels[i] = lv; else levels.push(lv); }
    levels.sort((a, b) => a.stage - b.stage); persist(); refresh();
  } catch (err) { alert('Could not read that file: ' + (err as Error).message); }
};
function download(name: string, text: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); URL.revokeObjectURL(a.href); dirty = false; }
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); } });

loadAtlases(() => {}).then(() => { refresh(); void frame; });
