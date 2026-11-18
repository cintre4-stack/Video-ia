# Mi nuevo club — Parte 2

Drawn from scratch with PIL (no Part 1 footage): the coach, the club scenes,
goal meter $900 / $2.400, "TODAVÍA FALTAN $1.500", the winning comment card
(FC Stuat, by @xd12_1), the 11 starter slots and the third-division match.
The coach's mouth follows the voice loudness.

1. Voice: `guion.json` (Piper offline for now; for ElevenLabs paste the text below).
2. 3D layer (three.js 0.170 in headless Chromium, the low-poly pitch + the coach):
   `python3 render.py vo/ x --fonts fonts/ --export3d scene3d` (writes scenes.json + env.json)
   `node scene3d/render3d.js scene3d <path to three/build/three.module.js> f3d/ <frames> --workers 3`
3. Graphics on top: `python3 render.py vo/ video.mp4 --fonts fonts/ --bg3d f3d/`
   (`--preview` writes a contact sheet; without `--bg3d` it draws a flat 2D version;
   fonts/ holds LilitaOne.ttf converted from public/fonts/LilitaOne.woff2)
4. `python3 mix.py vo/ ../../public/sfx video.mp4 reel-club-parte2.mp4`

`vo/` holds `voice.wav` and `timeline.json` (start/end of each line in seconds).

## Text for ElevenLabs (eleven_v3)

[excited] ¡Lo logramos! ¡Juntamos novecientos dólares para el club!
[happy] Ya tenemos porterías nuevas, cancha de verdad... ¡y luces para jugar de noche!
[pause] [serious] Pero ojo. Todavía nos faltan mil quinientos dólares.
[fast] Así que no paren. Cada like es un dólar. ¡Y cada comentario, diez!
[excited] Y el nombre del equipo ya está decidido. ¡FC Stuat! Idea de xd12_1.
[building tension] Y lo más importante. Los primeros once comentarios serán el once titular,
para jugar contra un equipo de tercera división. [shouting, excited] ¡Si ganamos, subimos!
¡Comenta ya! Nos vemos en la cancha.
