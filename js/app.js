// To-Do Life Dashboard — application logic

// ─── Theme ────────────────────────────────────────────────────────────────────

const THEME_KEY = 'tdld_theme';

/**
 * Reads the stored theme from localStorage.
 * Returns "light" if the key is absent, on error, or if the value is not
 * exactly "light" or "dark".
 * @returns {"light"|"dark"}
 */
function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'light';
  } catch (_) {
    return 'light';
  }
}

/**
 * Persists the given theme to localStorage under the key `tdld_theme`.
 * Swallows any storage errors (e.g. private-browsing quota exceeded).
 * @param {"light"|"dark"} theme
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_) {
    // Storage unavailable — degrade gracefully
  }
}

/**
 * Applies the given theme to the document and updates the toggle button's
 * aria-label and icon to reflect the active theme.
 *
 * Mapping:
 *   "light" → aria-label: "Switch to dark mode",  icon: ☀️
 *   "dark"  → aria-label: "Switch to light mode", icon: 🌙
 *
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const btn = document.getElementById('btn-theme-toggle');
  const icon = document.getElementById('theme-icon');

  if (theme === 'dark') {
    btn.setAttribute('aria-label', 'Switch to light mode');
    icon.textContent = '🌙';
  } else {
    btn.setAttribute('aria-label', 'Switch to dark mode');
    icon.textContent = '☀️';
  }
}

/**
 * Initialises the theme system: loads the stored theme, applies it, and
 * attaches a click listener to #btn-theme-toggle that toggles between
 * "light" and "dark", then persists the new value.
 */
function initTheme() {
  const theme = loadTheme();
  applyTheme(theme);

  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    saveTheme(newTheme);
  });
}

// ─── Greeting Widget ──────────────────────────────────────────────────────────

const USER_NAME_KEY = 'tdld_user_name';

/**
 * Reads the stored user name from localStorage.
 * Returns "" if the key is absent or on any storage error.
 * @returns {string}
 */
function loadUserName() {
  try {
    return localStorage.getItem(USER_NAME_KEY) ?? '';
  } catch (_) {
    return '';
  }
}

/**
 * Persists the given name to localStorage under the key `tdld_user_name`.
 * If name is empty, removes the key instead.
 * Swallows any storage errors (e.g. private-browsing quota exceeded).
 * @param {string} name
 */
function saveUserName(name) {
  try {
    if (name) {
      localStorage.setItem(USER_NAME_KEY, name);
    } else {
      localStorage.removeItem(USER_NAME_KEY);
    }
  } catch (_) {
    // Storage unavailable — degrade gracefully
  }
}

// Module-scoped user name, initialised from localStorage on load.
// renderGreeting() reads this variable so it does not re-read localStorage on every 60-second tick.
let userName = loadUserName();

/**
 * Returns the greeting string for the given hour and name.
 * If name is non-empty, returns e.g. "Good Morning, Alex".
 * If name is empty, returns e.g. "Good Morning".
 * @param {number} hour  Integer in [0, 23]
 * @param {string} name  Trimmed user name (may be empty)
 * @returns {string}
 */
function renderGreetingMessage(hour, name) {
  const greeting = getGreeting(hour);
  return name ? `${greeting}, ${name}` : greeting;
}

/**
 * Returns a zero-padded HH:MM string from a Date object.
 * @param {Date} date
 * @returns {string} e.g. "09:05"
 */
function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Returns a human-readable date string, e.g. "Monday, 14 July 2025".
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns the appropriate greeting string for a given hour (0–23).
 * 05–11 → "Good Morning"
 * 12–17 → "Good Afternoon"
 * 18–21 → "Good Evening"
 * 22–04 → "Good Night"
 * @param {number} hour  Integer in [0, 23]
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 21) return 'Good Evening';
  return 'Good Night'; // 22–23 and 0–4
}

/**
 * Reads the current Date and writes time, date, and greeting message to the DOM.
 * Uses the module-scoped `userName` variable so localStorage is not re-read on every tick.
 */
function renderGreeting() {
  const now = new Date();
  document.getElementById('greeting-time').textContent = formatTime(now);
  document.getElementById('greeting-date').textContent = formatDate(now);
  document.getElementById('greeting-message').textContent = renderGreetingMessage(now.getHours(), userName);
}

/**
 * Initialises the greeting widget: loads the stored user name, pre-fills the
 * name input, wires up the Set button, renders immediately, then updates every 60 s.
 */
function initGreeting() {
  // Pre-fill the name input with the stored user name (already loaded into
  // the module-scoped `userName` variable at module evaluation time).
  const nameInput = document.getElementById('name-input');
  nameInput.value = userName;

  // Wire up the Set button: trim the input, update the in-memory variable,
  // persist to localStorage, and re-render the greeting.
  document.getElementById('btn-set-name').addEventListener('click', () => {
    userName = nameInput.value.trim();
    saveUserName(userName);
    renderGreeting();
  });

  renderGreeting();
  setInterval(renderGreeting, 60000);
}

// ─── Focus Timer ──────────────────────────────────────────────────────────────

const TIMER_DURATION_KEY = 'tdld_timer_duration';

/**
 * Reads the stored timer duration (in minutes) from localStorage.
 * Returns 25 if the key is absent, the value is non-numeric, non-integer,
 * or out of the valid range [1, 99].
 * @returns {number} Integer in [1, 99], default 25
 */
function loadTimerDuration() {
  try {
    const raw = localStorage.getItem(TIMER_DURATION_KEY);
    if (raw === null) return 25;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return 25;
    return parsed;
  } catch (_) {
    return 25;
  }
}

/**
 * Persists the given timer duration (in minutes) to localStorage under the
 * key `tdld_timer_duration`. Swallows any storage errors (e.g. private-browsing
 * quota exceeded).
 * @param {number} minutes  Integer in [1, 99]
 */
function saveTimerDuration(minutes) {
  try {
    localStorage.setItem(TIMER_DURATION_KEY, String(minutes));
  } catch (_) {
    // Storage unavailable — degrade gracefully
  }
}

// 4.1 — Module-scoped timer state
let timerDurationMinutes = loadTimerDuration(); // default 25
let remainingSeconds = timerDurationMinutes * 60;
let intervalId = null;

/**
 * Returns a zero-padded MM:SS string for the given number of seconds.
 * @param {number} seconds  Non-negative integer
 * @returns {string} e.g. "25:00", "04:59"
 */
function formatTimer(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Writes the current timer value to #timer-display and syncs button disabled states.
 * Start is disabled while the timer is running; Stop is disabled while it is paused/reset.
 * Duration input and Set Duration button are disabled while the timer is running (req 3.8).
 */
function renderTimer() {
  document.getElementById('timer-display').textContent = formatTimer(remainingSeconds);
  document.getElementById('btn-start').disabled = intervalId !== null;
  document.getElementById('btn-stop').disabled = intervalId === null;
  document.getElementById('duration-input').disabled = intervalId !== null;
  document.getElementById('btn-set-duration').disabled = intervalId !== null;
}

/**
 * Called once per second by setInterval.
 * Decrements remainingSeconds; when it reaches 0 stops the timer and notifies the user.
 */
function onTick() {
  remainingSeconds -= 1;
  renderTimer();

  if (remainingSeconds <= 0) {
    stopTimer();
    document.getElementById('timer-notification').textContent = "Time's up!";

    // Web Notification — graceful fallback if denied or unsupported
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification("Focus Timer", { body: "Time's up! Take a break." });
    }
  }
}

/**
 * Starts the countdown. Guards against double-start.
 */
function startTimer() {
  if (intervalId !== null) return;
  intervalId = setInterval(onTick, 1000);
  renderTimer();
}

/**
 * Stops the countdown without resetting the remaining time.
 */
function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  renderTimer();
}

/**
 * Stops the countdown and resets the timer back to the current configured duration.
 */
function resetTimer() {
  stopTimer();
  remainingSeconds = timerDurationMinutes * 60;
  document.getElementById('timer-notification').textContent = '';
  renderTimer();
}

/**
 * Validates and applies a new timer duration.
 * Accepts integers in [1, 99]. On invalid input, sets #duration-validation-msg
 * and returns early without changing state. On valid input, clears the message,
 * updates timerDurationMinutes, resets remainingSeconds, calls resetTimer(),
 * and persists the new duration via saveTimerDuration().
 * @param {number|string} minutes
 */
function setTimerDuration(minutes) {
  const validationMsg = document.getElementById('duration-validation-msg');

  // Empty / null / undefined check
  if (minutes === '' || minutes === null || minutes === undefined) {
    validationMsg.textContent = 'Please enter a duration.';
    return;
  }

  const num = Number(minutes);

  // Non-integer check (covers NaN, floats, strings that parse to floats)
  if (!Number.isInteger(num)) {
    validationMsg.textContent = 'Duration must be a whole number.';
    return;
  }

  if (num < 1) {
    validationMsg.textContent = 'Duration must be at least 1 minute.';
    return;
  }

  if (num > 99) {
    validationMsg.textContent = 'Duration must be at most 99 minutes.';
    return;
  }

  // Valid — apply the new duration
  validationMsg.textContent = '';
  timerDurationMinutes = num;
  remainingSeconds = num * 60;
  resetTimer();
  saveTimerDuration(num);
}

/**
 * Initialises the focus timer widget: loads the stored duration, pre-fills the
 * duration input, wires up button listeners, and renders initial state.
 */
function initFocusTimer() {
  // Load persisted duration and initialise remaining seconds accordingly
  timerDurationMinutes = loadTimerDuration();
  remainingSeconds = timerDurationMinutes * 60;

  // Pre-fill the duration input with the loaded value
  document.getElementById('duration-input').value = timerDurationMinutes;

  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-stop').addEventListener('click', stopTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // Wire up the Set Duration button
  document.getElementById('btn-set-duration').addEventListener('click', () => {
    setTimerDuration(parseInt(document.getElementById('duration-input').value, 10));
  });

  renderTimer();
}

// ─── To-Do List ───────────────────────────────────────────────────────────────

const TASKS_KEY = 'tdld_tasks';

// 6.1 — Generate a unique ID for a task
/**
 * Returns a unique string ID using crypto.randomUUID() when available,
 * falling back to a Date.now + Math.random combination.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 6.2 — Persist tasks to localStorage
/**
 * Serialises the tasks array to localStorage under the key `tdld_tasks`.
 * Silently swallows any storage errors (e.g. private-browsing quota exceeded).
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (_) {
    // Storage unavailable — degrade gracefully
  }
}

// 6.3 — Load tasks from localStorage
/**
 * Reads and parses the tasks array from localStorage.
 * Returns an empty array if the key is absent or the JSON is malformed.
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

// 6.4 — Build a single task <li> element
/**
 * Creates and returns a `<li>` element representing one task.
 * @param {{id: string, title: string, completed: boolean}} task
 * @returns {HTMLLIElement}
 */
function renderTask(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  if (task.completed) li.classList.add('completed');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

  const titleSpan = document.createElement('span');
  titleSpan.className = 'task-title';
  titleSpan.textContent = task.title;

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit';
  editBtn.textContent = 'Edit';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.textContent = 'Delete';

  li.appendChild(checkbox);
  li.appendChild(titleSpan);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

// 6.5 — Re-render the full task list
/**
 * Clears #task-list and re-populates it from the tasks array.
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function renderTaskList(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => list.appendChild(renderTask(task)));
}

// 6.6 — Add a new task
/**
 * Trims the title; if empty, returns focus to the input and exits early.
 * Otherwise appends a new task object, persists, and re-renders.
 * @param {string} title
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function addTask(title, tasks) {
  const trimmed = title.trim();
  const input = document.getElementById('todo-input');
  if (!trimmed) {
    input.focus();
    return;
  }
  tasks.push({ id: generateId(), title: trimmed, completed: false });
  saveTasks(tasks);
  renderTaskList(tasks);
  input.value = '';
}

// 6.7 — Toggle a task's completed state
/**
 * Flips the `completed` boolean for the task with the given id, then persists and re-renders.
 * @param {string} id
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function toggleTask(id, tasks) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTaskList(tasks);
}

// 6.9 — Confirm an in-progress edit
/**
 * Trims newTitle; if empty, restores the original title span without saving.
 * Otherwise updates the task in the array, persists, and re-renders.
 * @param {string} id
 * @param {string} newTitle
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function confirmEditTask(id, newTitle, tasks) {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    // Restore original title by re-rendering (no mutation)
    renderTaskList(tasks);
    return;
  }
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.title = trimmed;
  saveTasks(tasks);
  renderTaskList(tasks);
}

// 6.8 — Begin inline editing of a task title
/**
 * Replaces the task's title span with a text input pre-filled with the current title.
 * Blur → cancels (restores original span via re-render).
 * Enter → calls confirmEditTask.
 *
 * NOTE: tasks is captured via closure from initTodoList so that confirmEditTask
 * always operates on the live array.
 *
 * @param {string} id
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function startEditTask(id, tasks) {
  const li = document.querySelector(`#task-list li[data-id="${id}"]`);
  if (!li) return;

  const titleSpan = li.querySelector('.task-title');
  if (!titleSpan) return;

  const originalTitle = titleSpan.textContent;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = originalTitle;
  editInput.className = 'task-title'; // keep flex sizing

  // Track whether Enter was pressed so blur doesn't double-fire
  let confirmed = false;

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      confirmed = true;
      confirmEditTask(id, editInput.value, tasks);
    } else if (e.key === 'Escape') {
      confirmed = true;
      renderTaskList(tasks); // cancel — restore original
    }
  });

  editInput.addEventListener('blur', () => {
    if (!confirmed) {
      renderTaskList(tasks); // cancel — restore original title
    }
  });

  li.replaceChild(editInput, titleSpan);
  editInput.focus();
  editInput.select();
}

// 6.10 — Delete a task
/**
 * Removes the task with the given id from the array, persists, and re-renders.
 * @param {string} id
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 */
function deleteTask(id, tasks) {
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) tasks.splice(index, 1);
  saveTasks(tasks);
  renderTaskList(tasks);
}

// 6.11 — Initialise the To-Do List widget
/**
 * Loads persisted tasks, renders them, and wires up all event listeners.
 * The `tasks` array is the single source of truth and lives in this closure.
 */
function initTodoList() {
  const tasks = loadTasks();
  renderTaskList(tasks);

  const todoInput = document.getElementById('todo-input');
  const btnAddTask = document.getElementById('btn-add-task');
  const taskList = document.getElementById('task-list');

  // Add task via button click
  btnAddTask.addEventListener('click', () => {
    addTask(todoInput.value, tasks);
  });

  // Add task via Enter key in the input
  todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask(todoInput.value, tasks);
    }
  });

  // Event delegation for checkbox, edit, and delete interactions
  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.matches('input[type="checkbox"]')) {
      toggleTask(id, tasks);
    } else if (e.target.matches('.btn-edit')) {
      startEditTask(id, tasks);
    } else if (e.target.matches('.btn-delete')) {
      deleteTask(id, tasks);
    }
  });
}

// ─── Quick Links ──────────────────────────────────────────────────────────────

const LINKS_KEY = 'tdld_links';

// 7.1 — Persist links to localStorage
/**
 * Serialises the links array to localStorage under the key `tdld_links`.
 * Silently swallows any storage errors (e.g. private-browsing quota exceeded).
 * @param {Array<{id: string, label: string, url: string}>} links
 */
function saveLinks(links) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch (_) {
    // Storage unavailable — degrade gracefully
  }
}

// 7.2 — Load links from localStorage
/**
 * Reads and parses the links array from localStorage.
 * Returns an empty array if the key is absent or the JSON is malformed.
 * @returns {Array<{id: string, label: string, url: string}>}
 */
function loadLinks() {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

// 7.3 — Re-render the full links list
/**
 * Clears #link-buttons and re-populates it from the links array.
 * Each link is rendered as a <span class="link-item"> containing an <a> and a delete button.
 * @param {Array<{id: string, label: string, url: string}>} links
 */
function renderLinks(links) {
  const container = document.getElementById('link-buttons');
  container.innerHTML = '';

  links.forEach(link => {
    const span = document.createElement('span');
    span.className = 'link-item';
    span.dataset.id = link.id;

    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.label;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-link';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Delete link "${link.label}"`);

    span.appendChild(anchor);
    span.appendChild(deleteBtn);
    container.appendChild(span);
  });
}

// 7.4 — Add a new link
/**
 * Trims both label and url; if either is empty, sets #link-validation-msg and returns early.
 * Otherwise clears the validation message, creates a new link object, persists, and re-renders.
 * @param {string} label
 * @param {string} url
 * @param {Array<{id: string, label: string, url: string}>} links
 */
function addLink(label, url, links) {
  const trimmedLabel = label.trim();
  const trimmedUrl = url.trim();
  const validationMsg = document.getElementById('link-validation-msg');

  if (!trimmedLabel || !trimmedUrl) {
    if (!trimmedLabel && !trimmedUrl) {
      validationMsg.textContent = 'Please enter a label and a URL.';
    } else if (!trimmedLabel) {
      validationMsg.textContent = 'Please enter a label.';
    } else {
      validationMsg.textContent = 'Please enter a URL.';
    }
    return;
  }

  validationMsg.textContent = '';
  links.push({ id: generateId(), label: trimmedLabel, url: trimmedUrl });
  saveLinks(links);
  renderLinks(links);
}

// 7.5 — Delete a link
/**
 * Removes the link with the given id from the array, persists, and re-renders.
 * @param {string} id
 * @param {Array<{id: string, label: string, url: string}>} links
 */
function deleteLink(id, links) {
  const index = links.findIndex(l => l.id === id);
  if (index !== -1) links.splice(index, 1);
  saveLinks(links);
  renderLinks(links);
}

// 7.6 — Initialise the Quick Links widget
/**
 * Loads persisted links, renders them, and wires up all event listeners.
 * The `links` array is the single source of truth and lives in this closure.
 */
function initQuickLinks() {
  const links = loadLinks();
  renderLinks(links);

  const labelInput = document.getElementById('link-label-input');
  const urlInput = document.getElementById('link-url-input');
  const btnAddLink = document.getElementById('btn-add-link');
  const linkButtons = document.getElementById('link-buttons');
  const validationMsg = document.getElementById('link-validation-msg');

  // Add link via button click
  btnAddLink.addEventListener('click', () => {
    addLink(labelInput.value, urlInput.value, links);
    if (!validationMsg.textContent) {
      // Successful add — clear inputs
      labelInput.value = '';
      urlInput.value = '';
    }
  });

  // Clear validation message when user starts typing in either input
  labelInput.addEventListener('input', () => {
    validationMsg.textContent = '';
  });
  urlInput.addEventListener('input', () => {
    validationMsg.textContent = '';
  });

  // Event delegation for delete button clicks inside #link-buttons
  linkButtons.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-link')) {
      const span = e.target.closest('span[data-id]');
      if (span) {
        deleteLink(span.dataset.id, links);
      }
    }
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

// Wire all widgets on DOMContentLoaded.
// Execution order matches the design sequence diagram:
//   initTheme() → initGreeting() → initFocusTimer() → initTodoList() → initQuickLinks()
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGreeting();
    initFocusTimer();
    initTodoList();
    initQuickLinks();
  });
}

// ─── Test exports ─────────────────────────────────────────────────────────────
// Conditionally export pure/testable functions when running under a module
// system (Vitest / Node). The browser loads this file as a classic script so
// `typeof exports` is "undefined" there and this block is never reached.
if (typeof exports !== 'undefined') {
  Object.assign(exports, {
    loadTheme,
    saveTheme,
    applyTheme,
    loadUserName,
    saveUserName,
    getGreeting,
    renderGreetingMessage,
    loadTimerDuration,
    saveTimerDuration,
    // setTimerDuration uses module-scoped mutable state; expose a factory so
    // tests can get a fresh copy of the state-dependent functions.
    _makeTimerState,
  });
}

/**
 * Factory used by tests to obtain a fresh, isolated copy of the timer state
 * and the functions that close over it. This avoids cross-test pollution from
 * the module-level `timerDurationMinutes`, `remainingSeconds`, and `intervalId`
 * variables.
 *
 * @returns {{ setTimerDuration: Function, getState: Function }}
 */
function _makeTimerState() {
  let _timerDurationMinutes = 25;
  let _remainingSeconds = _timerDurationMinutes * 60;
  let _intervalId = null;

  function _renderTimer() {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatTimer(_remainingSeconds);
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = _intervalId !== null;
    const btnStop = document.getElementById('btn-stop');
    if (btnStop) btnStop.disabled = _intervalId === null;
    const durationInput = document.getElementById('duration-input');
    if (durationInput) durationInput.disabled = _intervalId !== null;
    const btnSetDuration = document.getElementById('btn-set-duration');
    if (btnSetDuration) btnSetDuration.disabled = _intervalId !== null;
  }

  function _stopTimer() {
    clearInterval(_intervalId);
    _intervalId = null;
    _renderTimer();
  }

  function _resetTimer() {
    _stopTimer();
    _remainingSeconds = _timerDurationMinutes * 60;
    const notification = document.getElementById('timer-notification');
    if (notification) notification.textContent = '';
    _renderTimer();
  }

  function _setTimerDuration(minutes) {
    const validationMsg = document.getElementById('duration-validation-msg');

    if (minutes === '' || minutes === null || minutes === undefined) {
      if (validationMsg) validationMsg.textContent = 'Please enter a duration.';
      return;
    }

    const num = Number(minutes);

    if (!Number.isInteger(num)) {
      if (validationMsg) validationMsg.textContent = 'Duration must be a whole number.';
      return;
    }

    if (num < 1) {
      if (validationMsg) validationMsg.textContent = 'Duration must be at least 1 minute.';
      return;
    }

    if (num > 99) {
      if (validationMsg) validationMsg.textContent = 'Duration must be at most 99 minutes.';
      return;
    }

    if (validationMsg) validationMsg.textContent = '';
    _timerDurationMinutes = num;
    _remainingSeconds = num * 60;
    _resetTimer();
    saveTimerDuration(num);
  }

  function _startTimer() {
    if (_intervalId !== null) return;
    _intervalId = setInterval(() => {
      _remainingSeconds -= 1;
      _renderTimer();
      if (_remainingSeconds <= 0) {
        _stopTimer();
        const notification = document.getElementById('timer-notification');
        if (notification) notification.textContent = "Time's up!";
      }
    }, 1000);
    _renderTimer();
  }

  return {
    setTimerDuration: _setTimerDuration,
    startTimer: _startTimer,
    stopTimer: _stopTimer,
    resetTimer: _resetTimer,
    getState: () => ({
      timerDurationMinutes: _timerDurationMinutes,
      remainingSeconds: _remainingSeconds,
      intervalId: _intervalId,
    }),
  };
}
