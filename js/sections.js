// ============================================================
// SECTIONS.JS - Topic navigation, code loading & search filter
// ============================================================

const codeCache = {};

// ============================================================
// PROGRESS TRACKING (localStorage)
// ============================================================

const PROGRESS_KEY = 'sjsb_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch { return {}; }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function isTopicRead(topicName) {
  return !!getProgress()[topicName];
}

function toggleTopicRead(topicName) {
  const progress = getProgress();
  if (progress[topicName]) {
    delete progress[topicName];
  } else {
    progress[topicName] = Date.now();
  }
  saveProgress(progress);
  updateProgressUI();
}

function updateProgressUI() {
  const progress = getProgress();

  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const name = topic.dataset.topic;
    const check = topic.querySelector('.section-topic-check');
    if (check) {
      if (progress[name]) {
        check.classList.add('checked');
        check.textContent = 'check_circle';
      } else {
        check.classList.remove('checked');
        check.textContent = 'radio_button_unchecked';
      }
    }
  });

  // Update section progress counts
  document.querySelectorAll('.section').forEach(function (section) {
    const topics = section.querySelectorAll('.section-topic');
    const done = Array.from(topics).filter(function (t) { return progress[t.dataset.topic]; }).length;
    const counter = section.querySelector('.section-progress');
    if (counter) {
      counter.textContent = `${done}/${topics.length}`;
      counter.style.display = done > 0 ? 'inline' : 'none';
    }
  });

  // Update global progress dashboard
  const allTopics = document.querySelectorAll('.section-topic');
  const totalDone = Array.from(allTopics).filter(function (t) { return progress[t.dataset.topic]; }).length;
  const totalTopics = allTopics.length;
  const dashboard = document.getElementById('progressDashboard');
  const countEl = document.getElementById('progressCount');
  const fillEl = document.getElementById('progressFill');
  if (dashboard && countEl && fillEl) {
    countEl.textContent = totalDone + ' / ' + totalTopics;
    fillEl.style.width = (totalTopics > 0 ? (totalDone / totalTopics) * 100 : 0) + '%';
    if (totalDone > 0) {
      dashboard.classList.add('visible');
    } else {
      dashboard.classList.remove('visible');
    }
  }
}

// Reset buttons
(function () {
  var progressResetBtn = document.getElementById('progressReset');
  if (progressResetBtn) {
    progressResetBtn.addEventListener('click', function () {
      if (!confirm('Reset all reading progress?')) return;
      localStorage.removeItem(PROGRESS_KEY);
      updateProgressUI();
    });
  }

  var quizResetBtn = document.getElementById('quizReset');
  if (quizResetBtn) {
    quizResetBtn.addEventListener('click', function () {
      if (!confirm('Reset all quiz scores?')) return;
      localStorage.removeItem(QUIZ_KEY);
      updateQuizDashboard();
      // Re-render any open quiz sections to clear answered state
      document.querySelectorAll('.section-topic.open').forEach(function (topic) {
        var contentEl = topic.querySelector('.section-topic-content');
        if (contentEl && contentEl.dataset.loaded) {
          var topicName = topic.dataset.topic;
          var code = codeCache[topicName];
          if (code) {
            contentEl.dataset.loaded = '';
            renderCode(contentEl, code);
          }
        }
      });
    });
  }
})();

// Inject checkboxes into all topic headers
(function () {
  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const header = topic.querySelector('.section-topic-header');
    const check = document.createElement('i');
    check.className = 'material-icons section-topic-check';
    check.textContent = 'radio_button_unchecked';
    check.title = 'Mark as read';
    check.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTopicRead(topic.dataset.topic);
    });
    header.insertBefore(check, header.firstChild);
  });

  // Inject progress counters into section titles
  document.querySelectorAll('.section').forEach(function (section) {
    const title = section.querySelector('.section-title');
    if (title) {
      const counter = document.createElement('span');
      counter.className = 'section-progress';
      counter.style.display = 'none';
      title.appendChild(counter);
    }
  });

  updateProgressUI();
  // Init quiz dashboard after TOPIC_QUIZZES is defined
  setTimeout(updateQuizDashboard, 0);
})();

// ============================================================
// DIFFICULTY BADGES
// ============================================================

const TOPIC_LEVELS = {
  variables_and_types: 'beginner',
  operator_aritmetical: 'beginner',
  operator_assignative: 'beginner',
  operator_logical: 'beginner',
  operator_conditional: 'beginner',
  control_flow: 'beginner',
  closures_and_scope: 'intermediate',
  functions: 'intermediate',
  strings: 'beginner',
  regex: 'intermediate',
  json_and_dates: 'beginner',
  destructuring_and_spread: 'intermediate',
  logic_gates: 'intermediate',
  dom_manipulation: 'intermediate',
  data_collections_arrays: 'intermediate',
  data_collections_objects: 'intermediate',
  error_handling: 'intermediate',
  promises_and_async: 'advanced',
  fetch_api: 'intermediate',
  modules: 'intermediate',
  web_storage: 'intermediate',
  web_apis: 'intermediate',
  dom_events: 'intermediate',
  event_loop: 'advanced',
  iterators_generators: 'advanced',
  classes_and_oop: 'advanced',
  proxy_and_reflect: 'advanced',
  memory_and_performance: 'advanced',
  web_components: 'advanced',
  testing_basics: 'intermediate'
};

const RELATED_TOPICS = {
  variables_and_types: ['closures_and_scope', 'control_flow'],
  operator_aritmetical: ['operator_assignative', 'variables_and_types'],
  operator_assignative: ['operator_aritmetical', 'variables_and_types'],
  operator_logical: ['operator_conditional', 'control_flow'],
  operator_conditional: ['operator_logical', 'control_flow'],
  control_flow: ['functions', 'operator_conditional'],
  closures_and_scope: ['functions', 'variables_and_types'],
  functions: ['closures_and_scope', 'promises_and_async'],
  strings: ['regex', 'data_collections_arrays'],
  regex: ['strings'],
  json_and_dates: ['web_storage', 'fetch_api'],
  destructuring_and_spread: ['data_collections_arrays', 'data_collections_objects', 'functions'],
  logic_gates: ['operator_logical', 'memory_and_performance'],
  dom_manipulation: ['dom_events', 'web_apis'],
  data_collections_arrays: ['data_collections_objects', 'destructuring_and_spread'],
  data_collections_objects: ['data_collections_arrays', 'classes_and_oop'],
  error_handling: ['promises_and_async', 'fetch_api'],
  promises_and_async: ['event_loop', 'fetch_api', 'error_handling'],
  fetch_api: ['promises_and_async', 'json_and_dates', 'error_handling'],
  modules: ['functions', 'classes_and_oop'],
  web_storage: ['json_and_dates', 'web_apis'],
  web_apis: ['dom_manipulation', 'dom_events', 'web_storage'],
  dom_events: ['dom_manipulation', 'web_apis'],
  event_loop: ['promises_and_async', 'memory_and_performance'],
  iterators_generators: ['data_collections_arrays', 'classes_and_oop', 'event_loop'],
  classes_and_oop: ['data_collections_objects', 'proxy_and_reflect'],
  proxy_and_reflect: ['classes_and_oop', 'memory_and_performance'],
  memory_and_performance: ['event_loop', 'closures_and_scope'],
  web_components: ['dom_manipulation', 'dom_events', 'classes_and_oop'],
  testing_basics: ['functions', 'error_handling', 'promises_and_async']
};

(function () {
  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const level = TOPIC_LEVELS[topic.dataset.topic];
    if (!level) return;
    const badge = document.createElement('span');
    badge.className = 'section-topic-level level-' + level;
    badge.textContent = level;
    const header = topic.querySelector('.section-topic-header');
    const arrow = header.querySelector('.section-topic-arrow');
    header.insertBefore(badge, arrow);
  });
})();

// ============================================================
// QUIZ SCORE PERSISTENCE (localStorage)
// ============================================================

const QUIZ_KEY = 'sjsb_quiz_scores';

function getQuizScores() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY)) || {};
  } catch { return {}; }
}

function saveQuizAnswer(topicName, questionIdx, isCorrect) {
  const scores = getQuizScores();
  if (!scores[topicName]) scores[topicName] = {};
  scores[topicName][questionIdx] = isCorrect;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(scores));
  updateQuizDashboard();
}

function updateQuizDashboard() {
  const scores = getQuizScores();
  let totalCorrect = 0;
  let totalAnswered = 0;
  let totalQuestions = 0;

  Object.keys(TOPIC_QUIZZES).forEach(function (topic) {
    const quizLen = TOPIC_QUIZZES[topic].length;
    totalQuestions += quizLen;
    if (scores[topic]) {
      Object.keys(scores[topic]).forEach(function (qIdx) {
        totalAnswered++;
        if (scores[topic][qIdx]) totalCorrect++;
      });
    }
  });

  const el = document.getElementById('quizDashboard');
  if (!el) return;

  if (totalAnswered > 0) {
    el.classList.add('visible');
    const pct = Math.round((totalCorrect / totalQuestions) * 100);
    document.getElementById('quizCount').textContent = totalCorrect + ' / ' + totalQuestions + ' correct';
    document.getElementById('quizFill').style.width = pct + '%';
  } else {
    el.classList.remove('visible');
  }
}

// ============================================================
// MINI-QUIZ DATA
// ============================================================

const TOPIC_QUIZZES = {
  variables_and_types: [
    { q: 'What keyword declares a block-scoped variable that can be reassigned?', opts: ['var', 'let', 'const', 'static'], answer: 1 },
    { q: 'What does typeof null return?', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2 },
    { q: 'Which comparison operator checks both value and type?', opts: ['==', '===', '!=', '>='], answer: 1 }
  ],
  operator_aritmetical: [
    { q: 'What does 10 % 3 return?', opts: ['3', '1', '0', '3.33'], answer: 1 },
    { q: 'What is the result of 2 ** 3?', opts: ['6', '8', '9', '5'], answer: 1 }
  ],
  operator_assignative: [
    { q: 'What does x += 5 do?', opts: ['Compares x to 5', 'Assigns 5 to x', 'Adds 5 to x and reassigns', 'Returns x + 5'], answer: 2 },
    { q: 'What is the result of let x = 10; x ??= 20?', opts: ['20', '10', 'null', 'undefined'], answer: 1 }
  ],
  operator_conditional: [
    { q: 'What does the ternary operator ?: return?', opts: ['Always true', 'One of two values based on a condition', 'A boolean', 'undefined'], answer: 1 },
    { q: 'What does x ?? y return?', opts: ['x if x is falsy', 'y if x is null or undefined', 'y always', 'x always'], answer: 1 }
  ],
  operator_logical: [
    { q: 'What does false || "hello" return?', opts: ['false', 'true', '"hello"', 'undefined'], answer: 2 },
    { q: 'What does true && 0 return?', opts: ['true', 'false', '0', '1'], answer: 2 }
  ],
  control_flow: [
    { q: 'Which loop always executes at least once?', opts: ['for', 'while', 'do...while', 'for...of'], answer: 2 },
    { q: 'What does "break" do inside a loop?', opts: ['Skips iteration', 'Exits loop', 'Returns value', 'Pauses execution'], answer: 1 }
  ],
  closures_and_scope: [
    { q: 'What is a closure?', opts: ['A function inside a class', 'A function that remembers its outer scope', 'An arrow function', 'A recursive function'], answer: 1 },
    { q: 'Variables declared with var are scoped to the nearest...', opts: ['Block', 'Function', 'Module', 'Loop'], answer: 1 }
  ],
  functions: [
    { q: 'Arrow functions do NOT have their own:', opts: ['parameters', 'return value', 'this binding', 'variables'], answer: 2 },
    { q: 'What is an IIFE?', opts: ['An async function', 'A function that invokes itself immediately', 'A generator', 'A method'], answer: 1 }
  ],
  strings: [
    { q: 'What does "hello".slice(1, 3) return?', opts: ['"hel"', '"el"', '"ell"', '"llo"'], answer: 1 },
    { q: 'Which method checks if a string starts with a value?', opts: ['includes()', 'startsWith()', 'indexOf()', 'match()'], answer: 1 }
  ],
  regex: [
    { q: 'What flag makes a regex case-insensitive?', opts: ['g', 'i', 'm', 's'], answer: 1 },
    { q: 'What does \\d match?', opts: ['Any digit', 'Any letter', 'Any whitespace', 'Any character'], answer: 0 }
  ],
  data_collections_arrays: [
    { q: 'Which method returns a new array without modifying the original?', opts: ['push()', 'splice()', 'map()', 'sort()'], answer: 2 },
    { q: 'What does [1,2,3].reduce((a,b) => a+b, 0) return?', opts: ['[1,2,3]', '6', '0', '3'], answer: 1 }
  ],
  data_collections_objects: [
    { q: 'Which method returns an array of an object\'s keys?', opts: ['Object.values()', 'Object.keys()', 'Object.entries()', 'Object.assign()'], answer: 1 },
    { q: 'What does Object.freeze() do?', opts: ['Deletes properties', 'Prevents adding/modifying properties', 'Deep clones', 'Seals the object'], answer: 1 }
  ],
  promises_and_async: [
    { q: 'What does async/await simplify?', opts: ['Loops', 'Promise chains', 'DOM manipulation', 'RegEx'], answer: 1 },
    { q: 'Promise.all() resolves when:', opts: ['Any promise resolves', 'All promises resolve', 'First promise settles', 'All promises reject'], answer: 1 }
  ],
  error_handling: [
    { q: 'Which block always executes whether error occurs or not?', opts: ['try', 'catch', 'finally', 'throw'], answer: 2 },
    { q: 'How do you create a custom error?', opts: ['new Error()', 'throw "error"', 'class MyError extends Error', 'All of the above'], answer: 3 }
  ],
  fetch_api: [
    { q: 'fetch() returns a:', opts: ['String', 'JSON object', 'Promise', 'Response'], answer: 2 },
    { q: 'How do you cancel a fetch request?', opts: ['fetch.cancel()', 'AbortController', 'clearTimeout()', 'Promise.reject()'], answer: 1 }
  ],
  dom_manipulation: [
    { q: 'Which method selects the first matching element?', opts: ['getElementById()', 'querySelector()', 'querySelectorAll()', 'getElementsByClassName()'], answer: 1 },
    { q: 'What does element.remove() do?', opts: ['Hides element', 'Removes from DOM', 'Clears innerHTML', 'Removes attributes'], answer: 1 }
  ],
  dom_events: [
    { q: 'Which method attaches an event handler?', opts: ['onclick()', 'addEventListener()', 'attachEvent()', 'bindEvent()'], answer: 1 },
    { q: 'Event delegation uses which propagation phase?', opts: ['Capture', 'Bubble', 'Target', 'None'], answer: 1 }
  ],
  event_loop: [
    { q: 'Microtasks (Promise.then) execute before:', opts: ['Synchronous code', 'Macrotasks (setTimeout)', 'The call stack', 'Nothing'], answer: 1 },
    { q: 'setTimeout(fn, 0) runs:', opts: ['Immediately', 'After current call stack clears', 'Never', 'Before promises'], answer: 1 }
  ],
  classes_and_oop: [
    { q: 'What keyword creates a subclass?', opts: ['implements', 'extends', 'inherits', 'uses'], answer: 1 },
    { q: 'Private fields in JS classes start with:', opts: ['_', '#', '@', '$'], answer: 1 }
  ],
  iterators_generators: [
    { q: 'A generator function is declared with:', opts: ['function*', 'async function', 'gen function', 'yield function'], answer: 0 },
    { q: 'What does yield do?', opts: ['Returns and exits', 'Pauses and produces a value', 'Throws an error', 'Loops'], answer: 1 }
  ],
  proxy_and_reflect: [
    { q: 'A Proxy wraps an object to intercept:', opts: ['Events', 'Operations like get/set', 'Network requests', 'CSS styles'], answer: 1 },
    { q: 'Reflect.ownKeys() returns:', opts: ['Only string keys', 'Only symbol keys', 'All own keys including symbols', 'Inherited keys'], answer: 2 }
  ],
  memory_and_performance: [
    { q: 'What helps prevent excessive function calls on scroll?', opts: ['Memoize', 'Debounce/Throttle', 'WeakRef', 'Proxy'], answer: 1 },
    { q: 'WeakMap keys are:', opts: ['Strings only', 'Numbers only', 'Objects (weakly held)', 'Any value'], answer: 2 }
  ],
  modules: [
    { q: 'Which keyword imports a module in ESM?', opts: ['require()', 'import', 'include', 'load'], answer: 1 },
    { q: 'A file can have how many default exports?', opts: ['Unlimited', 'One', 'Two', 'Zero'], answer: 1 }
  ],
  web_storage: [
    { q: 'localStorage data persists until:', opts: ['Tab closes', 'Browser closes', 'Manually cleared', 'Page refreshes'], answer: 2 },
    { q: 'sessionStorage data persists until:', opts: ['Tab/window closes', 'Browser closes', 'Manually cleared', 'Forever'], answer: 0 }
  ],
  web_apis: [
    { q: 'Which API accesses the clipboard?', opts: ['Clipboard API', 'Storage API', 'History API', 'URL API'], answer: 0 },
    { q: 'Geolocation.getCurrentPosition() is:', opts: ['Synchronous', 'Asynchronous (callback)', 'A Promise', 'Blocking'], answer: 1 }
  ],
  destructuring_and_spread: [
    { q: 'What does ...arr do when used in a function parameter?', opts: ['Spread', 'Rest (collects args)', 'Destructure', 'Clone'], answer: 1 },
    { q: 'const {a: x} = {a: 1} — what is x?', opts: ['undefined', '{a:1}', '1', '"a"'], answer: 2 }
  ],
  json_and_dates: [
    { q: 'JSON.stringify() converts:', opts: ['String to object', 'Object to JSON string', 'JSON to array', 'Number to string'], answer: 1 },
    { q: 'new Date().getMonth() returns January as:', opts: ['1', '0', '"January"', '"Jan"'], answer: 1 }
  ],
  web_components: [
    { q: 'Custom element names must contain:', opts: ['Underscore', 'Hyphen', 'Number', 'Uppercase letter'], answer: 1 },
    { q: 'Shadow DOM provides:', opts: ['Server rendering', 'Style encapsulation', 'Faster loading', 'Database access'], answer: 1 }
  ],
  testing_basics: [
    { q: 'In TDD, what do you write first?', opts: ['Implementation', 'Documentation', 'Failing test', 'Database schema'], answer: 2 },
    { q: 'AAA pattern stands for:', opts: ['Act-Assert-Arrange', 'Arrange-Act-Assert', 'Assert-Act-Arrange', 'Arrange-Assert-Act'], answer: 1 }
  ],
  logic_gates: [
    { q: 'What does the XOR gate return?', opts: ['true if both true', 'true if inputs differ', 'true if both false', 'always true'], answer: 1 },
    { q: 'What is 5 & 3 in JavaScript?', opts: ['7', '1', '8', '15'], answer: 1 },
    { q: 'Which gate is called "universal" (can build all others)?', opts: ['AND', 'OR', 'NAND', 'XOR'], answer: 2 }
  ]
};

// ============================================================
// NAVIGATION & TOPIC TOGGLE
// ============================================================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleTopic(headerEl) {
  const topicEl = headerEl.closest('.section-topic');
  const contentEl = topicEl.querySelector('.section-topic-content');
  const isOpen = topicEl.classList.contains('open');

  if (isOpen) {
    topicEl.classList.remove('open');
  } else {
    topicEl.classList.add('open');
    if (!contentEl.dataset.loaded) {
      loadTopicCode(topicEl.dataset.topic, contentEl);
    }
  }
  saveOpenTopics();
}

// ============================================================
// PERSIST OPEN TOPICS (sessionStorage)
// ============================================================

const OPEN_TOPICS_KEY = 'sjsb_open_topics';

function saveOpenTopics() {
  const openTopics = [];
  document.querySelectorAll('.section-topic.open').forEach(function (topic) {
    openTopics.push(topic.dataset.topic);
  });
  sessionStorage.setItem(OPEN_TOPICS_KEY, JSON.stringify(openTopics));
}

(function restoreOpenTopics() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(OPEN_TOPICS_KEY));
    if (!saved || !saved.length) return;
    saved.forEach(function (topicName) {
      const topic = document.querySelector('.section-topic[data-topic="' + topicName + '"]');
      if (topic && !topic.classList.contains('open')) {
        topic.classList.add('open');
        const contentEl = topic.querySelector('.section-topic-content');
        if (!contentEl.dataset.loaded) {
          loadTopicCode(topicName, contentEl);
        }
      }
    });
  } catch (e) { /* ignore */ }
})();

// ============================================================
// CODE LOADING & RENDERING
// ============================================================

function loadTopicCode(topicName, contentEl) {
  const src = `js/${topicName}.js`;

  contentEl.classList.add('loading');
  contentEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>';

  if (codeCache[topicName]) {
    renderCode(contentEl, codeCache[topicName]);
    return;
  }

  fetch(src)
    .then(function (response) {
      if (!response.ok) throw new Error(`Failed to load ${src} (${response.status})`);
      return response.text();
    })
    .then(function (code) {
      codeCache[topicName] = code;
      renderCode(contentEl, code);
    })
    .catch(function (error) {
      contentEl.classList.remove('loading');
      contentEl.textContent = 'Error: ' + error.message;
    });
}

function renderCode(contentEl, code) {
  contentEl.classList.remove('loading');
  contentEl.innerHTML = '';

  // Add toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'code-toolbar';

  // Track current code (may be edited by user)
  let currentCode = code;

  const runBtn = document.createElement('button');
  runBtn.className = 'code-toolbar-btn';
  runBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">play_arrow</i> Run';
  runBtn.title = 'Execute code in console';
  runBtn.addEventListener('click', function () {
    runCode(currentCode);
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-toolbar-btn';
  copyBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">content_copy</i> Copy';
  copyBtn.addEventListener('click', function () {
    copyCode(currentCode, copyBtn);
  });

  const editBtn = document.createElement('button');
  editBtn.className = 'code-toolbar-btn';
  editBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">edit</i> Edit';
  editBtn.title = 'Edit code before running';
  editBtn.addEventListener('click', function () {
    const codeBlock = contentEl.querySelector('.code-block');
    const existingEditor = contentEl.querySelector('.code-editor');

    if (existingEditor) {
      // Switch back to read-only view
      currentCode = existingEditor.value;
      existingEditor.remove();
      codeBlock.style.display = '';
      // Re-render with edited code
      codeBlock.innerHTML = '';
      const lines = currentCode.split('\n');
      const frag = document.createDocumentFragment();
      lines.forEach(function (line, index) {
        const span = document.createElement('span');
        span.className = 'code-line';
        const lineNum = document.createElement('span');
        lineNum.className = 'code-line-number';
        lineNum.textContent = index + 1;
        span.appendChild(lineNum);
        const lineContent = document.createElement('span');
        lineContent.style.flex = '1';
        lineContent.style.minHeight = '1.2em';
        if (/^\/\/\/{3,}/.test(line.trim())) {
          lineContent.className = 'code-separator';
          lineContent.textContent = line;
        } else if (/^\s*\/\//.test(line)) {
          lineContent.className = 'code-comment';
          lineContent.textContent = line;
        } else {
          lineContent.innerHTML = highlightLine(line);
        }
        span.appendChild(lineContent);
        frag.appendChild(span);
      });
      codeBlock.appendChild(frag);
      editBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">edit</i> Edit';
    } else {
      // Switch to editor mode
      codeBlock.style.display = 'none';
      const editor = document.createElement('textarea');
      editor.className = 'code-editor';
      editor.value = currentCode;
      editor.spellcheck = false;
      editor.addEventListener('input', function () {
        currentCode = editor.value;
      });
      // Handle Tab key for indentation
      editor.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 2;
          currentCode = editor.value;
        }
      });
      contentEl.insertBefore(editor, codeBlock.nextSibling);
      editor.focus();
      editBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">visibility</i> View';
    }
  });

  const sep = document.createElement('span');
  sep.className = 'code-toolbar-separator';

  const sizeDown = document.createElement('button');
  sizeDown.className = 'code-toolbar-btn size-btn';
  sizeDown.textContent = 'A\u2212';
  sizeDown.title = 'Decrease font size';

  const sizeUp = document.createElement('button');
  sizeUp.className = 'code-toolbar-btn size-btn';
  sizeUp.textContent = 'A+';
  sizeUp.title = 'Increase font size';

  sizeDown.addEventListener('click', function () {
    const current = parseFloat(getComputedStyle(contentEl).fontSize);
    if (current > 8) contentEl.style.fontSize = (current - 1) + 'px';
  });
  sizeUp.addEventListener('click', function () {
    const current = parseFloat(getComputedStyle(contentEl).fontSize);
    if (current < 24) contentEl.style.fontSize = (current + 1) + 'px';
  });

  const topicName = contentEl.closest('.section-topic').dataset.topic;
  const shareBtn = createShareBtn(topicName);

  toolbar.appendChild(runBtn);
  toolbar.appendChild(copyBtn);
  toolbar.appendChild(editBtn);
  toolbar.appendChild(shareBtn);
  toolbar.appendChild(sep);
  toolbar.appendChild(sizeDown);
  toolbar.appendChild(sizeUp);
  contentEl.appendChild(toolbar);

  // Render code lines
  const codeBlock = document.createElement('div');
  codeBlock.className = 'code-block';

  const lines = code.split('\n');
  const fragment = document.createDocumentFragment();

  lines.forEach(function (line, index) {
    const span = document.createElement('span');
    span.className = 'code-line';

    const lineNum = document.createElement('span');
    lineNum.className = 'code-line-number';
    lineNum.textContent = index + 1;
    span.appendChild(lineNum);

    const lineContent = document.createElement('span');
    lineContent.style.flex = '1';
    lineContent.style.minHeight = '1.2em';

    if (/^\/\/\/{3,}/.test(line.trim())) {
      lineContent.className = 'code-separator';
      lineContent.textContent = line;
    } else if (/^\s*\/\//.test(line)) {
      lineContent.className = 'code-comment';
      lineContent.textContent = line;
    } else {
      lineContent.innerHTML = highlightLine(line);
    }
    span.appendChild(lineContent);
    fragment.appendChild(span);
  });

  codeBlock.appendChild(fragment);
  contentEl.appendChild(codeBlock);

  // Add related topics links
  const related = RELATED_TOPICS[topicName];
  if (related && related.length > 0) {
    const relatedDiv = document.createElement('div');
    relatedDiv.className = 'code-related';
    relatedDiv.innerHTML = '<span class="code-related-label">See also:</span> ';
    related.forEach(function (rel, i) {
      const topicEl = document.querySelector('.section-topic[data-topic="' + rel + '"]');
      if (!topicEl) return;
      const title = topicEl.querySelector('.section-topic-title').textContent.trim();
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'code-related-link';
      link.textContent = title;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        topicEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!topicEl.classList.contains('open')) {
          topicEl.classList.add('open');
          const c = topicEl.querySelector('.section-topic-content');
          if (!c.dataset.loaded) loadTopicCode(rel, c);
          saveOpenTopics();
        }
      });
      if (i > 0) relatedDiv.appendChild(document.createTextNode(' · '));
      relatedDiv.appendChild(link);
    });
    contentEl.appendChild(relatedDiv);
  }

  // Add mini-quiz if available
  const quizData = TOPIC_QUIZZES[topicName];
  if (quizData && quizData.length > 0) {
    const quizDiv = document.createElement('div');
    quizDiv.className = 'topic-quiz';
    quizDiv.innerHTML = '<div class="topic-quiz-header"><i class="material-icons" style="font-size:18px;vertical-align:middle;color:var(--yellow-color)">quiz</i> Quick Quiz</div>';

    const savedScores = getQuizScores();
    const topicScores = savedScores[topicName] || {};

    quizData.forEach(function (item, qIdx) {
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      qDiv.innerHTML = '<p class="quiz-question-text">' + (qIdx + 1) + '. ' + item.q + '</p>';

      const optsDiv = document.createElement('div');
      optsDiv.className = 'quiz-options';

      item.opts.forEach(function (opt, oIdx) {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt;

        // Restore previous answer state
        if (topicScores[qIdx] !== undefined) {
          btn.disabled = true;
          btn.classList.add('quiz-disabled');
          if (oIdx === item.answer) {
            btn.classList.add('quiz-correct');
          } else if (!topicScores[qIdx] && oIdx !== item.answer) {
            // We don't know which wrong answer was picked, just show correct
          }
        }

        btn.addEventListener('click', function () {
          optsDiv.querySelectorAll('.quiz-option-btn').forEach(function (b) {
            b.disabled = true;
            b.classList.add('quiz-disabled');
          });
          const isCorrect = oIdx === item.answer;
          if (isCorrect) {
            btn.classList.add('quiz-correct');
          } else {
            btn.classList.add('quiz-wrong');
            optsDiv.querySelectorAll('.quiz-option-btn')[item.answer].classList.add('quiz-correct');
          }
          saveQuizAnswer(topicName, qIdx, isCorrect);
        });
        optsDiv.appendChild(btn);
      });

      qDiv.appendChild(optsDiv);
      quizDiv.appendChild(qDiv);
    });

    contentEl.appendChild(quizDiv);
  }

  contentEl.dataset.loaded = 'true';
}

// ============================================================
// RUN CODE & COPY
// ============================================================

function runCode(code) {
  // Create output panel
  let output = document.getElementById('sjsb-console');
  if (!output) {
    output = document.createElement('div');
    output.id = 'sjsb-console';
    output.innerHTML = '<div class="console-header"><span>Console Output</span><button onclick="this.parentElement.parentElement.remove()" class="console-close">&times;</button></div><pre class="console-body"></pre>';
    document.body.appendChild(output);
  }

  const body = output.querySelector('.console-body');
  body.textContent = '';
  output.style.display = 'block';

  const logs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = function () {
    const args = Array.from(arguments).map(function (a) {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
    });
    logs.push(args.join(' '));
    originalLog.apply(console, arguments);
  };
  console.error = function () {
    logs.push('[ERROR] ' + Array.from(arguments).join(' '));
    originalError.apply(console, arguments);
  };
  console.warn = function () {
    logs.push('[WARN] ' + Array.from(arguments).join(' '));
    originalWarn.apply(console, arguments);
  };

  // Pre-process code: strip lines with import/export, top-level await
  let safeCode = code
    .split('\n')
    .map(function (line) {
      const trimmed = line.trim();
      // Skip import/export statements
      if (/^import\s/.test(trimmed) || /^export\s/.test(trimmed)) return '// [skipped] ' + line;
      // Skip top-level await (not in function)
      if (/^await\s/.test(trimmed)) return '// [skipped] ' + line;
      return line;
    })
    .join('\n');

  // Wrap in sandbox with DOM & API stubs
  const sandbox = `
    var document = (function () {
      var fakeEl = {
        style: {}, classList: { add: function(){}, remove: function(){}, toggle: function(){}, contains: function(){ return false; } },
        addEventListener: function(){}, removeEventListener: function(){},
        setAttribute: function(){}, getAttribute: function(){ return ''; },
        appendChild: function(c){ return c; }, removeChild: function(){},
        insertBefore: function(c){ return c; }, remove: function(){},
        querySelector: function(){ return fakeEl; }, querySelectorAll: function(){ return []; },
        innerHTML: '', textContent: '', value: '', id: '', className: '',
        children: [], childNodes: [], parentNode: null, parentElement: null,
        getBoundingClientRect: function(){ return { top:0,left:0,right:0,bottom:0,width:0,height:0 }; },
        cloneNode: function(){ return fakeEl; }, closest: function(){ return null; },
        matches: function(){ return false; }, contains: function(){ return false; },
        focus: function(){}, blur: function(){}, click: function(){},
        dispatchEvent: function(){ return true; },
        dataset: {}, offsetWidth: 0, offsetHeight: 0, scrollTop: 0, scrollLeft: 0
      };
      return {
        getElementById: function(){ return fakeEl; },
        querySelector: function(){ return fakeEl; },
        querySelectorAll: function(){ return []; },
        createElement: function(tag){ return Object.assign({}, fakeEl, { tagName: tag.toUpperCase() }); },
        createTextNode: function(t){ return { textContent: t }; },
        createDocumentFragment: function(){ return Object.assign({}, fakeEl); },
        addEventListener: function(){}, removeEventListener: function(){},
        body: fakeEl, head: fakeEl, documentElement: fakeEl,
        cookie: '', title: '', readyState: 'complete'
      };
    })();
    var window = {
      addEventListener: function(){}, removeEventListener: function(){},
      setTimeout: setTimeout, clearTimeout: clearTimeout,
      setInterval: setInterval, clearInterval: clearInterval,
      innerWidth: 1024, innerHeight: 768, scrollY: 0, scrollX: 0,
      location: { href: '', origin: '', pathname: '/', hash: '' },
      navigator: { userAgent: 'SJSB Sandbox' },
      history: { pushState: function(){}, replaceState: function(){}, back: function(){}, forward: function(){} },
      localStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){}, clear: function(){} },
      sessionStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){}, clear: function(){} },
      requestAnimationFrame: function(cb){ return setTimeout(cb, 16); },
      cancelAnimationFrame: function(id){ clearTimeout(id); },
      getComputedStyle: function(){ return {}; },
      matchMedia: function(){ return { matches: false, addEventListener: function(){} }; },
      alert: function(m){ console.log('[alert] ' + m); },
      confirm: function(){ return true; },
      prompt: function(msg, def){ return def || ''; },
      fetch: function(url) {
        console.log('[fetch] ' + url + ' (sandbox mock)');
        return Promise.resolve({
          ok: true, status: 200, statusText: 'OK',
          json: function(){ return Promise.resolve({}); },
          text: function(){ return Promise.resolve(''); },
          headers: { get: function(){ return ''; } }
        });
      },
      XMLHttpRequest: function(){},
      WebSocket: function(){},
      Worker: function(){},
      IntersectionObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; },
      MutationObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; },
      ResizeObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; }
    };
    var fetch = window.fetch;
    var alert = window.alert;
    var confirm = window.confirm;
    var prompt = window.prompt;
    var localStorage = window.localStorage;
    var sessionStorage = window.sessionStorage;
    var navigator = window.navigator;
    var requestAnimationFrame = window.requestAnimationFrame;

    // Web Components stubs
    var HTMLElement = (function () {
      function HTMLElement() {}
      HTMLElement.prototype.attachShadow = function() {
        var shadow = Object.assign({}, document.createElement('div'));
        shadow.getElementById = function(){ return document.createElement('div'); };
        shadow.innerHTML = '';
        this.shadowRoot = shadow;
        return shadow;
      };
      HTMLElement.prototype.getAttribute = function(){ return ''; };
      HTMLElement.prototype.setAttribute = function(){};
      HTMLElement.prototype.addEventListener = function(){};
      HTMLElement.prototype.dispatchEvent = function(){ return true; };
      HTMLElement.prototype.connectedCallback = function(){};
      HTMLElement.prototype.disconnectedCallback = function(){};
      HTMLElement.prototype.attributeChangedCallback = function(){};
      HTMLElement.observedAttributes = [];
      return HTMLElement;
    })();
    var HTMLButtonElement = HTMLElement;
    var customElements = {
      _registry: {},
      define: function(name, cls, opts) { this._registry[name] = cls; },
      get: function(name) { return this._registry[name]; },
      whenDefined: function() { return Promise.resolve(); }
    };
    var CustomEvent = function(type, opts) {
      this.type = type;
      this.detail = (opts && opts.detail) || null;
      this.bubbles = (opts && opts.bubbles) || false;
      this.composed = (opts && opts.composed) || false;
    };
    var Event = function(type, opts) {
      this.type = type;
      this.bubbles = (opts && opts.bubbles) || false;
      this.preventDefault = function(){};
      this.stopPropagation = function(){};
    };
  `;

  try {
    new Function(sandbox + '\n' + safeCode)();
  } catch (error) {
    logs.push('[ERROR] ' + error.name + ': ' + error.message);
  }

  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;

  body.textContent = logs.length > 0 ? logs.join('\n') : '(no console output)';
}

function copyCode(code, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function () {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">check</i> Copied!';
      setTimeout(function () { btn.innerHTML = orig; }, 1500);
    });
  }
}

// ============================================================
// SYNTAX HIGHLIGHTING
// ============================================================

function highlightLine(line) {
  if (!line.trim()) return '\n';

  var KEYWORDS = /^(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|async|await|yield|try|catch|finally|throw|import|export|default|from|true|false|null|undefined|NaN|Infinity|void|delete|static|get|set)$/;

  // Tokenize the line character by character
  var tokens = [];
  var i = 0;
  var len = line.length;

  while (i < len) {
    var ch = line[i];

    // Inline comment
    if (ch === '/' && i + 1 < len && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.substring(i) });
      break;
    }

    // Strings: single/double quotes
    if (ch === '"' || ch === "'") {
      var start = i;
      var quote = ch;
      i++;
      while (i < len && line[i] !== quote) {
        if (line[i] === '\\') i++;
        i++;
      }
      i++; // closing quote
      tokens.push({ type: 'string', value: line.substring(start, i) });
      continue;
    }

    // Template literals (backticks) with ${...} support
    if (ch === '`') {
      var start = i;
      i++;
      var tmplParts = [{ type: 'string-start', value: '`' }];
      var buf = '';
      while (i < len && line[i] !== '`') {
        if (line[i] === '\\') {
          buf += line[i] + (line[i + 1] || '');
          i += 2;
          continue;
        }
        if (line[i] === '$' && i + 1 < len && line[i + 1] === '{') {
          // Push accumulated string part
          tmplParts.push({ type: 'string-mid', value: buf + '${' });
          buf = '';
          i += 2;
          // Read expression inside ${...}
          var depth = 1;
          var exprStart = i;
          while (i < len && depth > 0) {
            if (line[i] === '{') depth++;
            else if (line[i] === '}') depth--;
            if (depth > 0) i++;
          }
          tmplParts.push({ type: 'expr', value: line.substring(exprStart, i) });
          tmplParts.push({ type: 'string-mid', value: '}' });
          i++; // skip closing }
          continue;
        }
        buf += line[i];
        i++;
      }
      tmplParts.push({ type: 'string-end', value: buf + (i < len ? '`' : '') });
      i++; // closing backtick
      tokens.push({ type: 'template', parts: tmplParts });
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && i + 1 < len && /\d/.test(line[i + 1]))) {
      var start = i;
      if (ch === '0' && i + 1 < len && /[xXbBoO]/.test(line[i + 1])) {
        i += 2;
        while (i < len && /[\da-fA-F_]/.test(line[i])) i++;
      } else {
        while (i < len && /[\d.]/.test(line[i])) i++;
        if (i < len && line[i] === 'n') i++; // BigInt
      }
      tokens.push({ type: 'number', value: line.substring(start, i) });
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_$]/.test(ch)) {
      var start = i;
      while (i < len && /[\w$]/.test(line[i])) i++;
      var word = line.substring(start, i);
      if (KEYWORDS.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        // Check if followed by ( → function call
        var j = i;
        while (j < len && line[j] === ' ') j++;
        if (j < len && line[j] === '(') {
          tokens.push({ type: 'function', value: word });
        } else {
          tokens.push({ type: 'text', value: word });
        }
      }
      continue;
    }

    // Everything else (operators, punctuation, whitespace)
    tokens.push({ type: 'text', value: ch });
    i++;
  }

  // Render tokens to HTML
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var html = '';
  tokens.forEach(function (tok) {
    if (tok.type === 'comment') {
      html += '<span class="code-comment">' + esc(tok.value) + '</span>';
    } else if (tok.type === 'string') {
      html += '<span class="code-string">' + esc(tok.value) + '</span>';
    } else if (tok.type === 'template') {
      tok.parts.forEach(function (part) {
        if (part.type === 'expr') {
          html += esc(part.value);
        } else {
          html += '<span class="code-string">' + esc(part.value) + '</span>';
        }
      });
    } else if (tok.type === 'number') {
      html += '<span class="code-number">' + esc(tok.value) + '</span>';
    } else if (tok.type === 'keyword') {
      html += '<span class="code-keyword">' + esc(tok.value) + '</span>';
    } else if (tok.type === 'function') {
      html += '<span class="code-function">' + esc(tok.value) + '</span>';
    } else {
      html += esc(tok.value);
    }
  });

  return html;
}

// ============================================================
// SEARCH FILTER
// ============================================================

function search() {
  smoothScrollToTop();
  const query = document.getElementById("query").value;
  const banner = document.getElementById("banner");

  if (query !== "") {
    banner.style.height = "0px";
  } else {
    banner.style.height = "222px";
  }

  filterTopics(query);
}

function filterTopics(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const sections = document.querySelectorAll('.section');
  let totalVisible = 0;
  let totalTopics = 0;

  sections.forEach(function (section) {
    const topics = section.querySelectorAll('.section-topic');
    let visibleTopics = 0;

    topics.forEach(function (topic) {
      totalTopics++;
      const title = topic.querySelector('.section-topic-title').textContent.toLowerCase();
      const desc = topic.querySelector('.section-topic-desc').textContent.toLowerCase();
      const topicName = topic.dataset.topic.toLowerCase().replace(/_/g, ' ');

      // Also search in loaded code content
      const cachedCode = codeCache[topic.dataset.topic];
      const codeMatch = cachedCode ? cachedCode.toLowerCase().includes(normalizedQuery) : false;

      const matches = !normalizedQuery ||
        title.includes(normalizedQuery) ||
        desc.includes(normalizedQuery) ||
        topicName.includes(normalizedQuery) ||
        codeMatch;

      if (matches) {
        topic.classList.remove('filtered-out');
        visibleTopics++;
        totalVisible++;
      } else {
        topic.classList.add('filtered-out');
      }
    });

    if (visibleTopics === 0 && normalizedQuery) {
      section.classList.add('filtered-out');
    } else {
      section.classList.remove('filtered-out');
    }
  });

  // Update search results counter
  const counterEl = document.getElementById('searchResultsCount');
  if (counterEl) {
    if (normalizedQuery) {
      counterEl.textContent = totalVisible + ' of ' + totalTopics + ' topics';
      counterEl.classList.add('visible');
    } else {
      counterEl.classList.remove('visible');
    }
  }
}

// ============================================================
// BACK TO TOP BUTTON
// ============================================================

(function () {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });
})();

// ============================================================
// EXPAND ALL / COLLAPSE ALL
// ============================================================

(function () {
  document.querySelectorAll('.section').forEach(function (section) {
    const title = section.querySelector('.section-title');
    if (!title) return;

    const controls = document.createElement('div');
    controls.className = 'section-controls';

    const expandBtn = document.createElement('button');
    expandBtn.className = 'section-controls-btn';
    expandBtn.innerHTML = '<i class="material-icons">unfold_more</i> Expand all';
    expandBtn.addEventListener('click', function () {
      section.querySelectorAll('.section-topic:not(.open)').forEach(function (topic) {
        topic.classList.add('open');
        const contentEl = topic.querySelector('.section-topic-content');
        if (!contentEl.dataset.loaded) {
          loadTopicCode(topic.dataset.topic, contentEl);
        }
      });
      saveOpenTopics();
    });

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'section-controls-btn';
    collapseBtn.innerHTML = '<i class="material-icons">unfold_less</i> Collapse all';
    collapseBtn.addEventListener('click', function () {
      section.querySelectorAll('.section-topic.open').forEach(function (topic) {
        topic.classList.remove('open');
      });
      saveOpenTopics();
    });

    controls.appendChild(expandBtn);
    controls.appendChild(collapseBtn);
    title.insertAdjacentElement('afterend', controls);
  });
})();

// ============================================================
// TOPIC COUNTS
// ============================================================

(function () {
  document.querySelectorAll('.section').forEach(function (section) {
    const count = section.querySelectorAll('.section-topic').length;
    const title = section.querySelector('.section-title');
    if (title && count > 0) {
      const badge = document.createElement('span');
      badge.className = 'section-title-count';
      badge.textContent = `(${count} topics)`;
      title.appendChild(badge);
    }
  });
})();

// ============================================================
// ACCESSIBILITY
// ============================================================

(function () {
  // Add ARIA attributes to topic headers for accordion pattern
  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const header = topic.querySelector('.section-topic-header');
    const content = topic.querySelector('.section-topic-content');
    const topicId = topic.dataset.topic;

    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', 'topic-' + topicId);
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', 'header-' + topicId);
    header.id = 'header-' + topicId;

    // Allow Enter/Space to toggle
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTopic(header);
      }
    });
  });

  // Update aria-expanded when topics open/close
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'class') {
        const topic = mutation.target;
        if (topic.classList.contains('section-topic')) {
          const header = topic.querySelector('.section-topic-header');
          header.setAttribute('aria-expanded', topic.classList.contains('open') ? 'true' : 'false');
        }
      }
    });
  });

  document.querySelectorAll('.section-topic').forEach(function (topic) {
    observer.observe(topic, { attributes: true });
  });

  // Arrow key navigation between topic headers
  document.addEventListener('keydown', function (e) {
    const active = document.activeElement;
    if (!active || !active.classList.contains('section-topic-header')) return;

    const headers = Array.from(document.querySelectorAll('.section-topic:not(.filtered-out) .section-topic-header'));
    const idx = headers.indexOf(active);
    if (idx === -1) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < headers.length - 1) headers[idx + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) headers[idx - 1].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      headers[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      headers[headers.length - 1].focus();
    }
  });
})();

// ============================================================
// THEME TOGGLE
// ============================================================

(function () {
  const THEME_KEY = 'sjsb_theme';
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!toggle || !icon) return;

  // Restore saved theme
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.textContent = 'light_mode';
  }

  toggle.addEventListener('click', function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      icon.textContent = 'dark_mode';
      localStorage.setItem(THEME_KEY, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      icon.textContent = 'light_mode';
      localStorage.setItem(THEME_KEY, 'dark');
    }
  });
})();

// ============================================================
// URL HASH ROUTING (deep links to topics)
// ============================================================

function openTopicByName(topicName) {
  const topic = document.querySelector('.section-topic[data-topic="' + topicName + '"]');
  if (!topic) return false;

  if (!topic.classList.contains('open')) {
    topic.classList.add('open');
    const contentEl = topic.querySelector('.section-topic-content');
    if (!contentEl.dataset.loaded) {
      loadTopicCode(topicName, contentEl);
    }
    saveOpenTopics();
  }

  setTimeout(function () {
    topic.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  // Brief highlight effect
  topic.style.transition = 'box-shadow 0.3s ease';
  topic.style.boxShadow = '0 0 0 3px var(--yellow-color)';
  setTimeout(function () { topic.style.boxShadow = ''; }, 1500);

  return true;
}

function updateHash(topicName) {
  if (topicName) {
    history.replaceState(null, '', '#topic=' + topicName);
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// Read hash on page load
(function () {
  const hash = window.location.hash;
  if (hash.startsWith('#topic=')) {
    const topicName = hash.substring(7);
    // Wait for DOM to be fully set up
    setTimeout(function () { openTopicByName(topicName); }, 300);
  }

  // Listen for hash changes (back/forward navigation)
  window.addEventListener('hashchange', function () {
    const hash = window.location.hash;
    if (hash.startsWith('#topic=')) {
      openTopicByName(hash.substring(7));
    }
  });
})();

// Add share button to code toolbar (injected in renderCode)
function createShareBtn(topicName) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'code-toolbar-btn';
  shareBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">share</i> Share';
  shareBtn.title = 'Copy link to this topic';
  shareBtn.addEventListener('click', function () {
    const url = window.location.origin + window.location.pathname + '#topic=' + topicName;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        updateHash(topicName);
        const orig = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">check</i> Copied!';
        setTimeout(function () { shareBtn.innerHTML = orig; }, 1500);
      });
    }
  });
  return shareBtn;
}

// ============================================================
// KEYBOARD SHORTCUTS & HELP OVERLAY
// ============================================================

function toggleShortcutsOverlay() {
  let overlay = document.getElementById('shortcuts-overlay');
  if (overlay) {
    overlay.remove();
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'shortcuts-overlay';
  overlay.innerHTML =
    '<div class="shortcuts-modal">' +
      '<div class="shortcuts-modal-header">' +
        '<span>Keyboard Shortcuts</span>' +
        '<button class="shortcuts-modal-close" onclick="document.getElementById(\'shortcuts-overlay\').remove()">&times;</button>' +
      '</div>' +
      '<div class="shortcuts-modal-body">' +
        '<div class="shortcut-row"><kbd>?</kbd><span>Show this help</span></div>' +
        '<div class="shortcut-row"><kbd>/</kbd> or <kbd>Ctrl+K</kbd><span>Focus search</span></div>' +
        '<div class="shortcut-row"><kbd>Esc</kbd><span>Close console / collapse all</span></div>' +
        '<div class="shortcut-row"><kbd>Arrow Up/Down</kbd><span>Navigate between topics</span></div>' +
        '<div class="shortcut-row"><kbd>Enter</kbd> / <kbd>Space</kbd><span>Open/close focused topic</span></div>' +
        '<div class="shortcut-row"><kbd>Home</kbd> / <kbd>End</kbd><span>Jump to first/last topic</span></div>' +
      '</div>' +
    '</div>';
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

document.addEventListener('keydown', function (event) {
  // Don't trigger shortcuts when typing in input
  const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';

  if (event.key === 'Escape') {
    // Close shortcuts overlay first
    const shortcutsOverlay = document.getElementById('shortcuts-overlay');
    if (shortcutsOverlay) { shortcutsOverlay.remove(); return; }
    // Close console if open
    const consoleEl = document.getElementById('sjsb-console');
    if (consoleEl) { consoleEl.remove(); return; }
    // Otherwise close all open topics
    document.querySelectorAll('.section-topic.open').forEach(function (topic) {
      topic.classList.remove('open');
    });
    saveOpenTopics();
  }

  if ((event.ctrlKey && event.key === 'k') || (event.key === '/' && !isInput)) {
    event.preventDefault();
    document.getElementById('query').focus();
  }

  if (event.key === '?' && !isInput) {
    event.preventDefault();
    toggleShortcutsOverlay();
  }
});
