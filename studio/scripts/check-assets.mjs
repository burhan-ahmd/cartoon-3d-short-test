import fs from "node:fs";
const moon = ["market-stall-94937d", "flower-bicycle-284d0e", "hot-air-balloon-a2a511", "flower-seller-s-hand-d617f9", "cobblestone-street-tile-c1dca2", "lamp-post-c9e409", "street-oil-lamp-d246ea", "oak-tree-50ee7c"];
const monsoon = ["market-stall-94937d", "flower-bicycle-284d0e", "cobblestone-street-tile-c1dca2", "lamp-post-c9e409", "street-oil-lamp-d246ea", "oak-tree-50ee7c", "shovel-997c4d", "drain-grate-tile-5568d9"];
const missing = moon.map(id => `public/moonmarket/models/${id}.glb`).concat(monsoon.map(id => `public/monsoon/models/${id}.glb`), ["public/audio/moonmarket.wav", "public/audio/monsoon-voice.wav", "public/fonts/LilitaOne-Regular.ttf"]).filter(p => !fs.existsSync(p));
if (missing.length) { console.error("Missing assets:\n" + missing.join("\n")); process.exit(1); }
console.log(`Moon Market + Monsoon City assets ok: ${moon.length + monsoon.length} Polyfork model references, audio and Lilita One font`);
