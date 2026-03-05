#!/bin/bash
BASE="/home/wijnandb/sites/klanten/byhava-website"
PORTFOLIO_DIR="$BASE/portfolio"
IMG_DIR="$BASE/images/portfolio"

declare -A TITLES=(
  ["21-dinners"]="21 Dinners"
  ["studio"]="Studio"
  ["behind-the-scenes"]="Behind the Scenes"
  ["artist"]="Artist"
  ["club"]="Club"
  ["food"]="Food"
  ["festival"]="Festival"
  ["outdoor"]="Outdoor"
)

for topic in 21-dinners studio behind-the-scenes artist club food festival outdoor; do
  title="${TITLES[$topic]}"
  images=$(ls "$IMG_DIR/$topic/"*.jpg 2>/dev/null | sort)
  count=$(echo "$images" | wc -l)
  
  # Build image grid HTML
  img_html=""
  for img in $images; do
    fname=$(basename "$img")
    img_html="$img_html        <div class=\"gallery-grid__item\">
          <img src=\"../images/portfolio/$topic/$fname\" alt=\"$title — photography by HAVA\" loading=\"lazy\">
        </div>
"
  done

  cat > "$PORTFOLIO_DIR/$topic.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title — HAVA Portfolio</title>
  <meta name="description" content="$title — photography by HAVA. Concert, festival & event photographer based in the Netherlands.">
  <link rel="icon" href="../images/favicon.ico" sizes="any">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <script>(function(){var t=localStorage.getItem('byhava-theme');if(t)document.documentElement.setAttribute('data-theme',t)})()</script>
</head>
<body>

  <!-- Navigation -->
  <nav class="nav" id="nav">
    <a href="../index.html" class="nav__logo">
      <img src="../images/logo.png" alt="HAVA" class="nav__logo-img">
    </a>
    <button class="nav__toggle" id="navToggle" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav__links" id="navLinks">
      <li><a href="../portfolio.html" class="nav__link--active">Portfolio</a></li>
      <li><a href="../index.html#services">Services</a></li>
      <li><a href="../index.html#about">About</a></li>
      <li><a href="../index.html#contact" class="nav__cta">Book Me</a></li>
      <li class="nav__utils">
        <a href="../nl/index.html" class="lang-switch">NL</a>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        </button>
      </li>
    </ul>
  </nav>

  <!-- Gallery -->
  <section class="gallery-page">
    <div class="container">
      <a href="../portfolio.html" class="gallery-page__back">&larr; Back to Portfolio</a>
      <h1 class="gallery-page__title">$title</h1>
      <p class="gallery-page__count">$count Photos</p>

      <div class="gallery-grid">
$img_html      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer__inner">
      <img src="../images/logo.png" alt="HAVA" class="footer__logo-img">
      <span class="footer__copy">&copy; 2026 byHAVA Photography. All rights reserved.</span>
      <a href="../privacy.html" class="footer__link">Privacy</a>
      <span class="footer__credit">Photography by <a href="https://www.instagram.com/amberhavenaar/" target="_blank" rel="noopener">Amber Havenaar</a></span>
    </div>
  </footer>

  <!-- WhatsApp Floating Button -->
  <a href="https://wa.me/31615260755" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Chat on WhatsApp">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>

  <script src="../script.js"></script>
</body>
</html>
EOF

  echo "Created $topic.html ($count images)"
done
