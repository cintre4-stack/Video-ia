# Narración · Reel Leverkusen 2023/24 (“Neverkusen” → campeón invicto)

Voz montada: "Marcos The Agent" (ElevenLabs, eleven_v4), toma única del usuario.
Voz recomendada para el estilo: MARCOS PROFESIONAL (`wfwG5A1z7UhZfYQ68gAv`).
Pegar el bloque entero en una sola toma; los `[pause]` separan las 12 frases.

```
[intense] Durante veintidós años les llamaron... Neverkusen. El equipo que nunca gana nada. [pause] [fast] Rebobinemos. Dos mil dos: se les escapa la Liga, pierden la final de Copa y la final de Champions. Todo en un mes. [pause] [sarcastic] Y arriba, el Bayern. Once ligas seguidas. [pause] Octubre de dos mil veintidós. El Leverkusen, en descenso. Y llega Xabi Alonso. [pause] [building tension] Jornada tras jornada... no pierden. Ni una vez. [pause] [excited] Y cuando van perdiendo, marcan en el descuento. Ocho goles en el añadido. Récord. [pause] Febrero: tres a cero al Bayern. Aviso. [pause] [intense] Catorce de abril de dos mil veinticuatro. Contra el Werder Bremen. Boniface, de penalti. ¡Y Xhaka, golazo! [pause] [shouting, excited] ¡Wirtz! ¡Tres a cero! ¡Wirtz otra vez! ¡La afición invade el campo! ¡Y Wirtz, el quinto! [pause] [shouting, excited] ¡Campeones! Primera Bundesliga en ciento veinte años de historia. [pause] Treinta y cuatro partidos. Cero derrotas. Nadie lo había hecho jamás en Alemania. [pause] [somber] Neverkusen... nunca más. ¿Es la mejor temporada que has visto? Te leo en comentarios.
```

Con el MP3 de una sola toma:

    python3 scripts/split-voiceover.py marcos.mp3 12 public/voiceover/leverkusen src/ReelLeverkusen/voiceover.generated.ts

Corta en los 11 silencios más largos (o en los cortes que se pasen como 5º argumento; para la toma de Marcos The Agent:
`6.23,13.54,17.17,22.83,27.12,32.31,35.48,41.92,47.80,52.06,57.22`) y regenera las duraciones; los goles y sellos
están atados a fracciones de cada frase (`beat()` en timeline.ts), así que se resincroniza solo.

| # | Escena | Beat clave |
|---|---|---|
| 1 | Gancho: NEVERKUSEN → la N cae, entra la L | al acabar la frase |
| 2 | Rebobinado VHS: 2002, tres ✗ | Liga / Copa / Champions |
| 3 | Bayern: 11 platos | conteo 1→11 |
| 4 | Oct 2022, 17º en descenso | “Y llega Xabi Alonso” |
| 5 | Jornada 1→28, derrotas 0 | “Ni una vez” |
| 6 | Gol en el añadido, sello RÉCORD | “descuento” |
| 7 | 3-0 al Bayern (10 feb 2024), sello AVISO | “Aviso” |
| 8 | 14 abr 2024 vs Bremen: Boniface 25' (pen.), Xhaka 60' | “de penalti”, “golazo” |
| 9 | Wirtz 68', 83', invasión, 90' | cada “¡Wirtz!” |
| 10 | ¡CAMPEONES! 1ª Bundesliga en 120 años | pitido final |
| 11 | 34 PJ · 28 V · 6 E · 0 D · 90 pts | “Cero derrotas” |
| 12 | CTA: NEVERKUSEN → NUNCA MÁS (cierra el loop) | pregunta |

Fuentes: bundesliga.com (crónica J29 y récord de invicto), bayer04.de, Al Jazeera (estadísticas).
