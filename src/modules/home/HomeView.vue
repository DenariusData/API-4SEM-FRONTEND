<script lang="ts" setup> 
import { ref, onMounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON<any> | null>(null)

/* =========================
   ZONAS
   ========================= */
const selectedZones = ref<string[]>([])       // pré-seleção (duplo clique)
const zonasSelecionadasLista = selectedZones  // alias reativo
const filteredZones = ref<string[]>([])       // zonas aplicadas (as “salvas”)

/* Todas as zonas do GeoJSON (usado quando nada for selecionado) */
const ALL_ZONES: string[] = (() => {
  const set = new Set<string>()
  const features = (sjcGeojson as any).features as any[]
  for (const f of features) {
    const p = f?.properties || {}
    if (p?.layer === 'zona' && typeof p?.regiao === 'string') set.add(p.regiao)
  }
  return Array.from(set)
})()

/* =========================
   DATAS
   ========================= */
// Recebem o valor do <v-date-input> (string | Date | null)
const startDateTime = ref<string | Date | null>(null)
const endDateTime   = ref<string | Date | null>(null)

// Variáveis finais do filtro (salvas)
const filtroDataHoraInicial = ref<string | null>(null)
const filtroDataHoraFinal   = ref<string | null>(null)

// Normalizador auxiliar
const normalize = (v: unknown): string | null => {
  if (v == null || v === '') return null
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString()
  if (typeof v === 'string' && v.trim() !== '') return v
  return null
}

/* Regras pedidas:
   - sem início e sem fim -> ambos null
   - só início -> fim = agora
   - só fim -> início = null, fim = informado
   - ambos -> ambos informados
*/
watch([startDateTime, endDateTime], ([ini, fim]) => {
  const nIni = normalize(ini)
  const nFim = normalize(fim)

  if (!nIni && !nFim) {
    filtroDataHoraInicial.value = null
    filtroDataHoraFinal.value   = null
  } else if (nIni && !nFim) {
    filtroDataHoraInicial.value = nIni
    filtroDataHoraFinal.value   = new Date().toISOString()
  } else if (!nIni && nFim) {
    filtroDataHoraInicial.value = null
    filtroDataHoraFinal.value   = nFim
  } else {
    filtroDataHoraInicial.value = nIni!
    filtroDataHoraFinal.value   = nFim!
  }
})

/* Habilitar o botão "Filtrar" quando:
   - ambas nulas
   - início com valor e fim nulo
   - ambas com valor
   (=> desabilita quando só o fim tem valor)
*/
const isEmpty = (v: unknown) => v == null || (typeof v === 'string' && v.trim() === '')
const canFilter = computed(() => {
  const hasStart = !isEmpty(startDateTime.value)
  const hasEnd   = !isEmpty(endDateTime.value)
  return (!hasStart && !hasEnd) || (hasStart && !hasEnd) || (hasStart && hasEnd)
})

/* =========================
   MAPA
   ========================= */
const activeAnimations = new Map<string, any>()

onMounted(() => {
  if (!mapContainer.value) return
  map.value = L.map(mapContainer.value).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map.value)

  drawMap((sjcGeojson as any).features)
})

function drawMap(features: any[]) {
  if (!map.value) return
  if (geoJsonLayer.value) map.value.removeLayer(geoJsonLayer.value)

  geoJsonLayer.value = L.geoJSON(features, {
    style: (feature) => {
      const props = feature?.properties || {}
      const region = props.regiao
      const selected = selectedZones.value.includes(region)
      const filtered = filteredZones.value.includes(region)

      let borderColor = '#333'
      let fillColor = props.color || '#3388ff'
      if (selected) { borderColor = '#0044ff'; fillColor = '#3399ff' }
      else if (filtered) { borderColor = '#008000'; fillColor = '#33cc33' }

      return {
        color: borderColor,
        weight: selected || filtered ? 3 : 1,
        fillColor,
        fillOpacity: props.layer === 'municipio' ? 0.2 : 0.6,
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {}
      if (props.layer === 'zona') {
        layer.bindTooltip(`Zona ${props.regiao}`, { sticky: true })
        layer.bindPopup(`
          <b>Zona ${props.regiao}</b><br>
          Domicílios (origem): ${props.domiciliosOrigem || 'N/D'}<br>
          Pessoas (origem): ${props.pessoasOrigem || 'N/D'}<br>
          Moradores/domicílio (origem): ${props.moradoresOrigem || 'N/D'}<br>
          Domicílios (est. 2025): ${props.domiciliosEst || 'N/D'}<br>
          Pessoas (est. 2025): ${props.pessoasEst || 'N/D'}<br>
          Moradores/dom. (est. 2025): ${props.moradoresEst || 'N/D'}
        `)
        layer.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          toggleZone(props.regiao, layer)
        })
      } else if (props.layer === 'municipio') {
        layer.bindPopup(`<b>${props.name}</b><br>${props.description || ''}`)
      }
    },
  }).addTo(map.value)
}

function toggleZone(region: string, layer: L.Layer) {
  const index = selectedZones.value.indexOf(region)
  if (index >= 0) {
    selectedZones.value.splice(index, 1)
    stopAnimation(region)
  } else {
    selectedZones.value.push(region)
    startAnimation(region, layer)
  }
  drawMap((sjcGeojson as any).features)
}

function startAnimation(region: string, layer: L.Layer) {
  stopAnimation(region)
  if (!(layer as any).setStyle) return
  let glow = 0
  const interval = setInterval(() => {
    if (!(layer as any).setStyle) return
    const intensity = 0.5 + 0.3 * Math.sin(glow)
    ;(layer as any).setStyle({
      weight: 3 + 1.5 * intensity,
      color: `rgba(0, 68, 255, ${0.7 + 0.3 * intensity})`,
    })
    glow += 0.3
    if (glow > Math.PI * 2) glow = 0
  }, 120)
  activeAnimations.set(region, interval)
}

function stopAnimation(region: string) {
  const anim = activeAnimations.get(region)
  if (anim) {
    clearInterval(anim)
    activeAnimations.delete(region)
  }
}

function applyFilter() {
  const nothingSelected = selectedZones.value.length === 0

  let filtered = (sjcGeojson as any).features
  if (!nothingSelected) {
    filtered = (sjcGeojson as any).features.filter((f: any) => {
      if (f.properties?.layer === 'municipio') return true
      return selectedZones.value.includes(f.properties?.regiao)
    })
    filteredZones.value = [...selectedZones.value]       // aplica só as escolhidas
  } else {
    filteredZones.value = [...ALL_ZONES]                 // aplica TODAS as zonas
  }

  selectedZones.value = [] // limpa a pré-seleção
  drawMap(filtered)
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
}

function clearSelection() {
  selectedZones.value = []
  filteredZones.value = []
  startDateTime.value = '' // pode ser '' ou null
  endDateTime.value   = ''
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
  drawMap((sjcGeojson as any).features)
}
</script>

<template>
  <div class="home-container">
    <div class="filter-bar">
      <div class="filters">
        <div class="filter-group">
          <v-date-input
            v-model="startDateTime"
            label="Data/hora inicial"
            placeholder="Selecione data e hora"
          />
        </div>

        <div class="filter-group">
          <v-date-input
            v-model="endDateTime"
            label="Data/hora final"
            placeholder="Selecione data e hora"
          />
        </div>
      </div>

      <div class="status">
        <span v-if="selectedZones.length === 0 && filteredZones.length === 0"> Nenhuma zona selecionada </span>
        <span v-else-if="selectedZones.length > 0"> Zonas (pré-seleção): {{ selectedZones.join(', ') }} </span>
        <span v-else> Zonas aplicadas: {{ filteredZones.join(', ') }} </span>
      </div>

      <div class="buttons">
        <button @click="applyFilter" :disabled="!canFilter">
          Filtrar
        </button>
        <button
          @click="clearSelection"
          :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
        >
          Limpar
        </button>
      </div>
    </div>

    <div class="instructions">ℹ️ Dê <b>dois cliques</b> em uma zona para selecioná-la antes de aplicar o filtro.</div>

    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #f3f4f6;
    border-bottom: 1px solid #ddd;
    gap: 1rem;

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;

      .filter-group {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        width: 220px;

        :deep(.v-date-input) {
          width: 100%;
        }
      }
    }

    .status {
      font-size: 0.9rem;
      color: #333;
      flex: 1;
      text-align: center;
    }

    .buttons {
      display: flex;
      gap: 0.5rem;

      button {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        color: white;
        transition: 0.2s;

        &:disabled {
          background: #bbb !important;
          cursor: not-allowed;
        }

        &:first-child { background: #16a34a; }
        &:last-child  { background: #dc2626; }
      }
    }
  }

  .instructions {
    background: #e0f2fe;
    color: #0369a1;
    text-align: center;
    font-size: 0.9rem;
    padding: 0.5rem;
    border-bottom: 1px solid #b3e0ff;
  }

  .map {
    flex: 1;
    width: 100%;
    overflow: hidden;
  }

  :deep(.leaflet-interactive) {
    outline: none !important;
    cursor: pointer;
  }
}
</style>
