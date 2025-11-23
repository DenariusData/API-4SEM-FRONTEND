<template>
  <div :class="['map-container', { 'map-compact': compact }]">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import sjcGeojson from '@/utils/sjcGeojson.json'
import type { GeoJsonFeature } from '@/modules/home/types/homeTypes'
import { viasPrincipais } from '../utils/viasPrincipais'

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

    div.innerHTML = '<h4 style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Legenda do Mapa</h4>'
    div.innerHTML += '<div style="font-weight: 500; font-size: 13px; margin-bottom: 4px;">Níveis de Alerta</div>'
    levels.forEach((item) => {
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 20px; height: 20px; background-color: ${item.color}; margin-right: 10px; border: 1px solid #333; border-radius: 3px;"></div>
          <span style="font-size: 12px;">${item.label}</span>
        </div>
      `
    })

    div.innerHTML += '<div style="height: 1px; background: #eee; margin: 10px 0 10px 0;"></div>'

    div.innerHTML += `
      <div style="font-weight: 500; font-size: 13px; margin-bottom: 4px;">Outros</div>
      <div style="display: flex; align-items: center;">
        <div style="width: 32px; height: 0; border-top: 5px solid #FF6B6B; margin-right: 10px;"></div>
        <span style="font-size: 12px;">Via principal</span>
      </div>
    `

    return div
  }
  legend.addTo(map.value as L.Map)
}

function drawVias(): void {
  if (!viasLayer.value || !map.value) return

  viasLayer.value.clearLayers()

  const viasToShow =
    props.filteredZones.length > 0
      ? Object.entries(viasPrincipais).filter(([zona]) => {
          return props.filteredZones.includes(zona)
        })
      : Object.entries(viasPrincipais)

  viasToShow.forEach(([zona, data]) => {
    data.vias.forEach((via) => {
      const polyline = L.polyline(via.coords as L.LatLngExpression[], {
        color: data.color,
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
      })

      polyline.bindTooltip(via.name, {
        permanent: false,
        direction: 'center',
        className: 'via-tooltip',
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

        layer.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          emit('zoneToggle', propsData.regiao, layer)
        })
      } else if (propsData.layer === 'municipio') {
        layer.bindPopup(`<b>${propsData.name}</b><br>${propsData.description || ''}`)
      }
    },
  }).addTo(map.value as L.Map)

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
