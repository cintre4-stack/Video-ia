# Club Cabezón — Mi nuevo club, Parte 5

¡Ya somos 600 aficionados! → la mascota será un osito (idea de @MATEOPEREZO7) → empezó la copa →
cuartos de final contra el FC Lombrises (rosa y verde) → nuestro once con sus nombres → nos meten cinco
goles, contados uno a uno → 0-5 → hay que meter 6 en la vuelta, en su estadio → ¿lo lograremos?

Mismo motor que las partes 3 y 4 (`scene3d/` three.js + `render.py` PIL + `mix.py`).
Los 5 goles caen en `marks.goals` (segundos absolutos); si no están en el timeline se reparten en la frase s06.

1. Voz → `vo/`:
   - Provisional (Piper): `python3 make_vo.py piper <es-carlfm-x-low.onnx> guion.json vo/`
   - Toma de ElevenLabs: tiempos de cada frase (+ `marks.goals` con el instante de "uno, dos, tres, cuatro, cinco")
     en `voz/timeline.json`, luego `python3 make_vo.py manual voz/<toma>.mp3 voz/timeline.json vo/`
2. `python3 render.py vo/ x --fonts fonts/ --export3d scene3d`
3. `node scene3d/render3d.js scene3d <three@0.170 build/three.module.js> f3d/ <frames> --workers 4`
4. `python3 render.py vo/ video.mp4 --fonts fonts/ --bg3d f3d/`
5. `python3 mix.py vo/ ../../public/sfx video.mp4 reel-club-parte5.mp4`

## Texto para ElevenLabs (eleven_v4, Marcos The Agent `eEyWolF7iBpMA65GbtAm`), ~24 s

```
[excited] ¡Ya somos SEISCIENTOS aficionados!

[mysterious] Y la mascota será… [excited] ¡un OSITO! [happy] Idea de Mateo.

[serious] Pero ya empezó la COPA…

[tense] En cuartos nos tocó el FC Lombrises.

[proud] Nuestro once titular.

[nervous] Y nos metieron: uno, dos, tres, cuatro… [shouting] ¡CINCO goles!

[sighs, devastated] Cinco a cero.

[determined] Nos quedan SEIS goles en la vuelta… [shouting] ¡en SU estadio!

[playful] ¿Lo lograremos? [excited] ¡Comenta YA!
```

La toma usada está en `voz/marcos-eleven-v4.mp3` y sus tiempos en `voz/timeline.json`.
