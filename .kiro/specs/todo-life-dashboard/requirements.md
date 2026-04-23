# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a live greeting with the current time and date, a Pomodoro-style focus timer, a persistent to-do list, and a quick-access link launcher — all in a single, minimal HTML/CSS/Vanilla JS page. All data is stored in the browser's Local Storage; no backend or build tooling is required.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a time-of-day greeting.
- **Focus_Timer**: The UI section that implements a 25-minute countdown timer.
- **Todo_List**: The UI section that manages the user's task items.
- **Task**: A single to-do item with a title, a completion state, and an optional edit state.
- **Quick_Links**: The UI section that displays user-defined shortcut buttons to external URLs.
- **Link**: A user-defined record consisting of a label and a URL stored in Quick_Links.
- **Local_Storage**: The browser's `localStorage` API used for all client-side persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari at their current stable release.

---

## Requirements

### Requirement 1: Live Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I have an immediate sense of the time of day without checking another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 14 July 2025").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL update the displayed time without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down in one-second intervals.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed MM:SS value each second.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual or audible notification to the user.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate timers.
8. WHILE the Focus_Timer is paused or reset, THE Focus_Timer SHALL disable the Stop control.

---

### Requirement 3: To-Do List — Task Creation

**User Story:** As a user, I want to add new tasks to my to-do list, so that I can track the things I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field and an Add control for creating new Tasks.
2. WHEN the user submits a non-empty task title via the Add control or the Enter key, THE Todo_List SHALL append the new Task to the list and clear the input field.
3. IF the user attempts to submit an empty or whitespace-only task title, THEN THE Todo_List SHALL not create a Task and SHALL retain focus on the input field.
4. WHEN a Task is created, THE Todo_List SHALL persist all Tasks to Local_Storage.

---

### Requirement 4: To-Do List — Task Management

**User Story:** As a user, I want to mark tasks as done, edit task titles, and delete tasks, so that I can keep my list accurate and up to date.

#### Acceptance Criteria

1. WHEN the user activates the completion control on a Task, THE Todo_List SHALL toggle the Task's completion state and apply a visual distinction (e.g., strikethrough) to completed Tasks.
2. WHEN the user activates the edit control on a Task, THE Todo_List SHALL replace the Task title with an editable input field pre-populated with the current title.
3. WHEN the user confirms an edit with a non-empty title, THE Todo_List SHALL update the Task title and return to the read-only display.
4. IF the user confirms an edit with an empty or whitespace-only title, THEN THE Todo_List SHALL discard the edit and restore the original Task title.
5. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list.
6. WHEN any Task state changes (completion, edit, or deletion), THE Todo_List SHALL persist the updated Task list to Local_Storage.

---

### Requirement 5: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Todo_List SHALL read all Tasks from Local_Storage and render them in the order they were saved.
2. THE Todo_List SHALL preserve each Task's title and completion state across page reloads.
3. IF Local_Storage contains no Task data, THEN THE Todo_List SHALL render an empty list with no errors.

---

### Requirement 6: Quick Links — Link Management

**User Story:** As a user, I want to add, open, and delete shortcut buttons to my favourite websites, so that I can navigate to them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a label input, a URL input, and an Add control for creating new Links.
2. WHEN the user submits a Link with a non-empty label and a valid URL, THE Quick_Links SHALL add a new button for that Link.
3. IF the user attempts to submit a Link with an empty label or an empty URL, THEN THE Quick_Links SHALL not create the Link and SHALL display an inline validation message.
4. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
5. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove that Link button from the display.
6. WHEN any Link is added or deleted, THE Quick_Links SHALL persist the updated Link list to Local_Storage.

---

### Requirement 7: Quick Links — Persistence

**User Story:** As a user, I want my quick links to be saved automatically, so that my shortcuts are still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Quick_Links SHALL read all Links from Local_Storage and render a button for each Link.
2. THE Quick_Links SHALL preserve each Link's label and URL across page reloads.
3. IF Local_Storage contains no Link data, THEN THE Quick_Links SHALL render an empty link area with no errors.

---

### Requirement 8: Layout and Visual Design

**User Story:** As a user, I want a clean, readable, and visually organised interface, so that I can use the Dashboard comfortably without distraction.

#### Acceptance Criteria

1. THE Dashboard SHALL organise the Greeting_Widget, Focus_Timer, Todo_List, and Quick_Links into clearly separated visual sections.
2. THE Dashboard SHALL apply a consistent typographic scale with a minimum body font size of 14px.
3. THE Dashboard SHALL use a single CSS file located at `css/style.css` for all styling.
4. THE Dashboard SHALL use a single JavaScript file located at `js/app.js` for all behaviour.
5. THE Dashboard SHALL render without horizontal scrollbars on viewport widths of 320px and above.

---

### Requirement 9: Browser Compatibility and Performance

**User Story:** As a user, I want the Dashboard to load quickly and work in any modern browser, so that I can use it reliably regardless of my preferred browser.

#### Acceptance Criteria

1. THE Dashboard SHALL load and render all widgets within 2 seconds on a standard broadband connection.
2. THE Dashboard SHALL function correctly in the current stable release of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL use only standard Web APIs available in Modern_Browsers without requiring polyfills or transpilation.
4. WHEN the user interacts with any control (add, delete, toggle, timer), THE Dashboard SHALL reflect the change in the UI within 100ms.
