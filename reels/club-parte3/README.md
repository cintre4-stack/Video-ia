# Mi nuevo club — Parte 3

Continuación de la Parte 2, en el mismo estilo 3D (three.js low-poly + gráficos PIL encima):
los 11 afortunados (sin nombres), meta de $2.400 completada, vestidores y gradas nuevas,
el partido contra el equipo de tercera división (nos dominan, el portero lo para todo,
contragolpe en el último minuto, 1-0) y la nueva meta: $10.000 para segunda división
(1 like = $1, 1 comentario = $10).

1. Voz → `vo/voice.wav` + `vo/timeline.json`:
   - Piper offline: `python3 make_vo.py piper <es-carlfm-x-low.onnx> guion.json vo/`
   - Toma de ElevenLabs (texto abajo, una sola toma): `python3 make_vo.py take voz.mp3 guion.json vo/`
     (corta en los 11 silencios más largos; todo lo demás se re-sincroniza solo)
2. `python3 render.py vo/ x --fonts fonts/ --export3d scene3d`
3. `node scene3d/render3d.js scene3d <three@0.170 build/three.module.js> f3d/ <frames> --workers 4`
4. `python3 render.py vo/ video.mp4 --fonts fonts/ --bg3d f3d/` (`--preview` = hoja de contacto)
5. `python3 mix.py vo/ ../../public/sfx video.mp4 reel-club-parte3.mp4`

## Texto para ElevenLabs (eleven_v4, voz JosePlan)

Deja una pausa clara entre las 12 frases:

[excited] ¡Ya tenemos a nuestros once titulares!
Los primeros once comentarios fueron los afortunados. ¡Gracias, cracks!
[happy] ¡Y completamos la meta! Dos mil cuatrocientos dólares.
Ya tenemos vestidores,
¡y gradas para la afición!
[serious] Llegó el gran partido, contra el equipo de tercera división.
[tense] Ellos dominaban todo el partido. Tiro, tras tiro, tras tiro.
[building tension] Pero en el último minuto... ¡contragolpe... y gooool!
[shouting, excited] ¡Ganamos uno a cero! ¡Ya somos de tercera división!
[serious] Pero ahora viene lo más difícil. Para llegar a segunda división, necesitamos diez mil dólares.
[fast] Cada like es un dólar. ¡Y cada comentario, diez!
[excited] ¡Comenta ya! Nos vemos en la cancha.
