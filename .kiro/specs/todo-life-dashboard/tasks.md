# Implementation Plan: To-Do Life Dashboard

## Overview

Build a single-page productivity dashboard as three files (`index.html`, `css/style.css`, `js/app.js`) using plain HTML, CSS, and Vanilla JavaScript. No frameworks, no build tools, no backend. Each widget is an independent init function; state is persisted to `localStorage` under dedicated keys.

## Tasks

- [x] 1. Create project file structure and HTML skeleton
  - Create `index.html` with `<!DOCTYPE html>`, `<head>` (charset, viewport, title), and `<body>`
  - Link `css/style.css` in `<head>` and `<script src="js/app.js" defer>` before `</body>`
  - Add the four `<section>` elements with their IDs: `#greeting`, `#focus-timer`, `#todo-list`, `#quick-links`
  - Populate each section with the exact DOM structure specified in the design (all IDs, classes, `aria-live`, `role="alert"`, `type="url"`, `rel="noopener noreferrer"` attributes)
  - Create empty `css/style.css` and `js/app.js` placeholder files
  - _Requirements: 8.3, 8.4_

- [x] 2. Implement base CSS layout and visual design
  - Set `box-sizing: border-box`, body `font-size` ≥ 14px, and a consistent typographic scale
  - Lay out the four sections as clearly separated visual regions (e.g., CSS Grid or Flexbox column)
  - Ensure no horizontal scrollbar appears at 320px viewport width (use `max-width: 100%`, avoid fixed widths wider than viewport)
  - Add visual distinction styles for completed tasks (e.g., `text-decoration: line-through`, reduced opacity)
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 3. Implement `initGreeting()` — Greeting Widget
  - [x] 3.1 Implement `formatTime(date)` — returns zero-padded `HH:MM` string from a `Date` object
    - Use `date.getHours()` and `date.getMinutes()` with `String.padStart(2, '0')`
    - _Requirements: 1.1_
  - [x] 3.2 Implement `formatDate(date)` — returns human-readable date string (e.g., "Monday, 14 July 2025")
    - Use `date.toLocaleDateString` with `{ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }` or manual formatting
    - _Requirements: 1.2_
  - [x] 3.3 Implement `getGreeting(hour)` — returns the correct greeting string for a given hour integer
    - 05–11 → "Good Morning", 12–17 → "Good Afternoon", 18–21 → "Good Evening", 22–04 → "Good Night"
    - _Requirements: 1.3, 1.4, 1.5, 1.6_
  - [x] 3.4 Implement `renderGreeting()` — reads `new Date()`, writes time/date/message to `#greeting-time`, `#greeting-date`, `#greeting-message`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [x] 3.5 Implement `initGreeting()` — calls `renderGreeting()` immediately, then schedules `setInterval(renderGreeting, 60000)`
    - _Requirements: 1.7_

- [x] 4. Implement `initFocusTimer()` — Focus Timer
  - [x] 4.1 Declare module-scoped `remainingSeconds = 1500` and `intervalId = null`
    - _Requirements: 2.1_
  - [x] 4.2 Implement `formatTimer(seconds)` — returns zero-padded `MM:SS` string
    - `MM = Math.floor(seconds / 60)`, `SS = seconds % 60`, both padded to 2 digits
    - _Requirements: 2.3_
  - [x] 4.3 Implement `renderTimer()` — writes `formatTimer(remainingSeconds)` to `#timer-display`, syncs disabled states on `#btn-start` and `#btn-stop` per the button-state table in the design
    - Start disabled when `intervalId !== null`; Stop disabled when `intervalId === null`
    - _Requirements: 2.3, 2.7, 2.8_
  - [x] 4.4 Implement `onTick()` — decrements `remainingSeconds`; if it reaches 0, calls `stopTimer()` and sets `#timer-notification` text to "Time's up!"; requests Web Notification if permission granted (graceful fallback)
    - _Requirements: 2.2, 2.6_
  - [x] 4.5 Implement `startTimer()` — guards against double-start (`if (intervalId !== null) return`), creates `setInterval(onTick, 1000)`, stores result in `intervalId`, calls `renderTimer()`
    - _Requirements: 2.2, 2.7_
  - [x] 4.6 Implement `stopTimer()` — calls `clearInterval(intervalId)`, sets `intervalId = null`, calls `renderTimer()`
    - _Requirements: 2.4, 2.8_
  - [x] 4.7 Implement `resetTimer()` — calls `stopTimer()`, resets `remainingSeconds = 1500`, clears `#timer-notification` text, calls `renderTimer()`
    - _Requirements: 2.5_
  - [x] 4.8 Implement `initFocusTimer()` — attaches click listeners to `#btn-start`, `#btn-stop`, `#btn-reset`, calls `renderTimer()` for initial state
    - _Requirements: 2.1, 2.7, 2.8_

- [x] 5. Checkpoint — verify greeting and timer in browser
  - Open `index.html` directly in a browser; confirm greeting shows correct time/date/message, timer displays "25:00", Start is enabled, Stop is disabled, countdown runs and stops at 00:00 with notification.

- [x] 6. Implement `initTodoList()` — To-Do List
  - [x] 6.1 Implement `generateId()` — returns `crypto.randomUUID()` with fallback to `Date.now().toString(36) + Math.random().toString(36)`
    - _Requirements: 3.2_
  - [x] 6.2 Implement `saveTasks(tasks)` — serialises task array to `localStorage` under key `tdld_tasks` inside a `try/catch`
    - _Requirements: 3.4, 4.6_
  - [x] 6.3 Implement `loadTasks()` — reads `tdld_tasks` from `localStorage`, parses JSON; returns `[]` on missing key or parse error (wrap in `try/catch`)
    - _Requirements: 5.1, 5.3_
  - [x] 6.4 Implement `renderTask(task)` — creates `<li data-id>` with checkbox (`checked` reflects `task.completed`), `<span class="task-title">`, Edit button, Delete button; applies completed styling class when `task.completed` is true
    - _Requirements: 4.1, 4.2_
  - [x] 6.5 Implement `renderTaskList(tasks)` — clears `#task-list`, iterates tasks array calling `renderTask`, appends each `<li>` to `#task-list`
    - _Requirements: 5.1, 5.2_
  - [x] 6.6 Implement `addTask(title, tasks)` — trims title; if empty, retains focus on `#todo-input` and returns early; otherwise creates `{ id, title, completed: false }`, pushes to tasks array, calls `saveTasks`, calls `renderTaskList`, clears input
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 6.7 Implement `toggleTask(id, tasks)` — finds task by id, flips `completed`, calls `saveTasks`, calls `renderTaskList`
    - _Requirements: 4.1, 4.6_
  - [x] 6.8 Implement `startEditTask(id)` — finds the `<li>` for the given id, replaces `<span class="task-title">` with an `<input>` pre-filled with current title; on blur cancels edit and restores original title; on Enter key calls `confirmEditTask`
    - _Requirements: 4.2, 4.4_
  - [x] 6.9 Implement `confirmEditTask(id, newTitle, tasks)` — trims newTitle; if empty, restores original title; otherwise updates task title, calls `saveTasks`, calls `renderTaskList`
    - _Requirements: 4.3, 4.4, 4.6_
  - [x] 6.10 Implement `deleteTask(id, tasks)` — filters out task with matching id, calls `saveTasks`, calls `renderTaskList`
    - _Requirements: 4.5, 4.6_
  - [x] 6.11 Implement `initTodoList()` — calls `loadTasks()`, calls `renderTaskList`, attaches click listener on `#btn-add-task` (calls `addTask`), attaches keydown listener on `#todo-input` for Enter key (calls `addTask`); delegates checkbox/edit/delete clicks via event delegation on `#task-list`
    - _Requirements: 3.1, 3.2, 5.1_

- [x] 7. Implement `initQuickLinks()` — Quick Links
  - [x] 7.1 Implement `saveLinks(links)` — serialises link array to `localStorage` under key `tdld_links` inside a `try/catch`
    - _Requirements: 6.6_
  - [x] 7.2 Implement `loadLinks()` — reads `tdld_links` from `localStorage`, parses JSON; returns `[]` on missing key or parse error
    - _Requirements: 7.1, 7.3_
  - [x] 7.3 Implement `renderLinks(links)` — clears `#link-buttons`, iterates links array; for each link creates a `<span class="link-item">` containing `<a href target="_blank" rel="noopener noreferrer">` and a delete `<button class="btn-delete-link">`; appends to `#link-buttons`
    - _Requirements: 6.4, 7.1, 7.2_
  - [x] 7.4 Implement `addLink(label, url, links)` — trims both fields; if either is empty, sets `#link-validation-msg` text and returns early; otherwise clears validation message, creates `{ id, label, url }`, pushes to links array, calls `saveLinks`, calls `renderLinks`
    - _Requirements: 6.2, 6.3, 6.6_
  - [x] 7.5 Implement `deleteLink(id, links)` — filters out link with matching id, calls `saveLinks`, calls `renderLinks`
    - _Requirements: 6.5, 6.6_
  - [x] 7.6 Implement `initQuickLinks()` — calls `loadLinks()`, calls `renderLinks`, attaches click listener on `#btn-add-link` (calls `addLink`); clears `#link-validation-msg` on input events on `#link-label-input` and `#link-url-input`; delegates delete clicks via event delegation on `#link-buttons`
    - _Requirements: 6.1, 7.1_

- [x] 8. Wire all init functions in `app.js`
  - Add `document.addEventListener('DOMContentLoaded', () => { initGreeting(); initFocusTimer(); initTodoList(); initQuickLinks(); })` at the bottom of `app.js`
  - Confirm execution order matches the design sequence diagram
  - _Requirements: 8.4, 9.1, 9.4_

- [x] 9. Final checkpoint — full integration verification
  - Open `index.html` in Chrome, Firefox, Edge, and Safari; confirm no console errors
  - Verify tasks and links survive a full page reload (localStorage round-trip)
  - Verify no horizontal scrollbar at 320px viewport width
  - Verify timer counts down, stops at 00:00, and shows notification
  - Verify empty/whitespace task and link inputs are rejected with correct behaviour
  - Verify edit-on-blur cancels and restores original title
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- No build tools, no test framework, no backend — all tasks are pure file creation/modification
- `tdld_tasks` and `tdld_links` are the only `localStorage` keys used
- Timer state is session-only; no persistence needed for `remainingSeconds` or `intervalId`
- Edit-on-blur cancels (restores original title); only Enter confirms an edit
- `crypto.randomUUID()` is used for IDs with a `Date.now` + `Math.random` fallback
- URL validation relies on the browser-native `type="url"` input; no custom URL parsing
- All `localStorage` reads/writes are wrapped in `try/catch` for graceful degradation
