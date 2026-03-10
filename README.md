## Technology Dependency & Sovereignty Check

Lightweight client-side assessment tool for the Navara website. It helps CTOs and technology leaders quickly understand how dependent their organisation is on a small number of technology providers.

### Features

- **3-minute assessment**: 6 focused questions covering concentration, operational dependence, exit difficulty and legal visibility.
- **One-question-per-screen**: Clear progress indicator, progress bar, back navigation and answer persistence.
- **Scoring model**: Explicit scoring rules (0–18) with three categories (Low / Moderate / High exposure).
- **Results page**: Score, exposure category, narrative headline and description, plus ISO 27001 context copy.
- **Lead capture form**: First name, work email, organisation and two consent checkboxes, stored to `localStorage` and logged to the console.
- **Analytics hooks**: Simple event hooks that can be wired into your analytics stack later.
- **Embed-friendly**: Single React component with minimal styling and no external UI dependencies.

### Tech stack

- **React 18**
- **TypeScript**
- **Vite** for local development and bundling
- **No runtime backend** – everything runs client-side

### Getting started

From the project root:

```bash
npm install
npm run dev
```

Then open the printed URL (by default `http://localhost:5173`) in your browser.

### Core structure

- **`src/assessmentConfig.ts`**: Question definitions, answer options and scoring rules. This file encodes the exact wording, scores and the category thresholds.
- **`src/analytics.ts`**: Central place for analytics hooks. Currently logs events to the console; replace `trackEvent` with your own analytics implementation (e.g. `dataLayer.push`, Segment, etc.).
- **`src/leadStorage.ts`**: Local lead storage for the prototype. Uses `localStorage` under a single key and logs every submission to the console. Swap `saveLead` for a real API call in production.
- **`src/App.tsx`**: Main React component implementing the full flow (intro → assessment → short analysis loading state → results + lead form).
- **`src/styles.css`**: Minimal but polished styling, mobile-first and neutral enough to embed inside a corporate site.

### Flow overview

1. **Intro screen**
   - Explains the purpose and audience (CTOs / CIOs / technology leaders).
   - Button: “Start assessment” triggers the `assessment_started` analytics event.

2. **Assessment**
   - One question per screen.
   - Progress indicator “Question X of 6” and a progress bar.
   - Large clickable answer buttons that remain selected when navigating back and forth.
   - Back button:
     - From question 1, returns to the intro.
     - Otherwise, moves to the previous question without losing answers.
   - On answer selection a `question_answered` event is logged.

3. **Analysis loading**
   - After the final question, a 2-second loading screen shows “Analysing technology dependencies…”.
   - During this phase, `assessment_completed` is logged with `totalScore` and `category`.

4. **Results**
   - Shows the numeric score (e.g. `13 / 18`).
   - Exposure category:
     - 0–6: **Low exposure** – “Diversified technology environment”.
     - 7–12: **Moderate exposure** – “Structural dependency on a small number of providers”.
     - 13–18: **High exposure** – “Strong provider dependency”.
   - Includes the required ISO context message explaining how this complements ISO 27001.
   - Offers a simple “Start a new assessment” link to reset state.

5. **Lead capture form**
   - Fields:
     - First name
     - Work email
     - Organisation
   - Checkboxes:
     - Send me the whitepaper “Security Without Sovereignty: Why ISO 27001 Isn’t Enough”.
     - Contact me for a deeper Technology Dependency & Sovereignty assessment.
   - Basic validation: all three text fields are required; error and success messages are shown inline.
   - On successful submit:
     - Data is stored in `localStorage` as an array of submissions.
     - A `lead_submitted` analytics event is logged.

### Analytics hooks

All analytics events are centralised in `src/analytics.ts`:

- **`assessment_started`** – Fired when the intro button is clicked.
- **`question_answered`** – Fired on each answer selection with `questionId` and `answerId`.
- **`assessment_completed`** – Fired after the last answer, just before the loading screen, with `totalScore` and `category`.
- **`lead_submitted`** – Fired after a successful lead form submission with checkbox flags.

To connect a real analytics platform, replace the implementation of `trackEvent` with the appropriate calls while keeping the event payload shapes stable.

### Connecting a backend later

For production use you will typically want to:

- Send assessments or summaries to an API.
- Forward leads into a CRM or marketing automation tool.

Places to integrate:

- **Lead capture**: Replace `saveLead` in `src/leadStorage.ts` with an async POST request to your backend, keeping the function signature so `App.tsx` does not need major changes.
- **Assessment results**: Extend `assessment_completed` handling in `src/analytics.ts` to persist scores or feed dashboards.

### Embedding in another website

Because this is a standard React component, you can embed it in several ways:

- **Inside a React-based site**:
  - Import `App` and render it within the host site’s layout.
- **As a standalone bundle**:
  - Use `npm run build` to create a static bundle.
  - Serve it under a path like `/sovereignty-check/` and embed it via an `<iframe>` in your CMS-based site.

Styling is intentionally scoped to simple class names and base elements to minimise clashes. If you embed inside a larger design system, you can either:

- Wrap the tool in a container that constrains fonts and colours, or
- Adjust `src/styles.css` to better match your design tokens.

