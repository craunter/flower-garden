A LITTLE GARDEN — FINAL
========================

This build follows the approved mobile screenshot exactly in one important way:
there are NO programmatically rendered/fake flowers over the background.

The garden image supplies all visible flowers. The five marked flowers are
implemented as invisible touch targets positioned over the real flowers in
garden-mobile.png.

Files:
- index.html
- style.css
- script.js
- assets/garden-desktop.png
- assets/garden-mobile.png

Open index.html through a local server (for example VS Code Live Server).
To reset the five-secret progress:
localStorage.removeItem("aarvikaGardenFound"); location.reload();
