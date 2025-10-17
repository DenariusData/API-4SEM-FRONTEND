<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON<any> | null>(null)
const zonasSelecionadas = ref<string[]>([])

const dataHoraInicio = ref<string>('')
const dataHoraFim = ref<string>('')

const animacoesAtivas = new Map<string, any>()

onMounted(() => {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map.value)

  desenharMapa(sjcGeojson.features)
})

function desenharMapa(features: any[]) {
  if (!map.value) return

  if (geoJsonLayer.value) {
    map.value.removeLayer(geoJsonLayer.value)
  }

  geoJsonLayer.value = L.geoJSON(features, {
    style: (feature) => {
      const props = feature?.properties || {}
      const regiao = props.regiao
      const selecionada = zonasSelecionadas.value.includes(regiao)
      return {
        color: selecionada ? '#ff0000' : '#333',
        weight: selecionada ? 3 : 1,
        fillColor: selecionada ? '#ff6666' : props.color || '#3388ff',
        fillOpacity: props.layer === 'municipio' ? 0.2 : 0.6,
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {}

      if (props.layer === 'zona') {
        layer.bindTooltip(`Zona ${props.regiao}`, { sticky: true })
        layer.bindPopup(`
          <b>Zona ${props.regiao}</b><br>
          População: ${props.populacao || 'N/D'}<br>
          Domicílios: ${props.domicilios || 'N/D'}<br>
          Média moradores: ${props.media || 'N/D'}
        `)

        layer.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e) 
          toggleZona(props.regiao, layer)
        })
      } else if (props.layer === 'municipio') {
        layer.bindPopup(`<b>${props.name}</b><br>${props.description || ''}`)
      }
    },
  }).addTo(map.value)
}

function toggleZona(regiao: string, layer: L.Layer) {
  const index = zonasSelecionadas.value.indexOf(regiao)
  if (index >= 0) {
    zonasSelecionadas.value.splice(index, 1)
    pararAnimacao(regiao)
  } else {
    zonasSelecionadas.value.push(regiao)
    iniciarAnimacao(regiao, layer)
  }
  desenharMapa(sjcGeojson.features)
}

function iniciarAnimacao(regiao: string, layer: L.Layer) {
  pararAnimacao(regiao)
  if (!(layer as any).setStyle) return

  let brilho = 0
  const intervalo = setInterval(() => {
    if (!(layer as any).setStyle) return
    const intensidade = 0.5 + 0.3 * Math.sin(brilho)
    ;(layer as any).setStyle({
      weight: 3 + 1.5 * intensidade,
      color: `rgba(255, 0, 0, ${0.7 + 0.3 * intensidade})`,
    })
    brilho += 0.3
    if (brilho > Math.PI * 2) brilho = 0
  }, 120)
  animacoesAtivas.set(regiao, intervalo)
}

function pararAnimacao(regiao: string) {
  const anim = animacoesAtivas.get(regiao)
  if (anim) {
    clearInterval(anim)
    animacoesAtivas.delete(regiao)
  }
}

function aplicarFiltro() {
  let filtradas = sjcGeojson.features
  if (zonasSelecionadas.value.length > 0) {
    filtradas = sjcGeojson.features.filter((f: any) => {
      if (f.properties?.layer === 'municipio') return true
      return zonasSelecionadas.value.includes(f.properties?.regiao)
    })
  }

  console.log('📊 Filtro aplicado:', {
    zonas: zonasSelecionadas.value,
    dataHoraInicio: dataHoraInicio.value,
    dataHoraFim: dataHoraFim.value,
  })

  desenharMapa(filtradas)
  animacoesAtivas.forEach(clearInterval)
  animacoesAtivas.clear()
}

function limparSelecao() {
  zonasSelecionadas.value = []
  dataHoraInicio.value = ''
  dataHoraFim.value = ''
  animacoesAtivas.forEach(clearInterval)
  animacoesAtivas.clear()
  desenharMapa(sjcGeojson.features)
}
</script>

<template>
  <div class="home-container">
    <div class="filter-bar">
      <div class="filters">
        <div class="filter-group">
          <label>Data/hora inicial:</label>
          <input type="datetime-local" v-model="dataHoraInicio" />
        </div>

        <div class="filter-group">
          <label>Data/hora final:</label>
          <input type="datetime-local" v-model="dataHoraFim" />
        </div>
      </div>

      <div class="status">
        <span v-if="zonasSelecionadas.length === 0">Nenhuma zona selecionada</span>
        <span v-else>Zonas: {{ zonasSelecionadas.join(', ') }}</span>
      </div>

      <div class="buttons">
        <button @click="aplicarFiltro" :disabled="!zonasSelecionadas.length && !dataHoraInicio && !dataHoraFim">
          OK
        </button>
        <button @click="limparSelecao" :disabled="!zonasSelecionadas.length && !dataHoraInicio && !dataHoraFim">
          Limpar
        </button>
      </div>
    </div>

    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #ddd;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: 0.2rem;
}

input[type="datetime-local"] {
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  border: 1px solid #ccc;
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
}

.buttons button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2563eb;
  color: white;
  transition: 0.2s;
}

.buttons button:disabled {
  background: #bbb;
  cursor: not-allowed;
}

.buttons button:hover:not(:disabled) {
  background: #1e40af;
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
</style>
