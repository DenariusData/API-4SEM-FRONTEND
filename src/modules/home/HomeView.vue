<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'
import DashboardView from '@/modules/dashboards/DashboardsView.vue'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON<any> | null>(null)
const selectedZones = ref<string[]>([])
const filteredZones = ref<string[]>([])
const startDateTime = ref<string>('')
const endDateTime = ref<string>('')
const showFilters = ref<boolean>(false)
const showDashboard = ref<boolean>(false)

const activeAnimations = new Map<string, any>()

onMounted(() => {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map.value)

  drawMap(sjcGeojson.features)
})

function drawMap(features: any[]) {
  if (!map.value) return

  if (geoJsonLayer.value) {
    map.value.removeLayer(geoJsonLayer.value)
  }

  geoJsonLayer.value = L.geoJSON(features, {
    style: (feature) => {
      const props = feature?.properties || {}
      const region = props.regiao
      const selected = selectedZones.value.includes(region)
      const filtered = filteredZones.value.includes(region)

      let borderColor = '#333'
      let fillColor = props.color || '#3388ff'

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
  drawMap(sjcGeojson.features)
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
  let filtered = sjcGeojson.features
  if (selectedZones.value.length > 0) {
    filtered = sjcGeojson.features.filter((f: any) => {
      if (f.properties?.layer === 'municipio') return true
      return selectedZones.value.includes(f.properties?.regiao)
    })
  }

  filteredZones.value = [...selectedZones.value]
  selectedZones.value = []

  drawMap(filtered)
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
  showFilters.value = false
}

function clearSelection() {
  selectedZones.value = []
  filteredZones.value = []
  startDateTime.value = ''
  endDateTime.value = ''
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
  drawMap(sjcGeojson.features)
  showFilters.value = false
}

function openDashboard() {
  showDashboard.value = true
}

function closeDashboard() {
  showDashboard.value = false
}
</script>

<template>
  <div class="home-container">
    <div class="top-bar">
      <button class="filters-button" @click="showFilters = !showFilters">
        Filtros
      </button>
      <button class="dashboard-button" @click="openDashboard">
        Dashboard's
      </button>
    </div>

    <div class="content-wrapper">

      <!-- 
      <div class="left-content">
        <div class="card">
          <h2 class="card-title">Principais vias</h2>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Zona</th>
                  <th>Local</th>
                  <th>Nível (nível geral)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in 7" :key="i">
                  <td>9h46</td>
                  <td>Sul</td>
                  <td>Rua ABC - Bairro XYZ</td>
                  <td>
                    <span class="status-badge status-excelente">
                      <span class="status-dot"></span>
                      Excelente - nível 1 - 7%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Alertas críticos</h2>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Horário</th>
                  <th>Local</th>
                  <th>Nível</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Congestionamento</td>
                  <td>18h46</td>
                  <td>Rua ABC - Bairro XYZ</td>
                  <td>
                    <span class="status-badge status-pessimo">
                      <span class="status-dot"></span>
                      Péssimo - nível 5 - 95%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Infrações</td>
                  <td>10h34</td>
                  <td>Rua DEF - Bairro UVW</td>
                  <td>
                    <span class="status-badge status-medio">
                      <span class="status-dot"></span>
                      Médio - nível 3 - 52%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      -->

      <div v-if="showFilters" class="filter-dropdown">
        <div class="filter-content">
          <div class="instructions">
            ℹ️ Dê <b>dois cliques</b> em uma zona para selecioná-la
          </div>

          <div class="filter-group">
            <v-date-input
              v-model="startDateTime"
              label="Data/hora inicial"
              placeholder="Selecione data e hora"
            ></v-date-input>
          </div>

          <div class="filter-group">
            <v-date-input
              v-model="endDateTime"
              label="Data/hora final"
              placeholder="Selecione data e hora"
            ></v-date-input>
          </div>

          <div class="status">
            <span v-if="selectedZones.length === 0 && filteredZones.length === 0">
              Nenhuma zona selecionada
            </span>
            <span v-else-if="selectedZones.length > 0">
              Zonas (pré-seleção): {{ selectedZones.join(', ') }}
            </span>
            <span v-else>
              Zonas aplicadas: {{ filteredZones.join(', ') }}
            </span>
          </div>

          <div class="buttons">
            <button
              @click="applyFilter"
              :disabled="!selectedZones.length && !startDateTime && !endDateTime"
              class="apply-btn"
            >
              Filtrar
            </button>
            <button
              @click="clearSelection"
              :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
              class="clear-btn"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div ref="mapContainer" class="map map-expanded"></div>
    </div>

    <DashboardView 
      v-if="showDashboard" 
      :filtered-zones="filteredZones"
      @close="closeDashboard" 
    />
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  .top-bar {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: transparent;
    gap: 0.75rem;
    z-index: 1000;

    .filters-button,
    .dashboard-button {
      padding: 0.5rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: white;
      font-weight: 500;
      transition: 0.2s;
    }

    .filters-button {
      background: #3b82f6;

      &:hover {
        background: #2563eb;
      }
    }

    .dashboard-button {
      background: #00c853;

      &:hover {
        background: #00963e;
      }
    }
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    position: relative;
    overflow: hidden;
    gap: 1rem;
    padding: 0 1rem 1rem;
  }

  .left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    padding-right: 1rem;
  }

  .card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      padding: 1rem 1.25rem;
      margin: 0;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;

      thead {
        background: #f8f9fa;

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #4a4a4a;
          border-bottom: 2px solid #e0e0e0;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid #f0f0f0;

          &:hover {
            background: #f9fafb;
          }

          &:last-child {
            border-bottom: none;
          }
        }

        td {
          padding: 0.75rem 1rem;
          color: #333;
        }
      }
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    &.status-excelente {
      background: #d4f4dd;
      color: #0d6832;

      .status-dot {
        background: #00c853;
      }
    }

    &.status-bom {
      background: #d4f4dd;
      color: #0d6832;

      .status-dot {
        background: #4caf50;
      }
    }

    &.status-medio {
      background: #fff3cd;
      color: #856404;

      .status-dot {
        background: #ff9800;
      }
    }

    &.status-ruim {
      background: #f8d7da;
      color: #721c24;

      .status-dot {
        background: #f44336;
      }
    }

    &.status-pessimo {
      background: #e8d0d0;
      color: #5a1a1a;

      .status-dot {
        background: #8b0000;
      }
    }
  }

  .filter-dropdown {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 300px;

    .filter-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .instructions {
        background: #e0f2fe;
        color: #0369a1;
        text-align: center;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        border-radius: 6px;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;

        label {
          font-weight: 500;
          margin-bottom: 0.2rem;
        }

        :deep(.v-date-input) {
          width: 100%;
        }
      }

      .status {
        font-size: 0.9rem;
        color: #333;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 4px;
        text-align: center;
      }

      .buttons {
        display: flex;
        gap: 0.5rem;

        button {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: white;
          transition: 0.2s;
          font-weight: 500;

          &:disabled {
            background: #bbb !important;
            cursor: not-allowed;
          }
        }

        .apply-btn {
          background: #16a34a;

          &:hover:not(:disabled) {
            background: #15803d;
          }
        }

        .clear-btn {
          background: #dc2626;

          &:hover:not(:disabled) {
            background: #b91c1c;
          }
        }
      }
    }
  }

  .map {
    flex-shrink: 0;
    width: 600px;
    height: calc(100vh - 120px);
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #e0e0e0;

    &.map-expanded {
      width: 100%;
    }
  }

  :deep(.leaflet-interactive) {
    outline: none !important;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .map {
    width: 100% !important;
    height: 400px !important;
  }

  .left-content {
    padding-right: 0;
  }
}
</style>
add dashboard modal and map filters dropdown (UI only, no integration)