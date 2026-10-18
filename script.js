/* =========================================================
   Фонетический разбор — интерактивный тренажёр для ребёнка
   + проверка ответов с реакцией
   ========================================================= */

// ---------- ДАННЫЕ ----------
const VOWELS = new Set(['а','о','у','ы','э','и','е','ё','ю','я']);

const VOICE_PAIRS = {
  'б':'п','в':'ф','г':'к','д':'т','ж':'ш','з':'с',
  'п':'б','ф':'в','к':'г','т':'д','ш':'ж','с':'з',
};
const UNPAIRED_VOICED = new Set(['й','л','м','н','р']);
const UNPAIRED_DEAF   = new Set(['х','ц','ч','щ']);

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
};

const screens = [];
let currentIndex = -1;

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

/**
 * Возвращает HTML-кружок/треугольник/квадрат с буквой.
 * По умолчанию — БЕЛЫЙ с чёрным контуром.
 * Цвет появляется только после определения свойств.
 */
function shapeSpan(extraClass = '') {
  const cls = ['inline-shape'];

  if (state.isVowel) {
    // гласная: круг, розовый, только когда уже знаем
    if (state.isVowel === true && state.stress !== undefined) {
      cls.push('vowel', 'is-filled');
    }
  } else if (state.voiced !== null) {
    // согласная: форма и цвет по звонкости
    cls.push(state.voiced ? 'tri' : 'sq');
    cls.push(state.voiced ? 'voiced' : 'deaf', 'is-filled');
    // мягкость перекрашивает
    if (state.soft === true) { cls.pop(); cls.pop(); cls.push('soft', 'is-filled'); }
    if (state.soft === false) { cls.pop(); cls.pop(); cls.push('hard', 'is-filled'); }
  }

  if (extraClass) cls.push(extraClass);
  return `<span class="${cls.join(' ')}">${esc(state.letter)}</span>`;
}

function setFloatingShape() {
  floatingShape.classList.remove(
    'hidden','tri','sq','vowel','voiced','deaf','soft','hard','consonant','is-filled'
  );

  if (!state.letter) { floatingShape.classList.add('hidden'); return; }
  floatingLetter.textContent = state.letter;

  // базовая белая фигура — если свойств ещё нет
  if (state.isVowel === true) {
    floatingShape.classList.add('vowel','is-filled');
  } else if (state.isVowel === false) {
    if (state.voiced !== null) {
      floatingShape.classList.add(state.voiced ? 'tri' : 'sq');
      floatingShape.classList.add(state.voiced ? 'voiced' : 'deaf', 'is-filled');
      if (state.soft === true)  floatingShape.classList.add('soft');
      if (state.soft === false) floatingShape.classList.add('hard');
    }
    // иначе — оставляем белый круг
  }
  // если isVowel === null — белый круг (ничего не добавляем)

  // Бейдж-пара
  const pair = state.pairSoftLetter || state.pairVoiceLetter;
  if (pair) {
    pairBadge.textContent = pair;
    pairBadge.classList.remove('hidden');
  } else {
    pairBadge.classList.add('hidden');
  }
}

// ---------- ПЕРЕХОДЫ ----------
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
function back() { goTo(currentIndex - 1, 'back'); }

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

// ---------- УТИЛИТА ДЛЯ ПРОВЕРКИ ОТВЕТА ----------
/**
 * Обрабатывает нажатие «Да/Нет».
 * correctFn() → true/false — правильный ли это ответ.
 * При неверном: тряска, красный, подсказка, подсветка правильной кнопки.
 * При верном: зелёная, подсказка «Верно!», через паузу onCorrect().
 */
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
        hint.classList.remove('hidden');
        hint.classList.add('ok');
      }
      setTimeout(() => onCorrect(), 700);
    } else {
      (chosenYes ? yesBtn : noBtn).classList.add('wrong');
      (chosenYes ? yesBtn : noBtn).classList.remove('correct');
      if (hint) {
        hint.textContent = hintWrong || 'Попробуй ещё раз — прислушайся внимательнее.';
        hint.classList.remove('hidden');
        hint.classList.remove('ok');
      }
      // Пульс на правильной кнопке
      const rightBtn = correctIsYes ? yesBtn : noBtn;
      rightBtn.classList.add('pulse-hint');
      setTimeout(() => rightBtn.classList.remove('pulse-hint'), 2400);
      // через 600мс убираем красный — даём попробовать снова
      setTimeout(() => {
        (chosenYes ? yesBtn : noBtn).classList.remove('wrong');
      }, 900);
    }
  }

  yesBtn.addEventListener('click', () => handle(true));
  noBtn.addEventListener('click', () => handle(false));
}

// ---------- ЭКРАНЫ ----------

// 0. Ввод буквы
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
  const map = {
    a:'а', b:'б', c:'ц', d:'д', e:'е', f:'ф', g:'г', h:'х', i:'и',
    j:'й', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'к', r:'р',
    s:'с', t:'т', u:'у', v:'в', w:'в', x:'х', y:'у', z:'з',
  };
  return map[ch] || ch;
}

// 1. Открытый рот → гласная/согласная
function screenOpenMouthQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon">${esc(state.letter)}</div>
      <h1>Ваша буква ${shapeSpan()} может быть сказана с открытым ртом, без использования языка?</h1>
      <h2>Попробуйте произнести её и почувствуйте</h2>
      <div class="btn-row">
        <button class="btn btn-yes" id="yes">Да</button>
        <button class="btn btn-no"  id="no">Нет</button>
      </div>
      <div id="hint" class="hint-text hidden"></div>
    </div>
  `);
  const correct = VOWELS.has(state.letter);
  bindYesNo(wrap, {
    correctIsYes: correct,
    hintWrong: correct
      ? 'Прислушайся: гласную можно пропеть с открытым ртом, язык не мешает.'
      : 'Прислушайся: язык или губы создают преграду — значит, буква согласная.',
    onCorrect: () => {
      state.isVowel = correct;
      if (correct) {
        // Гласная ветка
        screens[2] = screenVowelInfo;
        screens[3] = screenStressQuestion;
      } else {
        // Согласная ветка
        screens[2] = screenConsonantInfo;
        screens[3] = screenVoiceQuestion;
      }
      next();
    }
  });
  return wrap;
}

// 2-Г. Гласная — промежуточный
function screenVowelInfo() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon vowel is-filled">${esc(state.letter)}</div>
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

// 2-С. Согласная — промежуточный
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

// 3-Г. Вопрос про ударение
function screenStressQuestion() {
  const wrap = el(`
    <div class="screen-inner center">
      <div class="letter-icon vowel is-filled">${esc(state.letter
