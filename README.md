# PC1 CATS Research Landscape

Static research-landscape website for GitHub Pages. This version intentionally maps **Axis 1 only**. The existing design, project cards, research-summary drawer, and automatic counts are preserved.

## Content updates

Edit **`projects.json`** to add or update projects. Each project uses:

| Field | Meaning |
|---|---|
| `id` | Unique URL-friendly identifier |
| `title` | Full project title |
| `primaryWP` | For this starter: `1.1`, `1.2` or `1.3` |
| `fundingYear` | Funding cohort (numeric year), or `null` if unknown |
| `fundingType` | `pc1-full` or `support` |
| `hybridRelevance` | `strong`, `moderate`, `weak` or `none` |
| `researchFocus` | Short research description |
| `collaboration` | Collaborative interaction/task scenario |
| `evaluation` | Proposal's evaluation plans (do not present planned work as findings) |
| `myResearch` | Relationship to proposed Hybrid Events in Mixed Reality research |
| `pdfUrl` | Original proposal's HTTPS URL; empty if unavailable |
| `example` | Optional working note; currently stored but not displayed |

Each project's primary work package controls its location. **Project cards are sorted by funding year** (then alphabetically for ties). The total and funding-category counts are computed from the data on every load. The site currently displays only PC1 fully funded and PC1 support-grant projects with WP1.x; adding Axis 2–4 requires extending `app.js` and its axis/work-package configuration.

## Preview locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Do not open `index.html` directly from Finder: browsers commonly block local JSON fetching under `file://`.

## Publish updates

Copy the files into your existing GitHub repository, then run:

```bash
git add index.html style.css app.js projects.json favicon.svg README.md
git commit -m "Clean up research landscape code"
git push
```

No new dependency or build step is needed. GitHub Pages serves `index.html` from the repository root.

## Scope note

This is preliminary mapping from research proposals, **not** an evidence-based synthesis of completed studies. Funding cohort, category, and PDF references should be verified before presenting the map as a definitive project inventory.
