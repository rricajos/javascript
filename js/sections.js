// ============================================================
// SECTIONS.JS - Roadmap navigation, drawer panel, code loading
// ============================================================

const codeCache = {};
var currentDrawerTopic = null;

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
    // Update roadmap dot .read state
    if (progress[name]) {
      topic.classList.add('read');
    } else {
      topic.classList.remove('read');
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
      // Re-render drawer if open
      if (currentDrawerTopic) {
        var contentEl = document.getElementById('drawerContent');
        var quizBody = document.getElementById('quizSlideBody');
        if (quizBody) quizBody.innerHTML = '';
        var code = codeCache[currentDrawerTopic];
        if (contentEl && code) {
          renderCode(contentEl, code, currentDrawerTopic);
        }
      }
    });
  }
  // Review mistakes
  var reviewBtn = document.getElementById('reviewMistakes');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', function () {
      openReviewMode();
    });
  }

  // Export data
  var exportBtn = document.getElementById('exportData');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      var data = {
        progress: getProgress(),
        quizScores: getQuizScores(),
        theme: localStorage.getItem('sjsb_theme') || 'light',
        exported: new Date().toISOString()
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sjsb-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  // Import data
  var importBtn = document.getElementById('importData');
  if (importBtn) {
    importBtn.addEventListener('click', function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', function () {
        var file = input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(reader.result);
            if (data.progress) saveProgress(data.progress);
            if (data.quizScores) localStorage.setItem(QUIZ_KEY, JSON.stringify(data.quizScores));
            updateProgressUI();
            updateQuizDashboard();
            alert('Data imported successfully!');
          } catch (e) {
            alert('Invalid backup file.');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }
})();

// ============================================================
// DRAWER OPEN / CLOSE
// ============================================================

function openQuizSlide(topicName) {
  var quizSlide = document.getElementById('quizSlide');
  var quizBody = document.getElementById('quizSlideBody');
  if (!quizSlide || !quizBody) return;
  quizBody.innerHTML = '';
  // Quiz content is rendered by renderCode — just open the panel
  quizSlide.classList.add('open');
}

function closeQuizSlide() {
  var quizSlide = document.getElementById('quizSlide');
  if (quizSlide) quizSlide.classList.remove('open');
}

// D4: Review mode — open quiz slide with only incorrectly-answered questions
function openReviewMode() {
  var scores = getQuizScores();
  var quizSlide = document.getElementById('quizSlide');
  var quizBody = document.getElementById('quizSlideBody');
  var quizTitle = document.getElementById('quizSlideTitle');
  if (!quizSlide || !quizBody) return;

  quizBody.innerHTML = '';
  if (quizTitle) quizTitle.textContent = 'Review Mistakes';

  var failedItems = [];
  Object.keys(TOPIC_QUIZZES).forEach(function (topic) {
    var topicScores = scores[topic] || {};
    TOPIC_QUIZZES[topic].forEach(function (item, qIdx) {
      if (topicScores[qIdx] === false) {
        failedItems.push({ topic: topic, item: item, qIdx: qIdx });
      }
    });
  });

  if (failedItems.length === 0) {
    quizBody.innerHTML = '<div style="padding:2em;text-align:center;color:#aaa"><i class="material-icons" style="font-size:48px;display:block;margin-bottom:0.5em;color:var(--yellow-color)">emoji_events</i>No mistakes to review! All correct.</div>';
    quizSlide.classList.add('open');
    return;
  }

  var quizDiv = document.createElement('div');
  quizDiv.className = 'topic-quiz';
  quizDiv.innerHTML = '<div class="topic-quiz-header"><i class="material-icons" style="font-size:18px;vertical-align:middle;color:#f44336">replay</i> ' + failedItems.length + ' question' + (failedItems.length !== 1 ? 's' : '') + ' to review</div>';

  failedItems.forEach(function (fi, idx) {
    var item = fi.item;
    var topicLabel = fi.topic.replace(/_/g, ' ');
    var qDiv = document.createElement('div');
    qDiv.className = 'quiz-question';
    qDiv.innerHTML = '<p class="quiz-question-text"><span class="review-topic-label">' + topicLabel + '</span>' + (idx + 1) + '. ' + item.q + '</p>';

    if (item.code) {
      var codeSnippet = document.createElement('pre');
      codeSnippet.className = 'quiz-code-snippet';
      codeSnippet.textContent = item.code;
      qDiv.appendChild(codeSnippet);
    }

    var optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';

    item.opts.forEach(function (opt, oIdx) {
      var btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;

      btn.addEventListener('click', function () {
        optsDiv.querySelectorAll('.quiz-option-btn').forEach(function (b) {
          b.disabled = true;
          b.classList.add('quiz-disabled');
        });
        var isCorrect = oIdx === item.answer;
        if (isCorrect) {
          btn.classList.add('quiz-correct');
        } else {
          btn.classList.add('quiz-wrong');
          optsDiv.querySelectorAll('.quiz-option-btn')[item.answer].classList.add('quiz-correct');
        }
        if (item.explanation) {
          var expDiv = document.createElement('div');
          expDiv.className = 'quiz-explanation';
          expDiv.innerHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)">lightbulb</i> ' + item.explanation;
          qDiv.appendChild(expDiv);
        }
        saveQuizAnswer(fi.topic, fi.qIdx, isCorrect);
      });
      optsDiv.appendChild(btn);
    });

    qDiv.appendChild(optsDiv);
    quizDiv.appendChild(qDiv);
  });

  quizBody.appendChild(quizDiv);
  quizSlide.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openDrawer(topicName) {
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  var titleEl = document.getElementById('drawerTitle');
  var contentEl = document.getElementById('drawerContent');
  if (!drawer || !overlay) return;

  // Set title from node label
  var node = document.querySelector('.roadmap-node[data-topic="' + topicName + '"]');
  titleEl.textContent = node ? node.querySelector('.roadmap-label').textContent : topicName;

  // Scroll drawer body to top and clear content
  var drawerBody = document.getElementById('drawerBody');
  if (drawerBody) drawerBody.scrollTop = 0;
  contentEl.innerHTML = '';
  contentEl.removeAttribute('data-loaded');
  contentEl.style.fontSize = '';

  // Clear and close quiz slide (will reopen if topic has quiz)
  closeQuizSlide();
  var quizBody = document.getElementById('quizSlideBody');
  if (quizBody) quizBody.innerHTML = '';

  loadTopicCode(topicName, contentEl);

  // Mark active node
  document.querySelectorAll('.roadmap-node.node-active').forEach(function (n) {
    n.classList.remove('node-active');
  });
  if (node) node.classList.add('node-active');

  // Open drawer
  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  currentDrawerTopic = topicName;
  updateHash(topicName);
}

function closeDrawer() {
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;

  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  document.querySelectorAll('.roadmap-node.node-active').forEach(function (n) {
    n.classList.remove('node-active');
  });

  currentDrawerTopic = null;
  updateHash(null);
}

// Close everything in sequence: quiz slides away first, then drawer
function closeAll() {
  var quizSlide = document.getElementById('quizSlide');
  if (quizSlide && quizSlide.classList.contains('open')) {
    closeQuizSlide();
    setTimeout(function () { closeDrawer(); }, 350);
  } else {
    closeDrawer();
  }
}

// Wire up drawer close button and overlay click
(function () {
  var closeBtn = document.getElementById('drawerClose');
  var overlay = document.getElementById('drawerOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeAll);
  if (overlay) overlay.addEventListener('click', closeAll);

  // Quiz slide close button
  var quizCloseBtn = document.getElementById('quizSlideClose');
  if (quizCloseBtn) quizCloseBtn.addEventListener('click', closeQuizSlide);
})();

// Wire up roadmap node clicks
(function () {
  document.querySelectorAll('.roadmap-node').forEach(function (node) {
    node.addEventListener('click', function (e) {
      // Don't open drawer if user clicked the check icon
      if (e.target.classList.contains('section-topic-check')) return;
      openDrawer(node.dataset.topic);
    });
  });
})();

// Inject checkboxes into roadmap nodes
(function () {
  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const check = document.createElement('i');
    check.className = 'material-icons section-topic-check';
    check.textContent = 'radio_button_unchecked';
    check.title = 'Mark as read';
    check.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTopicRead(topic.dataset.topic);
    });
    topic.appendChild(check);
  });

  // Inject progress counters into section titles
  document.querySelectorAll('.section').forEach(function (section) {
    const title = section.querySelector('.roadmap-section-title');
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

// Inject difficulty badges into roadmap nodes
(function () {
  document.querySelectorAll('.section-topic').forEach(function (topic) {
    const level = TOPIC_LEVELS[topic.dataset.topic];
    if (!level) return;
    const badge = document.createElement('span');
    badge.className = 'section-topic-level level-' + level;
    badge.textContent = level;
    topic.appendChild(badge);
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

function getTopicMedal(topicName) {
  var scores = getQuizScores();
  var topicScores = scores[topicName];
  var quizData = TOPIC_QUIZZES[topicName];
  if (!topicScores || !quizData) return null;
  var answered = 0, correct = 0;
  Object.keys(topicScores).forEach(function (k) {
    answered++;
    if (topicScores[k]) correct++;
  });
  if (answered < quizData.length) return null;
  var pct = Math.round((correct / quizData.length) * 100);
  if (pct === 100) return 'gold';
  if (pct >= 75) return 'silver';
  if (pct >= 50) return 'bronze';
  return null;
}

function updateMedalBadges() {
  document.querySelectorAll('.roadmap-node[data-topic]').forEach(function (node) {
    var existing = node.querySelector('.quiz-medal');
    if (existing) existing.remove();
    var medal = getTopicMedal(node.dataset.topic);
    if (medal) {
      var badge = document.createElement('span');
      badge.className = 'quiz-medal medal-' + medal;
      badge.textContent = medal === 'gold' ? '\u{1F947}' : medal === 'silver' ? '\u{1F948}' : '\u{1F949}';
      badge.title = medal.charAt(0).toUpperCase() + medal.slice(1) + ' medal';
      node.appendChild(badge);
    }
  });
}

function updateQuizDashboard() {
  var scores = getQuizScores();
  var totalCorrect = 0;
  var totalAnswered = 0;
  var totalQuestions = 0;
  var totalFailed = 0;

  Object.keys(TOPIC_QUIZZES).forEach(function (topic) {
    var quizLen = TOPIC_QUIZZES[topic].length;
    totalQuestions += quizLen;
    if (scores[topic]) {
      Object.keys(scores[topic]).forEach(function (qIdx) {
        totalAnswered++;
        if (scores[topic][qIdx]) totalCorrect++;
        else totalFailed++;
      });
    }
  });

  var el = document.getElementById('quizDashboard');
  if (!el) return;

  if (totalAnswered > 0) {
    el.classList.add('visible');
    var pct = Math.round((totalCorrect / totalQuestions) * 100);
    var countEl = document.getElementById('quizCount');
    countEl.textContent = totalCorrect + ' / ' + totalQuestions + ' correct (' + pct + '%)';

    document.getElementById('quizFill').style.width = pct + '%';

    // Show/hide review button based on failed answers
    var reviewBtn = document.getElementById('reviewMistakes');
    if (reviewBtn) {
      reviewBtn.style.display = totalFailed > 0 ? 'inline-flex' : 'none';
      reviewBtn.title = 'Review ' + totalFailed + ' incorrect answer' + (totalFailed !== 1 ? 's' : '');
    }
  } else {
    el.classList.remove('visible');
  }

  updateMedalBadges();
}

// ============================================================
// MINI-QUIZ DATA
// ============================================================

const TOPIC_QUIZZES = {
  variables_and_types: [
    { q: 'What keyword declares a block-scoped variable that can be reassigned?', opts: ['var', 'let', 'const', 'static'], answer: 1, explanation: 'let is block-scoped (unlike var which is function-scoped) and allows reassignment (unlike const).' },
    { q: 'What does typeof null return?', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2, explanation: 'This is a well-known JS bug from the first implementation. typeof null returns "object" due to how type tags were stored internally.' },
    { q: 'Which comparison operator checks both value and type?', opts: ['==', '===', '!=', '>='], answer: 1, explanation: '=== (strict equality) compares without type coercion, so 1 === "1" is false, while 1 == "1" is true.' },
    { q: 'What does this code print?', code: 'let a = "5";\nlet b = 2;\nconsole.log(a + b);\nconsole.log(a - b);', opts: ['"52" and 3', '7 and 3', '"52" and "52"', 'NaN and NaN'], answer: 0, explanation: 'The + operator concatenates when one operand is a string: "5"+2 = "52". But - always converts to numbers: "5"-2 = 3.' },
    { q: 'What does this code print?', code: 'console.log(typeof undefined);\nconsole.log(typeof undeclaredVar);', opts: ['Error thrown', '"undefined" and "undefined"', '"undefined" and ReferenceError', '"undefined" and "null"'], answer: 1, explanation: 'typeof is special — it returns "undefined" for both undefined values AND undeclared variables without throwing.' }
  ],
  operator_aritmetical: [
    { q: 'What does 10 % 3 return?', opts: ['3', '1', '0', '3.33'], answer: 1, explanation: 'The modulo operator (%) returns the remainder of division. 10 / 3 = 3 remainder 1.' },
    { q: 'What is the result of 2 ** 3?', opts: ['6', '8', '9', '5'], answer: 1, explanation: 'The exponentiation operator (**) raises the left operand to the power of the right. 2³ = 8.' },
    { q: 'What does +"42" evaluate to?', opts: ['NaN', '"42"', '42', 'undefined'], answer: 2, explanation: 'The unary + operator converts its operand to a number. +"42" becomes the number 42.' },
    { q: 'What is typeof (1 / 0)?', opts: ['"undefined"', '"NaN"', '"number"', '"Infinity"'], answer: 2, explanation: '1 / 0 evaluates to Infinity, and typeof Infinity is "number". Infinity is a numeric value in JS.' }
  ],
  operator_assignative: [
    { q: 'What does x += 5 do?', opts: ['Compares x to 5', 'Assigns 5 to x', 'Adds 5 to x and reassigns', 'Returns x + 5'], answer: 2, explanation: 'x += 5 is shorthand for x = x + 5. It adds 5 to x and stores the result back in x.' },
    { q: 'What is the result of let x = 10; x ??= 20?', opts: ['20', '10', 'null', 'undefined'], answer: 1, explanation: '??= only assigns if the left side is null or undefined. Since x is 10 (not nullish), it stays 10.' },
    { q: 'What does x &&= y do?', opts: ['Always assigns y to x', 'Assigns y to x only if x is truthy', 'Assigns y to x only if x is falsy', 'Logical AND of x and y'], answer: 1, explanation: '&&= is the logical AND assignment. It only assigns the right side if the left side is truthy.' },
    { q: 'What does let a = 8; a >>= 2 produce?', opts: ['4', '2', '32', '16'], answer: 1, explanation: '>>= is the right shift assignment. 8 >> 2 shifts binary 1000 right by 2 positions = 10 (decimal 2).' }
  ],
  operator_conditional: [
    { q: 'What does the ternary operator ?: return?', opts: ['Always true', 'One of two values based on a condition', 'A boolean', 'undefined'], answer: 1, explanation: 'The ternary operator evaluates condition ? valueIfTrue : valueIfFalse, returning one of two expressions.' },
    { q: 'What does x ?? y return?', opts: ['x if x is falsy', 'y if x is null or undefined', 'y always', 'x always'], answer: 1, explanation: 'The nullish coalescing operator (??) returns y only when x is null or undefined, not for other falsy values like 0 or "".' },
    { q: 'What does 0 ?? "default" return?', opts: ['"default"', '0', 'null', 'false'], answer: 1, explanation: '?? only triggers on null/undefined. Since 0 is not nullish (just falsy), it returns 0.' },
    { q: 'What does a?.b?.c do if a is null?', opts: ['Throws TypeError', 'Returns undefined', 'Returns null', 'Returns ""'], answer: 1, explanation: 'Optional chaining (?.) short-circuits and returns undefined if a is null or undefined, instead of throwing.' }
  ],
  operator_logical: [
    { q: 'What does false || "hello" return?', opts: ['false', 'true', '"hello"', 'undefined'], answer: 2, explanation: 'The OR operator returns the first truthy value. false is falsy, so it returns "hello".' },
    { q: 'What does true && 0 return?', opts: ['true', 'false', '0', '1'], answer: 2, explanation: 'The AND operator returns the first falsy value or the last value. true is truthy, so it evaluates and returns 0.' },
    { q: 'What does !!"" evaluate to?', opts: ['true', 'false', '""', 'undefined'], answer: 1, explanation: '"" is falsy, so !"" is true, and !!"" is false. Double negation converts to boolean.' },
    { q: 'What does null || 0 || "" || "hi" return?', opts: ['null', '0', '""', '"hi"'], answer: 3, explanation: 'OR returns the first truthy value. null, 0, and "" are all falsy, so it returns "hi".' },
    { q: 'What does this code print?', code: 'let a = 0;\nlet b = "";\nlet c = "JS";\nconsole.log(a || b || c);', opts: ['0', '""', '"JS"', 'false'], answer: 2, explanation: 'OR (||) skips falsy values (0, ""), returning the first truthy one: "JS".' }
  ],
  control_flow: [
    { q: 'Which loop always executes at least once?', opts: ['for', 'while', 'do...while', 'for...of'], answer: 2, explanation: 'do...while checks the condition after executing the body, so it always runs at least once.' },
    { q: 'What does "break" do inside a loop?', opts: ['Skips iteration', 'Exits loop', 'Returns value', 'Pauses execution'], answer: 1, explanation: 'break immediately terminates the innermost enclosing loop. Use "continue" to skip to the next iteration.' },
    { q: 'for...of iterates over:', opts: ['Object keys', 'Iterable values', 'Array indices', 'Prototype chain'], answer: 1, explanation: 'for...of iterates over iterable values (arrays, strings, Maps, Sets). Use for...in for object keys.' },
    { q: 'What happens if no case matches in a switch without default?', opts: ['Error', 'Returns undefined', 'Nothing executes', 'First case runs'], answer: 2, explanation: 'Without a matching case or default clause, the switch statement simply does nothing and execution continues after it.' },
    { q: 'What does this code print?', code: 'for (let i = 0; i < 5; i++) {\n  if (i === 3) continue;\n  if (i === 4) break;\n  console.log(i);\n}', opts: ['0, 1, 2, 3, 4', '0, 1, 2', '0, 1, 2, 4', '0, 1, 2, 3'], answer: 1, explanation: 'Prints 0, 1, 2. At i=3 continue skips the log. At i=4 break exits the loop entirely. So only 0, 1, 2 are printed.' }
  ],
  closures_and_scope: [
    { q: 'What is a closure?', opts: ['A function inside a class', 'A function that remembers its outer scope', 'An arrow function', 'A recursive function'], answer: 1, explanation: 'A closure is created when an inner function retains access to variables from its outer (enclosing) function even after the outer function has returned.' },
    { q: 'Variables declared with var are scoped to the nearest...', opts: ['Block', 'Function', 'Module', 'Loop'], answer: 1, explanation: 'var is function-scoped, meaning it ignores block boundaries like if/for. Use let/const for block scoping.' },
    { q: 'What does this code print?', code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// After all timeouts fire:', opts: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'undefined x3'], answer: 1, explanation: 'Classic closure trap! var is function-scoped, so all 3 callbacks share the same i. By the time they run, the loop has finished and i = 3. Use let to fix.' },
    { q: 'What does this code print?', code: 'function outer() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst fn = outer();\nconsole.log(fn(), fn(), fn());', opts: ['0 0 0', '1 1 1', '1 2 3', 'Error'], answer: 2, explanation: 'The inner function closes over count. Each call increments the same count variable: 1, 2, 3.' }
  ],
  functions: [
    { q: 'Arrow functions do NOT have their own:', opts: ['parameters', 'return value', 'this binding', 'variables'], answer: 2, explanation: 'Arrow functions inherit "this" from their enclosing lexical scope. They also lack arguments object and cannot be used as constructors.' },
    { q: 'What is an IIFE?', opts: ['An async function', 'A function that invokes itself immediately', 'A generator', 'A method'], answer: 1, explanation: 'IIFE (Immediately Invoked Function Expression) is a function defined and called in one step: (function(){})().' },
    { q: 'What are default parameters?', opts: ['Parameters that are always required', 'Values used when argument is undefined', 'Global variables', 'Rest parameters'], answer: 1, explanation: 'Default parameters provide fallback values when arguments are not passed or are undefined: function f(x = 10) {}.' },
    { q: 'What does arguments refer to inside a regular function?', opts: ['An array of parameters', 'An array-like object of passed arguments', 'The function name', 'undefined'], answer: 1, explanation: 'arguments is an array-like object containing all passed arguments. Arrow functions do not have their own arguments.' },
    { q: 'What does this code print?', code: 'console.log(greet());\nfunction greet() {\n  return "Hello!";\n}', opts: ['Error: greet is not defined', '"Hello!"', 'undefined', 'null'], answer: 1, explanation: 'Function declarations are hoisted — the entire function is available before its position in the code. Function expressions are NOT hoisted.' }
  ],
  strings: [
    { q: 'What does "hello".slice(1, 3) return?', opts: ['"hel"', '"el"', '"ell"', '"llo"'], answer: 1, explanation: 'slice(1, 3) extracts characters from index 1 up to (not including) index 3: "e" and "l" = "el".' },
    { q: 'Which method checks if a string starts with a value?', opts: ['includes()', 'startsWith()', 'indexOf()', 'match()'], answer: 1, explanation: 'startsWith() returns true if the string begins with the specified characters. endsWith() checks the end.' },
    { q: 'What does "abc".repeat(3) return?', opts: ['"abc3"', '"abcabcabc"', '["abc","abc","abc"]', '"aaa"'], answer: 1, explanation: 'repeat(n) returns a new string with n copies of the original string concatenated together.' },
    { q: 'Template literals use which character?', opts: ['Single quotes', 'Double quotes', 'Backticks', 'Parentheses'], answer: 2, explanation: 'Template literals use backticks (`) and support string interpolation with ${expression} and multi-line strings.' },
    { q: 'What does this code print?', code: 'const str = "JavaScript";\nconsole.log(str[0]);\nconsole.log(str.at(-1));\nconsole.log(str.length);', opts: ['"J", "t", 10', '"J", "t", 9', '"J", undefined, 10', '"j", "t", 10'], answer: 0, explanation: 'str[0] = "J" (first char). str.at(-1) = "t" (last char via negative index). "JavaScript" has 10 characters.' }
  ],
  regex: [
    { q: 'What flag makes a regex case-insensitive?', opts: ['g', 'i', 'm', 's'], answer: 1, explanation: 'The "i" flag enables case-insensitive matching. "g" is global, "m" is multiline, "s" makes . match newlines.' },
    { q: 'What does \\d match?', opts: ['Any digit', 'Any letter', 'Any whitespace', 'Any character'], answer: 0, explanation: '\\d matches any digit (0-9). \\w matches word chars, \\s matches whitespace, . matches any character except newline.' },
    { q: 'What does /^hello$/ match?', opts: ['Any string containing hello', 'Only the exact string "hello"', 'Strings starting with hello', 'Strings ending with hello'], answer: 1, explanation: '^ asserts start of string, $ asserts end. Together they ensure the entire string is exactly "hello".' },
    { q: 'What does str.match(/a/g) return if str = "banana"?', opts: ['["a"]', '["a","a","a"]', '"a"', '3'], answer: 1, explanation: 'With the global flag (g), match() returns an array of ALL matches. "banana" has 3 "a" characters.' }
  ],
  data_collections_arrays: [
    { q: 'Which method returns a new array without modifying the original?', opts: ['push()', 'splice()', 'map()', 'sort()'], answer: 2, explanation: 'map() creates a new array with the results of calling a function on every element. push/splice/sort mutate the original.' },
    { q: 'What does [1,2,3].reduce((a,b) => a+b, 0) return?', opts: ['[1,2,3]', '6', '0', '3'], answer: 1, explanation: 'reduce() accumulates values: 0+1=1, 1+2=3, 3+3=6. The second argument (0) is the initial accumulator value.' },
    { q: 'What does [1,2,3].find(x => x > 1) return?', opts: ['[2,3]', '2', 'true', '1'], answer: 1, explanation: 'find() returns the FIRST element that satisfies the condition. Use filter() to get all matching elements.' },
    { q: 'What does Array.isArray("hello") return?', opts: ['true', 'false', 'undefined', 'Error'], answer: 1, explanation: 'Array.isArray() checks if the value is an array. Strings are not arrays, so it returns false.' },
    { q: 'What does this code print?', code: 'const arr = [1, 2, 3, 4, 5];\nconst result = arr\n  .filter(x => x % 2 !== 0)\n  .map(x => x * 10);\nconsole.log(result);', opts: ['[10, 30, 50]', '[20, 40]', '[10, 20, 30, 40, 50]', '[1, 3, 5]'], answer: 0, explanation: 'filter keeps odd numbers [1,3,5], then map multiplies each by 10: [10, 30, 50]. Chaining is a common array pattern.' }
  ],
  data_collections_objects: [
    { q: 'Which method returns an array of an object\'s keys?', opts: ['Object.values()', 'Object.keys()', 'Object.entries()', 'Object.assign()'], answer: 1, explanation: 'Object.keys() returns an array of own enumerable property names. values() returns values, entries() returns [key, value] pairs.' },
    { q: 'What does Object.freeze() do?', opts: ['Deletes properties', 'Prevents adding/modifying properties', 'Deep clones', 'Seals the object'], answer: 1, explanation: 'Object.freeze() makes an object immutable — no adding, removing, or modifying properties. It is shallow (nested objects are not frozen).' },
    { q: 'What does {...a, ...b} do?', opts: ['Deep merges a and b', 'Shallow merges, b overwrites a', 'Creates an array', 'Clones only a'], answer: 1, explanation: 'The spread operator creates a shallow copy. Properties from b overwrite same-named properties from a.' },
    { q: 'What does Object.entries({x:1, y:2}) return?', opts: ['["x","y"]', '[[\"x\",1],[\"y\",2]]', '[1,2]', '{x:1,y:2}'], answer: 1, explanation: 'Object.entries() returns an array of [key, value] pairs: [["x",1],["y",2]].' }
  ],
  promises_and_async: [
    { q: 'What does async/await simplify?', opts: ['Loops', 'Promise chains', 'DOM manipulation', 'RegEx'], answer: 1, explanation: 'async/await is syntactic sugar over Promises, letting you write asynchronous code that reads like synchronous code.' },
    { q: 'Promise.all() resolves when:', opts: ['Any promise resolves', 'All promises resolve', 'First promise settles', 'All promises reject'], answer: 1, explanation: 'Promise.all() waits for ALL promises to resolve. If any rejects, the whole thing rejects. Use Promise.allSettled() to wait for all regardless.' },
    { q: 'What does this code print?', code: 'async function getData() {\n  return 42;\n}\nconsole.log(typeof getData());', opts: ['"number"', '"object"', '"undefined"', '"function"'], answer: 1, explanation: 'async functions ALWAYS return a Promise, even if you return a plain value. typeof Promise is "object".' },
    { q: 'In what order does this print?', code: 'console.log("A");\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");', opts: ['A, B, C', 'A, C, B', 'B, A, C', 'C, A, B'], answer: 1, explanation: 'Synchronous code runs first (A, C), then the microtask queue (Promise.then) runs B.' }
  ],
  error_handling: [
    { q: 'Which block always executes whether error occurs or not?', opts: ['try', 'catch', 'finally', 'throw'], answer: 2, explanation: 'finally always runs after try/catch, whether an error occurred or not — useful for cleanup tasks.' },
    { q: 'How do you create a custom error?', opts: ['new Error()', 'throw "error"', 'class MyError extends Error', 'All of the above'], answer: 3, explanation: 'All three work: new Error() creates a standard error, throw can throw anything, and extending Error creates custom types.' },
    { q: 'What property gives the error description?', opts: ['.text', '.message', '.description', '.info'], answer: 1, explanation: 'Error objects have .message (description), .name (error type), and .stack (call trace).' },
    { q: 'What does throw do?', opts: ['Catches an error', 'Creates an error silently', 'Stops execution and signals an error', 'Logs to console'], answer: 2, explanation: 'throw immediately stops the current execution and transfers control to the nearest catch block.' },
    { q: 'What does this code print?', code: 'try {\n  throw new Error("oops");\n  console.log("A");\n} catch (e) {\n  console.log("B");\n} finally {\n  console.log("C");\n}', opts: ['A, B, C', 'B, C', 'A, C', 'C only'], answer: 1, explanation: 'throw jumps to catch (skipping "A"), printing "B". finally always runs, printing "C". Result: B, C.' }
  ],
  fetch_api: [
    { q: 'fetch() returns a:', opts: ['String', 'JSON object', 'Promise', 'Response'], answer: 2, explanation: 'fetch() is Promise-based. It resolves to a Response object; you then call .json() or .text() to parse the body.' },
    { q: 'How do you cancel a fetch request?', opts: ['fetch.cancel()', 'AbortController', 'clearTimeout()', 'Promise.reject()'], answer: 1, explanation: 'AbortController creates a signal that can be passed to fetch. Calling controller.abort() cancels the request.' },
    { q: 'Does fetch reject on HTTP 404/500 errors?', opts: ['Yes always', 'No, only on network failure', 'Only on 500', 'Depends on browser'], answer: 1, explanation: 'fetch() only rejects on network failures. For HTTP errors, check response.ok or response.status manually.' },
    { q: 'How do you send a POST request with fetch?', opts: ['fetch(url, "POST")', 'fetch(url, {method:"POST"})', 'fetch.post(url)', 'fetch(url).post()'], answer: 1, explanation: 'Pass an options object as the second argument with method, headers, and body properties.' }
  ],
  dom_manipulation: [
    { q: 'Which method selects the first matching element?', opts: ['getElementById()', 'querySelector()', 'querySelectorAll()', 'getElementsByClassName()'], answer: 1, explanation: 'querySelector() returns the first element matching a CSS selector. getElementById() matches by ID only.' },
    { q: 'What does element.remove() do?', opts: ['Hides element', 'Removes from DOM', 'Clears innerHTML', 'Removes attributes'], answer: 1, explanation: 'remove() detaches the element from the DOM entirely. The JS reference still exists but the element is no longer visible.' },
    { q: 'What is a DocumentFragment?', opts: ['A string of HTML', 'A lightweight container for DOM nodes', 'A CSS selector', 'An event type'], answer: 1, explanation: 'DocumentFragment is a minimal DOM node that has no parent. Used to batch DOM operations before inserting, improving performance.' },
    { q: 'dataset.myValue accesses which HTML attribute?', opts: ['my-value', 'data-my-value', 'myValue', 'value'], answer: 1, explanation: 'The dataset property provides access to data-* attributes. data-my-value becomes element.dataset.myValue (camelCase).' }
  ],
  dom_events: [
    { q: 'Which method attaches an event handler?', opts: ['onclick()', 'addEventListener()', 'attachEvent()', 'bindEvent()'], answer: 1, explanation: 'addEventListener() is the modern standard. It supports multiple handlers per event and options like capture/once.' },
    { q: 'Event delegation uses which propagation phase?', opts: ['Capture', 'Bubble', 'Target', 'None'], answer: 1, explanation: 'Event delegation attaches a single listener to a parent, leveraging event bubbling to handle events from child elements.' },
    { q: 'e.stopPropagation() prevents:', opts: ['Default action', 'Event from reaching other listeners on the same element', 'Event from reaching parent elements', 'All of the above'], answer: 2, explanation: 'stopPropagation() stops the event from bubbling to parent elements. Use preventDefault() to stop the default action.' },
    { q: 'What does {once: true} do in addEventListener?', opts: ['Fires handler once then auto-removes', 'Ensures only one handler exists', 'Delays execution', 'Prevents bubbling'], answer: 0, explanation: 'The once option automatically removes the listener after the first invocation, equivalent to manually calling removeEventListener.' }
  ],
  event_loop: [
    { q: 'Microtasks (Promise.then) execute before:', opts: ['Synchronous code', 'Macrotasks (setTimeout)', 'The call stack', 'Nothing'], answer: 1, explanation: 'After the call stack empties, all microtasks (Promises) run before the next macrotask (setTimeout, setInterval).' },
    { q: 'setTimeout(fn, 0) runs:', opts: ['Immediately', 'After current call stack clears', 'Never', 'Before promises'], answer: 1, explanation: 'setTimeout(fn, 0) queues a macrotask. It runs after the stack clears AND after all pending microtasks.' },
    { q: 'queueMicrotask() schedules a:', opts: ['Macrotask', 'Microtask', 'Animation frame', 'Web Worker'], answer: 1, explanation: 'queueMicrotask() adds a callback to the microtask queue, similar to Promise.resolve().then(fn).' },
    { q: 'requestAnimationFrame runs before:', opts: ['Microtasks', 'The next repaint', 'setTimeout(fn,0)', 'Synchronous code'], answer: 1, explanation: 'requestAnimationFrame callbacks run right before the browser\'s next repaint cycle, typically at 60fps.' },
    { q: 'What order does this print?', code: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");', opts: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '1, 3, 4, 2'], answer: 1, explanation: 'Sync first: 1, 4. Then microtask (Promise): 3. Then macrotask (setTimeout): 2. Order: 1, 4, 3, 2.' }
  ],
  classes_and_oop: [
    { q: 'What keyword creates a subclass?', opts: ['implements', 'extends', 'inherits', 'uses'], answer: 1, explanation: 'extends creates a class that inherits from another. The child class gets all parent methods and can override them.' },
    { q: 'Private fields in JS classes start with:', opts: ['_', '#', '@', '$'], answer: 1, explanation: '#privateField is truly private in JS classes — not accessible outside the class body. _ is only a naming convention.' },
    { q: 'super() must be called:', opts: ['In any method', 'Before using "this" in a subclass constructor', 'After return', 'Only in static methods'], answer: 1, explanation: 'In a subclass constructor, super() must be called before accessing "this", as it initializes the parent class.' },
    { q: 'Static methods belong to:', opts: ['Each instance', 'The class itself', 'The prototype', 'The global scope'], answer: 1, explanation: 'Static methods are called on the class (e.g., Array.isArray()), not on instances. Defined with the static keyword.' },
    { q: 'What does this code print?', code: 'class Animal {\n  speak() { return "..."; }\n}\nclass Dog extends Animal {\n  speak() { return "Woof!"; }\n}\nconst d = new Dog();\nconsole.log(d.speak());\nconsole.log(d instanceof Animal);', opts: ['"Woof!" and true', '"..." and true', '"Woof!" and false', 'Error'], answer: 0, explanation: 'Dog overrides speak() so d.speak() = "Woof!". d is an instance of Dog AND Animal (via prototype chain), so instanceof returns true.' }
  ],
  iterators_generators: [
    { q: 'A generator function is declared with:', opts: ['function*', 'async function', 'gen function', 'yield function'], answer: 0, explanation: 'The asterisk after function (function*) marks it as a generator that can yield multiple values.' },
    { q: 'What does yield do?', opts: ['Returns and exits', 'Pauses and produces a value', 'Throws an error', 'Loops'], answer: 1, explanation: 'yield pauses the generator and sends a value out. Calling next() resumes execution from where it paused.' },
    { q: 'What method advances a generator?', opts: ['.resume()', '.next()', '.continue()', '.step()'], answer: 1, explanation: 'Calling gen.next() resumes the generator until the next yield, returning {value, done}.' },
    { q: 'An object is iterable if it has:', opts: ['a .length property', 'a Symbol.iterator method', 'a .forEach method', 'a .next method'], answer: 1, explanation: 'The iterable protocol requires a [Symbol.iterator]() method that returns an iterator with a .next() method.' },
    { q: 'What does this code print?', code: 'function* counter() {\n  yield 1;\n  yield 2;\n  yield 3;\n}\nconst gen = counter();\nconsole.log(gen.next().value);\nconsole.log(gen.next().value);\nconsole.log(gen.next().done);', opts: ['1, 2, true', '1, 2, false', '1, 2, 3', '1, 2, undefined'], answer: 1, explanation: 'First next() yields 1, second yields 2. Third next() yields 3 (not done yet — done is false). It would be true on the FOURTH call.' }
  ],
  proxy_and_reflect: [
    { q: 'A Proxy wraps an object to intercept:', opts: ['Events', 'Operations like get/set', 'Network requests', 'CSS styles'], answer: 1, explanation: 'Proxy intercepts fundamental operations (get, set, delete, etc.) through handler trap functions.' },
    { q: 'Reflect.ownKeys() returns:', opts: ['Only string keys', 'Only symbol keys', 'All own keys including symbols', 'Inherited keys'], answer: 2, explanation: 'Reflect.ownKeys() returns all own property keys — strings AND symbols, unlike Object.keys() which skips symbols.' },
    { q: 'What is a Proxy "trap"?', opts: ['An error handler', 'A handler method that intercepts an operation', 'A debugging tool', 'A loop prevention'], answer: 1, explanation: 'Traps are functions in the handler object (get, set, has, etc.) that intercept corresponding operations on the target.' },
    { q: 'Proxy can make an object:', opts: ['Faster', 'Reactive/observable', 'Immutable only', 'Async'], answer: 1, explanation: 'By intercepting set/get operations, Proxies enable reactive patterns where changes automatically trigger updates.' }
  ],
  memory_and_performance: [
    { q: 'What helps prevent excessive function calls on scroll?', opts: ['Memoize', 'Debounce/Throttle', 'WeakRef', 'Proxy'], answer: 1, explanation: 'Debounce delays until quiet period; throttle limits to once per interval. Both reduce excessive event handler calls.' },
    { q: 'WeakMap keys are:', opts: ['Strings only', 'Numbers only', 'Objects (weakly held)', 'Any value'], answer: 2, explanation: 'WeakMap keys must be objects and are weakly referenced — if no other reference exists, they can be garbage collected.' },
    { q: 'What causes a memory leak?', opts: ['Using const', 'Forgotten references preventing GC', 'Using strict mode', 'Small arrays'], answer: 1, explanation: 'Memory leaks occur when objects that are no longer needed still have references (e.g., event listeners, closures, detached DOM).' },
    { q: 'requestIdleCallback runs when:', opts: ['Immediately', 'During browser idle time', 'Before every repaint', 'Every second'], answer: 1, explanation: 'requestIdleCallback schedules low-priority work to run when the browser has free time between frames.' }
  ],
  modules: [
    { q: 'Which keyword imports a module in ESM?', opts: ['require()', 'import', 'include', 'load'], answer: 1, explanation: 'ESM uses import/export syntax. require() is CommonJS (Node.js). ESM is the official JS module standard.' },
    { q: 'A file can have how many default exports?', opts: ['Unlimited', 'One', 'Two', 'Zero'], answer: 1, explanation: 'Each module can have at most one default export but unlimited named exports.' },
    { q: 'import() (dynamic) returns:', opts: ['The module directly', 'A Promise', 'undefined', 'A string'], answer: 1, explanation: 'Dynamic import() returns a Promise that resolves to the module, enabling lazy loading and code splitting.' },
    { q: 'Named exports are imported with:', opts: ['import x from', 'import {x} from', 'import * from', 'require(x)'], answer: 1, explanation: 'Named exports use destructuring syntax: import {x, y} from "module". Default exports use import x from "module".' }
  ],
  web_storage: [
    { q: 'localStorage data persists until:', opts: ['Tab closes', 'Browser closes', 'Manually cleared', 'Page refreshes'], answer: 2, explanation: 'localStorage has no expiration — data persists until explicitly removed via removeItem() or clear().' },
    { q: 'sessionStorage data persists until:', opts: ['Tab/window closes', 'Browser closes', 'Manually cleared', 'Forever'], answer: 0, explanation: 'sessionStorage is scoped to the tab/window. Data is cleared when the tab is closed.' },
    { q: 'localStorage stores data as:', opts: ['JSON', 'Binary', 'Strings only', 'Any JS type'], answer: 2, explanation: 'localStorage only stores strings. Use JSON.stringify() to store objects and JSON.parse() to retrieve them.' },
    { q: 'The "storage" event fires:', opts: ['On the same tab', 'On other tabs of same origin', 'On all browsers', 'Never automatically'], answer: 1, explanation: 'The storage event fires on OTHER tabs/windows of the same origin when localStorage changes, enabling cross-tab sync.' }
  ],
  web_apis: [
    { q: 'Which API accesses the clipboard?', opts: ['Clipboard API', 'Storage API', 'History API', 'URL API'], answer: 0, explanation: 'The Clipboard API (navigator.clipboard) provides read/write access to the system clipboard asynchronously.' },
    { q: 'Geolocation.getCurrentPosition() is:', opts: ['Synchronous', 'Asynchronous (callback)', 'A Promise', 'Blocking'], answer: 1, explanation: 'Geolocation uses callbacks (success, error). It\'s async but predates Promises. Requires user permission.' },
    { q: 'IntersectionObserver detects:', opts: ['Click events', 'Element visibility in viewport', 'Network status', 'Screen size'], answer: 1, explanation: 'IntersectionObserver watches when elements enter/exit the viewport or an ancestor, useful for lazy loading and infinite scroll.' },
    { q: 'Which API enables background scripts for offline?', opts: ['Web Workers', 'Service Workers', 'WebSockets', 'IndexedDB'], answer: 1, explanation: 'Service Workers act as a network proxy, enabling offline support, caching, and push notifications.' }
  ],
  destructuring_and_spread: [
    { q: 'What does ...arr do when used in a function parameter?', opts: ['Spread', 'Rest (collects args)', 'Destructure', 'Clone'], answer: 1, explanation: 'In function parameters, ... is the rest operator — it collects remaining arguments into an array.' },
    { q: 'const {a: x} = {a: 1} — what is x?', opts: ['undefined', '{a:1}', '1', '"a"'], answer: 2, explanation: '{a: x} renames "a" to "x" during destructuring. x gets the value of a, which is 1.' },
    { q: 'What does [a, , b] = [1, 2, 3] assign to b?', opts: ['2', '3', 'undefined', 'Error'], answer: 1, explanation: 'The empty slot (,,) skips index 1. So a=1, index 1 is skipped, and b=3.' },
    { q: 'const [first, ...rest] = [1,2,3] — what is rest?', opts: ['[2,3]', '[1,2,3]', '3', '2'], answer: 0, explanation: 'Rest in array destructuring collects remaining elements. first=1, rest=[2,3].' },
    { q: 'What does this code print?', code: 'const user = { name: "Ana", age: 25 };\nconst clone = { ...user, age: 30 };\nconsole.log(user.age, clone.age);', opts: ['30, 30', '25, 30', '25, 25', 'Error'], answer: 1, explanation: 'Spread creates a shallow copy. The age: 30 after the spread overwrites clone.age. The original user is unchanged.' }
  ],
  json_and_dates: [
    { q: 'JSON.stringify() converts:', opts: ['String to object', 'Object to JSON string', 'JSON to array', 'Number to string'], answer: 1, explanation: 'JSON.stringify() serializes a JS value to a JSON string. JSON.parse() does the reverse.' },
    { q: 'new Date().getMonth() returns January as:', opts: ['1', '0', '"January"', '"Jan"'], answer: 1, explanation: 'Months are 0-indexed in JS Date: January=0, February=1, ... December=11. A common gotcha!' },
    { q: 'Which values does JSON.stringify() skip?', opts: ['Numbers', 'Strings', 'Functions and undefined', 'Arrays'], answer: 2, explanation: 'JSON.stringify() omits functions, undefined, and Symbol values. null and NaN are preserved.' },
    { q: 'Date.now() returns:', opts: ['A Date object', 'A formatted string', 'Milliseconds since epoch', 'Seconds since epoch'], answer: 2, explanation: 'Date.now() returns the number of milliseconds since January 1, 1970 (Unix epoch) as a number.' },
    { q: 'What does this code print?', code: 'const obj = { a: 1, b: undefined, c: function(){} };\nconsole.log(JSON.stringify(obj));', opts: ['{"a":1,"b":undefined,"c":"function(){}"}', '{"a":1}', '{"a":1,"b":null}', 'Error'], answer: 1, explanation: 'JSON.stringify() silently omits properties whose value is undefined or a function. Only {"a":1} remains.' }
  ],
  web_components: [
    { q: 'Custom element names must contain:', opts: ['Underscore', 'Hyphen', 'Number', 'Uppercase letter'], answer: 1, explanation: 'Custom elements require a hyphen (e.g., my-component) to avoid conflicts with current/future HTML elements.' },
    { q: 'Shadow DOM provides:', opts: ['Server rendering', 'Style encapsulation', 'Faster loading', 'Database access'], answer: 1, explanation: 'Shadow DOM creates an encapsulated DOM subtree with isolated styles that don\'t leak in or out.' },
    { q: 'Which lifecycle callback fires when element is added to DOM?', opts: ['constructor()', 'connectedCallback()', 'adoptedCallback()', 'attributeChangedCallback()'], answer: 1, explanation: 'connectedCallback() fires each time the element is inserted into the DOM. constructor() runs at creation time.' },
    { q: 'HTML templates render:', opts: ['Immediately on parse', 'Only when cloned and inserted', 'On page load', 'After DOMContentLoaded'], answer: 1, explanation: '<template> content is parsed but not rendered. You must clone it (cloneNode) and insert it into the DOM.' }
  ],
  testing_basics: [
    { q: 'In TDD, what do you write first?', opts: ['Implementation', 'Documentation', 'Failing test', 'Database schema'], answer: 2, explanation: 'Test-Driven Development: write a failing test first, then implement just enough code to pass it, then refactor.' },
    { q: 'AAA pattern stands for:', opts: ['Act-Assert-Arrange', 'Arrange-Act-Assert', 'Assert-Act-Arrange', 'Arrange-Assert-Act'], answer: 1, explanation: 'Arrange (setup), Act (execute), Assert (verify). This pattern keeps tests organized and readable.' },
    { q: 'A "mock" is:', opts: ['A real database', 'A fake implementation for testing', 'A test runner', 'A code formatter'], answer: 1, explanation: 'Mocks simulate dependencies (APIs, databases) so you can test units in isolation without side effects.' },
    { q: 'What does code coverage measure?', opts: ['Performance', 'How much code is executed by tests', 'Number of tests', 'File size'], answer: 1, explanation: 'Code coverage reports the percentage of lines, branches, and functions exercised by your test suite.' }
  ],
  logic_gates: [
    { q: 'What does the XOR gate return?', opts: ['true if both true', 'true if inputs differ', 'true if both false', 'always true'], answer: 1, explanation: 'XOR (exclusive OR) returns true only when inputs are different. In JS: a ^ b.' },
    { q: 'What is 5 & 3 in JavaScript?', opts: ['7', '1', '8', '15'], answer: 1, explanation: '5 is 101, 3 is 011 in binary. AND (101 & 011) = 001 = 1.' },
    { q: 'Which gate is called "universal" (can build all others)?', opts: ['AND', 'OR', 'NAND', 'XOR'], answer: 2, explanation: 'NAND (and NOR) are universal gates — any other gate can be constructed using only NAND gates.' },
    { q: 'What does this code print?', code: 'console.log(5 | 3);\nconsole.log(5 ^ 3);\nconsole.log(~5);', opts: ['7, 6, -6', '1, 6, -5', '7, 6, -5', '8, 6, -6'], answer: 0, explanation: '5|3: 101|011=111=7. 5^3: 101^011=110=6. ~5: bitwise NOT flips all bits, result is -(5+1)=-6.' }
  ]
};

// ============================================================
// NAVIGATION
// ============================================================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================
// CODE LOADING & RENDERING
// ============================================================

function loadTopicCode(topicName, contentEl) {
  const src = `js/${topicName}.js`;

  contentEl.classList.add('loading');
  contentEl.innerHTML = '<div class="skeleton-loading">' +
    '<div class="skeleton-line" style="width:60%"></div>' +
    '<div class="skeleton-line" style="width:80%"></div>' +
    '<div class="skeleton-line" style="width:45%"></div>' +
    '<div class="skeleton-line" style="width:70%"></div>' +
    '<div class="skeleton-line" style="width:55%"></div>' +
    '<div class="skeleton-line" style="width:90%"></div>' +
    '<div class="skeleton-line" style="width:35%"></div>' +
    '</div>';

  if (codeCache[topicName]) {
    renderCode(contentEl, codeCache[topicName], topicName);
    return;
  }

  fetch(src)
    .then(function (response) {
      if (!response.ok) throw new Error(`Failed to load ${src} (${response.status})`);
      return response.text();
    })
    .then(function (code) {
      codeCache[topicName] = code;
      renderCode(contentEl, code, topicName);
    })
    .catch(function (error) {
      contentEl.classList.remove('loading');
      contentEl.textContent = 'Error: ' + error.message;
    });
}

function renderCode(contentEl, code, topicName) {
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
      const relNode = document.querySelector('.roadmap-node[data-topic="' + rel + '"]');
      if (!relNode) return;
      const title = relNode.querySelector('.roadmap-label').textContent.trim();
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'code-related-link';
      link.textContent = title;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer(rel);
      });
      if (i > 0) relatedDiv.appendChild(document.createTextNode(' \u00b7 '));
      relatedDiv.appendChild(link);
    });
    contentEl.appendChild(relatedDiv);
  }

  // Add mini-quiz if available — render into quiz slide panel
  var quizSlideBody = document.getElementById('quizSlideBody');
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

      // Code output question: show code snippet
      if (item.code) {
        var codeSnippet = document.createElement('pre');
        codeSnippet.className = 'quiz-code-snippet';
        codeSnippet.textContent = item.code;
        qDiv.appendChild(codeSnippet);
      }

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
          // Show explanation if available
          if (item.explanation) {
            var expDiv = document.createElement('div');
            expDiv.className = 'quiz-explanation';
            expDiv.innerHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)">lightbulb</i> ' + item.explanation;
            qDiv.appendChild(expDiv);
          }
          saveQuizAnswer(topicName, qIdx, isCorrect);
        });
        optsDiv.appendChild(btn);
      });

      qDiv.appendChild(optsDiv);

      // Show explanation for already-answered questions
      if (topicScores[qIdx] !== undefined && item.explanation) {
        var expDiv = document.createElement('div');
        expDiv.className = 'quiz-explanation';
        expDiv.innerHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)">lightbulb</i> ' + item.explanation;
        qDiv.appendChild(expDiv);
      }

      quizDiv.appendChild(qDiv);
    });

    // Render into quiz slide and open it
    if (quizSlideBody) {
      quizSlideBody.appendChild(quizDiv);
      openQuizSlide(topicName);
    } else {
      contentEl.appendChild(quizDiv);
    }
  }

  contentEl.dataset.loaded = 'true';
}

// ============================================================
// RUN CODE & COPY
// ============================================================

// Sandbox source shared between main-thread fallback and Worker
var _sandboxSrc =
  'var document = (function () {\n' +
  '  var fakeEl = {\n' +
  '    style: {}, classList: { add: function(){}, remove: function(){}, toggle: function(){}, contains: function(){ return false; } },\n' +
  '    addEventListener: function(){}, removeEventListener: function(){},\n' +
  '    setAttribute: function(){}, getAttribute: function(){ return ""; },\n' +
  '    appendChild: function(c){ return c; }, removeChild: function(){},\n' +
  '    insertBefore: function(c){ return c; }, remove: function(){},\n' +
  '    querySelector: function(){ return fakeEl; }, querySelectorAll: function(){ return []; },\n' +
  '    innerHTML: "", textContent: "", value: "", id: "", className: "",\n' +
  '    children: [], childNodes: [], parentNode: null, parentElement: null,\n' +
  '    getBoundingClientRect: function(){ return { top:0,left:0,right:0,bottom:0,width:0,height:0 }; },\n' +
  '    cloneNode: function(){ return fakeEl; }, closest: function(){ return null; },\n' +
  '    matches: function(){ return false; }, contains: function(){ return false; },\n' +
  '    focus: function(){}, blur: function(){}, click: function(){},\n' +
  '    dispatchEvent: function(){ return true; },\n' +
  '    dataset: {}, offsetWidth: 0, offsetHeight: 0, scrollTop: 0, scrollLeft: 0\n' +
  '  };\n' +
  '  return {\n' +
  '    getElementById: function(){ return fakeEl; },\n' +
  '    querySelector: function(){ return fakeEl; },\n' +
  '    querySelectorAll: function(){ return []; },\n' +
  '    createElement: function(tag){ return Object.assign({}, fakeEl, { tagName: tag.toUpperCase() }); },\n' +
  '    createTextNode: function(t){ return { textContent: t }; },\n' +
  '    createDocumentFragment: function(){ return Object.assign({}, fakeEl); },\n' +
  '    addEventListener: function(){}, removeEventListener: function(){},\n' +
  '    body: fakeEl, head: fakeEl, documentElement: fakeEl,\n' +
  '    cookie: "", title: "", readyState: "complete"\n' +
  '  };\n' +
  '})();\n' +
  'var window = {\n' +
  '  addEventListener: function(){}, removeEventListener: function(){},\n' +
  '  setTimeout: setTimeout, clearTimeout: clearTimeout,\n' +
  '  setInterval: setInterval, clearInterval: clearInterval,\n' +
  '  innerWidth: 1024, innerHeight: 768, scrollY: 0, scrollX: 0,\n' +
  '  location: { href: "", origin: "", pathname: "/", hash: "" },\n' +
  '  navigator: { userAgent: "SJSB Sandbox" },\n' +
  '  history: { pushState: function(){}, replaceState: function(){}, back: function(){}, forward: function(){} },\n' +
  '  localStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){}, clear: function(){} },\n' +
  '  sessionStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){}, clear: function(){} },\n' +
  '  requestAnimationFrame: function(cb){ return setTimeout(cb, 16); },\n' +
  '  cancelAnimationFrame: function(id){ clearTimeout(id); },\n' +
  '  getComputedStyle: function(){ return {}; },\n' +
  '  matchMedia: function(){ return { matches: false, addEventListener: function(){} }; },\n' +
  '  alert: function(m){ console.log("[alert] " + m); },\n' +
  '  confirm: function(){ return true; },\n' +
  '  prompt: function(msg, def){ return def || ""; },\n' +
  '  fetch: function(url) {\n' +
  '    console.log("[fetch] " + url + " (sandbox mock)");\n' +
  '    return Promise.resolve({ ok: true, status: 200, statusText: "OK", json: function(){ return Promise.resolve({}); }, text: function(){ return Promise.resolve(""); }, headers: { get: function(){ return ""; } } });\n' +
  '  },\n' +
  '  XMLHttpRequest: function(){},\n' +
  '  WebSocket: function(){},\n' +
  '  Worker: function(){},\n' +
  '  IntersectionObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; },\n' +
  '  MutationObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; },\n' +
  '  ResizeObserver: function(cb){ this.observe = function(){}; this.disconnect = function(){}; }\n' +
  '};\n' +
  'var fetch = window.fetch;\n' +
  'var alert = window.alert;\n' +
  'var confirm = window.confirm;\n' +
  'var prompt = window.prompt;\n' +
  'var localStorage = window.localStorage;\n' +
  'var sessionStorage = window.sessionStorage;\n' +
  'var navigator = window.navigator;\n' +
  'var requestAnimationFrame = window.requestAnimationFrame;\n' +
  'var HTMLElement = (function () {\n' +
  '  function HTMLElement() {}\n' +
  '  HTMLElement.prototype.attachShadow = function() {\n' +
  '    var shadow = Object.assign({}, document.createElement("div"));\n' +
  '    shadow.getElementById = function(){ return document.createElement("div"); };\n' +
  '    shadow.innerHTML = "";\n' +
  '    this.shadowRoot = shadow;\n' +
  '    return shadow;\n' +
  '  };\n' +
  '  HTMLElement.prototype.getAttribute = function(){ return ""; };\n' +
  '  HTMLElement.prototype.setAttribute = function(){};\n' +
  '  HTMLElement.prototype.addEventListener = function(){};\n' +
  '  HTMLElement.prototype.dispatchEvent = function(){ return true; };\n' +
  '  HTMLElement.prototype.connectedCallback = function(){};\n' +
  '  HTMLElement.prototype.disconnectedCallback = function(){};\n' +
  '  HTMLElement.prototype.attributeChangedCallback = function(){};\n' +
  '  HTMLElement.observedAttributes = [];\n' +
  '  return HTMLElement;\n' +
  '})();\n' +
  'var HTMLButtonElement = HTMLElement;\n' +
  'var customElements = {\n' +
  '  _registry: {},\n' +
  '  define: function(name, cls, opts) { this._registry[name] = cls; },\n' +
  '  get: function(name) { return this._registry[name]; },\n' +
  '  whenDefined: function() { return Promise.resolve(); }\n' +
  '};\n' +
  'var CustomEvent = function(type, opts) { this.type = type; this.detail = (opts && opts.detail) || null; this.bubbles = (opts && opts.bubbles) || false; this.composed = (opts && opts.composed) || false; };\n' +
  'var Event = function(type, opts) { this.type = type; this.bubbles = (opts && opts.bubbles) || false; this.preventDefault = function(){}; this.stopPropagation = function(){}; };\n';

var RUN_TIMEOUT_MS = 3000;

function _prepareCode(code) {
  return code
    .split('\n')
    .map(function (line) {
      var trimmed = line.trim();
      if (/^import\s/.test(trimmed) || /^export\s/.test(trimmed)) return '// [skipped] ' + line;
      if (/^await\s/.test(trimmed)) return '// [skipped] ' + line;
      return line;
    })
    .join('\n');
}

function _getConsolePanel() {
  var output = document.getElementById('sjsb-console');
  if (!output) {
    output = document.createElement('div');
    output.id = 'sjsb-console';
    output.innerHTML = '<div class="console-header"><span>Console Output</span><button onclick="this.parentElement.parentElement.remove()" class="console-close">&times;</button></div><pre class="console-body"></pre>';
    document.body.appendChild(output);
  }
  output.style.display = 'block';
  return output;
}

function runCode(code) {
  var output = _getConsolePanel();
  var body = output.querySelector('.console-body');
  body.textContent = 'Running\u2026';

  var safeCode = _prepareCode(code);

  // Build worker source with console capture
  var workerSrc =
    'var _logs = [];\n' +
    'var console = {\n' +
    '  log: function() { var a = Array.prototype.slice.call(arguments).map(function(v){ if(v===null)return"null"; if(v===undefined)return"undefined"; return typeof v==="object"?JSON.stringify(v,null,2):String(v); }); _logs.push(a.join(" ")); },\n' +
    '  error: function() { _logs.push("[ERROR] " + Array.prototype.slice.call(arguments).join(" ")); },\n' +
    '  warn: function() { _logs.push("[WARN] " + Array.prototype.slice.call(arguments).join(" ")); },\n' +
    '  info: function() { _logs.push("[INFO] " + Array.prototype.slice.call(arguments).join(" ")); },\n' +
    '  table: function(data) { _logs.push(typeof data==="object"?JSON.stringify(data,null,2):String(data)); },\n' +
    '  dir: function(obj) { _logs.push(typeof obj==="object"?JSON.stringify(obj,null,2):String(obj)); }\n' +
    '};\n' +
    _sandboxSrc + '\n' +
    'try {\n' + safeCode + '\n} catch(_e) { _logs.push("[ERROR] " + _e.name + ": " + _e.message); }\n' +
    'postMessage(_logs);\n';

  // Try Web Worker with timeout; fall back to main-thread if Workers unavailable
  if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
    var blob = new Blob([workerSrc], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var worker = new Worker(url);
    var done = false;

    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      worker.terminate();
      URL.revokeObjectURL(url);
      body.textContent = '[TIMEOUT] Execution exceeded ' + (RUN_TIMEOUT_MS / 1000) + 's \u2014 possible infinite loop';
    }, RUN_TIMEOUT_MS);

    worker.onmessage = function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      var logs = e.data || [];
      body.textContent = logs.length > 0 ? logs.join('\n') : '(no console output)';
    };

    worker.onerror = function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      body.textContent = '[ERROR] ' + (e.message || 'Unknown worker error');
    };
  } else {
    // Fallback: main-thread execution (no timeout protection)
    var logs = [];
    var origLog = console.log, origErr = console.error, origWarn = console.warn;
    console.log = function () { var a = Array.from(arguments).map(function (v) { if (v === null) return 'null'; if (v === undefined) return 'undefined'; return typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v); }); logs.push(a.join(' ')); origLog.apply(console, arguments); };
    console.error = function () { logs.push('[ERROR] ' + Array.from(arguments).join(' ')); origErr.apply(console, arguments); };
    console.warn = function () { logs.push('[WARN] ' + Array.from(arguments).join(' ')); origWarn.apply(console, arguments); };
    try { new Function(_sandboxSrc + '\n' + safeCode)(); } catch (err) { logs.push('[ERROR] ' + err.name + ': ' + err.message); }
    console.log = origLog; console.error = origErr; console.warn = origWarn;
    body.textContent = logs.length > 0 ? logs.join('\n') : '(no console output)';
  }
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

var _highlightCache = {};

function highlightLine(line) {
  if (!line.trim()) return '\n';

  // Return cached result if available
  if (_highlightCache[line] !== undefined) return _highlightCache[line];

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
          tmplParts.push({ type: 'string-mid', value: buf + '${' });
          buf = '';
          i += 2;
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

  _highlightCache[line] = html;
  return html;
}

// ============================================================
// SEARCH FILTER
// ============================================================

var _searchTimer = null;
function search() {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(function () {
    smoothScrollToTop();
    var query = document.getElementById("query").value;
    var banner = document.getElementById("banner");

    if (query !== "") {
      banner.style.height = "0px";
    } else {
      banner.style.height = "222px";
    }

    filterTopics(query);
  }, 200);
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
      const label = topic.querySelector('.roadmap-label');
      const labelText = label ? label.textContent.toLowerCase() : '';
      const topicName = topic.dataset.topic.toLowerCase().replace(/_/g, ' ');

      // Also search in loaded code content
      const cachedCode = codeCache[topic.dataset.topic];
      const codeMatch = cachedCode ? cachedCode.toLowerCase().includes(normalizedQuery) : false;

      const matches = !normalizedQuery ||
        labelText.includes(normalizedQuery) ||
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

  backToTop.addEventListener('click', function () {
    smoothScrollToTop();
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });
})();

// Wire cube navigation clicks (no inline onclick)
(function () {
  document.querySelectorAll('.cube[data-section]').forEach(function (cube) {
    cube.addEventListener('click', function () {
      scrollToSection(cube.dataset.section);
    });
  });
})();

// Wire search input (no inline oninput)
(function () {
  var queryInput = document.getElementById('query');
  if (queryInput) {
    queryInput.addEventListener('input', search);
  }
})();

// ============================================================
// LAZY PRELOAD — prefetch topic files when nodes come into view
// ============================================================

(function () {
  if (!('IntersectionObserver' in window)) return;
  var preloadObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var topic = entry.target.dataset.topic;
      if (!topic || codeCache[topic]) return;
      fetch('js/' + topic + '.js').then(function (r) {
        if (r.ok) return r.text();
      }).then(function (code) {
        if (code) codeCache[topic] = code;
      }).catch(function () {});
      preloadObserver.unobserve(entry.target);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('.roadmap-node[data-topic]').forEach(function (node) {
    preloadObserver.observe(node);
  });
})();

// ============================================================
// CUBES STICKY NAV + ACTIVE SECTION TRACKING
// ============================================================

(function () {
  const nav = document.getElementById('cubesNav');
  const sentinel = document.getElementById('navSentinel');
  const cubes = document.querySelectorAll('.cube[data-section]');
  const sections = document.querySelectorAll('.section');
  if (!nav || !cubes.length) return;

  // Use IntersectionObserver on a sentinel element to avoid feedback loops.
  // When the sentinel (placed right above the cubes nav) leaves the viewport,
  // the nav becomes sticky compact. Position is immune to height changes.
  if (sentinel && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) {
        nav.classList.add('cubes-sticky');
      } else {
        nav.classList.remove('cubes-sticky');
      }
    }, { threshold: 0 });
    observer.observe(sentinel);
  }

  // Track which section is in view (active cube highlighting)
  function updateActiveSection() {
    var currentSection = null;
    var scrollY = window.scrollY + 150;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentSection = section.id;
      }
    });

    // Default to first section when above all sections
    if (!currentSection && sections.length) {
      currentSection = sections[0].id;
    }

    cubes.forEach(function (cube) {
      if (cube.dataset.section === currentSection) {
        cube.classList.add('cube-active');
      } else {
        cube.classList.remove('cube-active');
      }
    });

    sections.forEach(function (section) {
      if (section.id === currentSection) {
        section.classList.add('section-active');
      } else {
        section.classList.remove('section-active');
      }
    });
  }

  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateActiveSection();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  updateActiveSection();

  // Sticky search button: scroll up to reveal search bar and focus it
  var stickySearchBtn = document.getElementById('stickySearchBtn');
  if (stickySearchBtn) {
    stickySearchBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(function () {
        document.getElementById('query').focus();
      }, 400);
    });
  }
})();

// ============================================================
// TOPIC COUNTS
// ============================================================

(function () {
  document.querySelectorAll('.section').forEach(function (section) {
    const count = section.querySelectorAll('.section-topic').length;
    const title = section.querySelector('.roadmap-section-title');
    if (title && count > 0) {
      const badge = document.createElement('span');
      badge.className = 'section-title-count';
      badge.textContent = `(${count})`;
      title.appendChild(badge);
    }
  });
})();

// ============================================================
// ACCESSIBILITY
// ============================================================

(function () {
  // Make roadmap nodes keyboard-accessible
  document.querySelectorAll('.roadmap-node').forEach(function (node) {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');

    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDrawer(node.dataset.topic);
      }
    });
  });

  // Arrow key navigation between roadmap nodes
  document.addEventListener('keydown', function (e) {
    const active = document.activeElement;
    if (!active || !active.classList.contains('roadmap-node')) return;

    const nodes = Array.from(document.querySelectorAll('.roadmap-node:not(.filtered-out)'));
    const idx = nodes.indexOf(active);
    if (idx === -1) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < nodes.length - 1) nodes[idx + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) nodes[idx - 1].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      nodes[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      nodes[nodes.length - 1].focus();
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
  const node = document.querySelector('.roadmap-node[data-topic="' + topicName + '"]');
  if (!node) return false;

  // Scroll node into view, then open drawer
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(function () {
    openDrawer(topicName);
  }, 200);

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
    setTimeout(function () { openTopicByName(topicName); }, 300);
  }

  window.addEventListener('hashchange', function () {
    const hash = window.location.hash;
    if (hash.startsWith('#topic=')) {
      openTopicByName(hash.substring(7));
    }
  });
})();

// Add share button to code toolbar
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
        '<div class="shortcut-row"><kbd>Esc</kbd><span>Close drawer / console</span></div>' +
        '<div class="shortcut-row"><kbd>Arrow Up/Down</kbd><span>Navigate between topics</span></div>' +
        '<div class="shortcut-row"><kbd>J</kbd> / <kbd>K</kbd><span>Navigate topics (vim-style)</span></div>' +
        '<div class="shortcut-row"><kbd>Enter</kbd> / <kbd>Space</kbd><span>Open topic in drawer</span></div>' +
        '<div class="shortcut-row"><kbd>N</kbd> / <kbd>P</kbd><span>Next / Previous topic (drawer open)</span></div>' +
        '<div class="shortcut-row"><kbd>R</kbd><span>Run code (drawer open)</span></div>' +
        '<div class="shortcut-row"><kbd>Home</kbd> / <kbd>End</kbd><span>Jump to first/last topic</span></div>' +
      '</div>' +
    '</div>';
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

document.addEventListener('keydown', function (event) {
  const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
  const isEditing = document.activeElement.contentEditable === 'true';

  if (event.key === 'Escape') {
    // Close shortcuts overlay first
    const shortcutsOverlay = document.getElementById('shortcuts-overlay');
    if (shortcutsOverlay) { shortcutsOverlay.remove(); return; }
    // Close console if open
    const consoleEl = document.getElementById('sjsb-console');
    if (consoleEl) { consoleEl.remove(); return; }
    // Close both panels in sequence: quiz first, then drawer
    if (currentDrawerTopic) { closeAll(); return; }
    // Close quiz slide if open standalone (e.g., review mode)
    var quizSlide = document.getElementById('quizSlide');
    if (quizSlide && quizSlide.classList.contains('open')) {
      closeQuizSlide();
      document.body.style.overflow = '';
      return;
    }
  }

  if ((event.ctrlKey && event.key === 'k') || (event.key === '/' && !isInput)) {
    event.preventDefault();
    document.getElementById('query').focus();
  }

  if (event.key === '?' && !isInput) {
    event.preventDefault();
    toggleShortcutsOverlay();
  }

  // Skip vim-style shortcuts when typing in inputs or editors
  if (isInput || isEditing) return;

  // J/K — navigate between roadmap nodes (vim-style)
  if (event.key === 'j' || event.key === 'k') {
    var nodes = Array.from(document.querySelectorAll('.roadmap-node:not(.filtered-out)'));
    if (nodes.length === 0) return;
    var activeNode = document.querySelector('.roadmap-node.node-active') || document.activeElement;
    var idx = nodes.indexOf(activeNode);
    if (event.key === 'j') {
      var next = (idx === -1) ? 0 : Math.min(idx + 1, nodes.length - 1);
      nodes[next].focus();
      nodes[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      var prev = (idx === -1) ? 0 : Math.max(idx - 1, 0);
      nodes[prev].focus();
      nodes[prev].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    event.preventDefault();
    return;
  }

  // N/P — next/previous topic while drawer is open
  if ((event.key === 'n' || event.key === 'p') && currentDrawerTopic) {
    var allNodes = Array.from(document.querySelectorAll('.roadmap-node:not(.filtered-out)'));
    var curIdx = allNodes.findIndex(function (n) { return n.dataset.topic === currentDrawerTopic; });
    if (curIdx === -1) return;
    var targetIdx = event.key === 'n' ? curIdx + 1 : curIdx - 1;
    if (targetIdx < 0 || targetIdx >= allNodes.length) return;
    var targetTopic = allNodes[targetIdx].dataset.topic;
    if (targetTopic) {
      openDrawer(targetTopic);
      allNodes[targetIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    event.preventDefault();
    return;
  }

  // R — run code when drawer is open
  if (event.key === 'r' && currentDrawerTopic) {
    var topicCode = codeCache[currentDrawerTopic];
    if (topicCode) {
      runCode(topicCode);
    }
    event.preventDefault();
    return;
  }
});
