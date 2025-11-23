<template>
  <div :class="['map-container', { 'map-compact': compact }]">
    <div class="instructions">
      ℹ️ Dê <b>dois cliques</b> em uma zona para selecioná-la antes de aplicar o filtro.
      <span class="vias-legend">| Linhas coloridas = Principais vias</span>
    </div>
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'
import type { GeoJsonFeature } from '@/modules/home/types/homeTypes'

interface Props {
  compact?: boolean
  regionNameToLevelMap: Map<string, number>
  selectedZones: string[]
  filteredZones: string[]
  isAgent: boolean
}

interface Emits {
  (event: 'zoneToggle', region: string, layer: L.Layer): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON | null>(null)
const viasLayer = ref<L.LayerGroup | null>(null)
const activeAnimations = new Map<string, number>()

const levelColorMap: Record<number, string> = {
  1: '#10b981',
  2: '#7af957',
  3: '#edef56',
  4: '#f59e0b',
  5: '#ef4444',
}

// Definição das principais vias por zona
const viasPrincipais = {
  'SUL': {
    color: '#FF6B6B',
    vias: [
      { name: 'Avenida Cidade Jardim', coords: [
        [-23.2677246345782,-45.88674902426166],
        [-23.24950375554043,-45.885611195458836],
        [ -23.247712454291985,-45.884677577492624],
        [ -23.24602519439648,-45.88346647326625],
        [ -23.24233807201489,-45.88190896502056],
        [ -23.235604595723146,-45.88047165563549],
        [-23.229349053371394,-45.88024568938263],
        [ -23.225831507415933,-45.880505723533815],
        [-23.221955776591642,-45.88319234160454],
        [ -23.213522594114608,-45.89247703437792,]] },
      { name: 'Avenida Andromeda', coords:[
        [-23.24707350209917,-45.88540593771759],
        [-23.228676973140608,-45.88427383120799],
        [-23.22728992214786,-45.88449001953563],
        [-23.22569443667153,-45.88524798755185],
        [-23.216330217023526,-45.895320732435295]] },
     { name: 'Rua Bacabal', coords: [
      [-23.227071541927984,-45.90112380167565],
      [-23.2304513416896,-45.90116017586101],
      [-23.24226016313213,-45.906694004309]] }
    ]
  },
  'NORTE': {
    color: '#FF6B6B',
    vias: [
      { name: 'Via Norte', coords: [
        [-23.175133078404883,-45.89079454289535],
        [ -23.175348427510613,-45.89110688831613],
        [ -23.175719465836792,-45.89227626063084],
        [-23.17551337348074,-45.89399088652752],
        [ -23.174487981235572,-45.895065393603375],
        [-23.172283524015285,-45.89515229812886],
        [-23.17065781599308,-45.895091545326466],
        [ -23.169235677721858,-45.894862141354906],
        [-23.168444288188567,-45.89500167971789],
        [ -23.167096729588877,-45.89576480412762],
        [ -23.16589451023782,-45.897492940225845],
        [ -23.164756148843097,-45.89970328336241],
        [ -23.163636068625536,-45.901793570097254]] },
      { name: 'Rodovia Monteiro Lobato (SP-50)', coords: [
          [-23.13602640715463,-45.90830175922474],
          [-23.13760950965853,-45.90774924038669],
          [-23.138383556625982,-45.90704152389384],
          [-23.138918615944903,-45.906378602787186],
          [-23.140156362119015,-45.90629253011073],
          [-23.140891212274056,-45.90591390311181],
          [-23.142584015680285,-45.90532050680838],
          [-23.14387324818044,-45.904572855387045],
          [-23.145051658251248,-45.90451909053277],
          [-23.147789217896033,-45.9045975400862]] },
      { name: 'Via Jaguari', coords: [
        [-23.13602640715463,-45.90830175922474],
        [ -23.13760950965853,-45.90774924038669 ],
        [ -23.138383556625982,-45.90704152389384],
        [ -23.138918615944903,-45.906378602787186],
        [ -23.140156362119015,-45.90629253011073],
        [ -23.140891212274056,-45.90591390311181],
        [-23.142584015680285,-45.90532050680838],
        [ -23.14387324818044,-45.904572855387045],
        [ -23.145051658251248,-45.90451909053277],
        [ -23.147789217896033,-45.9045975400862]] }
]
  },
  'LESTE': {
    color: '#FF6B6B',
    vias: [
      { name: 'Avenida Juscelino Kubitschek (JK)', coords: [
          [-23.177528555949024,-45.83776297886911],
          [ -23.177634446677942,-45.84017271288667],
          [ -23.178880041426027,-45.841945871357865],
          [ -23.179956471993222,-45.84365211818795],
          [ -23.180709968155796,-45.846311855831715],
          [ -23.180132702225777,-45.85211518845449],
          [ -23.180647268924304,-45.85335719909992],
          [ -23.18364100355342,-45.858620894291846],
          [ -23.184808779271236,-45.86252458821642],
          [ -23.184280160910347,-45.86396527628915],
          [ -23.182820705742756,-45.86526170458441],
          [ -23.181134326022743,-45.866332175236266],
          [-23.18076202364462,-45.86684938590548],
          [ -23.180737927561992,-45.86848328347088],
          [-23.18113952837564,-45.8698288461712],
          [ -23.182223844552595,-45.870728800445306],
          [-23.18328405631702,-45.871200621132715],
          [ -23.18435754979255,-45.87112570314562],
          [ -23.185140417959417,-45.87101599901172],
          [ -23.18673122191113,-45.87209071082498],
          [-23.18833168019806,-45.87343586999606]] },
      { name: 'Avenida Pedro Álvares Cabral', coords: [
          [-23.188474268561237, -45.878758110900264],
          [-23.18858139946896, -45.878492644592484],
          [-23.188636830995137, -45.876805933196295],
          [-23.188626415498092, -45.87635107933849],
          [-23.188569874301663, -45.87564048200332],
          [-23.188490380542106, -45.87427999958618],
          [-23.188479754399467, -45.87357995576329],
          [-23.188497609555085, -45.87338085603247],
          [-23.18866167726506, -45.873096471850374]] },
      { name: 'Rua José Cobra', coords: [
        [-23.237566124670806,-45.90941407931018],
        [ -23.23778691991268,-45.90965436768329],
        [ -23.253356402469564,-45.91892276035196],
        [ -23.253646618258074,-45.919654033206285]] }
    ]
  },
  'OESTE': {
    color: '#FF6B6B',
    vias: [
      { name: 'Avenida Lineu de Moura', coords:[
        [-23.1955340075112, -45.931599701822165],
        [-23.196007616448526, -45.929586222842374],
        [-23.195490289670843, -45.9285160668081],
        [-23.194244325414175, -45.92787397318702],
        [-23.19225997963747, -45.92408163712952],
        [-23.192369276834057, -45.92283708529598],
        [-23.194963233585725, -45.91974552531232],
        [-23.198725190805405, -45.9149750034947],
        [-23.19840460068137, -45.91315177469468]] },
      { name: 'Avenida Cassiano Ricardo', coords: [
        [-23.211898025736545, -45.909885803980075],
        [-23.21240237003117, -45.909801378454745],
        [-23.21280756834129, -45.9097263335419],
        [-23.2312337015924, -45.9130163447505]] },
      { name: 'Benedito Matarazzo', coords: [
        [-23.193763273299822, -45.869524978879895],
        [-23.19446640541996, -45.87107554451103],
        [-23.194832372642907, -45.87164642251767],
        [-23.19526806014467, -45.87261515254781],
        [-23.19726815489406, -45.87605322977697],
        [-23.19902085184232, -45.87838525453478],
        [-23.208385900542083, -45.88849810969833],
        [-23.21026751572282, -45.89053937029493]] }
    ]
  },
  'CENTRO': {
    color: '#FF6B6B',
    vias: [
      { name: 'Avenida Anchieta', coords: [
        [-23.19266048385333, -45.893615434524406],
        [-23.19279397000082, -45.90364624179912],
        [-23.193284206192573, -45.9044958075269],
        [-23.19490190966654, -45.90671686597611],
        [-23.195620545756242, -45.908230929867045]] },
      { name: 'Avenida Nove de Julho', coords: [
        [-23.192556406029922, -45.89299354631953],
        [-23.193918713280013, -45.89324632815649],
        [-23.194840813412824, -45.89345996273403],
        [-23.196846821409977, -45.89428357211361],
        [-23.197192795214775, -45.89438916957715],
        [-23.20344807164888, -45.896925515159154]] },
      { name: 'Avenida Nelson D\'avila', coords: [
        [-23.185988369741793, -45.88644025798067],
        [-23.192630964517292, -45.88529255179688],
        [-23.193085695274945, -45.885261421898065],
        [-23.19678469288327, -45.886045225353485]] }
    ]
  },
  'SUDESTE': {
    color: '#FF6B6B',
    vias: [
      { name: 'Via Cambuí', coords: [
       [-23.251345147006916, -45.84229321869543],
        [-23.24742483808535, -45.84208762033444],
        [-23.246655945481095, -45.842460510840425],
        [-23.244346641967, -45.84517576660107],
        [-23.241855279408867, -45.84555536198425],
        [-23.240451853059923, -45.84586204749206],
        [-23.239375438162483, -45.84593016543934],
        [-23.23420613827436, -45.845346699581086],
        [-23.232018910358377, -45.844887338477946],
        [-23.23077450985126, -45.84474942172528],
        [-23.228502441486583, -45.84493240196463],
        [-23.22761389805713, -45.844750291527475],
        [-23.226417552945264, -45.84365180768813],
        [-23.224009399066205, -45.84095261972857],
        [-23.223092933203162, -45.840458319969315],
        [-23.22260788723844, -45.84030918367674],
        [-23.221850799248614, -45.84027016001235],
        [-23.219219240108302, -45.84008592651071],
        [-23.21762532521879, -45.83963498637945],
        [-23.216949626795426, -45.83929410662259],
        [-23.2155907924587, -45.839059964631275],
        [-23.21432007707952, -45.839030782867354],
        [-23.213243218150836, -45.83946579837169],
        [-23.212215099230463, -45.840389358449215],
        [-23.21069117251247, -45.84285057235218],
        [-23.20965904890518, -45.84379581224269],
        [-23.208007656257735, -45.84476531101626],
        [-23.203075211091928, -45.84694998978006],
        [-23.202329968207593, -45.84740960183751],
        [-23.20176405907047, -45.84809901992273],
        [-23.201322768019878, -45.84903875533615],
        [-23.200716770459564, -45.85074609105342],
        [-23.199761514786047, -45.85214029039321],
        [-23.199087989971147, -45.85224001746727],
        [-23.19907256554022, -45.85263087677819],
        [-23.19724951616486, -45.85345449588195],
        [-23.195279904004806, -45.854386523608184],
        [-23.1896237117016, -45.85621627387101],
        [-23.18809830456125, -45.85827804308107],
        [-23.187919632195246, -45.859825618894774],
        [-23.1878271825949, -45.861853863401876],
        [-23.185241432455484, -45.86287588072173]] },
      { name: 'João Rodolfo Castelli', coords: [
        [-23.244073034968807, -45.838481444661824],
        [-23.24400402896252, -45.83735491687503],
        [-23.24437441210597, -45.83464519320262],
        [-23.246020684082325, -45.83007470888205],
        [-23.249128176777717, -45.82592167624804],
        [-23.249059026964005, -45.82488694201484],
        [-23.249029454071533, -45.823299074278],
        [-23.249522334760712, -45.82085289965633],
        [-23.250241934750633, -45.81905045798615],
        [-23.250665808400143, -45.818170693428954],
        [-23.251552981443183, -45.81729092887235],
        [-23.255404666086932, -45.81505533658148],
        [-23.25619323661232, -45.814068283663744],
        [-23.25633581747786, -45.81355176472994],
        [-23.25713423952955, -45.81302605176285],
        [-23.257420093175924, -45.81209264302538],
        [-23.2575019722249, -45.8099260385396],
        [-23.25703869215404, -45.80873513773699],
        [-23.25579600116461, -45.80624182987023],
        [-23.2553130020286, -45.80344159500174],
        [-23.254415996769396, -45.80029804603657],
        [-23.254415996744584, -45.79951484099141],
        [-23.255214430292312, -45.79894621268019],
        [-23.255924144989166, -45.79925734892623]] },
      { name: 'Rodovia dos Tamoios (SP-099)', coords:[
          [ -23.227629433198317,-45.872275713383004],
          [ -23.22953646595967,-45.87065917551624],
          [ -23.231663128221243,-45.86916099628587],
          [-23.238694870063455,-45.86779370087109],
          [ -23.239674066502744,-45.8678146990552],
          [-23.2437317762964,-45.86710836482686],
          [-23.245048575376615,-45.866793391971754],
          [ -23.245617733144385,-45.865832731222696],
          [ -23.24676087290338,-45.86289298547649],
          [-23.247499737408532,-45.861753349077475],
          [ -23.24769749367468,-45.86174809953113],
          [  -23.247769843423526,-45.861118153948894],
          [-23.248815485076577,-45.857183160869226],
          [-23.25427855068625,-45.84030325063574],
          [ -23.26798395234914,-45.819473889044815],
          [ -23.271987769231515,-45.81425769695218],
          [-23.277243656275672,-45.810835016656455],
          [-23.281185407621678,-45.80521592102036],
          [-23.286159033954405,-45.80199808709767]] }
    ]
  }
}

function getLevelColor(zoneName: string): string {
  const level = props.regionNameToLevelMap.get(zoneName)
  if (!level) return '#3388ff'

  return levelColorMap[level] || '#3388ff'
}

function initializeMap(): void {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map.value as L.Map)

  // Inicializa a camada de vias
  viasLayer.value = L.layerGroup().addTo(map.value as L.Map)
}

function createLegend(): void {
  if (!map.value) return

  const legend = new L.Control({ position: 'bottomright' })
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend')
    L.DomEvent.disableClickPropagation(div)

    const levels = [
      { level: 1, color: levelColorMap[1], label: 'Nível 1' },
      { level: 2, color: levelColorMap[2], label: 'Nível 2' },
      { level: 3, color: levelColorMap[3], label: 'Nível 3' },
      { level: 4, color: levelColorMap[4], label: 'Nível 4' },
      { level: 5, color: levelColorMap[5], label: 'Nível 5' },
    ]

    div.innerHTML = '<h4 style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Níveis de Alerta</h4>'
    levels.forEach((item) => {
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 20px; height: 20px; background-color: ${item.color}; margin-right: 10px; border: 1px solid #333; border-radius: 3px;"></div>
          <span style="font-size: 12px;">${item.label}</span>
        </div>
      `
    })

    return div
  }
  legend.addTo(map.value as L.Map)
}

function drawVias(): void {
  if (!viasLayer.value || !map.value) return

  viasLayer.value.clearLayers()

  // Determina quais vias devem ser exibidas
  const viasToShow = props.filteredZones.length > 0
    ? Object.entries(viasPrincipais).filter(([zona]) => {
        return props.filteredZones.includes(zona)
      })
    : Object.entries(viasPrincipais)

  viasToShow.forEach(([zona, data]) => {
    data.vias.forEach(via => {
      const polyline = L.polyline(via.coords as L.LatLngExpression[], {
        color: data.color,
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1
      })

      polyline.bindTooltip(via.name, {
        permanent: false,
        direction: 'center',
        className: 'via-tooltip'
      })

      polyline.bindPopup(`
        <b>${via.name}</b><br>
        <span style="color: ${data.color};">● Zona ${zona}</span>
      `)

      polyline.addTo(viasLayer.value as L.LayerGroup)
    })
  })
}

function drawMap(features: GeoJsonFeature[]): void {
  if (!map.value) return

  if (geoJsonLayer.value) {
    map.value.removeLayer(geoJsonLayer.value as unknown as L.Layer)
  }

  geoJsonLayer.value = L.geoJSON(features as GeoJSON.GeoJsonObject[], {
    style: (feature) => {
      const props = feature?.properties || {}
      const region = props.regiao
      const selected = props.selectedZones?.includes(region)
      const filtered = props.filteredZones?.includes(region)

      let borderColor = '#333'
      let fillColor = props.layer === 'zona' ? getLevelColor(region) : props.color || '#3388ff'

      if (selected) {
        borderColor = '#0044ff'
        fillColor = '#3399ff'
      } else if (filtered) {
        borderColor = '#008000'
        fillColor = '#33cc33'
      }

      return {
        color: borderColor,
        weight: selected || filtered ? 3 : 1,
        fillColor: fillColor,
        fillOpacity: props.layer === 'municipio' ? 0.2 : 0.6,
      }
    },
    onEachFeature: (feature, layer) => {
      const propsData = feature?.properties || {}

      if (propsData.layer === 'zona') {
        layer.bindTooltip(`Zona ${propsData.regiao}`, { sticky: true })

        // Adiciona popup com informações da zona
        layer.bindPopup(`
          <b>Zona ${propsData.regiao}</b><br>
          Domicílios (origem): ${propsData.domiciliosOrigem || 'N/D'}<br>
          Pessoas (origem): ${propsData.pessoasOrigem || 'N/D'}<br>
          Moradores/domicílio (origem): ${propsData.moradoresOrigem || 'N/D'}<br>
          Domicílios (est. 2025): ${propsData.domiciliosEst || 'N/D'}<br>
          Pessoas (est. 2025): ${propsData.pessoasEst || 'N/D'}<br>
          Moradores/dom. (est. 2025): ${propsData.moradoresEst || 'N/D'}
        `)

        layer.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          emit('zoneToggle', propsData.regiao, layer)
        })
      } else if (propsData.layer === 'municipio') {
        layer.bindPopup(`<b>${propsData.name}</b><br>${propsData.description || ''}`)
      }
    },
  }).addTo(map.value as L.Map)

  // Desenha as vias após desenhar o mapa
  drawVias()
}

function updateMap() {
  const featuresWithState = sjcGeojson.features.map((feature: GeoJsonFeature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      selectedZones: props.selectedZones,
      filteredZones: props.filteredZones,
    },
  }))

  drawMap(featuresWithState as GeoJsonFeature[])
}

watch(
  () => [props.selectedZones, props.filteredZones, props.regionNameToLevelMap],
  () => {
    updateMap()
  },
  { deep: true },
)

onMounted(() => {
  initializeMap()
  createLegend()
  drawMap(sjcGeojson.features as GeoJsonFeature[])
})

onUnmounted(() => {
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()

  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

defineExpose({
  updateMap,
})
</script>

<style lang="scss" scoped>
.map-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  &.map-compact {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .instructions {
    background: #e0f2fe;
    color: #0369a1;
    text-align: center;
    font-size: 0.9rem;
    padding: 0.5rem;
    border-bottom: 1px solid #b3e0ff;
    flex-shrink: 0;

    .vias-legend {
      margin-left: 1rem;
      font-weight: 500;
    }
  }

  .map {
    flex: 1;
    width: 100%;
    height: 100%;
  }
}

:deep(.leaflet-interactive) {
  outline: none !important;
  cursor: pointer;
}

:deep(.via-tooltip) {
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.85rem;
  padding: 0.3rem 0.6rem;
  font-weight: 500;
}

:deep(.legend) {
  background: white;
  padding: 12px 16px;
  border-radius: 5px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  font-family: Arial, sans-serif;
}

:deep(.legend h4) {
  margin: 0 0 10px 0 !important;
  font-weight: bold;
  font-size: 14px !important;
}

:deep(.legend div) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

:deep(.legend span) {
  font-size: 12px !important;
}

:deep(.leaflet-container) {
  background: #f5f5f5;
}
</style>
