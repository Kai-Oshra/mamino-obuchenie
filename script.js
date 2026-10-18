/* =========================================================
   Фонетический разбор — интерактивный тренажёр для ребёнка
   ========================================================= */

// ---------- ДАННЫЕ ----------
const VOWELS = new Set(['а','о','у','ы','э','и','е','ё','ю','я']);

// Парные по звонкости/глухости (без непарных)
const VOICE_PAIRS = {
  'б':'п', 'в':'ф', 'г':'к', 'д':'т', 'ж':'ш', 'з':'с',
  'п':'б', 'ф':'в', 'к':'г', 'т':'д', 'ш':'ж', 'с':'з',
};
const UNPAIRED_VOICED = new Set(['й','л','м','н','р']);
const UNPAIRED_DEAF   = new Set(['х','ц','ч','щ']);

// Парные по мягкости/твёрдости
const SOFT_PAIRS = {
  'б':'бь','в':'вь','г':'гь','д':'дь','з':'зь','к':'кь','л':'ль','м':'мь',
  'н':'нь','п':'пь','р':'рь','с':'сь','т':'ть','ф':'фь','х':'хь',
  // обратное направление — упрощённо, для отображения «пары»
  'бь':'б','вь':'в','гь':'г','дь':'д','зь':'з','кь':'к','ль':'л','мь':'м',
  'нь':'н','пь':'п','рь':'р','сь':'с','ть':'т','фь':'ф','хь':'х',
};
// Согласные, у которых есть пара по мягкости/твёрдости
const SOFT_PAIRABLE = new Set(['б','в','г','д','з','к','л','м','н','п','р','с','т','ф','х']);
const UNPAIRED_SOFT  = new Set(['ч','щ','й']);
const UNPAIRED_HARD  = new Set(['ж','ш','ц']);

// Гласные, смягчающие предыдущий согласный
const SOFTENING_VOWELS = ['е','ё','и','ю','я'];
// Все гласные для «после буквы есть ...?»
const ALL_VOWELS = ['а','о','у','ы','э','и','е','ё','ю','я'];

// ---------- СОСТОЯНИЕ ----------
const state = {
  letter: '',          // исходная буква (нижний регистр)
  isVowel: null,       // bool
  voiced: null,        // bool (для согласных)
  pairedVoice: null,   // bool — есть ли пара по звонкости
  pairVoiceLetter: '',
  soft: null,          // bool (для согласных) — мягкая ли
  pairedSoft: null,    // bool — есть ли пара по мягкости
  pairSoftLetter: '',
  step: 0,             // для точек прогресса
};

const screens = [];
let currentIndex = -1;

// ---------- DOM ----------
const screenEl       = document.getElementById('screen');
const floatingShape  = document.getElementById('floating-shape');
const floatingLetter = document.getElementById('floating-letter');
const pairBadge      = document.getElementById('pair-badge');

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

// «Кружок» с буквой внутри текста
function shapeSpan(extraClass = '') {
  const isVowel = state.isVowel;
  const shapeClass = isVowel
    ? ''
    : state.voiced === true ? 'tri'
    : state.voiced === false ? 'sq'
    : '';
  const colorClass = isVowel ? 'vowel'
    : state.voiced === true ? 'voiced'
    : state.voiced === false ? 'deaf'
    : '';
  // Для гласной — оставляем круг; для согласных — форма + цвет
  const cls = ['inline-shape', shapeClass, colorClass, extraClass].filter(Boolean).join(' ');
  return `<span class="${cls}">${esc(state.letter)}</span>`;
}

function setFloatingShape() {
  floatingShape.classList.remove('hidden','shape-circle','shape-triangle','shape-square',
    'vowel','consonant','voiced','deaf','soft','hard');

  if (!state.letter) { floatingShape.classList.add('hidden'); return; }

  floatingLetter.textContent = state.letter;

  if (state.isVowel) {
    floatingShape.classList.add('shape-circle','vowel');
    if (state.soft !== null) {
      // гласная: ударение — не отображаем формой, но цвет оставим
    }
  } else {
    // согласная
    const shape = state.voiced === true ? 'shape-triangle'
                 : state.voiced === false ? 'shape-square'
                 : 'shape-circle';
    floatingShape.classList.add(shape);
    floatingShape.classList.add(state.voiced === true ? 'voiced' : state.voiced === false ? 'deaf' : 'consonant');

    // Если определили мягкость/твёрдость — перекрашиваем
    if (state.soft === true)  floatingShape.classList.add('soft');
    if (state.soft === false) floatingShape.classList.add('hard');
  }

  // Бейдж-пара
  if (state.pairSoftLetter) {
    pairBadge.textContent = state.pairSoftLetter;
    pairBadge.classList.remove('hidden');
    // цвет бейджа по цвету пары
    pairBadge.style.background = '';
  } else if (state.pairVoiceLetter) {
    pairBadge.textContent = state.pairVoiceLetter;
    pairBadge.classList.remove('hidden');
  } else {
    pairBadge.classList.add('hidden');
  }
}

// ---------- АНИМАЦИЯ ПЕРЕХОДА ----------
function goTo(newIndex, direction = 'forward') {
  const oldScreen = screenEl.firstElementChild;
  const finish = () => {
    currentIndex = newIndex;
    render();
  };

  if (!oldScreen) { finish(); return; }

  oldScreen.classList.add(direction === 'forward' ? 'slide-out-left' : 'slide-out-right');
  setTimeout(() => {
    finish();
    const newScreen = screenEl.firstElementChild;
    if (newScreen) {
      newScreen.classList.add(direction === 'forward' ? 'slide-in-right' : 'slide-in-left');
    }
  }, 380);
}

function next() { goTo(currentIndex + 1, 'forward'); }
function back() { goTo(currentIndex - 1, 'back'); }

// ---------- РЕНДЕР ----------
function render() {
  screenEl.innerHTML = '';

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= screens.length) currentIndex = screens.length - 1;

  const factory = screens[currentIndex];
  const node = factory();
  screenEl.appendChild(node);
  setFloatingShape();
}

// ---------- СБРОС / СТАРТ ----------
function resetState() {
  state.letter = '';
  state.isVowel = null;
  state.voiced = null;
  state.pairedVoice = null;
  state.pairVoiceLetter = '';
  state.soft = null;
  state.pairedSoft = null;
  state.pairSoftLetter = '';
  state.step = 0;
}

// ---------- ЭКРАНЫ ----------

// 1. Ввод буквы
function screenLetterInput() {
  const wrap = el(`
    <div class="screen-inner">
      <span class="eyebrow">Шаг 1</span>
      <h1>Какая у вас буква?</h1>
      <h2>Введите ровно одну букву</h2>
      <input id="letter" class="letter-input" type="text" inputmode="text"
             maxlength="1" autocomplete="off" spellcheck="false"
             placeholder="?" aria-label="Введите одну букву" />
      <button id="next" class="btn" disabled>Перейти к вопросам →</button>
    </div>
  `);

  const input = wrap.querySelector('#letter');
  const btn = wrap.querySelector('#next');

  // Ограничение ввода: только одна буква (латиница/кириллица)
  input.addEventListener('input', () => {
    let v = input.value;
    // оставляем только буквы (кириллица, латиница)
    v = v.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
    // берём первый символ
    if (v.length > 1) v = v[0];
    // латиницу конвертируем в кириллицу по визуальному соответствию
    v = v.toLowerCase();
    v = mapLatinToCyrillic(v);
    input.value = v;
    btn.disabled = v.length !== 1;
  });

  // Enter = нажать кнопку
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });

  btn.addEventListener('click', () => {
    const v = mapLatinToCyrillic((input.value || '').toLowerCase().trim());
    if (v.length !== 1) return;
    resetState();
    state.letter = v;
    // Определяем, гласная ли
    state.isVowel = VOWELS.has(v);
    // Сбрасываем "мягкие" варианты для гласных
    next();
  });

  setTimeout(() => input.focus(), 60);
  return wrap;
}

// Утилита: если родитель введёт латиницу — превратим в кириллицу
function mapLatinToCyrillic(ch) {
  const map = {
    a:'а', b:'б', c:'ц', d:'д', e:'е', f:'ф', g:'г', h:'х', i:'и',
    j:'й', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'к', r:'р',
    s:'с', t:'т', u:'у', v:'в', w:'в', x:'х', y:'у', z:'з',
  };
  return map[ch] || ch;
}

// 2. Вопрос "может быть сказана с открытым ртом?"
function screenOpenMouthQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon ${state.isVowel ? 'vowel' : ''}">${esc(state.letter)}</div>
      <h1>Ваша буква ${shapeSpan()} может быть сказана с открытым ртом, без использования языка?</h1>
      <h2>Попробуйте произнести её и почувствуйте</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да</button>
        <button class="btn btn-no"  id="no">Нет</button>
      </div>
    </div>
  `);

  wrap.querySelector('#yes').addEventListener('click', () => {
    state.isVowel = true;
    // заменяем следующий экран в зависимости от ответа
    screens[2] = screenVowelInfo;      // "Ваша буква гласная!"
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    state.isVowel = false;
    screens[2] = screenConsonantInfo;  // "Ваша буква согласная!"
    next();
  });

  return wrap;
}

// 3-Г. Гласная — промежуточный экран
function screenVowelInfo() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon vowel">${esc(state.letter)}</div>
      <h1>Ваша буква гласная! 🎉</h1>
      <h2>Она тянется, не встречает преграды</h2>
      <p>Гласную можно петь. Давайте проверим ударение.</p>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => {
    screens[3] = screenStressQuestion;
    next();
  });
  return wrap;
}

// 3-С. Согласная — промежуточный экран
function screenConsonantInfo() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon">${esc(state.letter)}</div>
      <h1>Ваша буква согласная!</h1>
      <h2>Она встречает преграду при произношении</h2>
      <p>Теперь узнаем, звонкая она или глухая.</p>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => {
    screens[3] = screenVoiceQuestion;
    next();
  });
  return wrap;
}

// 4. Вопрос про ударение (для гласных)
function screenStressQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon vowel">${esc(state.letter)}</div>
      <h1>Позовите разбираемое слово — ${shapeSpan()} тянется?</h1>
      <h2>Ударная гласная звучит дольше и сильнее</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, тянется</button>
        <button class="btn btn-no"  id="no">Нет, не тянется</button>
      </div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => {
    screens[4] = () => screenVowelResult(true);
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    screens[4] = () => screenVowelResult(false);
    next();
  });
  return wrap;
}

// 5-Г. Итог для гласной
function screenVowelResult(isStressed) {
  const stressWord = isStressed ? 'ударная' : 'безударная';
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon vowel">${esc(state.letter)}</div>
      <h1>${shapeSpan()} ${stressWord}!</h1>
      <h2>Получается: ${shapeSpan()} — гласная, ${stressWord}.</h2>
      <div class="summary">
        <div class="summary-row"><span class="k">Тип</span><span class="v vowel">Гласная</span></div>
        <div class="summary-row"><span class="k">Ударение</span><span class="v">${stressWord}</span></div>
      </div>
      <button class="btn" id="restart">Перейти к следующей букве ↺</button>
    </div>
  `);
  wrap.querySelector('#restart').addEventListener('click', () => {
    resetState();
    screens[2] = screenVowelInfo;
    screens[3] = screenStressQuestion;
    screens[4] = () => screenVowelResult(true);
    goTo(0, 'back');
  });
  return wrap;
}

// 4-С. Вопрос про вибрацию (звонкость)
function screenVoiceQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon">${esc(state.letter)}</div>
      <h1>Произнося ${shapeSpan()}, приложите руку к горлу. Чувствуете вибрацию?</h1>
      <h2>Если да — буква звонкая, если нет — глухая</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, чувствую</button>
        <button class="btn btn-no"  id="no">Нет вибрации</button>
      </div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => {
    state.voiced = true;
    screens[4] = () => screenVoiceResult(true);
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    state.voiced = false;
    screens[4] = () => screenVoiceResult(false);
    next();
  });
  return wrap;
}

// 5-С. Итог по звонкости + переход к парности по звонкости
function screenVoiceResult(isVoiced) {
  const word = isVoiced ? 'звонкая' : 'глухая';
  const cls = isVoiced ? 'voiced' : 'deaf';
  const shapeCls = isVoiced ? 'tri' : 'sq';

  // Проверим, есть ли у буквы пара по звонкости
  const pair = VOICE_PAIRS[state.letter] || '';
  state.pairedVoice = Boolean(pair);
  state.pairVoiceLetter = pair;

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon ${cls} ${shapeCls}">${esc(state.letter)}</div>
      <h1>${shapeSpan()} — ${word}!</h1>
      <h2>${isVoiced
        ? 'Голосовые связки вибрируют — это звонкий звук.'
        : 'Голосовые связки не вибрируют — это глухой звук.'}</h2>
      <button class="btn" id="next">Дальше →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => {
    // Следующий вопрос — про пару по звонкости
    screens[5] = screenVoicePairQuestion;
    next();
  });
  return wrap;
}

// 5.5 Вопрос про парность по звонкости/глухости
function screenVoicePairQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon ${state.voiced ? 'voiced tri' : 'deaf sq'}">${esc(state.letter)}</div>
      <h1>Есть ли у буквы ${shapeSpan()} пара по звонкости/глухости?</h1>
      <h2>Например, у «б» пара — «п», у «з» — «с»</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, есть</button>
        <button class="btn btn-no"  id="no">Нет, непарная</button>
      </div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => {
    state.pairedVoice = true;
    screens[6] = screenSoftnessQuestion;
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    state.pairedVoice = false;
    state.pairVoiceLetter = '';
    screens[6] = screenSoftnessQuestion;
    next();
  });
  return wrap;
}

// 6. Вопрос о мягкости/твёрдости через гласные
// Здесь цикл: спрашиваем «После вашей буквы есть буква X?» для всех смягчающих гласных,
// потом для Ь, потом для остальных гласных. Если всё «нет» — твёрдая.
const SOFT_QUESTION_SEQUENCE = ['е','ё','и','ю','я','ь','а','о','у','ы','э'];

function screenSoftnessQuestion() {
  // Текущий шаг в последовательности храним в state.softStep
  if (state.softStep === undefined) state.softStep = 0;
  // Если уже определили мягкость — не спрашиваем
  if (state.soft !== null) return screenSoftnessResult();

  const ch = SOFT_QUESTION_SEQUENCE[state.softStep];
  if (!ch) {
    // Все «нет» — буква твёрдая
    state.soft = false;
    return screenSoftnessResult();
  }

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon ${state.voiced ? 'voiced tri' : 'deaf sq'}">${esc(state.letter)}</div>
      <h1>После вашей ${shapeSpan()} в слове есть буква «${esc(ch)}»?</h1>
      <h2>Проверяем, смягчает ли она ваш согласный</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да, есть</button>
        <button class="btn btn-no"  id="no">Нет</button>
      </div>
    </div>
  `);
  wrap.querySelector('#yes').addEventListener('click', () => {
    // Если это смягчающая гласная или Ь — буква мягкая
    if (['е','ё','и','ю','я','ь'].includes(ch)) {
      state.soft = true;
    } else {
      // а, о, у, ы, э — твёрдая
      state.soft = false;
    }
    screens[7] = screenSoftnessResult;
    next();
  });
  wrap.querySelector('#no').addEventListener('click', () => {
    state.softStep += 1;
    // перерисовываем этот же экран
    const newNode = screenSoftnessQuestion();
    screenEl.innerHTML = '';
    screenEl.appendChild(newNode);
    setFloatingShape();
  });

  return wrap;
}

// 7. Экран результата по мягкости/твёрдости и парности
function screenSoftnessResult() {
  // Определяем парность по мягкости
  let pairSoft = '';
  let pairedSoft = false;
  if (state.soft === true) {
    // мягкая: есть ли у неё твёрдая пара?
    if (SOFT_PAIRABLE.has(state.letter)) { pairedSoft = true; pairSoft = state.letter + ' (тв.)'; }
    else { pairedSoft = false; }
  } else {
    // твёрдая: есть ли у неё мягкая пара?
    if (SOFT_PAIRABLE.has(state.letter)) { pairedSoft = true; pairSoft = state.letter + 'ь'; }
    else { pairedSoft = false; }
  }
  state.pairedSoft = pairedSoft;
  state.pairSoftLetter = pairedSoft ? pairSoft : '';

  const word = state.soft ? 'мягкая' : 'твёрдая';
  const colorCls = state.soft ? 'soft' : 'hard';
  const shapeCls = state.voiced ? 'tri' : 'sq';

  // Дальше — финальный экран
  screens[8] = screenFinal;

  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon ${colorCls} ${shapeCls}">${esc(state.letter)}</div>
      <h1>${shapeSpan()} — ${word}!</h1>
      <h2>${state.soft
        ? 'Мягкость придаёт соседняя смягчающая буква (е, ё, и, ю, я или ь).'
        : 'Твёрдость — когда рядом нет смягчающей буквы.'}</h2>
      <button class="btn" id="next">Узнать итог →</button>
    </div>
  `);
  wrap.querySelector('#next').addEventListener('click', () => next());
  return wrap;
}

// 8. Финальный экран со всеми свойствами
function screenFinal() {
  const isVowel = state.isVowel;
  const voiceWord = state.voiced === true ? 'звонкая' : state.voiced === false ? 'глухая' : '—';
  const voiceCls  = state.voiced === true ? 'voiced' : state.voiced === false ? 'deaf' : '';
  const voicePairWord = state.pairedVoice ? `есть (${state.pairVoiceLetter})` : 'непарная';

  const softWord = state.soft === true ? 'мягкая' : state.soft === false ? 'твёрдая' : '—';
  const softCls  = state.soft === true ? 'soft' : state.soft === false ? 'hard' : '';
  const softPairWord = state.pairedSoft ? `есть (${state.pairSoftLetter})` : 'непарная';

  const bigShapeClass = isVowel ? 'vowel'
    : state.voiced === true ? 'voiced tri'
    : state.voiced === false ? 'deaf sq'
    : 'consonant';

  const smallPairClass = state.soft === true ? 'soft' : state.soft === false ? 'hard' : '';

  const wrap = el(`
    <div class="screen-inner center">
      <div class="final-letter">
        <div class="big ${bigShapeClass}">${esc(state.letter)}</div>
        ${state.pairSoftLetter
          ? `<div class="pair-small ${smallPairClass} ${state.voiced ? 'tri' : 'sq'}">${esc(state.pairSoftLetter)}</div>`
          : ''}
      </div>
      <h1 style="margin-top:18px;">Итог по букве ${esc(state.letter)}</h1>
      <div class="summary">
        ${isVowel
          ? `<div class="summary-row"><span class="k">Тип</span><span class="v vowel">Гласная</span></div>
             <div class="summary-row"><span class="k">Ударение</span><span class="v">${state.stressedWord || '—'}</span></div>`
          : `<div class="summary-row"><span class="k">Тип</span><span class="v consonant">Согласная</span></div>
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
    // Сброс
    state.softStep = 0;
    screens[2] = screenVowelInfo;
    screens[3] = screenStressQuestion;
    screens[4] = () => screenVowelResult(true);
    screens[5] = screenVoicePairQuestion;
    screens[6] = screenSoftnessQuestion;
    screens[7] = screenSoftnessResult;
    screens[8] = screenFinal;
    resetState();
    goTo(0, 'back');
  });
  return wrap;
}

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
screens.push(screenLetterInput);          // 0
screens.push(screenOpenMouthQuestion);    // 1
screens.push(screenVowelInfo);            // 2 (заменяется динамически)
screens.push(screenStressQuestion);       // 3 (заменяется)
screens.push(() => screenVowelResult(true)); // 4 (заменяется)
screens.push(screenVoicePairQuestion);    // 5 (заменяется)
screens.push(screenSoftnessQuestion);     // 6
screens.push(screenSoftnessResult);       // 7
screens.push(screenFinal);                // 8

currentIndex = 0;
render();
