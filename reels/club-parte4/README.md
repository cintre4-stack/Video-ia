# Mi nuevo club — Parte 4

Gancho: "¡Ya tenemos los $10.000!" (segunda división) → pero el estadio está vacío (0 aficionados) →
cada comentario = un aficionado del FC Stuat (las gradas se llenan una a una) → el comentario con más
likes será la mascota del equipo (silueta misteriosa "?") con el nombre del animal.
Mismo motor 3D que la Parte 3 (three.js en Chromium headless + gráficos PIL encima).

1. Voz → `vo/voice.wav` + `vo/timeline.json`:
   - Provisional (Piper): `python3 make_vo.py piper <es-carlfm-x-low.onnx> guion.json vo/`
   - Toma de ElevenLabs (texto abajo): se miden los tiempos de cada frase y se pasan a `voz/timeline.json`
     (ver `reels/club-parte3/voz/timeline.json`), luego `python3 make_vo.py manual voz/<toma>.mp3 voz/timeline.json vo/`
2. `python3 render.py vo/ x --fonts fonts/ --export3d scene3d`
3. `node scene3d/render3d.js scene3d <three@0.170 build/three.module.js> f3d/ <frames> --workers 4`
4. `python3 render.py vo/ video.mp4 --fonts fonts/ --bg3d f3d/` (`--preview` = hoja de contacto)
5. `python3 mix.py vo/ ../../public/sfx video.mp4 reel-club-parte4.mp4`

Las 10 frases del video (`s01`..`s10` en `guion.json`) son las líneas del texto de abajo, en orden.

## Texto para ElevenLabs (eleven_v4, Marcos The Agent `eEyWolF7iBpMA65GbtAm`)

```
[excited] ¡Lo logramos! ¡YA TENEMOS los diez mil dólares! [proud] ¡Estamos en segunda división!

[sighs, worried] Pero hay un problema… nuestro estadio está VACÍO. [serious] No tenemos AFICIÓN.

[urgent] Así que cada COMENTARIO… [excited] será un aficionado del FC Stuat.

[happy] ¡Tú comentas, y te sientas en las gradas!

[building tension] Y ojo… el comentario con MÁS likes… [whispers, mysterious] será la MASCOTA del equipo.

[excited] ¡Con el nombre del animal, obvio!

[fast, clear] Cada comentario, un aficionado. Cada LIKE, cuenta para la mascota.

[friendly, big smile] ¡Comenta YA! [playful] Nos vemos en la cancha.
```
