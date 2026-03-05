# Plan: Portfolio Category Pages

## Context
The picflow portfolio (hava.picflow.com) is private and can't be scraped. However, we already have variant images in the repo that aren't displayed on the site. These map to 4 categories with multiple shoots each.

## Existing Image Inventory

| Post | Caption | Category | Extra images |
|------|---------|----------|-------------|
| post-00 | DJ Nems | concert | +1 (post-00-1) |
| post-01 | Raye — Lowlands | concert | +2 (post-01-1, post-01-2) |
| post-02 | Editorial Portrait | editorial | none |
| post-03 | Behind the Scenes | event | +6 (post-03-1 to post-03-6) |
| post-04 | Summer Dinner | event | +6 (post-04-1 to post-04-6) |
| post-05 | Event Coverage | event | +6 (post-05-1 to post-05-6) |
| post-06 | Artist Portrait | portrait | +3 (post-06-1 to post-06-3) |
| post-07 | Kaya Imani | portrait | +4 (post-07-1 to post-07-4) |
| post-08 | Daelo Stylo | portrait | +2 (post-08-1 to post-08-2) |
| post-09 | Live Performance | concert | +2 (post-09-1 to post-09-2) |
| post-10 | Frenna | concert | +1 (post-10-1) |
| post-11 | Adje | concert | +3 (post-11-1 to post-11-3) |

**Total: 12 main images + 36 variants = 48 photos**

## Plan

### Step 1: Create 4 category pages
Create one HTML page per category, matching the site's existing dark design:
- `portfolio/concerts.html` — 5 shoots, 14 photos total
- `portfolio/portraits.html` — 3 shoots, 12 photos total
- `portfolio/editorial.html` — 1 shoot, 1 photo total
- `portfolio/events.html` — 3 shoots, 21 photos total

### Step 2: Category page layout
Each category page will have:
- **Same header/nav** as index0.html (with back-to-home navigation)
- **Hero banner** with category title + subtitle
- **Shoot sections** — each shoot gets its own section with:
  - Shoot title (e.g. "Raye — Lowlands")
  - Masonry/grid gallery showing the main image + all variants
- **Lightbox** — clicking a photo opens it in a full-screen lightbox overlay with prev/next navigation
- **Same footer** as index0.html
- Link to picflow portfolio: "View full portfolio on Picflow"

### Step 3: Update main page (index0.html)
- Make portfolio grid items **clickable** — clicking a photo navigates to its category page (anchored to the specific shoot)
- Make category filter buttons link to category pages (or keep inline filter + add "View All →" links)
- Add a "View Full Portfolio" button linking to hava.picflow.com below the grid
- Update nav to include a "Portfolio" dropdown or keep single link

### Step 4: Shared styles
- Add portfolio page styles to `style.css` (or a new `portfolio.css`)
- Lightbox CSS + JS (vanilla, no dependencies)
- Responsive: same breakpoints as main site

### Step 5: Also implement the client's other feedback
- Hero text: grey → white, slightly bolder
- "View Work" button: more prominent (stronger border or filled style)

## File changes summary
- **New files:** `portfolio/concerts.html`, `portfolio/portraits.html`, `portfolio/editorial.html`, `portfolio/events.html`
- **New directory:** `portfolio/`
- **Modified:** `index0.html` (portfolio links, hero text, button styling)
- **Modified:** `style.css` (category page styles, lightbox, hero text fix, button fix)
- **Modified:** `script.js` (lightbox functionality)
