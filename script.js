/* =========================================================
   Фонетический разбор — интерактивный тренажёр для ребёнка
   ========================================================= */

// ---------- ДАННЫЕ ----------
const VOWELS = new Set(['а','о','у','ы','э','и','е','ё','ю','я']);

const VOICE_PAIRS = {
  'б':'п','в':'ф','г':'к','д':'т','ж':'ш','з':'с',
  'п':'б','ф':'в','к':'г','т':'д','ш':'ж','с':'з',
};

// Парные по мягкости/твёрдости
const SOFT_PAIRABLE = new Set(['б','в','г','д','з','к','л','м','н','п','р','с','т','ф','х']);
const UNPAIRED_SOFT = new Set(['ч','щ','й']);
const UNPAIRED_HARD = new Set(['ж','ш','ц']);

const SOFTENING = ['е','ё','и','ю','я','ь'];
const HARDENING = ['а','о','у','ы','э'];

// ---------- СОСТОЯНИЕ ----------
const state = {
  letter: '',
  isVowel: null,
  voiced: null,
  pairedVoice: null,
  pairVoiceLetter: '',
  soft: null,
  pairedSoft: null,
  pairSoftLetter: '',
  softStep: 0,
  stress: undefined,
};

const screens = [];
let currentIndex = -1;

const screenEl       = document.getElementById('screen');
const floatingShape  = document.getElementById('floating-shape');
const floatingLetter = document.getElementById('floating-letter');

// ---------- УТИЛИТЫ ----------
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
  ));
}

/**
 * Создаёт HTML фигуры с буквой и опциональным бейджем-парой.
 */
function makeShape(letter, { size = 'normal', forceWhite = false, badge = '', isVowel = null, voiced = null, soft = null } = {}) {
  let classes = ['shape-base'];
  let badgeHtml = '';

  if (forceWhite || (isVowel === null && voiced === null)) {
    // Белый круг по умолчанию
  } else {
    if (isVowel) {
      classes.push('vowel');
    } else if (voiced !== null) {
      classes.push(voiced ? 'tri' : 'sq');
      if (soft === true) classes.push('soft');
      else if (soft === false) classes.push('hard');
      else classes.push(voiced ? 'voiced' : 'deaf');
    }
  }

  if (size === 'big') classes.push('big');
  if (size === 'inline') classes.push('inline-shape');

  // Бейдж-кружок сверху (противоположный цвет)
  if (badge) {
    const badgeClass = soft !== null ? (soft ? 'hard' : 'soft') : (voiced ? 'deaf' : 'voiced');
    badgeHtml = `<span class="shape-badge ${badgeClass}">${esc(badge)}</span>`;
  }

  return `<span class="${classes.join(' ')}">${esc(letter)}${badgeHtml}</span>`;
}

function setFloatingShape() {
  floatingShape.className = 'floating-shape'; // Сброс
  if (!state.letter) { floatingShape.classList.add('hidden'); return; }
  floatingLetter.textContent = state.letter;

  if (state.isVowel === true) {
    floatingShape.classList.add('shape-base', 'vowel');
  } else if (state.isVowel === false) {
    if (state.voiced !== null) {
      floatingShape.classList.add('shape-base', state.voiced ? 'tri' : 'sq');
      if (state.soft === true) floatingShape.classList.add('soft');
      else if (state.soft === false) floatingShape.classList.add('hard');
      else floatingShape.classList.add(state.voiced ? 'voiced' : 'deaf');
    } else {
      floatingShape.classList.add('shape-base'); // Белый
    }
  } else {
    floatingShape.classList.add('shape-base'); // Белый
  }
}

// ---------- АНИМАЦИЯ ПЕРЕХОДА ----------
function goTo(newIndex, direction = 'forward') {
  const oldScreen = screenEl.firstElementChild;
  const finish = () => { currentIndex = newIndex; render(); };
  if (!oldScreen) { finish(); return; }

  oldScreen.classList.add(direction === 'forward' ? 'slide-out-left' : 'slide-out-right');
  setTimeout(() => {
    finish();
    const ns = screenEl.firstElementChild;
    if (ns) ns.classList.add(direction === 'forward' ? 'slide-in-right' : 'slide-in-left');
  }, 380);
}
function next() { goTo(currentIndex + 1, 'forward'); }

function render() {
  screenEl.innerHTML = '';
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= screens.length) currentIndex = screens.length - 1;
  screenEl.appendChild(screens[currentIndex]());
  setFloatingShape();
}

function resetState() {
  state.letter = '';
  state.isVowel = null;
  state.voiced = null;
  state.pairedVoice = null;
  state.pairVoiceLetter = '';
  state.soft = null;
  state.pairedSoft = null;
  state.pairSoftLetter = '';
  state.softStep = 0;
  state.stress = undefined;
}

// ---------- ПРОВЕРКА ОТВЕТОВ ----------
function bindYesNo(wrap, { onCorrect, correctIsYes, hintWrong }) {
  const yesBtn = wrap.querySelector('#yes');
  const noBtn  = wrap.querySelector('#no');
  const hint   = wrap.querySelector('#hint');

  function handle(chosenYes) {
    const isCorrect = chosenYes === correctIsYes;
    if (isCorrect) {
      (chosenYes ? yesBtn : noBtn).classList.add('correct');
      (chosenYes ? yesBtn : noBtn).classList.remove('wrong');
      yesBtn.disabled = true; noBtn.disabled = true;
      if (hint) {
        hint.textContent = 'Верно! 🎉';
        hint.classList.add('show', 'ok');
        hint.classList.remove('hidden');
      }
      setTimeout(() => onCorrect(), 700);
    } else {
      (chosenYes ? yesBtn : noBtn).classList.add('wrong');
      (chosenYes ? yesBtn : noBtn).classList.remove('correct');
      if (hint) {
        hint.textContent = hintWrong || 'Попробуй ещё раз.';
        hint.classList.add('show');
        hint.classList.remove('hidden', 'ok');
      }
      const rightBtn = correctIsYes ? yesBtn : noBtn;
      rightBtn.classList.add('pulse-hint');
      setTimeout(() => rightBtn.classList.remove('pulse-hint'), 2400);
      setTimeout(() => (chosenYes ? yesBtn : noBtn).classList.remove('wrong'), 900);
    }
  }

  yesBtn.addEventListener('click', () => handle(true));
  noBtn.addEventListener('click', () => handle(false));
}

// ---------- ЭКРАНЫ ----------

function screenLetterInput() {
  const wrap = el(`
    <div class="screen-inner">
      <span class="eyebrow">Шаг 1</span>
      <h1>Какая у вас буква?</h1>
      <h2>Введите ровно одну букву</h2>
      <input id="letter" class="letter-input" type="text" inputmode="text"
             maxlength="1" autocomplete="off" spellcheck="false" placeholder="?" />
      <button id="next" class="btn" disabled>Перейти к вопросам →</button>
    </div>
  `);
  const input = wrap.querySelector('#letter');
  const btn   = wrap.querySelector('#next');

  input.addEventListener('input', () => {
    let v = input.value.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '').toLowerCase();
    if (v.length > 1) v = v[0];
    v = mapLatinToCyrillic(v);
    input.value = v;
    btn.disabled = v.length !== 1;
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });
  btn.addEventListener('click', () => {
    const v = mapLatinToCyrillic((input.value || '').toLowerCase().trim());
    if (v.length !== 1) return;
    resetState();
    state.letter = v;
    next();
  });
  setTimeout(() => input.focus(), 60);
  return wrap;
}

function mapLatinToCyrillic(ch) {
  const map = { a:'а', b:'б', c:'ц', d:'д', e:'е', f:'ф', g:'г', h:'х', i:'и', j:'й', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'к', r:'р', s:'с', t:'т', u:'у', v:'в', w:'в', x:'х', y:'у', z:'з' };
  return map[ch] || ch;
}

// 1. Открытый рот -> Гласная/Согласная
function screenOpenMouthQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base">${esc(state.letter)}</div>
      <h1>Ваша буква ${makeShape(state.letter, { size: 'inline', forceWhite: true })} может быть сказана с открытым ртом, без использования языка?</h1>
      <h2>Попробуйте произнести её и почувствуйте</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да</button>
        <button class="btn btn-no"  id="no">Нет</button>
      </div>
      <div id="hint" class="hint-text"></div>
    </div>
  `);
  const correct = VOWELS.has(state.letter);
  bindYesNo(wrap, {
    correctIsYes: correct,
    hintWrong: correct ? 'Гласную можно пропеть с открытым ртом, язык не мешает.' : 'Язык или губы создают преграду — значит, буква согласная.',
    onCorrect: () => {
      state.isVowel = correct;
      if (correct) { screens[2] = screenVowelInfo; }
      else { screens[2] = screenConsonantInfo; }
      next();
    }
  });
  return wrap;
}

// 2-Г. Гласная
function screenVowelInfo() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base vowel flash">${esc(state.letter)}</div>
      <h1>Ваша буква гласная! 🎉</h1>
      <h2>Она тянется, не встречает преграды</h2>
      <p>Гласную можно петь. Давайте проверим ударение.</p>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => { screens[3] = screenStressQuestion; next(); });
  return wrap;
}

// 2-С. Согласная
function screenConsonantInfo() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base flash">${esc(state.letter)}</div>
      <h1>Ваша буква согласная!</h1>
      <h2>Она встречает преграду при произношении</h2>
      <p>Теперь узнаем, звонкая она или глухая.</p>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => { screens[3] = screenVoiceQuestion; next(); });
  return wrap;
}

// 3-Г. Ударение
function screenStressQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base vowel">${esc(state.letter)}</div>
      <h1>Позовите разборчивое слово — ${makeShape(state.letter, { size: 'inline', isVowel: true })} тянется?</h1>
      <h2>Ударная гласная звучит дольше и сильнее</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, тянется</button>
        <button class="btn btn-no"  id="no">Нет, не тянется</button>
      </div>
      <div id="hint" class="hint-text"></div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => { state.stress = 'ударная'; screens[4] = () => screenVowelResult(true); next(); });
  wrap.querySelector('#no').addEventListener('click', () => { state.stress = 'безударная'; screens[4] = () => screenVowelResult(false); next(); });
  return wrap;
}

// 4-Г. Итог гласной
function screenVowelResult(isStressed) {
  const word = isStressed ? 'ударная' : 'безударная';
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base vowel">${esc(state.letter)}</div>
      <h1>${makeShape(state.letter, { size: 'inline', isVowel: true })} ${word}!</h1>
      <h2>Получается: ${makeShape(state.letter, { size: 'inline', isVowel: true })} — гласная, ${word}.</h2>
      <div class="summary">
        <div class="summary-row"><span class="k">Тип</span><span class="v vowel">Гласная</span></div>
        <div class="summary-row"><span class="k">Ударение</span><span class="v">${word}</span></div>
      </div>
      <button class="btn" id="restart">Перейти к следующей букве ↺</button>
    </div>
  `);
  wrap.querySelector('#restart').addEventListener('click', () => { resetState(); goTo(0, 'back'); });
  return wrap;
}

// 3-С. Звонкость
function screenVoiceQuestion() {
  const isVoicedCorrect = !['п','ф','к','т','ш','с','х','ц','ч','щ'].includes(state.letter);

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base">${esc(state.letter)}</div>
      <h1>Произнося ${makeShape(state.letter, { size: 'inline', forceWhite: true })}, приложите руку к горлу. Чувствуете вибрацию?</h1>
      <h2>Если да — буква звонкая, если нет — глухая</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, чувствую</button>
        <button class="btn btn-no"  id="no">Нет вибрации</button>
      </div>
      <div id="hint" class="hint-text"></div>
    </div>
  `);
  bindYesNo(wrap, {
    correctIsYes: isVoicedCorrect,
    hintWrong: isVoicedCorrect ? 'Приложите руку к горлу и произнесите букву с голосом — должна быть вибрация.' : 'Горло не вибрирует — звук глухой, голосовые связки не работают.',
    onCorrect: () => {
      state.voiced = isVoicedCorrect;
      screens[4] = () => screenVoiceResult(isVoicedCorrect);
      next();
    }
  });
  return wrap;
}

// 4-С. Итог звонкости
function screenVoiceResult(isVoiced) {
  const word = isVoiced ? 'звонкая' : 'глухая';
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base ${isVoiced ? 'voiced tri' : 'deaf sq'} flash">${esc(state.letter)}</div>
      <h1>${makeShape(state.letter, { size: 'inline', voiced: isVoiced })} — ${word}!</h1>
      <h2>${isVoiced ? 'Голосовые связки вибрируют — это звонкий звук.' : 'Голосовые связки не вибрируют — это глухой звук.'}</h2>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => { screens[5] = screenVoicePairQuestion; next(); });
  return wrap;
}

// 4.5 Парность по звонкости
function screenVoicePairQuestion() {
  const correctPaired = Boolean(VOICE_PAIRS[state.letter]);
  const pairLetter = VOICE_PAIRS[state.letter] || '';

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base ${state.voiced ? 'voiced tri' : 'deaf sq'}">${esc(state.letter)}</div>
      <h1>Есть ли у буквы ${makeShape(state.letter, { size: 'inline', voiced: state.voiced })} пара по звонкости/глухости?</h1>
      <h2>Например, у «б» пара — «п», у «з» — «с»</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, есть</button>
        <button class="btn btn-no"  id="no">Нет, непарная</button>
      </div>
      <div id="hint" class="hint-text"></div>
    </div>
  `);
  bindYesNo(wrap, {
    correctIsYes: correctPaired,
    hintWrong: correctPaired ? `У этой буквы есть пара: «${pairLetter}».` : 'Эта буква не имеет пары по звонкости — она непарная.',
    onCorrect: () => {
      state.pairedVoice = correctPaired;
      state.pairVoiceLetter = correctPaired ? pairLetter : '';
      screens[6] = screenSoftnessLogic;
      next();
    }
  });
  return wrap;
}

// 5. Логика мягкости (проверка на непарность + вопросы)
function screenSoftnessLogic() {
  // Если непарная по мягкости — выводим объяснение и пропускаем вопросы
  if (UNPAIRED_SOFT.has(state.letter) || UNPAIRED_HARD.has(state.letter)) {
    state.soft = UNPAIRED_SOFT.has(state.letter);
    return screenUnpairedSoftnessInfo();
  }

  // Парная — задаем вопросы
  return screenSoftnessQuestion();
}

function screenUnpairedSoftnessInfo() {
  const isSoft = state.soft;
  const word = isSoft ? 'мягкая' : 'твёрдая';
  const colorCls = isSoft ? 'soft' : 'hard';
  const shapeCls = state.voiced ? 'tri' : 'sq';
  
  state.pairedSoft = false;
  state.pairSoftLetter = '';

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base ${colorCls} ${shapeCls} flash">${esc(state.letter)}</div>
      <h1>Ваша буква ${makeShape(state.letter, { size: 'inline', voiced: state.voiced, soft: state.soft })} всегда ${word}!</h1>
      <h2>У неё нет пары по мягкости/твёрдости.</h2>
      <p>Она ${word} при любых обстоятельствах, поэтому вопросы не нужны.</p>
      <button class="btn" id="next">Узнать итог →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => { screens[8] = screenFinal; next(); });
  return wrap;
}

const SOFT_QUESTION_SEQUENCE = ['е','ё','и','ю','я','ь','а','о','у','ы','э'];

function screenSoftnessQuestion() {
  if (state.soft !== null) return screenSoftnessResult();

  const ch = SOFT_QUESTION_SEQUENCE[state.softStep];
  if (!ch) {
    state.soft = false; // твёрдая
    return screenSoftnessResult();
  }

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base ${state.voiced ? 'voiced tri' : 'deaf sq'}">${esc(state.letter)}</div>
      <h1>После вашей ${makeShape(state.letter, { size: 'inline', voiced: state.voiced })} в слове есть буква «${esc(ch)}»?</h1>
      <h2>Проверяем, смягчает ли она ваш согласный</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, есть</button>
        <button class="btn btn-no"  id="no">Нет</button>
      </div>
      <div id="hint" class="hint-text"></div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => {
    if (SOFTENING.includes(ch)) state.soft = true;
    else state.soft = false;
    screens[7] = screenSoftnessResult;
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    state.softStep += 1;
    const newNode = screenSoftnessQuestion();
    screenEl.innerHTML = '';
    screenEl.appendChild(newNode);
    setFloatingShape();
  });
  return wrap;
}

// 6. Итог мягкости + пара
function screenSoftnessResult() {
  let pairSoft = '';
  let pairedSoft = false;

  if (state.soft === true) {
    if (SOFT_PAIRABLE.has(state.letter)) { pairedSoft = true; pairSoft = state.letter + ' (тв.)'; }
  } else {
    if (SOFT_PAIRABLE.has(state.letter)) { pairedSoft = true; pairSoft = state.letter + 'ь'; }
  }
  state.pairedSoft = pairedSoft;
  state.pairSoftLetter = pairedSoft ? pairSoft : '';

  const word = state.soft ? 'мягкая' : 'твёрдая';
  const colorCls = state.soft ? 'soft' : 'hard';
  const shapeCls = state.voiced ? 'tri' : 'sq';

  screens[8] = screenFinal;

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon shape-base ${colorCls} ${shapeCls} flash">${esc(state.letter)}</div>
      <h1>${makeShape(state.letter, { size: 'inline', voiced: state.voiced, soft: state.soft })} — ${word}!</h1>
      <h2>${state.soft ? 'Мягкость придаёт соседняя смягчающая буква (е, ё, и, ю, я или ь).' : 'Твёрдость — когда рядом нет смягчающей буквы.'}</h2>
      <button class="btn" id="next">Узнать итог →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => next());
  return wrap;
}

// 7. Финальный экран
function screenFinal() {
  const isVowel = state.isVowel;
  const voiceWord = state.voiced ? 'звонкая' : 'глухая';
  const voiceCls  = state.voiced ? 'voiced' : 'deaf';
  const voicePairWord = state.pairedVoice ? `парная (${state.pairVoiceLetter})` : 'непарная';

  const softWord = state.soft ? 'мягкая' : 'твёрдая';
  const softCls  = state.soft ? 'soft' : 'hard';
  const softPairWord = state.pairedSoft ? `парная (${state.pairSoftLetter})` : 'непарная';

  // Бейдж-кружок сверху (противоположный цвет)
  let badge = '';
  if (state.pairedSoft && state.pairSoftLetter) {
    badge = state.pairSoftLetter; 
  }

  const wrap = el(`
    <div class="screen-inner center">
      <div class="final-letter">
        ${makeShape(state.letter, { size: 'big', isVowel, voiced: state.voiced, soft: state.soft, badge })}
        ${state.pairSoftLetter ? `<div class="pair-small ${state.voiced ? 'tri' : 'sq'}" style="background: var(--${state.soft ? 'soft' : 'hard'})">${esc(state.pairSoftLetter)}</div>` : ''}
      </div>
      <h1 style="margin-top:28px;">Итог по букве ${esc(state.letter)}</h1>
      <div class="summary">
        ${isVowel
          ? `<div class="summary-row"><span class="k">Тип</span><span class="v vowel">Гласная</span></div>
             <div class="summary-row"><span class="k">Ударение</span><span class="v">${state.stress || '—'}</span></div>`
          : `<div class="summary-row"><span class="k">Тип</span><span class="v" style="color:var(--consonant)">Согласная</span></div>
             <div class="summary-row"><span class="k">Звонкость</span><span class="v ${voiceCls}">${voiceWord}</span></div>
             <div class="summary-row"><span class="k">Пара по звонкости</span><span class="v ${state.pairedVoice ? 'paired' : 'unpaired'}">${voicePairWord}</span></div>
             <div class="summary-row"><span class="k">Мягкость</span><span class="v ${softCls}">${softWord}</span></div>
             <div class="summary-row"><span class="k">Пара по мягкости</span><span class="v ${state.pairedSoft ? 'paired' : 'unpaired'}">${softPairWord}</span></div>`
        }
      </div>
      <button class="btn" id="restart">Перейти к следующей букве ↺</button>
    </div>
  `);
  wrap.querySelector('#restart').addEventListener('click', () => {
    resetState();
    screens[2] = screenVowelInfo;
    screens[3] = screenStressQuestion;
    screens[4] = () => screenVowelResult(true);
    screens[5] = screenVoicePairQuestion;
    screens[6] = screenSoftnessLogic;
    screens[7] = screenSoftnessResult;
    screens[8] = screenFinal;
    goTo(0, 'back');
  });
  return wrap;
}

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
screens.push(screenLetterInput);              // 0
screens.push(screenOpenMouthQuestion);        // 1
screens.push(screenVowelInfo);                // 2
screens.push(screenStressQuestion);           // 3
screens.push(() => screenVowelResult(true));  // 4
screens.push(screenVoicePairQuestion);        // 5
screens.push(screenSoftnessLogic);            // 6
screens.push(screenSoftnessResult);           // 7
screens.push(screenFinal);                    // 8

currentIndex = 0;
render();
