:root {
  --bg: #f5f7ff;
  --bg-alt: #ffffff;
  --text: #1f2a44;
  --muted: #6b7a99;
  --accent: #5b8def;
  --accent-dark: #3f6fd8;
  --ok: #2fc18c;
  --warn: #ff8a5b;
  --vowel: #ff6b9a;
  --consonant: #5b8def;
  --voiced: #7a5cff;
  --deaf: #7f8ca6;
  --soft: #2fc18c;
  --hard: #5b8def;
  --shadow: 0 12px 30px rgba(31, 42, 68, 0.12);
  --radius: 22px;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Nunito', system-ui, -apple-system, sans-serif;
  background: radial-gradient(1200px 800px at 20% 0%, #e8eeff 0%, var(--bg) 60%);
  color: var(--text);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 120px;
  position: relative;
}

.screen {
  width: min(640px, 100%);
  background: var(--bg-alt);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px 32px;
  position: relative;
  overflow: hidden;
  animation: screenIn 0.5s cubic-bezier(.22,1,.36,1);
}

/* --- Анимация "листания" экранов --- */
.screen.slide-out-left {
  animation: slideOutLeft 0.42s cubic-bezier(.6,0,.4,1) forwards;
}
.screen.slide-in-right {
  animation: slideInRight 0.5s cubic-bezier(.22,1,.36,1);
}
.screen.slide-out-right {
  animation: slideOutRight 0.42s cubic-bezier(.6,0,.4,1) forwards;
}
.screen.slide-in-left {
  animation: slideInLeft 0.5s cubic-bezier(.22,1,.36,1);
}

@keyframes screenIn {
  from { opacity: 0; transform: translateY(20px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slideOutLeft {
  to { opacity: 0; transform: translateX(-80px) rotate(-2deg); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(80px) rotate(2deg); }
  to   { opacity: 1; transform: translateX(0) rotate(0); }
}
@keyframes slideOutRight {
  to { opacity: 0; transform: translateX(80px) rotate(2deg); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-80px) rotate(-2deg); }
  to   { opacity: 1; transform: translateX(0) rotate(0); }
}

/* --- Заголовки и текст --- */
h1 {
  font-size: clamp(1.4rem, 3.4vw, 1.8rem);
  font-weight: 900;
  margin: 0 0 8px;
  line-height: 1.25;
  animation: fadeUp .5s .05s both;
}
h2 {
  font-size: clamp(1.15rem, 2.6vw, 1.4rem);
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--muted);
  animation: fadeUp .5s .1s both;
}
p {
  font-size: 1.05rem;
  line-height: 1.5;
  animation: fadeUp .5s .15s both;
}
.eyebrow {
  display: inline-block;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
  animation: fadeUp .5s both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* --- Поле ввода буквы --- */
.letter-input {
  width: 100%;
  font-family: 'Nunito', sans-serif;
  font-size: 2.6rem;
  font-weight: 900;
  text-align: center;
  text-transform: lowercase;
  padding: 18px 14px;
  border: 3px dashed #cfd8ef;
  border-radius: 18px;
  background: #f8faff;
  color: var(--text);
  outline: none;
  transition: border-color .25s, box-shadow .25s, background .25s;
  animation: fadeUp .5s .2s both;
}
.letter-input:focus {
  border-color: var(--accent);
  background: #fff;
  box-shadow: 0 0 0 6px rgba(91, 141, 239, 0.14);
}
.letter-input::placeholder {
  color: #c3cde4;
  font-weight: 700;
}

/* --- Кнопки --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 22px;
  margin-top: 14px;
  font-family: 'Nunito', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: .02em;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  box-shadow: 0 8px 20px rgba(91, 141, 239, 0.35);
  transition: transform .18s ease, box-shadow .18s ease, opacity .2s, filter .2s;
  animation: fadeUp .5s .25s both;
}
.btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 12px 26px rgba(91, 141, 239, 0.45);
}
.btn:active:not(:disabled) {
  transform: translateY(0) scale(.99);
}
.btn:disabled {
  opacity: .4;
  cursor: not-allowed;
  filter: grayscale(.35);
  box-shadow: none;
}

.btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 26px;
}
.btn-yes {
  background: linear-gradient(135deg, #2fc18c 0%, #23a577 100%);
  box-shadow: 0 8px 20px rgba(47, 193, 140, 0.35);
}
.btn-yes:hover:not(:disabled) {
  box-shadow: 0 12px 26px rgba(47, 193, 140, 0.5);
}
.btn-no {
  background: linear-gradient(135deg, #ff8a5b 0%, #e56c3d 100%);
  box-shadow: 0 8px 20px rgba(255, 138, 91, 0.35);
}
.btn-no:hover:not(:disabled) {
  box-shadow: 0 12px 26px rgba(255, 138, 91, 0.5);
}
.btn-ghost {
  background: #eef2fc;
  color: var(--accent-dark);
  box-shadow: none;
}
.btn-ghost:hover:not(:disabled) {
  background: #e0e8fb;
  box-shadow: none;
}

/* --- Плавающая фигура --- */
.floating-shape {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 74px;
  height: 74px;
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  background: var(--consonant);
  border-radius: 50%;
  box-shadow: 0 10px 26px rgba(31, 42, 68, 0.22);
  transition: border-radius .55s cubic-bezier(.68,-0.55,.27,1.55),
              background .5s ease,
              transform .4s ease;
  z-index: 50;
}
.floating-shape.hidden {
  opacity: 0;
  transform: scale(.4) translateY(-14px);
  pointer-events: none;
}
.floating-shape.shape-circle  { border-radius: 50%; }
.floating-shape.shape-triangle {
  border-radius: 0;
  clip-path: polygon(50% 4%, 96% 92%, 4% 92%);
}
.floating-shape.shape-square {
  border-radius: 14px;
}
.floating-shape.vowel   { background: var(--vowel); }
.floating-shape.consonant { background: var(--consonant); }
.floating-shape.voiced  { background: var(--voiced); }
.floating-shape.deaf    { background: var(--deaf); }
.floating-shape.soft    { background: var(--soft); }
.floating-shape.hard    { background: var(--hard); }

.floating-shape span#floating-letter {
  display: block;
  transform: translateY(1px);
}

.pair-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  display: grid;
  place-items: center;
  font-size: .95rem;
  font-weight: 900;
  color: #fff;
  background: #1f2a44;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,.25);
  animation: popIn .45s cubic-bezier(.68,-0.55,.27,1.55);
}
.pair-badge.hidden { display: none; }

@keyframes popIn {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

/* --- Итоги --- */
.summary {
  margin-top: 22px;
  display: grid;
  gap: 10px;
  animation: fadeUp .5s .2s both;
}
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f4f7ff;
  border-radius: 14px;
  font-weight: 700;
}
.summary-row .k { color: var(--muted); font-weight: 700; }
.summary-row .v { color: var(--text); font-weight: 900; }
.summary-row .v.vowel   { color: var(--vowel); }
.summary-row .v.voiced  { color: var(--voiced); }
.summary-row .v.deaf    { color: var(--deaf); }
.summary-row .v.soft    { color: var(--soft); }
.summary-row .v.hard    { color: var(--hard); }
.summary-row .v.paired  { color: var(--accent); }
.summary-row .v.unpaired { color: var(--muted); }

/* --- Крупная буква в вопросе --- */
.inline-shape {
  display: inline-grid;
  place-items: center;
  width: 1.6em;
  height: 1.6em;
  margin: 0 .15em;
  font-weight: 900;
  color: #fff;
  background: var(--consonant);
  border-radius: 50%;
  vertical-align: middle;
  transition: border-radius .5s cubic-bezier(.68,-0.55,.27,1.55),
              background .4s;
}
.inline-shape.tri { border-radius: 0; clip-path: polygon(50% 6%, 95% 94%, 5% 94%); }
.inline-shape.sq  { border-radius: 14px; }
.inline-shape.vowel { background: var(--vowel); }
.inline-shape.voiced { background: var(--voiced); }
.inline-shape.deaf { background: var(--deaf); }
.inline-shape.soft { background: var(--soft); }
.inline-shape.hard { background: var(--hard); }

.letter-icon {
  display: inline-grid;
  place-items: center;
  width: 78px;
  height: 78px;
  margin: 0 auto 18px;
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  background: var(--consonant);
  border-radius: 50%;
  box-shadow: 0 10px 24px rgba(31,42,68,.2);
  transition: border-radius .55s cubic-bezier(.68,-0.55,.27,1.55),
              background .4s;
  animation: popIn .5s;
}
.letter-icon.tri { border-radius: 0; clip-path: polygon(50% 6%, 95% 94%, 5% 94%); }
.letter-icon.sq  { border-radius: 16px; }
.letter-icon.vowel { background: var(--vowel); }
.letter-icon.voiced { background: var(--voiced); }
.letter-icon.deaf { background: var(--deaf); }
.letter-icon.soft { background: var(--soft); }
.letter-icon.hard { background: var(--hard); }

.center { text-align: center; }

/* --- Финальное слово с "маленькой парой" внизу --- */
.final-letter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: popIn .5s;
}
.final-letter .big {
  width: 92px; height: 92px;
  display: grid; place-items: center;
  font-size: 2.6rem; font-weight: 900; color: #fff;
  border-radius: 50%;
  transition: border-radius .55s cubic-bezier(.68,-0.55,.27,1.55),
              background .4s;
}
.final-letter .big.tri { border-radius: 0; clip-path: polygon(50% 6%, 95% 94%, 5% 94%); }
.final-letter .big.sq  { border-radius: 18px; }
.final-letter .big.vowel { background: var(--vowel); }
.final-letter .big.voiced { background: var(--voiced); }
.final-letter .big.deaf { background: var(--deaf); }
.final-letter .big.soft { background: var(--soft); }
.final-letter .big.hard { background: var(--hard); }

.final-letter .pair-small {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  font-size: 1rem; font-weight: 900; color: #fff;
  background: #1f2a44;
  border-radius: 50%;
  animation: popIn .5s;
}
.final-letter .pair-small.tri { border-radius: 0; clip-path: polygon(50% 6%, 95% 94%, 5% 94%); }
.final-letter .pair-small.sq  { border-radius: 8px; }
.final-letter .pair-small.soft { background: var(--soft); }
.final-letter .pair-small.hard { background: var(--hard); }

/* --- Прогресс-точки --- */
.dots {
  display: flex;
  gap: 6px;
  margin-top: 26px;
  justify-content: center;
}
.dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #d8e0f3;
  transition: background .3s, transform .3s;
}
.dots span.active {
  background: var(--accent);
  transform: scale(1.35);
}

/* --- Мобильная адаптация --- */
@media (max-width: 480px) {
  .screen { padding: 28px 20px 24px; border-radius: 18px; }
  .floating-shape { width: 60px; height: 60px; font-size: 1.6rem; top: 12px; right: 12px; }
  .letter-input { font-size: 2.1rem; }
  .btn { font-size: 1rem; padding: 14px 18px; }
  #app { padding-bottom: 140px; align-items: flex-start; padding-top: 84px; }
}
