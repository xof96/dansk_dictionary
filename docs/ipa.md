# IPA, stød y audio

## Reglas del producto

- Mostrar IPA solo cuando una fuente fiable la aporta para la forma actual.
- No copiar la IPA del lema a una forma flexionada.
- No concatenar IPA de palabras para fabricar una frase.
- Conservar cada variante como registro separado con su atribución.
- Distinguir transcripción fonémica `/…/` de fonética `[…]`.
- Si no hay IPA, decir “pronunciación IPA específica no disponible”.

## Lectura básica

- `/…/`: categorías sonoras relevantes del sistema; detalle fonémico.
- `[…]`: realización más concreta; detalle fonético.
- `ˈ`: acento principal antes de la sílaba acentuada.
- `ː`: segmento largo.
- `ˀ`: marca usada por las fuentes actuales para representar stød.

El stød es un rasgo laríngeo del danés. Su realización y análisis pueden variar; la app conserva la notación de la fuente y no intenta convertir sistemas.

## Estado actual

El normalizador reconoce valores IPA delimitados por `/` o `[` dentro de `{{IPA|da|…}}`. Ejemplos de fixtures reales:

- `hus`: `[ˈhuˀs]`, fonética;
- `hedde`: `[ˈheðə]`, fonética;
- `arbejde`: dos variantes fonémicas y una fonética;
- `hedder`: sin IPA en la entrada consultada; la UI no muestra la de `hedde`.

No se extraen todavía de forma estructurada sílaba tónica, stød o dialecto fuera de lo codificado en la propia transcripción. Añadir esos campos exige una fuente que los etiquete explícitamente.

## Audio

El TTS actual usa `expo-speech`, texto danés y locale `da-DK`. Antes de iniciar una voz se detiene la anterior. Los ejemplos ofrecen velocidad normal (`0.95`) y lenta (`0.65`); ambos controles indican “voz sintética”. Un error del motor se muestra y el mismo botón permite reintentar.

Una grabación humana futura necesita:

1. URL estable del archivo;
2. autor o atribución verificable;
3. licencia del medio, no solo de la página;
4. evidencia de que corresponde a la forma exacta;
5. etiqueta de variante/dialecto si la fuente la da;
6. coordinación global para impedir audios simultáneos.
