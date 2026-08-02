import { AppText, Card, PageScroll, Pill } from '@/components/ui';

export default function InformationScreen() {
  return (
    <PageScroll>
      <AppText variant="title">Información</AppText>
      <Card>
        <AppText variant="heading">Fuentes y licencias</AppText>
        <AppText>
          Las entradas se consultan mediante la API oficial de Wiktionary en inglés y se validan
          antes de mostrarse. El texto reutilizado se atribuye bajo CC BY-SA 4.0 con enlace y
          revisión de origen.
        </AppText>
        <AppText>
          Las traducciones al español y los ejemplos marcados como pedagógicos son contenido
          editorial propio. Den Danske Ordbog se usa solo como referencia funcional: no se copia ni
          se extrae su contenido.
        </AppText>
      </Card>
      <Card>
        <AppText variant="heading">Privacidad y conexión</AppText>
        <AppText>
          No hay cuentas, anuncios ni analítica. La palabra buscada se envía a Wiktionary.
          Historial, favoritos y caché se guardan únicamente en SQLite dentro del dispositivo.
        </AppText>
      </Card>
      <Card>
        <AppText variant="heading">Género: en / et</AppText>
        <Pill>en · género común</Pill>
        <Pill>et · género neutro</Pill>
        <AppText>
          El artículo forma parte de la información que conviene aprender con cada sustantivo: en
          dag, et hus.
        </AppText>
      </Card>
      <Card>
        <AppText variant="heading">IPA y stød</AppText>
        <AppText>
          /…/ representa una transcripción fonémica; […] una transcripción fonética más concreta. El
          signo ˈ marca el acento principal y ː la longitud. El stød es un rasgo laríngeo
          característico del danés y suele marcarse con ˀ en estas transcripciones.
        </AppText>
        <AppText>
          La aplicación nunca construye IPA de frases concatenando palabras ni copia la del lema a
          una forma flexionada.
        </AppText>
      </Card>
      <Card>
        <AppText variant="heading">Audio humano y TTS</AppText>
        <AppText>
          Una grabación solo se mostrará como humana cuando la fuente y su licencia lo acrediten.
          Actualmente el botón de audio usa el motor TTS danés del dispositivo y siempre aparece
          identificado como “voz sintética”.
        </AppText>
      </Card>
    </PageScroll>
  );
}
