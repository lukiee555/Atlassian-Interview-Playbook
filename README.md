# Atlassian Interview Playbook

A lightweight static interview-preparation website for the complete Atlassian full-stack loop:

- **AI-Enabled Code Design** — repository discovery, bounded AI use, Java feature/bug simulations, testing and diff review.
- **Full-Stack Based System Design** — progressive designs for product-agnostic tagging, a Jira/Trello board and a Confluence popular-content feed.
- **Management Interview** — official format, candidate-reported questions, a pricing-first personalized answer library, project deep dives and an interactive mock.
- **Values Interview** — all five official values, a complete question bank, primary and backup personalized stories, a ten-story matrix and an interactive mock.

The site is structured as an interview simulation rather than a collection of notes.

## Features

- Static HTML, CSS and JavaScript; no backend or build step.
- Responsive sidebar/mobile drawer, page table of contents and reading progress.
- Global search with `Cmd/Ctrl + K` or `/` across all 27 pages.
- Light/dark mode, print-friendly pages and local review progress.
- Copy buttons for prompts and code; local PrismJS syntax highlighting.
- Mermaid diagrams rendered in the browser without modifying diagram source.
- Expandable follow-ups, random management/values question decks and timers.
- Optional practice-note builder with persistent-storage detection, verified copy, TXT download, JSON export and JSON import.
- Official, candidate-reported and practice/reconstruction content visibly separated.
- Personalized behavioral preparation uses known experience only; uncertain outcomes are explicitly marked.
- Interview-safe abstractions avoid exposing internal repository, branch, configuration-key and private store identifiers.

## Personalized behavioral portfolio

The site deliberately does not over-rely on one project. The portfolio includes:

1. Pricing fallback and derived national-price aggregation.
2. Five Spark jobs consolidated into one pipeline handling 165M+ records.
3. Staged pricing migration and tenant-aware international integration.
4. International production deployment failure caused by a runtime-parity gap.
5. Production disagreement over temporary containment versus permanent business behavior.
6. Cross-team defect triage during a large rollout.
7. Mentoring junior, vendor and frontend engineers.
8. Feedback that backend judgment was not sufficiently visible.
9. Promo-pricing operations UI delivered end to end in two days.
10. Wally streaming responses and broader mobile/full-stack ownership.

## Folder structure

```text
/
├── index.html
├── css/style.css
├── js/
│   ├── app.js
│   └── prism-bundle.js
├── assets/
├── pages/
│   ├── ai-code-design/        # 5 pages
│   ├── system-design/         # 7 pages
│   ├── management/            # 5 pages
│   ├── values/                # 6 pages
│   └── quick-revision/        # 3 pages
├── RESEARCH-SOURCES.md
└── README.md
```

## Run locally

Use an HTTP origin rather than opening files directly:

```bash
cd atlassian-interview-playbook
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Copy the folder contents to the root of a GitHub repository.
2. Commit and push to the default branch.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch** and select the default branch with `/ (root)`.

No package installation or build workflow is required.

## Customize the interview date

The home countdown is controlled by this element in `index.html`:

```html
<div data-countdown="2026-10-12T09:00:00+05:30">Calculating…</div>
```

Change both the visible text and ISO date-time value.

## Behavioral preparation workflow

1. Read the management overview and choose the story based on the question.
2. Practise the pricing fallback project as the default project deep dive.
3. Learn the short headline and 90-second core for each behavioral story.
4. Use the mock pages to practise interruptions and follow-ups.
5. Add only verified metrics or exact wording in the optional practice-note builder.
6. Download TXT or JSON before leaving the note page if persistent storage is unavailable.

## Add a page

1. Copy the closest page in the appropriate directory.
2. Set `data-page`, `data-title`, title and breadcrumbs.
3. Add it to `NAV` and `SEARCH_INDEX` in `js/app.js`.
4. Use `h2` and `h3`; the table of contents is generated automatically.
5. Reuse interview blocks, answer cards, value cards, prompt cards, callouts, native details and Mermaid diagrams.
6. Update previous/next links and run link validation.

## External resources

Mermaid is loaded from jsDelivr only on pages containing diagrams. PrismJS is bundled locally under its MIT license. Opening external research links follows the provider's normal network behavior.

## Privacy and truth boundary

The site sends no notes to a backend. Theme, review progress and optional note fields use browser storage when available. Do not enter confidential customer names, credentials or proprietary data.

The website itself uses interview-safe abstractions. Keep exact internal identifiers, repository names, branch names, configuration keys and customer-sensitive data out of a public GitHub Pages repository.

Candidate reports are anecdotal and formats can vary by role, level, location and interviewer. Personalized answer drafts never invent missing metrics or interpersonal outcomes.

## Mermaid rendering fix

- Copy controls skip `<pre class="mermaid">`, so Mermaid source is not altered before rendering.
- Mermaid is pinned to version `11.17.2` for reproducible rendering.
