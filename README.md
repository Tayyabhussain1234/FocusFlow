# FocusFlow

> **Plan Smarter. Focus Deeper. Achieve More.**

FocusFlow is a modern, high-performance productivity web application designed to help knowledge workers, developers, and students bridge the gap between daily scheduling, deep focus execution, and actionable productivity analytics.

---

## Overview

Modern productivity tools often suffer from fragmented workflows: task lists exist in one application, focus timers in another, weekly planners in a third, and analytics are often locked behind paid enterprise tiers.

**FocusFlow** unifies the four pillars of effective personal productivity into a cohesive, zero-friction interface:

1. **Smart Task Manager** — High-velocity task organization with multi-tier filters and customizable taxonomy.
2. **Pomodoro Focus Timer** — An accurate, drift-resistant focus engine with task linkage and native audio alerts.
3. **Interactive Weekly Planner** — A 7-day calendar matrix powered by a unified task state model.
4. **Productivity Insights** — Real-time analytics, completion velocity trends, and focus distribution charts.

---

## Key Features

### 1. Smart Task Manager
- **Structured Task Creation:** Modal dialog supporting task titles, detailed descriptions, priority tiers (*High*, *Medium*, *Low*), functional categories (*Work*, *Study*, *Personal*, *Finance*, or custom user categories), due dates, and estimated durations.
- **Form Validation:** Client-side input validation preventing blank titles, trimming extraneous whitespace, and rejecting invalid durations.
- **Multi-Factor Filtering:** Live search by title or description combined with status tabs (*All*, *Active*, *Completed*, *Overdue*), priority filters, and category selectors.
- **Sorting Options:** Sort tasks by due date (soonest/latest), priority level, creation timestamp, or alphabetical title.
- **Zero-Pill Visual Hierarchy:** Clean, unboxed metadata with typographic separators (`·`), subtle priority indicators, and responsive hover controls.
- **Single-Click Focus Launcher:** Jump directly from any task card into an associated Pomodoro focus block.

### 2. Pomodoro Focus Timer
- **High-Accuracy Timestamp Engine:** Unlike naive `setInterval` countdowns that drift when browser tabs are throttled in the background, FocusFlow computes remaining duration against an absolute target timestamp (`targetEndTime = Date.now() + remainingSeconds * 1000`).
- **Tab Visibility Recovery:** Listens for `visibilitychange` events to recalculate and reconcile remaining time immediately upon tab focus.
- **Reload State Persistence:** If the page is reloaded during an active session, the timer restores from local storage and resumes countdown seamlessly.
- **Audio Chime:** Synthesizes a warm multi-tone chime chord (D5, F#5, A5) using the native browser **Web Audio API**—zero external audio dependencies, zero network latency.
- **Customizable Durations:** Configure standard focus sessions (default 25m), short breaks (5m), and long breaks (15m).
- **Distraction-Free Mode:** Fullscreen mode for deep immersion with dark backdrop and focal timer ring.

### 3. Interactive Weekly Planner
- **Unified 7-Day Matrix:** Visualizes the current week with daily task counts, completion indicators, and relative day highlighting.
- **Shared Data Source:** Direct synchronization with the Task Manager—marking a task complete or modifying its date updates across all views immediately.
- **Day-Specific Quick Scheduling:** Click any day to view scheduled tasks or open a pre-filled task creation dialog for that specific date.
- **Timezone-Safe Date Math:** Employs local calendar date strings (`YYYY-MM-DD`) to eliminate timezone off-by-one errors near midnight.

### 4. Productivity Insights & Telemetry
- **Accurate Metric Calculations:**
  - Total tasks created vs. active backlog.
  - Overall task completion rate (with safe zero-division handling).
  - Cumulative deep focus minutes and hours logged from genuine completed sessions.
  - Today's completed tasks and today's focus volume.
- **Interactive Data Visualizations (Recharts):**
  - **Task Completion Velocity:** Daily bar chart displaying finished tasks over the selected window.
  - **Focus Volume Curve:** Smooth gradient area chart plotting daily deep work minutes.
  - **Category Breakdown:** Donut chart and progress metrics illustrating distribution across functional domains.
- **Dynamic Time Horizons:** Toggle between *Last 7 Days* and *Last 30 Days* for short-term and mid-term productivity evaluation.

---

## Design System & Aesthetics

FocusFlow is styled with a charcoal-black aesthetic paired with warm amber and gold accents:

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Canvas** | `#101112` | Primary application background |
| **Sidebar** | `#151719` | Persistent navigation rail |
| **Card Surface** | `#1B1E21` | Standard container surface |
| **Elevated Surface** | `#22262A` | Active states, hover surfaces, inputs |
| **Primary Accent** | `#FFD166` | Primary CTAs, active indicators, timer rings |
| **Secondary Accent**| `#FF8A00` | Accent gradients, celebratory highlights |
| **Border** | `#303438` | Subtle hairline structure |
| **Text Primary** | `#F7F7F5` | High-contrast readable typography |
| **Text Muted** | `#A3A8AE` | Secondary labels, descriptions, metadata |
| **Success** | `#72D6A0` | Completed checkboxes, positive trends |
| **Warning / Alert** | `#FF7373` | Overdue deadlines, high-priority flags |

### Typography
- **Primary Interface:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — crisp geometric neo-grotesque sans-serif.
- **Numerical & Timers:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — tabular figures (`font-mono tabular-nums`) preventing layout jitter during countdowns.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti
- **Audio:** Web Audio API (OscillatorNode & GainNode)
- **Persistence:** LocalStorage with schema protection

---

## Project Structure

```
focusflow/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ConfirmDialog.tsx # Accessible destructive action modal
│   │   ├── EmptyState.tsx   # Informative empty states with CTAs
│   │   ├── PomodoroTimer.tsx # SVG circular timer & session engine
│   │   ├── ProductivityInsights.tsx # Analytics & Recharts visualizations
│   │   ├── Sidebar.tsx      # Desktop navigation & mobile drawer
│   │   ├── StatCard.tsx     # KPI summary cards with tabular numbers
│   │   ├── TaskCard.tsx     # Task item card with Zero-Pill metadata
│   │   ├── TaskFilters.tsx  # Search, status tabs, priority & sort bar
│   │   ├── TaskForm.tsx     # Modal dialog for task creation/editing
│   │   ├── Toast.tsx        # Ephemeral feedback alerts
│   │   ├── Topbar.tsx       # Contextual header with timer chip
│   │   └── WeeklyPlanner.tsx # 7-day schedule matrix & day detail view
│   ├── context/
│   │   └── AppContext.tsx   # Centralized state provider & action handlers
│   ├── hooks/
│   │   ├── useLocalStorage.ts # Robust typed localStorage hook
│   │   └── usePomodoroTimer.ts # Accurate Pomodoro countdown & lifecycle hook
│   ├── pages/
│   │   ├── Dashboard.tsx    # Overview dashboard & daily queue
│   │   ├── Focus.tsx        # Dedicated focus session screen
│   │   ├── Insights.tsx     # Dedicated analytics page
│   │   ├── Planner.tsx      # Dedicated weekly planner page
│   │   └── Tasks.tsx        # Dedicated task backlog & filtering page
│   ├── types/
│   │   └── index.ts         # TypeScript data schemas & type contracts
│   ├── utils/
│   │   ├── dateUtils.ts     # Timezone-safe local calendar helpers
│   │   ├── sound.ts         # Web Audio API harmonic chime generator
│   │   ├── statistics.ts    # Mathematical aggregations for insights
│   │   └── taskUtils.ts     # Filtering, sorting, and validation logic
│   ├── App.tsx              # Root application layout
│   ├── index.css            # Tailwind theme, variables, and typography
│   └── main.tsx             # Application bootstrap entry point
├── index.html               # HTML5 document with preloaded Google Fonts
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite bundler configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm, pnpm, or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/focusflow.git
   cd focusflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build
To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

### Type Checking
To run the TypeScript type checker:
```bash
npm run lint
```

---

## Data Model & Local Storage

All user data is stored locally in the browser's `localStorage`:

- `focusflow_tasks_v1` — Stores task records including IDs, titles, descriptions, priorities, categories, due dates, estimated durations, and completion timestamps.
- `focusflow_sessions_v1` — Stores completed focus sessions with associated task IDs, durations, and timestamps.
- `focusflow_timer_state_v1` — Stores running timer state for seamless reload recovery.
- `focusflow_timer_settings_v1` — Stores customized session durations and sound preferences.

No external databases or third-party cloud accounts are required; the application operates entirely client-side.

---

## License

This project is licensed under the [MIT License](LICENSE).
