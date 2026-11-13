# Fortuity Atlas

A searchable arXiv hep-th bibliography on fortuity, fortuitous BPS states, supercharge cohomology, and black-hole microstates. This static website is designed for GitHub Pages.

## Explore

Search by title, author, arXiv identifier, topic, or summary. Filter by topic, year, or core/background classification; sort papers; open arXiv and PDF links; copy citations; and download BibTeX or JSON. Filtering runs entirely in the browser, without accounts, analytics, cookies, external fonts, or a backend.

## Publish with GitHub Pages

1. Keep these files at the root of the repository on the `main` branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**, then click **Save**.

GitHub displays the published site URL in the Pages settings once deployment completes. Changes pushed to `main` are republished automatically. This does not automatically discover new papers.

## Preview locally

From this directory, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Because the page fetches `papers.json`, serve it over HTTP rather than opening `index.html` directly with `file://`.

## Update the collection

Edit `papers.json`. Each entry includes an arXiv ID, current title, author names, original submission date, hep-th category, topics, core/background classification, editorial summary, and canonical abstract/PDF links. Update the top-level `updated` date only after reviewing the sources.

## Coverage and sources

The collection is a curated snapshot checked on 13 November 2026. It combines searches for fortuity and fortuitous cohomology with reference chaining and selected foundational work. It aims for broad coverage but is not guaranteed exhaustive. Core/background labels and summaries are editorial. Inclusion does not establish that every candidate state survives quantum corrections or represents a black-hole microstate.

See [SOURCES.md](SOURCES.md) for scope, verification notes, and source links. Linked papers remain subject to their authors' licenses. This website is independent of arXiv.
