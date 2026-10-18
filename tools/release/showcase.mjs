// Writes out/release/index.html: the release kit on one page (trailer with
// subtitle tracks, screenshots, icon, feature graphic, store text in both
// languages, plan and report). Markdown is rendered here (marked) so the page is static.
// Usage: node tools/release/showcase.mjs   (after the release files exist)
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { marked } from 'marked';

const R = 'out/release';
// markdown → HTML with marked; wide tables get a scroll wrapper for phones
const md = (src) => marked.parse(src).replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');

const EVIDENCE = [
  ['ui-audit.jpg', 'UI 자동 검사 화면 일부 (22화면 × 2폰 × 2언어)', 'UI audit sample (22 screens × 2 phones × 2 languages)'],
  ['qa-small-ko.jpg', '처음 하는 사람 여정: 작은 폰 · 한국어', 'First-timer journey: small phone · Korean'],
  ['qa-large-en.jpg', '처음 하는 사람 여정: 큰 폰 · 영어', 'First-timer journey: large phone · English'],
  ['qa-small-en.jpg', '처음 하는 사람 여정: 작은 폰 · 영어', 'First-timer journey: small phone · English'],
  ['qa-large-ko.jpg', '처음 하는 사람 여정: 큰 폰 · 한국어', 'First-timer journey: large phone · Korean'],
  ['trailer-review.jpg', '트레일러 구간별 검토 (처음·중간·끝 프레임)', 'Trailer review by segment (start, middle, end)'],
  ['rescue-pop.jpg', '구출 순간: 동물이 효과 위로 튀어나옴', 'Rescue: the animal pops out above the effects'],
  ['editor.jpg', '레벨 에디터', 'Level editor'],
].filter(([f]) => existsSync(`${R}/evidence/${f}`));
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const shots = existsSync(`${R}/screenshots`) ? readdirSync(`${R}/screenshots`).filter((f) => f.endsWith('.png')).sort() : [];
const mb = (p) => (existsSync(p) ? (statSync(p).size / 1e6).toFixed(1) + ' MB' : '');
const storeKo = md(read(`${R}/store/ko.md`).replace(/^# .*\n/, ''));
const storeEn = md(read(`${R}/store/en.md`).replace(/^# .*\n/, ''));
const plan = md(read(`${R}/plan.md`));
const report = md(read(`${R}/report.md`));

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>물총 구조대 · 출시 키트</title>
<meta name="description" content="물총 구조대(Splash Rescue) 출시 키트: 트레일러, 스크린샷, 아이콘, 스토어 문구, 기획서, 결과 보고서">
<link rel="icon" href="icon-512.png">
<style>
:root { --ink: #3a2416; --ink2: #6b4a32; --paper: #fffaf0; --cream: #fff3d6; --blue: #2a62b8; --sky: #e3f4ff; --line: #e7d3b0; --accent: #ffcf3d; --bg: #f4fbff; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #f5ead8; --ink2: #cdb79c; --paper: #2a211b; --cream: #33281f; --blue: #8cc6ff; --sky: #1d2b38; --line: #4a3a2c; --bg: #171310; } }
:root[data-theme="dark"] { --ink: #f5ead8; --ink2: #cdb79c; --paper: #2a211b; --cream: #33281f; --blue: #8cc6ff; --sky: #1d2b38; --line: #4a3a2c; --bg: #171310; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.6 system-ui, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; word-break: keep-all; overflow-wrap: break-word; }
a { color: var(--blue); }
header { background: linear-gradient(#5cc4ff, #c8f0ff); color: #23314a; }
.hero { max-width: 1080px; margin: 0 auto; padding: 28px 16px 24px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
.hero img.icon { width: 96px; height: 96px; border-radius: 22px; box-shadow: 0 4px 0 rgba(30,40,80,.25); }
.hero h1 { margin: 0; font-size: 34px; line-height: 1.15; }
.hero p { margin: 4px 0 0; }
.hero .grow { flex: 1; min-width: 220px; }
.lang { display: flex; gap: 6px; }
.lang button { min-width: 56px; min-height: 44px; border-radius: 22px; border: 2px solid #23314a; background: #fff; font-weight: 700; cursor: pointer; color: #23314a; }
.lang button[aria-pressed="true"] { background: #ffcf3d; }
main { max-width: 1080px; margin: 0 auto; padding: 8px 16px 64px; }
section { margin-top: 36px; }
h2 { font-size: 24px; margin: 0 0 12px; }
h3 { font-size: 19px; margin: 22px 0 8px; }
h4, h5 { font-size: 16px; margin: 16px 0 6px; }
.links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.links a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 22px; background: var(--paper); border: 2px solid var(--line); text-decoration: none; color: var(--ink); font-weight: 600; }
.links a.primary { background: #ffcf3d; border-color: #d9951f; color: #3a2416; }
.media { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 24px; align-items: start; }
@media (max-width: 760px) { .media { grid-template-columns: 1fr; } }
video { width: 100%; max-width: 360px; aspect-ratio: 9 / 16; border-radius: 18px; background: #000; display: block; }
.note { color: var(--ink2); font-size: 14px; }
.feature { width: 100%; border-radius: 14px; display: block; }
.shots { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 760px) { .shots { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.shots img { width: 100%; border-radius: 12px; display: block; }
.card { background: var(--paper); border: 2px solid var(--line); border-radius: 18px; padding: 8px 18px 14px; }
.doc { background: var(--paper); border: 2px solid var(--line); border-radius: 18px; padding: 4px 18px 18px; }
details.doc > summary { cursor: pointer; font-weight: 700; font-size: 18px; padding: 12px 0; min-height: 44px; }
.tbl { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; margin: 8px 0; }
th, td { border: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: var(--cream); }
code { background: var(--cream); padding: 1px 5px; border-radius: 6px; font-size: 13px; }
pre { overflow-x: auto; background: var(--cream); padding: 10px; border-radius: 10px; }
blockquote { margin: 8px 0; padding: 6px 12px; border-left: 4px solid var(--accent); color: var(--ink2); }
.files td:first-child { white-space: nowrap; }
html[lang="ko"] [data-l="en"], html[lang="en"] [data-l="ko"] { display: none !important; }
.evidence { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 760px) { .evidence { grid-template-columns: 1fr; } }
.evidence a { display: block; background: var(--paper); border: 2px solid var(--line); border-radius: 14px; padding: 8px; text-decoration: none; color: var(--ink); }
.evidence img { width: 100%; height: 160px; object-fit: cover; object-position: top; border-radius: 8px; display: block; }
.evidence span { display: block; font-size: 14px; margin-top: 6px; }
</style>
</head>
<body>
<header>
  <div class="hero">
    <img class="icon" src="icon-512.png" alt="">
    <div class="grow">
      <h1><span data-l="ko">물총 구조대</span><span data-l="en">Splash Rescue</span></h1>
      <p><span data-l="ko">엄지 하나로 끈적이를 씻어 내고 갇힌 동물을 구하는 물총 액션 · 출시 키트</span><span data-l="en">One-thumb water-gun action: wash away goo, rescue animals · Release kit</span></p>
    </div>
    <div class="lang" role="group" aria-label="Language">
      <button type="button" data-set="ko" aria-pressed="true">한국어</button>
      <button type="button" data-set="en" aria-pressed="false">English</button>
    </div>
  </div>
</header>
<main>
  <div class="links">
    <a class="primary" href="../index.html"><span data-l="ko">게임 플레이</span><span data-l="en">Play the game</span></a>
    <a href="../editor.html"><span data-l="ko">레벨 에디터</span><span data-l="en">Level editor</span></a>
    <a href="plan.md"><span data-l="ko">기획서 (md)</span><span data-l="en">Plan (md, Korean)</span></a>
    <a href="report.md"><span data-l="ko">결과 보고서 (md)</span><span data-l="en">Report (md, Korean)</span></a>
  </div>

  <section>
    <h2><span data-l="ko">트레일러</span><span data-l="en">Trailer</span></h2>
    <div class="media">
      <video id="trailer" controls playsinline preload="metadata" poster="trailer-poster.jpg">
        <source src="trailer.mp4" type="video/mp4">
        <track kind="subtitles" src="subtitles/trailer.ko.vtt" srclang="ko" label="한국어" default>
        <track kind="subtitles" src="subtitles/trailer.en.vtt" srclang="en" label="English">
      </video>
      <div>
        <p data-l="ko">처음 3초는 새로 설치한 상태에서 1구역 첫 판을 실제로 플레이한 장면입니다(끈적이 물방울 피하기 → 멈춰서 쏘기 → 끈적이가 씻겨 나감 → 강아지 구출). 나머지도 모두 게임 화면을 그대로 녹화했고, 소리는 게임이 그 순간 낸 효과음과 배경음을 그대로 섞었습니다. 마지막 엔드 카드만 게임 스프라이트로 따로 그렸습니다.</p>
        <p data-l="en">The first 3 seconds are real footage of a fresh install's first run of area 1 (dodging a goo droplet → stopping to spray → the goo washing away → the puppy freed). Everything else is also recorded straight from the game, with the sound effects and music the game played at those moments. Only the end card is drawn separately, from the game's sprites.</p>
        <p class="note">H.264 · 1080×1920 · 30 fps · ${mb(`${R}/trailer.mp4`)} · <span data-l="ko">자막: 한국어, 영어 (vtt/srt, 영상 안 자막 트랙 포함)</span><span data-l="en">Subtitles: Korean, English (vtt/srt, also embedded as tracks)</span></p>
        <img class="feature" src="feature-1024x500.png" alt="">
        <p class="note"><span data-l="ko">대표 이미지 1024×500 · 아이콘 512×512</span><span data-l="en">Feature graphic 1024×500 · Icon 512×512</span></p>
      </div>
    </div>
  </section>

  <section>
    <h2><span data-l="ko">스크린샷</span><span data-l="en">Screenshots</span></h2>
    <div class="shots" data-l="ko">${shots.filter((s) => s.startsWith('ko-')).map((s) => `<img src="screenshots/${s}" alt="" loading="lazy">`).join('')}</div>
    <div class="shots" data-l="en">${shots.filter((s) => s.startsWith('en-')).map((s) => `<img src="screenshots/${s}" alt="" loading="lazy">`).join('')}</div>
  </section>

  <section>
    <h2><span data-l="ko">스토어 문구</span><span data-l="en">Store listing</span></h2>
    <div class="card" data-l="ko">${storeKo}</div>
    <div class="card" data-l="en">${storeEn}</div>
  </section>

  <section>
    <h2><span data-l="ko">점검 근거</span><span data-l="en">Check evidence</span></h2>
    <div class="evidence">${EVIDENCE.map(([f, ko, en]) => `<a href="evidence/${f}"><img src="evidence/${f}" alt="" loading="lazy"><span data-l="ko">${ko}</span><span data-l="en">${en}</span></a>`).join('')}</div>
    <p class="note">${['validate.txt', 'progression.txt', 'art-check.txt', 'ui-audit.txt', 'perf-1x.txt', 'perf-4x.txt', 'perf-auto-4x.txt', 'audio-lifecycle.txt', 'trailer-review.md'].filter((f) => existsSync(`${R}/evidence/${f}`)).map((f) => `<a href="evidence/${f}">${f}</a>`).join(' · ')}</p>
  </section>

  <section>
    <h2><span data-l="ko">문서</span><span data-l="en">Documents</span></h2>
    <p class="note" data-l="en">The plan and the report are written in Korean.</p>
    <details class="doc"><summary><span data-l="ko">결과 보고서</span><span data-l="en">Report</span></summary>${report}</details>
    <details class="doc" style="margin-top:12px"><summary><span data-l="ko">기획서</span><span data-l="en">Plan</span></summary>${plan}</details>
  </section>
</main>
<script>
(function () {
  var root = document.documentElement, video = document.getElementById('trailer');
  function set(l) {
    root.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === l)); });
    if (video && video.textTracks) for (var i = 0; i < video.textTracks.length; i++) video.textTracks[i].mode = video.textTracks[i].language === l ? 'showing' : 'disabled';
    try { localStorage.setItem('kit-lang', l); } catch (e) {}
  }
  document.querySelectorAll('.lang button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.set); }); });
  var saved = null; try { saved = localStorage.getItem('kit-lang'); } catch (e) {}
  set(saved || ((navigator.language || 'en').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en'));
})();
</script>
</body>
</html>
`;
writeFileSync(`${R}/index.html`, html);
console.log('showcase written:', shots.length, 'screenshots');
