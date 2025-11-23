<script lang="ts" setup>
import { ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ZoneData } from '../types/dashboardsTypes'

Chart.register(...registerables)

const props = defineProps<{
  zonesData: ZoneData[]
  filteredZones: string[]
}>()

const emit = defineEmits(['close'])

const selectedZonesForComparison = ref<string[]>([])
const comparisonChartRef = ref<HTMLCanvasElement | null>(null)

let comparisonChartInstance: Chart | null = null

const isZoneAvailable = (zone: string) => {
  if (props.filteredZones.length === 0) return true
  return props.filteredZones.includes(zone)
}

function closeComparisonModal() {
  if (comparisonChartInstance) comparisonChartInstance.destroy()
  emit('close')
}

function toggleZoneSelection(zone: string) {
  if (!isZoneAvailable(zone)) return

  const index = selectedZonesForComparison.value.indexOf(zone)
  if (index > -1) {
    selectedZonesForComparison.value.splice(index, 1)
  } else {
    selectedZonesForComparison.value.push(zone)
  }
}

function selectAllZones() {
  selectedZonesForComparison.value = props.zonesData.filter((z) => isZoneAvailable(z.zone)).map((z) => z.zone)
}

function applyComparison() {
  if (selectedZonesForComparison.value.length > 0) {
    setTimeout(() => createComparisonChart(), 100)
  }
}

const createComparisonChart = () => {
  if (comparisonChartRef.value && selectedZonesForComparison.value.length > 0) {
    if (comparisonChartInstance) comparisonChartInstance.destroy()

    const selectedZones = props.zonesData.filter((z) => selectedZonesForComparison.value.includes(z.zone))

    const hasData = selectedZones.some((z) => z.corridors.length > 0)
    if (!hasData) {
      console.warn('⚠️ Nenhuma zona selecionada tem dados de corredores')
      return
    }

    const datasets = selectedZones
      .filter((z) => z.corridors.length > 0)
      .map((zone, index) => {
        const colors = ['#00c853', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4']
        return {
          label: `Zona ${zone.zone}`,
          data: zone.corridors.map((c) => c.vehicles),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1,
          borderRadius: 4,
        }
      })

    const allValues = datasets.flatMap((d) => d.data)
    const maxValue = Math.max(...allValues, 1500)
    const chartMax = Math.ceil((maxValue * 1.2) / 500) * 500

    const maxCorridors = Math.max(...selectedZones.map((z) => z.corridors.length))
    const labels = Array.from({ length: maxCorridors }, (_, i) => `Corredor ${i + 1}`)

    comparisonChartInstance = new Chart(comparisonChartRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 13 },
              color: '#4d4d4d',
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const zoneName = context.dataset.label
                const vehicles = context.parsed.y
                return `${zoneName}: ${vehicles.toLocaleString('pt-BR')} veículos`
              },
              afterLabel: function (context) {
                const zoneData = selectedZones.find((z) => `Zona ${z.zone}` === context.dataset.label)
                if (zoneData && zoneData.corridors[context.dataIndex]) {
                  return `📍 ${zoneData.corridors[context.dataIndex].name}`
                }
                return ''
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: chartMax,
            ticks: {
              stepSize: Math.ceil(chartMax / 5 / 100) * 100,
              font: { size: 12 },
              color: '#7a7a7a',
              callback: function (value) {
                return value.toLocaleString('pt-BR') + ' veíc.'
              },
            },
            grid: { color: '#e0e0e0' },
          },
          x: {
            ticks: {
              font: { size: 11 },
              color: '#7a7a7a',
            },
            grid: { display: false },
          },
        },
      },
    })
  }
}
</script>

<template>
  <div class="comparison-overlay" @click="closeComparisonModal">
    <div class="comparison-modal" @click.stop>
      <button class="close-comparison" @click="closeComparisonModal">×</button>

      <h2>🔄 Comparar Zonas</h2>
      <p class="comparison-subtitle">Selecione as zonas que deseja comparar</p>

      <div class="zone-selection">
        <button
          v-for="zone in zonesData"
          :key="zone.zone"
          :class="[
            'zone-select-btn',
            {
              selected: selectedZonesForComparison.includes(zone.zone),
              disabled: !isZoneAvailable(zone.zone),
              'no-data': zone.corridors.length === 0,
            },
          ]"
          :disabled="!isZoneAvailable(zone.zone)"
          @click="toggleZoneSelection(zone.zone)"
        >
          <span class="check-icon">{{ selectedZonesForComparison.includes(zone.zone) ? '✓' : '' }}</span>
          <div v-if="!isZoneAvailable(zone.zone)" class="lock-icon">🔒</div>
          <div v-if="zone.corridors.length === 0" class="no-data-badge">Sem dados</div>
          <div class="zone-icon">📍</div>
          <div class="zone-name">Zona {{ zone.zone }}</div>
          <div v-if="zone.corridors.length > 0" class="zone-info">
            {{ zone.corridors.length }} corredor{{ zone.corridors.length !== 1 ? 'es' : '' }}
          </div>
        </button>
      </div>

      <div class="comparison-actions">
        <button class="select-all-btn" @click="selectAllZones">Selecionar Todas Disponíveis</button>
        <button
          class="apply-comparison-btn"
          :disabled="selectedZonesForComparison.length === 0"
          @click="applyComparison"
        >
          Aplicar Comparação ({{ selectedZonesForComparison.length }})
        </button>
      </div>

      <div v-if="selectedZonesForComparison.length > 0" class="comparison-result">
        <h3>Comparação de Fluxo entre Zonas</h3>
        <p class="result-description">
          Comparando {{ selectedZonesForComparison.length }} zona{{
            selectedZonesForComparison.length !== 1 ? 's' : ''
          }}
          selecionada{{ selectedZonesForComparison.length !== 1 ? 's' : '' }}
        </p>
        <div class="chart-container">
          <canvas ref="comparisonChartRef"></canvas>
        </div>
      </div>

      <div v-else class="no-selection-message">
        <div class="message-icon">📊</div>
        <p>Selecione pelo menos uma zona para visualizar a comparação</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comparison-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.comparison-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
  position: relative;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .close-comparison {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #dc2626;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    &:hover {
      background: #b91c1c;
      transform: scale(1.1);
    }
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
  }

  .comparison-subtitle {
    color: #7a7a7a;
    font-size: 0.95rem;
    margin: 0 0 1.5rem 0;
  }

  .zone-selection {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;

    .zone-select-btn {
      background: white;
      border: 2px solid #e0e0e0;
      padding: 1.5rem 1rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #4d4d4d;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 160px;

      .check-icon {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        font-size: 1.2rem;
        color: #00c853;
        font-weight: bold;
      }

      .lock-icon {
        position: absolute;
        top: 0.75rem;
        left: 0.75rem;
        font-size: 1.2rem;
        opacity: 0.6;
      }

      .no-data-badge {
        position: absolute;
        top: 0.75rem;
        left: 50%;
        transform: translateX(-50%);
        background: #ffc107;
        color: #856404;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .zone-icon {
        font-size: 2.5rem;
        transition: transform 0.3s ease;
        margin-top: 1rem;
      }

      .zone-name {
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
      }

      .zone-info {
        font-size: 0.85rem;
        color: #7a7a7a;
        font-weight: 500;
      }

      &:hover:not(:disabled):not(.no-data) {
        border-color: #00c853;
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 200, 83, 0.2);

        .zone-icon {
          transform: scale(1.1);
        }
      }

      &.selected {
        background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
        border-color: #00c853;
        color: white;
        box-shadow: 0 6px 16px rgba(0, 200, 83, 0.4);

        .check-icon {
          color: white;
        }

        .zone-info {
          color: rgba(255, 255, 255, 0.9);
        }

        .zone-icon {
          transform: scale(1.1);
        }
      }

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: #f5f5f5;
        border-color: #e0e0e0;

        &:hover {
          transform: none;
          box-shadow: none;
          border-color: #e0e0e0;

          .zone-icon {
            transform: none;
          }
        }
      }

      &.no-data {
        opacity: 0.6;
        cursor: default;

        &:hover {
          transform: none;
          box-shadow: none;
          border-color: #e0e0e0;

          .zone-icon {
            transform: none;
          }
        }
      }
    }
  }

  .comparison-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    button {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .select-all-btn {
      background: #f0f0f0;
      color: #4d4d4d;

      &:hover {
        background: #e0e0e0;
        transform: translateY(-2px);
      }
    }

    .apply-comparison-btn {
      background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 200, 83, 0.4);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 200, 83, 0.5);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  .comparison-result {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e0e0e0;

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #4d4d4d;
      margin-bottom: 0.5rem;
    }

    .result-description {
      font-size: 0.9rem;
      color: #7a7a7a;
      margin-bottom: 1rem;
    }

    .chart-container {
      background: #ffffff;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      height: 400px;
      position: relative;

      canvas {
        max-height: 100%;
      }
    }
  }

  .no-selection-message {
    text-align: center;
    padding: 3rem 2rem;
    background: #f9fafb;
    border-radius: 12px;
    margin-top: 1rem;

    .message-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    p {
      color: #7a7a7a;
      font-size: 1rem;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .comparison-modal {
    padding: 1.5rem;
    width: 95%;
    max-width: 600px;

    h2 {
      font-size: 1.5rem;
    }

    .comparison-subtitle {
      font-size: 0.85rem;
    }

    .zone-selection {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;

      .zone-select-btn {
        padding: 1rem 0.75rem;
        min-height: 140px;

        .zone-icon {
          font-size: 2rem;
        }

        .zone-name {
          font-size: 0.95rem;
        }

        .zone-info {
          font-size: 0.8rem;
        }
      }
    }

    .comparison-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .comparison-result {
      .chart-container {
        height: 300px;
      }
    }
  }
}
</style>
