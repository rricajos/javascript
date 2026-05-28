// ============================================================
// SECTIONS.JS - Roadmap navigation, drawer panel, code loading
// ============================================================

const codeCache = {};
var currentDrawerTopic = null;

// ============================================================
// TOAST — reusable notification
// ============================================================
var _toastTimer = null;
function showToast(message, icon) {
  var el = document.getElementById('sjsb-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sjsb-toast';
    el.className = 'sjsb-toast';
    document.body.appendChild(el);
  }
  el.innerHTML = (icon ? '<i class="material-icons">' + icon + '</i> ' : '') + message;
  clearTimeout(_toastTimer);
  requestAnimationFrame(function () {
    el.classList.add('visible');
    _toastTimer = setTimeout(function () { el.classList.remove('visible'); }, 2500);
  });
}

// ============================================================
// FOCUS TRAP — keeps Tab cycling inside an open panel
// ============================================================
var _activeTrap = null;

function trapFocus(container) {
  _activeTrap = function (e) {
    if (e.key !== 'Tab') return;
    var focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', _activeTrap);
}

function releaseFocus() {
  if (_activeTrap) {
    document.removeEventListener('keydown', _activeTrap);
    _activeTrap = null;
  }
}

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

  // Update section progress counts + cube progress bars
  document.querySelectorAll('.section').forEach(function (section) {
    const topics = section.querySelectorAll('.section-topic');
    const done = Array.from(topics).filter(function (t) { return progress[t.dataset.topic]; }).length;
    const counter = section.querySelector('.section-progress');
    if (counter) {
      counter.textContent = `${done}/${topics.length}`;
      counter.style.display = done > 0 ? 'inline' : 'none';
    }
    // Update matching cube progress bar
    var sectionId = section.id;
    var cube = document.querySelector('.cube[data-section="' + sectionId + '"]');
    if (cube) {
      var fill = cube.querySelector('.cube-progress-fill');
      if (fill) {
        var pct = topics.length > 0 ? Math.round((done / topics.length) * 100) : 0;
        fill.style.width = pct + '%';
        fill.setAttribute('data-complete', pct === 100 ? 'true' : 'false');
      }
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
  if (!quizSlide) return;
  quizSlide.classList.add('open');
}

function closeQuizSlide() {
  var quizSlide = document.getElementById('quizSlide');
  if (quizSlide) quizSlide.classList.remove('open');
}

// Switch drawer between code and quiz tabs
function setDrawerTab(tab) {
  var codeContent = document.getElementById('drawerContent');
  var quizContent = document.getElementById('drawerQuizContent');
  var tabs = document.querySelectorAll('.drawer-tab');

  tabs.forEach(function (t) {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  if (tab === 'quiz') {
    if (codeContent) codeContent.style.display = 'none';
    if (quizContent) quizContent.style.display = '';
    // Close the side quiz slide since we're showing inline
    closeQuizSlide();
    // Render quiz into drawer if not already there
    if (quizContent && !quizContent.hasChildNodes() && currentDrawerTopic) {
      renderQuizInDrawer(currentDrawerTopic);
    }
  } else {
    if (codeContent) codeContent.style.display = '';
    if (quizContent) quizContent.style.display = 'none';
  }
}

// Shared quiz renderer — builds quiz DOM into containerEl for any context
function _buildQuizDOM(topicName, containerEl) {
  var quizData = TOPIC_QUIZZES && TOPIC_QUIZZES[topicName];
  if (!quizData || !quizData.length) return null;

  var quizDiv = document.createElement('div');
  quizDiv.className = 'topic-quiz';

  var answeredCount = 0;
  var topicScores = (getQuizScores()[topicName]) || {};
  Object.keys(topicScores).forEach(function () { answeredCount++; });
  var pct = Math.round((answeredCount / quizData.length) * 100);

  quizDiv.innerHTML =
    '<div class="topic-quiz-header"><i class="material-icons" style="font-size:18px;vertical-align:middle;color:var(--yellow-color)">quiz</i> Quick Quiz ' +
    '<span class="quiz-progress-label">' + answeredCount + ' / ' + quizData.length + '</span></div>' +
    '<div class="quiz-progress-bar"><div class="quiz-progress-bar-fill" style="width:' + pct + '%"></div></div>';

  quizData.forEach(function (item, qIdx) {
    var qDiv = document.createElement('div');
    qDiv.className = 'quiz-question';
    qDiv.innerHTML = '<p class="quiz-question-text">' + (qIdx + 1) + '. ' + item.q + '</p>';

    if (item.code) {
      var codePre = document.createElement('pre');
      codePre.className = 'quiz-code-snippet';
      codePre.textContent = item.code;
      qDiv.appendChild(codePre);
    }

    if (item.hint && topicScores[qIdx] === undefined) {
      var hintBtn = document.createElement('button');
      hintBtn.className = 'quiz-hint-btn';
      hintBtn.innerHTML = '<i class="material-icons" style="font-size:13px;vertical-align:middle">help_outline</i> Hint';
      hintBtn.addEventListener('click', function () {
        hintBtn.style.display = 'none';
        var hintDiv = document.createElement('div');
        hintDiv.className = 'quiz-hint';
        hintDiv.textContent = item.hint;
        qDiv.insertBefore(hintDiv, optsDiv);
      });
      qDiv.appendChild(hintBtn);
    }

    var optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';

    item.opts.forEach(function (opt, oIdx) {
      var btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;

      if (topicScores[qIdx] !== undefined) {
        btn.disabled = true;
        btn.classList.add('quiz-disabled');
        if (oIdx === item.answer) btn.classList.add('quiz-correct');
      }

      btn.addEventListener('click', function () {
        optsDiv.querySelectorAll('.quiz-option-btn').forEach(function (b) {
          b.disabled = true;
          b.classList.add('quiz-disabled');
        });
        var hBtn = qDiv.querySelector('.quiz-hint-btn');
        if (hBtn) hBtn.style.display = 'none';

        var isCorrect = oIdx === item.answer;
        if (isCorrect) {
          btn.classList.add('quiz-correct');
        } else {
          btn.classList.add('quiz-wrong');
          optsDiv.querySelectorAll('.quiz-option-btn')[item.answer].classList.add('quiz-correct');
        }

        if (item.explanation) {
          var expHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)">lightbulb</i> ' + item.explanation;
          if (item.mdn) expHTML += ' <a class="quiz-mdn-link" href="' + item.mdn + '" target="_blank" rel="noopener">MDN ↗</a>';
          var expDiv = document.createElement('div');
          expDiv.className = 'quiz-explanation';
          expDiv.innerHTML = expHTML;
          qDiv.appendChild(expDiv);
        }

        saveQuizAnswer(topicName, qIdx, isCorrect);

        var sc = getQuizScores()[topicName] || {};
        var cnt = Object.keys(sc).length;
        var bar = quizDiv.querySelector('.quiz-progress-bar-fill');
        var lbl = quizDiv.querySelector('.quiz-progress-label');
        if (bar) bar.style.width = Math.round((cnt / quizData.length) * 100) + '%';
        if (lbl) lbl.textContent = cnt + ' / ' + quizData.length;
      });
      optsDiv.appendChild(btn);
    });

    qDiv.appendChild(optsDiv);

    if (topicScores[qIdx] !== undefined && item.explanation) {
      var expHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)">lightbulb</i> ' + item.explanation;
      if (item.mdn) expHTML += ' <a class="quiz-mdn-link" href="' + item.mdn + '" target="_blank" rel="noopener">MDN ↗</a>';
      var expDiv = document.createElement('div');
      expDiv.className = 'quiz-explanation';
      expDiv.innerHTML = expHTML;
      qDiv.appendChild(expDiv);
    }

    quizDiv.appendChild(qDiv);
  });

  containerEl.appendChild(quizDiv);
  return quizDiv;
}

function renderQuizInDrawer(topicName) {
  var quizContent = document.getElementById('drawerQuizContent');
  if (!quizContent) return;
  _buildQuizDOM(topicName, quizContent);
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

  var PAGE_SIZE = 5;
  var currentPage = 0;
  var totalPages = Math.ceil(failedItems.length / PAGE_SIZE);

  function renderReviewPage() {
    quizBody.innerHTML = '';
    var quizDiv = document.createElement('div');
    quizDiv.className = 'topic-quiz';

    var start = currentPage * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, failedItems.length);
    quizDiv.innerHTML = '<div class="topic-quiz-header"><i class="material-icons" style="font-size:18px;vertical-align:middle;color:#f44336">replay</i> ' + failedItems.length + ' to review <span class="quiz-progress-label">' + (start + 1) + '\u2013' + end + ' of ' + failedItems.length + '</span></div>' +
      '<div class="quiz-progress-bar"><div class="quiz-progress-bar-fill" style="width:' + Math.round(((currentPage + 1) / totalPages) * 100) + '%"></div></div>';

    for (var idx = start; idx < end; idx++) {
      var fi = failedItems[idx];
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

      (function (fi, item, qDiv, optsDiv) {
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
      })(fi, item, qDiv, optsDiv);

      qDiv.appendChild(optsDiv);
      quizDiv.appendChild(qDiv);
    }

    // Pagination controls
    if (totalPages > 1) {
      var navDiv = document.createElement('div');
      navDiv.className = 'review-pagination';
      var prevBtn = document.createElement('button');
      prevBtn.className = 'quiz-option-btn';
      prevBtn.textContent = '\u2190 Prev';
      prevBtn.disabled = currentPage === 0;
      prevBtn.addEventListener('click', function () {
        if (currentPage > 0) { currentPage--; renderReviewPage(); }
      });
      var nextBtn = document.createElement('button');
      nextBtn.className = 'quiz-option-btn';
      nextBtn.textContent = 'Next \u2192';
      nextBtn.disabled = currentPage >= totalPages - 1;
      nextBtn.addEventListener('click', function () {
        if (currentPage < totalPages - 1) { currentPage++; renderReviewPage(); }
      });
      navDiv.appendChild(prevBtn);
      navDiv.appendChild(nextBtn);
      quizDiv.appendChild(navDiv);
    }

    quizBody.appendChild(quizDiv);
    quizBody.scrollTop = 0;
  }

  renderReviewPage();
  quizSlide.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openDrawer(topicName) {
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  var titleEl = document.getElementById('drawerTitle');
  var contentEl = document.getElementById('drawerContent');
  if (!drawer || !overlay) return;

  // Set title from node label (prefer data-original to handle search highlights)
  var node = document.querySelector('.roadmap-node[data-topic="' + topicName + '"]');
  var label = node ? node.querySelector('.roadmap-label') : null;
  var displayName = label ? (label.getAttribute('data-original') || label.textContent) : topicName;
  titleEl.textContent = displayName;

  // Update folder tab
  var folderTab = document.getElementById('drawerFolderTab');
  if (folderTab) folderTab.textContent = displayName;

  // Scroll drawer body to top and clear content
  var drawerBody = document.getElementById('drawerBody');
  if (drawerBody) drawerBody.scrollTop = 0;
  contentEl.innerHTML = '';
  contentEl.removeAttribute('data-loaded');
  contentEl.style.fontSize = '';

  // Clear quiz content area
  var drawerQuiz = document.getElementById('drawerQuizContent');
  if (drawerQuiz) { drawerQuiz.innerHTML = ''; drawerQuiz.style.display = 'none'; }

  // Clear and close quiz slide (will reopen if topic has quiz)
  closeQuizSlide();
  var quizBody = document.getElementById('quizSlideBody');
  if (quizBody) quizBody.innerHTML = '';

  // Reset tabs to code view
  setDrawerTab('code');

  // Check if topic has a quiz and update quiz tab state
  var hasQuiz = TOPIC_QUIZZES && TOPIC_QUIZZES[topicName] && TOPIC_QUIZZES[topicName].length > 0;
  var quizTab = document.querySelector('.drawer-tab[data-tab="quiz"]');
  if (quizTab) quizTab.setAttribute('data-has-quiz', hasQuiz ? 'true' : 'false');

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

  // Trap focus inside drawer and focus close button
  releaseFocus();
  trapFocus(drawer);
  var closeBtn = document.getElementById('drawerClose');
  if (closeBtn) closeBtn.focus();
}

function closeDrawer() {
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;

  releaseFocus();
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

  // Swipe-to-close: swipe right on drawer → close, swipe right on quiz → close quiz
  function addSwipeClose(el, callback, minDist) {
    var startX = 0, startY = 0;
    el.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = Math.abs(e.changedTouches[0].clientY - startY);
      // Swipe right (drawer slides to right) and mostly horizontal
      if (dx > (minDist || 80) && dy < dx * 0.5) {
        callback();
      }
    }, { passive: true });
  }

  var drawer = document.getElementById('drawer');
  var quizSlide = document.getElementById('quizSlide');
  if (drawer) addSwipeClose(drawer, closeAll, 80);
  if (quizSlide) addSwipeClose(quizSlide, closeQuizSlide, 60);

  // Wire up drawer tabs
  document.querySelectorAll('.drawer-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      setDrawerTab(tab.dataset.tab);
    });
  });
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

// ============================================================
// PREREQUISITES — suggested reading before a topic
// ============================================================
const PREREQUISITES = {
  closures_and_scope: ['variables_and_types', 'functions'],
  functions: ['variables_and_types', 'control_flow'],
  promises_and_async: ['functions', 'error_handling'],
  error_handling: ['control_flow', 'functions'],
  fetch_api: ['promises_and_async'],
  event_loop: ['promises_and_async'],
  classes_and_oop: ['functions', 'data_collections_objects'],
  iterators_generators: ['data_collections_arrays', 'functions'],
  proxy_and_reflect: ['classes_and_oop', 'data_collections_objects'],
  modules: ['functions'],
  destructuring_and_spread: ['data_collections_arrays', 'data_collections_objects'],
  dom_events: ['dom_manipulation'],
  web_components: ['dom_manipulation', 'classes_and_oop'],
  web_apis: ['dom_manipulation'],
  web_storage: ['json_and_dates'],
  testing_basics: ['functions', 'error_handling'],
  memory_and_performance: ['event_loop', 'closures_and_scope']
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

    // Spaced repetition: suggest topics with score < 75%
    var suggestEl = document.getElementById('reviewSuggestions');
    if (suggestEl) {
      var weak = [];
      Object.keys(scores).forEach(function (topic) {
        var quizLen = (TOPIC_QUIZZES[topic] || []).length;
        if (!quizLen) return;
        var correct = 0;
        var answered = 0;
        Object.keys(scores[topic]).forEach(function (qi) {
          answered++;
          if (scores[topic][qi]) correct++;
        });
        if (answered >= quizLen && (correct / quizLen) < 0.75) {
          var node = document.querySelector('.roadmap-node[data-topic="' + topic + '"] .roadmap-label');
          weak.push(node ? node.textContent : topic.replace(/_/g, ' '));
        }
      });
      if (weak.length) {
        suggestEl.textContent = 'Review: ' + weak.slice(0, 3).join(', ');
        suggestEl.style.display = '';
      } else {
        suggestEl.style.display = 'none';
      }
    }
  } else {
    el.classList.remove('visible');
  }

  updateMedalBadges();
}

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

  // Cached → render immediately, no skeleton flash
  if (codeCache[topicName]) {
    renderCode(contentEl, codeCache[topicName], topicName);
    return;
  }

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
      contentEl.innerHTML = '';
      var errDiv = document.createElement('div');
      errDiv.className = 'load-error';
      errDiv.innerHTML =
        '<i class="material-icons" style="font-size:32px;opacity:0.4">cloud_off</i>' +
        '<p>' + error.message + '</p>';
      var retryBtn = document.createElement('button');
      retryBtn.className = 'load-error-retry';
      retryBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">refresh</i> Retry';
      retryBtn.addEventListener('click', function () {
        contentEl.innerHTML = '';
        loadTopicCode(topicName, contentEl);
      });
      errDiv.appendChild(retryBtn);
      contentEl.appendChild(errDiv);
    });
}

function renderCode(contentEl, code, topicName) {
  var wasLoading = contentEl.classList.contains('loading');
  contentEl.classList.remove('loading');
  contentEl.classList.remove('content-ready');
  contentEl.innerHTML = '';
  if (wasLoading) {
    contentEl.classList.add('content-ready');
  }

  // Show prerequisite banner if topic has prerequisites not yet read
  var prereqs = PREREQUISITES[topicName];
  if (prereqs && prereqs.length) {
    var progress = getProgress();
    var unread = prereqs.filter(function (p) { return !progress[p]; });
    if (unread.length) {
      var prereqDiv = document.createElement('div');
      prereqDiv.className = 'prereq-banner';
      var labels = unread.map(function (p) {
        var node = document.querySelector('.roadmap-node[data-topic="' + p + '"] .roadmap-label');
        var label = node ? node.textContent : p.replace(/_/g, ' ');
        return '<span class="prereq-link" data-topic="' + p + '">' + label + '</span>';
      });
      prereqDiv.innerHTML = '<i class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--yellow-color)" aria-hidden="true">info</i> Suggested first: ' + labels.join(', ');
      prereqDiv.addEventListener('click', function (e) {
        var link = e.target.closest('.prereq-link');
        if (link) openDrawer(link.dataset.topic);
      });
      contentEl.appendChild(prereqDiv);
    }
  }

  // Add toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'code-toolbar';

  // Track current code (may be edited by user)
  let currentCode = code;

  const originalCode = code;

  const runBtn = document.createElement('button');
  runBtn.className = 'code-toolbar-btn';
  runBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">play_arrow</i> Run';
  runBtn.title = 'Execute code (Ctrl+Enter)';
  runBtn.addEventListener('click', function () {
    runCode(currentCode);
  });

  const resetBtn = document.createElement('button');
  resetBtn.className = 'code-toolbar-btn';
  resetBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">restart_alt</i> Reset';
  resetBtn.title = 'Reset to original code';
  resetBtn.style.display = 'none';
  resetBtn.addEventListener('click', function () {
    currentCode = originalCode;
    // If editor is open, update its value
    var editor = contentEl.querySelector('.code-editor');
    if (editor) editor.value = originalCode;
    // Re-render code block
    var codeBlock = contentEl.querySelector('.code-block');
    if (codeBlock) {
      codeBlock.innerHTML = '';
      var lines = originalCode.split('\n');
      var frag = document.createDocumentFragment();
      lines.forEach(function (line, index) {
        var span = document.createElement('span');
        span.className = 'code-line';
        var lineNum = document.createElement('span');
        lineNum.className = 'code-line-number';
        lineNum.textContent = index + 1;
        span.appendChild(lineNum);
        var lineContent = document.createElement('span');
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
    }
    resetBtn.style.display = 'none';
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-toolbar-btn';
  copyBtn.innerHTML = '<i class="material-icons" style="font-size:16px;vertical-align:middle">content_copy</i> Copy';
  copyBtn.addEventListener('click', function () {
    copyCode(currentCode);
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
        if (currentCode !== originalCode) resetBtn.style.display = '';
      });
      // Handle Tab key for indentation + Ctrl+Enter to run
      editor.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 2;
          currentCode = editor.value;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runCode(currentCode);
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
  toolbar.appendChild(resetBtn);
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
  if (quizSlideBody) quizSlideBody.innerHTML = '';
  var quizData = TOPIC_QUIZZES && TOPIC_QUIZZES[topicName];
  if (quizData && quizData.length > 0) {
    var target = quizSlideBody || contentEl;
    _buildQuizDOM(topicName, target);
    if (quizSlideBody) openQuizSlide(topicName);
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
    output.setAttribute('role', 'log');
    output.setAttribute('aria-label', 'Code execution console');
    output.innerHTML = '<div class="console-header"><span>Console Output</span><div class="console-actions"><button class="console-action-btn" data-action="copy" title="Copy output"><i class="material-icons" style="font-size:14px">content_copy</i></button><button class="console-action-btn" data-action="clear" title="Clear"><i class="material-icons" style="font-size:14px">delete_outline</i></button><button class="console-action-btn" data-action="close" title="Close"><i class="material-icons" style="font-size:14px">close</i></button></div></div><pre class="console-body" aria-live="polite"></pre>';
    output.querySelector('[data-action="close"]').addEventListener('click', function () { output.style.display = 'none'; });
    output.querySelector('[data-action="clear"]').addEventListener('click', function () { output.querySelector('.console-body').innerHTML = ''; });
    output.querySelector('[data-action="copy"]').addEventListener('click', function () {
      var text = output.querySelector('.console-body').textContent;
      if (navigator.clipboard && text) navigator.clipboard.writeText(text).then(function () { showToast('Copied!', 'check'); });
    });
    document.body.appendChild(output);
  }
  output.style.display = 'block';
  return output;
}

function _renderConsoleLogs(body, logs) {
  body.innerHTML = '';
  if (!logs.length) {
    body.textContent = '(no console output)';
    return;
  }
  logs.forEach(function (line) {
    var span = document.createElement('span');
    if (line.indexOf('[ERROR]') === 0 || line.indexOf('[TIMEOUT]') === 0) {
      span.className = 'console-error';
    } else if (line.indexOf('[WARN]') === 0) {
      span.className = 'console-warn';
    } else if (line.indexOf('[INFO]') === 0) {
      span.className = 'console-info';
    }
    span.textContent = line;
    body.appendChild(span);
    body.appendChild(document.createTextNode('\n'));
  });
  body.scrollTop = body.scrollHeight;
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
      _renderConsoleLogs(body, ['[TIMEOUT] Execution exceeded ' + (RUN_TIMEOUT_MS / 1000) + 's \u2014 possible infinite loop']);
    }, RUN_TIMEOUT_MS);

    worker.onmessage = function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      var logs = e.data || [];
      _renderConsoleLogs(body, logs);
    };

    worker.onerror = function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      _renderConsoleLogs(body, ['[ERROR] ' + (e.message || 'Unknown worker error')]);
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
    _renderConsoleLogs(body, logs);
  }
}

function copyCode(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function () {
      showToast('Code copied!', 'content_copy');
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

function highlightLabel(label, query) {
  var original = label.getAttribute('data-original');
  if (!original) {
    original = label.textContent;
    label.setAttribute('data-original', original);
  }
  if (!query) {
    label.textContent = original;
    return;
  }
  var lc = original.toLowerCase();
  var idx = lc.indexOf(query);
  if (idx === -1) {
    label.textContent = original;
    return;
  }
  var before = original.substring(0, idx);
  var match = original.substring(idx, idx + query.length);
  var after = original.substring(idx + query.length);
  label.innerHTML = escapeHTML(before) + '<mark>' + escapeHTML(match) + '</mark>' + escapeHTML(after);
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var _searchActiveIdx = -1;

function filterTopics(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const sections = document.querySelectorAll('.section');
  let totalVisible = 0;
  let totalTopics = 0;
  _searchActiveIdx = -1;

  // Clear previous search-active
  var prev = document.querySelector('.roadmap-node.search-active');
  if (prev) prev.classList.remove('search-active');

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

      // Highlight matching text in label
      if (label) highlightLabel(label, normalizedQuery);
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

// Wire search input + keyboard navigation
(function () {
  var queryInput = document.getElementById('query');
  if (!queryInput) return;

  queryInput.addEventListener('input', search);

  function getVisibleNodes() {
    return Array.from(document.querySelectorAll('.roadmap-node:not(.filtered-out)'));
  }

  function setSearchActive(nodes, idx) {
    var prev = document.querySelector('.roadmap-node.search-active');
    if (prev) prev.classList.remove('search-active');
    _searchActiveIdx = idx;
    if (idx >= 0 && idx < nodes.length) {
      nodes[idx].classList.add('search-active');
      nodes[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Update counter with position
      var counterEl = document.getElementById('searchResultsCount');
      if (counterEl && counterEl.classList.contains('visible')) {
        counterEl.textContent = (idx + 1) + ' / ' + nodes.length + ' topics';
      }
    }
  }

  queryInput.addEventListener('keydown', function (e) {
    var nodes = getVisibleNodes();
    if (!nodes.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = _searchActiveIdx < nodes.length - 1 ? _searchActiveIdx + 1 : 0;
      setSearchActive(nodes, next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = _searchActiveIdx > 0 ? _searchActiveIdx - 1 : nodes.length - 1;
      setSearchActive(nodes, prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (_searchActiveIdx >= 0 && _searchActiveIdx < nodes.length) {
        openDrawer(nodes[_searchActiveIdx].dataset.topic);
      } else if (nodes.length > 0) {
        openDrawer(nodes[0].dataset.topic);
      }
    } else if (e.key === 'Escape') {
      queryInput.value = '';
      search();
      queryInput.blur();
    }
  });
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

  // Sticky detection via scroll + rAF.
  // Checks whether the sentinel (above the nav) has scrolled out of view.
  // Using getBoundingClientRect is deterministic and immune to the
  // IntersectionObserver feedback-loop caused by nav height changes.
  if (sentinel) {
    var stickyTicking = false;
    window.addEventListener('scroll', function () {
      if (!stickyTicking) {
        requestAnimationFrame(function () {
          var gone = sentinel.getBoundingClientRect().bottom <= 0;
          if (gone && !nav.classList.contains('cubes-sticky')) {
            nav.classList.add('cubes-sticky');
          } else if (!gone && nav.classList.contains('cubes-sticky')) {
            nav.classList.remove('cubes-sticky');
          }
          stickyTicking = false;
        });
        stickyTicking = true;
      }
    }, { passive: true });
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
    history.pushState({ topic: topicName }, '', '#topic=' + topicName);
  } else {
    history.pushState(null, '', window.location.pathname);
  }
}

// Read hash on page load
(function () {
  const hash = window.location.hash;
  if (hash.startsWith('#topic=')) {
    const topicName = hash.substring(7);
    setTimeout(function () { openTopicByName(topicName); }, 300);
  } else if (hash === '#review') {
    setTimeout(function () { openReviewMode(); }, 400);
  } else if (hash === '#search') {
    setTimeout(function () {
      var input = document.getElementById('query');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth' }); }
    }, 300);
  }

  window.addEventListener('hashchange', function () {
    const hash = window.location.hash;
    if (hash.startsWith('#topic=')) {
      openTopicByName(hash.substring(7));
    } else if (hash === '#review') {
      openReviewMode();
    } else if (hash === '#search') {
      var input = document.getElementById('query');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth' }); }
    }
  });

  // Back/forward navigation
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.topic) {
      openTopicByName(e.state.topic);
    } else {
      closeDrawer();
      closeQuizSlide();
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
        showToast('Link copied!', 'check');
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
