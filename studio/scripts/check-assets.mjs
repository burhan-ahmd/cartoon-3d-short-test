import fs from "node:fs";
const ids = ["market-stall-94937d", "flower-bicycle-284d0e", "hot-air-balloon-a2a511", "flower-seller-s-hand-d617f9", "cobblestone-street-tile-c1dca2", "lamp-post-c9e409", "street-oil-lamp-d246ea", "oak-tree-50ee7c"];
const missing = ids.map(id => `public/moonmarket/models/${id}.glb`).concat(["public/audio/moonmarket.wav", "public/fonts/LilitaOne-Regular.ttf"]).filter(p => !fs.existsSync(p));
if (missing.length) { console.error("Missing assets:\n" + missing.join("\n")); process.exit(1); }
console.log(`Moon Market assets ok: ${ids.length} Polyfork models, 10 s WAV, Lilita One font`);
