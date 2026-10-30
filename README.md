# PC1 CATS — Research Landscape (Axis 1 starter)

A small static GitHub Pages site. It displays only **Axis 1**, organized by **primary work package**, with compact project entries and expandable summaries. No search or filters and no research-progress status field.

## Updating content

All current project data is in `projects.json`. Each entry has:

- `id`: unique slug (e.g. `new-project`)
- `title`: full project title
- `primaryWP`: `1.1`, `1.2`, or `1.3`
- `fundingYear`: year/cohort, or `null` if uncertain
- `fundingType`: `pc1-full`, `support`, or `pc5-full`
- `hybridRelevance`: `strong`, `moderate`, `weak`, or `none`
- `researchFocus`, `collaboration`, `example`, `evaluation`, `myResearch`: short summaries
- `pdfUrl`: https link to original proposal (or empty string if unknown)

The map and count update automatically as new Axis 1 entries are added. The other three axes are deliberately hidden for now.

## Updating the existing GitHub repository

Copy **all seven files** from this folder into your existing local `pc1-cats-research-landscape` repository, replacing files of the same name. Then run:

```bash
git add .
git commit -m "Simplify research landscape to Axis 1"
git push
```

GitHub Pages will publish from the same `main` branch you've already configured. The live address will remain the same.

## Local testing

From the folder containing `index.html`:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 . Opening `index.html` directly from Finder will not load JSON in most browsers.

## A note on scope

Data is preliminary and based on project proposals; evaluation summaries represent planned methods unless findings are explicitly documented. Full funding status and years should be checked before any official publication. The older six projects outside Axis 1 remain in your previous Git history / original ZIP and can be reintroduced later.
