# Reel 3D · "Ayúdame a construir mi club"

Vertical 1080x1920, 30 fps, ~38 s. Composición `Reel-Club-Entrenador` (`src/ReelClub`).
Personaje: entrenador chibi 3D (gorra azul marino, bigote, chándal rojo, silbato).
Mira a cámara y habla en primera persona. El club empieza destrozado, al atardecer,
y cada instalación se reconstruye en pantalla al decir su precio.

| # | Escena | Voz | Imagen / gráfico |
|---|--------|-----|------------------|
| 1 | Gancho | ¡Oye, tú! Sí, tú. ¡Necesito tu ayuda! | Zoom brusco a la cara, saluda y señala al espectador. Título "¡NECESITO TU AYUDA!". Silbato. |
| 2 | La cancha | Estoy fundando mi propio club de fútbol... pero mira esta cancha. Da pena. | Plano de dron: tierra, charcos, portería oxidada. Se gira y señala. Sello rojo "DA PENA". |
| 3 | Reglas | Así que vamos a arreglarla juntos. Cada like es un dólar. ¡Y cada comentario, diez dólares! | Brazos abiertos. Tarjetas "1 LIKE = $1" y "1 COMENTARIO = $10". |
| 4 | Porterías | Porterías nuevas: quinientos dólares. | La portería vieja se hunde y sale una nueva con red. Etiqueta $500. Arranca la barra "META DEL CLUB". |
| 5 | Césped | Césped de verdad: dos mil. | El césped se despliega a franjas y aparecen las líneas. $2.000. |
| 6 | Focos | Focos para jugar de noche: mil quinientos. | Se hace de noche, suben las torres y se encienden con parpadeo. $1.500. |
| 7 | Vestuario | Vestuario con duchas calientes: tres mil. | La caseta se convierte en vestuario con ventanas y vapor. $3.000. |
| 8 | Grada | Y una grada para ti: ¡cinco mil dólares! | La grada sube fila a fila y hay un asiento dorado "para ti". $5.000. Meta: $12.000. |
| 9 | Nombre | Y lo mejor... el comentario con más likes... ¡será el nombre del equipo! | Primer plano. Tarjeta de comentario "Club ???" con los likes subiendo. Golpe: "= NOMBRE DEL EQUIPO". |
| 10 | CTA | ¡Comenta ya! Nos vemos en la cancha. | Estadio iluminado, confeti, afición saltando. "¡COMENTA YA!", "$1 · $10" y flecha "AQUÍ" hacia los botones. |

## Voz
- Provisional: Piper offline (`scripts/voiceover-piper.py`, voz `es-carlfm-x-low`) a partir de `guiones/reel-club-entrenador.json`.
- Recomendada: ElevenLabs "JosePlan" (mexicano, enérgico tipo coach, `U7gtAPRc1sw2h98tq3fp`), modelo `eleven_v4`.
  Hay que guardar los clips como `public/voiceover/club/s01..s10.mp3` y después ejecutar:
  - `python3 scripts/voice-envelope.py public/voiceover/club src/ReelClub/envelope.generated.ts` (sincronía de labios)
  - y actualizar `src/ReelClub/voiceover.generated.ts` con la duración de cada clip en fotogramas.

## Render
```
npx remotion render Reel-Club-Entrenador out/reel-club-entrenador.mp4 --gl=swangle
```
(En la nube usar `--browser-executable` apuntando al Chromium preinstalado.)
