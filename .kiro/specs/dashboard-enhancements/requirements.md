# Requirements Document

## Introduction

This document describes enhancements to the existing To-Do Life Dashboard single-page web application. The four enhancements are:

1. **Light / Dark mode toggle** — users can switch between a light and a dark colour scheme, with the preference persisted across sessions.
2. **Custom name in greeting** — users can set their own name so the greeting reads "Good Morning, Alex" instead of the generic "Good Morning".
3. **Customisable Pomodoro timer duration** — users can change the focus timer's starting duration from the default 25 minutes to any value they choose.
4. **Purple primary colour** — the accent / primary colour is updated from indigo (`#4f46e5`) to purple (`#7c3aed`) across the entire design.

All enhancements are purely client-side. Preferences are persisted to `localStorage`. No build tools, frameworks, or backend are required.

---

## Glossary

- **Dashboard**: The single-page web application (`index.html` / `css/style.css` / `js/app.js`).
- **Theme**: The active colour scheme — either `"light"` or `"dark"`.
- **Theme_Toggle**: The UI control that switches between the light and dark Theme.
- **Greeting_Widget**: The existing UI section that displays the current time, date, and greeting message.
- **User_Name**: The optional display name entered by the user, shown as part of the greeting message.
- **Name_Input**: The UI control that allows the user to set or clear the User_Name.
- **Focus_Timer**: The existing UI section that implements the Pomodoro countdown timer.
- **Timer_Duration**: The starting value of the Focus_Timer countdown, expressed in whole minutes.
- **Duration_Input**: The UI control that allows the user to set the Timer_Duration.
- **Local_Storage**: The browser's `localStorage` API used for all client-side persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari at their current stable release.
- **Primary_Color**: The accent colour used for interactive elements, focus rings, and highlights throughout the Dashboard.

---

## Requirements

### Requirement 1: Light / Dark Mode Toggle

**User Story:** As a user, I want to toggle between a light and a dark colour scheme, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Theme_Toggle control that is always visible and accessible from any section of the page.
2. WHEN the user activates the Theme_Toggle, THE Dashboard SHALL switch the active Theme between `"light"` and `"dark"`.
3. WHILE the `"dark"` Theme is active, THE Dashboard SHALL apply a dark background colour and light text colour to all sections.
4. WHILE the `"light"` Theme is active, THE Dashboard SHALL apply a light background colour and dark text colour to all sections.
5. WHEN the user activates the Theme_Toggle, THE Dashboard SHALL persist the selected Theme to Local_Storage under the key `tdld_theme`.
6. WHEN the Dashboard loads, THE Dashboard SHALL read the Theme from Local_Storage and apply it before rendering any content, so that no flash of the wrong theme occurs.
7. IF Local_Storage contains no Theme value, THEN THE Dashboard SHALL default to the `"light"` Theme.
8. THE Theme_Toggle SHALL display a visible label or icon that indicates the currently active Theme (e.g., a sun icon for light mode, a moon icon for dark mode).

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting message is personalised to me, so that the Dashboard feels more welcoming.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide a Name_Input control that allows the user to enter or update the User_Name.
2. WHEN the user submits a non-empty User_Name via the Name_Input, THE Greeting_Widget SHALL append the User_Name to the greeting message (e.g., "Good Morning, Alex").
3. WHEN the user submits a non-empty User_Name, THE Greeting_Widget SHALL persist the User_Name to Local_Storage under the key `tdld_user_name`.
4. WHEN the Dashboard loads, THE Greeting_Widget SHALL read the User_Name from Local_Storage and include it in the greeting message if a value is present.
5. IF Local_Storage contains no User_Name value, THEN THE Greeting_Widget SHALL display the greeting without a name (e.g., "Good Morning").
6. WHEN the user clears the Name_Input and submits an empty value, THE Greeting_Widget SHALL remove the User_Name from the greeting and delete the `tdld_user_name` key from Local_Storage.
7. THE Greeting_Widget SHALL trim leading and trailing whitespace from the User_Name before persisting or displaying it.

---

### Requirement 3: Customisable Pomodoro Timer Duration

**User Story:** As a user, I want to set the focus timer's starting duration, so that I can adapt the Pomodoro length to my preferred work rhythm.

#### Acceptance Criteria

1. THE Focus_Timer SHALL provide a Duration_Input control that allows the user to set the Timer_Duration in whole minutes.
2. THE Duration_Input SHALL accept integer values between 1 and 99 minutes (inclusive).
3. WHEN the user submits a valid Timer_Duration via the Duration_Input, THE Focus_Timer SHALL update the starting duration and reset the countdown to the new Timer_Duration.
4. WHEN the user submits a valid Timer_Duration, THE Focus_Timer SHALL persist the Timer_Duration to Local_Storage under the key `tdld_timer_duration`.
5. WHEN the Dashboard loads, THE Focus_Timer SHALL read the Timer_Duration from Local_Storage and initialise the countdown to that value.
6. IF Local_Storage contains no Timer_Duration value, THEN THE Focus_Timer SHALL default to a Timer_Duration of 25 minutes.
7. IF the user submits a Timer_Duration that is not a whole number, is less than 1, or is greater than 99, THEN THE Focus_Timer SHALL reject the input and display an inline validation message.
8. WHILE the Focus_Timer is counting down, THE Duration_Input SHALL be disabled to prevent mid-session duration changes.

---

### Requirement 4: Purple Primary Colour

**User Story:** As a user, I want the Dashboard to use purple as its primary colour, so that the visual design feels fresh and distinct.

#### Acceptance Criteria

1. THE Dashboard SHALL replace all uses of the existing indigo accent colour (`#4f46e5` and `#4338ca`) with a purple primary colour (`#7c3aed` and `#6d28d9` for the hover state).
2. THE Dashboard SHALL apply the purple Primary_Color to all interactive elements that previously used the indigo accent, including buttons, focus rings, checkbox accents, link text, and input focus outlines.
3. WHILE the `"dark"` Theme is active, THE Dashboard SHALL use a purple-tinted dark surface colour for section backgrounds to maintain visual consistency with the Primary_Color.
4. THE Dashboard SHALL maintain a colour contrast ratio of at least 4.5:1 between the Primary_Color and any background it is placed on, in both light and dark Themes, in accordance with WCAG 2.1 AA.

---

### Requirement 5: Persistence and Cross-Enhancement Consistency

**User Story:** As a user, I want all my preferences (theme, name, timer duration) to be saved automatically, so that my Dashboard is configured exactly as I left it every time I return.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL restore the Theme, User_Name, and Timer_Duration from Local_Storage before any widget renders visible content.
2. THE Dashboard SHALL store each preference under a distinct Local_Storage key: `tdld_theme`, `tdld_user_name`, and `tdld_timer_duration`.
3. IF any preference key is absent from Local_Storage, THEN THE Dashboard SHALL apply the default value for that preference without error.
4. WHEN Local_Storage is unavailable (e.g., private browsing mode), THE Dashboard SHALL apply all default preference values and continue to function without throwing an unhandled error.

