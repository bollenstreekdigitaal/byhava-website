# byHAVA Photography

Portfolio website for **Amber Havenaar** — concert, festival & event photographer based in the Netherlands.

## Live

Hosted on GitHub Pages: [bollenstreekdigitaal.github.io/byhava-website](https://bollenstreekdigitaal.github.io/byhava-website/)

## Features

- Dark & light theme with toggle (preference saved in localStorage)
- Bilingual: English + Dutch (`/nl/`)
- Portfolio grid with category filters and lightbox slideshow
- Contact form via [Formbridge](https://forms.bollenstreekdigitaal.nl) (AJAX, no page reload)
- Service cards pre-select project type in the contact form
- WhatsApp floating button
- Fully responsive, no frameworks, no build step
- Privacy policy (EN + NL)
- SEO: Open Graph, structured data, sitemap, robots.txt

## Tech Stack

- HTML, CSS, vanilla JavaScript
- Google Fonts (Inter)
- GitHub Pages (deploy from branch)
- Formbridge for form processing

## Structure

```
├── index.html          # EN main page
├── index0.html         # EN variant (video hero)
├── privacy.html        # EN privacy policy
├── style.css           # Shared styles
├── script.js           # Shared JS
├── robots.txt
├── sitemap.xml
├── nl/
│   ├── index.html      # NL main page
│   └── privacy.html    # NL privacy policy
└── images/
    ├── favicon.ico
    ├── apple-touch-icon.png
    ├── social-preview.png
    ├── logo.png
    ├── hero-logo.png
    ├── hero-bg.mp4
    ├── self_portrait.jpg
    └── post-*.jpg      # Portfolio images
```

## Contact

info@byhava.nl
