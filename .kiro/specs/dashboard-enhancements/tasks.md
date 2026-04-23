# Implementation Plan: Dashboard Enhancements

## Overview

Implement four client-side enhancements to the existing To-Do Life Dashboard: a light/dark mode toggle, a custom name in the greeting, a customisable Pomodoro timer duration, and a purple primary colour update. All changes are confined to `index.html`, `css/style.css`, and `js/app.js`. Preferences are persisted to `localStorage`.

## Tasks

- [x] 1. Update CSS colour tokens and add dark theme custom properties
  - In `css/style.css`, update `:root` to replace `--color-accent: #4f46e5` with `#7c3aed` and `--color-accent-hover: #4338ca` with `#6d28d9`
  - Add the `[data-theme="dark"]` block with all dark-mode token overrides (`--color-bg: #1a1a2e`, `--color-surface: #2d1f4e`, `--color-border: #4a3f6b`, `--color-text: #e5e7eb`, `--color-text-muted: #9ca3af`, `--color-accent: #c4b5fd`, `--color-accent-hover: #a78bfa`, `--color-danger: #f87171`, `--color-danger-hover: #ef4444`)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Add theme toggle, name input, and duration input markup to `index.html`
  - Add `<div id="theme-toggle-bar"><button id="btn-theme-toggle" aria-label="Switch to dark mode"><span id="theme-icon">☀️</span></button></div>` before the first `<section>`
  - Inside `<section id="greeting">`, add `<div id="name-input-row">` with `#name-input` (type text, placeholder "Your name…") and `#btn-set-name` below `#greeting-message`
  - Inside `<section id="focus-timer">`, add `<div id="duration-input-row">` with a label, `#duration-input` (type number, min 1, max 99, value 25), and `#btn-set-duration` below `#timer-notification`; add `<p id="duration-validation-msg" role="alert"></p>` after the row
  - _Requirements: 1.1, 1.8, 2.1, 3.1_

- [x] 3. Add CSS styles for new UI controls
  - Add styles for `#theme-toggle-bar` and `#btn-theme-toggle` (always-visible, accessible button with hover/focus states using the updated accent colour)
  - Add styles for `#name-input-row`, `#name-input`, and `#btn-set-name` consistent with the existing `#todo-input-row` pattern
  - Add styles for `#duration-input-row`, `#duration-input`, `#btn-set-duration`, and `#duration-validation-msg` consistent with existing form patterns
  - Ensure all new controls are responsive at 320 px viewport width
  - _Requirements: 1.1, 1.8, 2.1, 3.1, 4.2_

- [x] 4. Implement theme persistence helpers and `initTheme()` in `js/app.js`
  - [x] 4.1 Implement `loadTheme()`, `saveTheme(theme)`, and `applyTheme(theme)` functions
    - `loadTheme()` reads `tdld_theme` from `localStorage`; returns `"light"` if absent, on error, or if value is not `"light"` or `"dark"`
    - `saveTheme(theme)` writes to `localStorage` under `tdld_theme`; swallows storage errors
    - `applyTheme(theme)` sets `document.documentElement.dataset.theme`, updates `#btn-theme-toggle` `aria-label` and `#theme-icon` text (☀️ for light / 🌙 for dark)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 4.2 Write property test for theme toggle involution (Property 1)
    - **Property 1: Theme toggle is an involution**
    - **Validates: Requirements 1.2**
    - Use `fc.constantFrom("light", "dark")` — toggling twice must return the original theme

  - [ ]* 4.3 Write property test for theme persistence round-trip (Property 2)
    - **Property 2: Theme persistence round-trip**
    - **Validates: Requirements 1.5**
    - Use `fc.constantFrom("light", "dark")` — `saveTheme` then `loadTheme` must return the same value

  - [ ]* 4.4 Write property test for theme icon and label (Property 3)
    - **Property 3: Theme icon and label reflect active theme**
    - **Validates: Requirements 1.8**
    - Use `fc.constantFrom("light", "dark")` — after `applyTheme`, aria-label and icon must match the mapping table

  - [x] 4.5 Implement `initTheme()`
    - Calls `loadTheme()` then `applyTheme()` on load
    - Attaches click listener to `#btn-theme-toggle` that reads current `data-theme`, computes the opposite, calls `applyTheme()` and `saveTheme()`
    - _Requirements: 1.2, 1.5, 1.6_

  - [ ]* 4.6 Write unit tests for `loadTheme()` edge cases
    - Key absent → `"light"`; stored `"dark"` → `"dark"`; corrupt value (e.g. `"blue"`) → `"light"`
    - `applyTheme("dark")` → `dataset.theme === "dark"`, icon is 🌙
    - `applyTheme("light")` → icon is ☀️, aria-label is "Switch to dark mode"
    - _Requirements: 1.7, 1.8_

- [x] 5. Call `initTheme()` first in the `DOMContentLoaded` handler
  - In `js/app.js`, update the bootstrap block to call `initTheme()` as the very first statement before `initGreeting()`
  - _Requirements: 1.6, 5.1_

- [x] 6. Checkpoint — Ensure theme toggle works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement custom name in greeting in `js/app.js`
  - [x] 7.1 Implement `loadUserName()` and `saveUserName(name)` functions
    - `loadUserName()` reads `tdld_user_name` from `localStorage`; returns `""` if absent or on error
    - `saveUserName(name)` writes non-empty name to `localStorage`; removes the key if name is empty; swallows storage errors
    - _Requirements: 2.3, 2.6_

  - [ ]* 7.2 Write property test for user name persistence round-trip (Property 5)
    - **Property 5: User name persistence round-trip**
    - **Validates: Requirements 2.3**
    - Use `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` — `saveUserName` then `loadUserName` must return the same string

  - [x] 7.3 Implement `renderGreetingMessage(hour, name)` and update `renderGreeting()`
    - `renderGreetingMessage(hour, name)` returns `getGreeting(hour) + ", " + name` if name is non-empty, otherwise just `getGreeting(hour)`
    - Add a module-scoped `userName` variable initialised from `loadUserName()` on load
    - Update `renderGreeting()` to call `renderGreetingMessage(now.getHours(), userName)` and write the result to `#greeting-message`
    - _Requirements: 2.2, 2.5, 2.7_

  - [ ]* 7.4 Write property test for greeting message with trimmed name (Property 4)
    - **Property 4: Greeting message includes trimmed name**
    - **Validates: Requirements 2.2, 2.7**
    - Use `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` and `fc.integer({ min: 0, max: 23 })` — result must contain both the time-of-day greeting and the trimmed name separated by ", "

  - [x] 7.5 Update `initGreeting()` to load name, pre-fill `#name-input`, and wire `#btn-set-name`
    - On load, read `userName` from `loadUserName()` and pre-fill `#name-input` with the stored value
    - Attach click listener to `#btn-set-name` that trims the input value, updates the `userName` variable, calls `saveUserName()`, and calls `renderGreeting()`
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 2.7_

  - [ ]* 7.6 Write unit tests for name input edge cases
    - `loadUserName()` with key absent → `""`
    - `saveUserName("")` → key removed from localStorage
    - `renderGreetingMessage(9, "")` → `"Good Morning"` (no comma)
    - `renderGreetingMessage(9, "Alex")` → `"Good Morning, Alex"`
    - Whitespace-only name treated as empty
    - _Requirements: 2.5, 2.6, 2.7_

- [x] 8. Checkpoint — Ensure greeting personalisation works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement customisable Pomodoro timer duration in `js/app.js`
  - [x] 9.1 Implement `loadTimerDuration()` and `saveTimerDuration(minutes)` functions
    - `loadTimerDuration()` reads `tdld_timer_duration` from `localStorage`; returns `25` if absent, non-numeric, non-integer, or out of range [1, 99]
    - `saveTimerDuration(minutes)` writes `minutes` to `localStorage` under `tdld_timer_duration`; swallows storage errors
    - _Requirements: 3.4, 3.5, 3.6_

  - [ ]* 9.2 Write property test for timer duration persistence round-trip (Property 8)
    - **Property 8: Timer duration persistence round-trip**
    - **Validates: Requirements 3.4**
    - Use `fc.integer({ min: 1, max: 99 })` — `saveTimerDuration` then `loadTimerDuration` must return the same integer

  - [x] 9.3 Implement `setTimerDuration(minutes)` with validation
    - Validates that `minutes` is an integer in [1, 99]; if invalid, sets `#duration-validation-msg` with the appropriate message and returns early without changing state
    - If valid, clears `#duration-validation-msg`, updates `timerDurationMinutes`, sets `remainingSeconds = minutes * 60`, calls `resetTimer()`, and calls `saveTimerDuration(minutes)`
    - Add a module-scoped `timerDurationMinutes` variable (default 25) and update `resetTimer()` to use `timerDurationMinutes * 60` instead of the hard-coded `1500`
    - _Requirements: 3.2, 3.3, 3.7_

  - [ ]* 9.4 Write property test for duration validation (Property 6)
    - **Property 6: Timer duration validation accepts valid range and rejects invalid input**
    - **Validates: Requirements 3.2, 3.7**
    - Valid: `fc.integer({ min: 1, max: 99 })` — no validation message, `remainingSeconds` updated
    - Invalid: `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 100 }), fc.float().filter(n => !Number.isInteger(n)))` — non-empty validation message, `remainingSeconds` unchanged

  - [ ]* 9.5 Write property test for duration reset correctness (Property 7)
    - **Property 7: Setting duration resets countdown to correct value**
    - **Validates: Requirements 3.3**
    - Use `fc.integer({ min: 1, max: 99 })` — after `setTimerDuration(D)`, `remainingSeconds` must equal `D * 60`

  - [x] 9.6 Update `initFocusTimer()` to load duration, pre-fill `#duration-input`, and wire `#btn-set-duration`
    - Read `timerDurationMinutes` from `loadTimerDuration()` and set `remainingSeconds = timerDurationMinutes * 60`
    - Pre-fill `#duration-input` with the loaded value
    - Attach click listener to `#btn-set-duration` that calls `setTimerDuration(parseInt(#duration-input.value, 10))`
    - _Requirements: 3.1, 3.5, 3.6_

  - [x] 9.7 Update `renderTimer()` to sync disabled state of `#duration-input` and `#btn-set-duration`
    - Disable both `#duration-input` and `#btn-set-duration` when `intervalId !== null`; enable them when `intervalId === null`
    - _Requirements: 3.8_

  - [ ]* 9.8 Write property test for duration input disabled state (Property 9)
    - **Property 9: Duration input disabled state matches timer running state**
    - **Validates: Requirements 3.8**
    - For both timer states (running / stopped), `#duration-input` and `#btn-set-duration` disabled state must match `intervalId !== null`

  - [ ]* 9.9 Write unit tests for timer duration edge cases
    - `loadTimerDuration()` with key absent → `25`
    - `loadTimerDuration()` with `"0"` stored → `25` (out of range)
    - `loadTimerDuration()` with `"2.5"` stored → `25` (non-integer)
    - `setTimerDuration(0)` → rejected, validation message shown
    - `setTimerDuration(100)` → rejected, validation message shown
    - `setTimerDuration(25)` → `remainingSeconds === 1500`
    - `setTimerDuration(1)` → `remainingSeconds === 60`
    - `setTimerDuration(99)` → `remainingSeconds === 5940`
    - Duration input disabled while timer running, enabled while stopped
    - _Requirements: 3.2, 3.6, 3.7, 3.8_

- [x] 10. Implement localStorage unavailability guard and defaults verification
  - Wrap all new `localStorage` read/write calls in `try/catch` consistent with the existing `saveTasks`/`loadTasks` pattern (verify this is already done in steps 4, 7, 9)
  - Verify that when all three preference keys are absent, `loadTheme()` → `"light"`, `loadUserName()` → `""`, `loadTimerDuration()` → `25`
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 10.1 Write property test for missing preference keys producing correct defaults (Property 10)
    - **Property 10: Missing preference keys produce correct defaults**
    - **Validates: Requirements 5.3**
    - Use `fc.subarray(["tdld_theme", "tdld_user_name", "tdld_timer_duration"])` — for any subset of absent keys, the corresponding load functions must return correct defaults without throwing

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use **fast-check** and validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- `initTheme()` MUST be called first in the `DOMContentLoaded` handler to prevent a flash of the wrong theme
