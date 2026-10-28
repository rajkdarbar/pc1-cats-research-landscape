# PC1 CATS — Simple Research Landscape (Document A)

This is an editable, lightweight website for **GitHub Pages**. It is intended as a preliminary mapping of projects — not a review claiming validated patterns.

## Site structure

1. **Four PC1 research axes**, expandable/collapsible.
2. **Primary work packages** within each axis (each project belongs to exactly one primary WP).
3. **Project cards** showing full title, funding year and category, one-sentence research focus, a project example (or collaboration description), and color-coded relevance to the author's Hybrid MR research.
4. **Read short summary** opens the full five-field research brief; **Original PDF** links to the source.
5. **Connections worth investigating** lists a few working hypotheses inferred from proposals, not confirmed research findings.

There are **no search boxes, filters, databases, or proposed/ongoing/completed statuses**.

## How to publish on GitHub

1. Create a public repository at https://github.com/new, e.g. `pc1-cats-landscape`.
2. Upload the files INSIDE this ZIP directly into the **repository root** (`index.html`, `projects.json`, `app.js`, `style.css`, `favicon.svg`, `.nojekyll`, `README.md`).
3. Open **Settings → Pages → Deploy from a branch** and choose `main` / `(root)`.
4. Your website URL will be `https://YOUR-USERNAME.github.io/pc1-cats-landscape/`. Share that with Christian.

## How to add a project — edit ONLY projects.json

Each project is one object in the JSON array. Copy an existing object, insert a comma between objects, and update the fields. A template:

```json
{
  "id": "my-new-project",
  "title": "Full project title",
  "primaryWP": "1.3",
  "fundingYear": 2024,
  "fundingType": "support",
  "hybridRelevance": "moderate",
  "researchFocus": "Brief research problem and solution approach.",
  "collaboration": "Who works together on what joint goal.",
  "example": "Optional concrete example; omit or set to empty string if not in the proposal.",
  "evaluation": "Proposed evaluation measures, not confirmed outcomes.",
  "myResearch": "How this relates to my Hybrid MR collaboration concept.",
  "pdfUrl": "https://..."
}
```

- `primaryWP` must be a **single** primary work package code (`1.1`, `1.3`, `2.2`, etc.).
- `fundingType`: `pc1-full`, `support`, or `pc5-full`.
- `hybridRelevance`: `strong` (orange), `moderate` (blue), `weak` (sand), `none` (grey), or `potential` (teal if you later add a color). These are *your analytical assessments*, not official PEPR statuses.
- `example` and `pdfUrl` can be empty; don't invent information absent from the source.
- No project progress/status field is needed.
- The "Connections worth investigating" section contains hand-curated **hypotheses**, not results; edit the three short text paragraphs in `index.html` if your understanding changes.

## Local preview

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ in your browser. Opening `index.html` directly without a server may prevent the browser from loading `projects.json`.

## Files

- `projects.json` — all project content (main file to edit)
- `index.html` — overall site structure and early observations
- `style.css` — color palette, cards and typography
- `app.js` — automatically builds the axis/work-package hierarchy and project cards
- `.nojekyll`, `favicon.svg`, `README.md` — supporting files
