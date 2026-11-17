# Reel 3D · Episodio 2: "Los Papois necesitan jugadores"

Vertical 1080x1920, 30 fps. Composición `Reel-Club-Ep2-Papois` (`src/ReelClub/ep2`).
Mismo entrenador y mismo club que el episodio 1. Atardecer; el club sigue roto salvo la portería,
que se construye en pantalla cuando dice "portería".

| # | Escena | Imagen / gráfico |
|---|--------|------------------|
| 1 | Gancho | Lluvia de monedas 3D, contador $0 → $280, "¡LO LOGRAMOS!". |
| 2 | Portería | Sale la portería nueva con red. "PORTERÍA NUEVA" + sello "PAGADA". Mini meta $280 / $2.400. |
| 3 | Nombre | Comentario ganador de @SoyDamiánblox ("Los Papois", GANADOR) y escudo de LOS PAPOIS girando. |
| 4 | Problema | Plano general de la cancha vacía, se encoge de hombros. Sello "0 JUGADORES". |
| 5 | El once | 11 jugadores fantasma con "?" aparecen en 4-3-3. Plazas 1–11 y "= ONCE TITULAR". |
| 6 | Rival | "PRÓXIMO VIDEO": escudo Los Papois VS escudo "?" de 3ª división, flecha "ASCENSO". |
| 7 | Meta | Panel: $280 / $2.400, portería ✓, césped/focos/vestuario/grada bloqueados, "$1 · $10". |
| 8 | CTA | Confeti, "¡COMENTA YA!", "ENTRA AL ONCE", flecha "AQUÍ". |

## Guion para ElevenLabs (eleven_v4, voz "Marcos The Agent")

```text
[excited] ¡Lo LOGRAMOS! Recaudamos doscientos ochenta dólares…

[laughs] …y solo alcanzó para la PORTERÍA. [proud] ¡Pero mírala qué bonita!

[building excitement] Y el equipo ya tiene nombre… [shouting] ¡LOS PAPOIS! [grateful] Gracias a Soy Damián Blox por el comentario ganador.

[serious] Pero hay un problema… [sighs] no tengo jugadores.

[excited] Así que los primeros ONCE comentarios… [shouting] ¡serán el once titular de Los Papois!

[dramatic] Y en el próximo video… nos enfrentamos a un equipo de TERCERA división. [hyped] ¡Para ascender!

[determined] La meta sigue: dos mil cuatrocientos dólares para el club.

[shouting] ¡Comenta YA y entra al once!
```

## Cambiar la voz provisional por la de ElevenLabs
1. Guardar el audio como `public/voiceover/club-ep2/voz.mp3`.
2. Actualizar en `src/ReelClub/ep2/timeline.ts` los segundos `a`/`end` de cada frase y los `BEATS`.
3. `python3 scripts/voice-envelope.py public/voiceover/club-ep2 src/ReelClub/ep2/envelope.generated.ts`
