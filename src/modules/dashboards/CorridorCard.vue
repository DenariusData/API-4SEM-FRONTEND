<script lang="ts" setup>
defineProps<{
  name: string
  vehicles: number
  speed: number
}>()
</script>

<template>
  <div class="corridor-card">
    <div class="card-header">
      <h3 class="corridor-name">{{ name }}</h3>
    </div>

    <div class="card-body">

      <!-- Veículos -->
      <div class="metric-item">
        <div class="metric-icon icon-car">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path>
          </svg>
        </div>

        <div class="metric-content">
          <div class="metric-value">{{ vehicles.toLocaleString('pt-BR') }}</div>
          <div class="metric-label">veículos/h</div>
        </div>
      </div>

      <!-- Velocidade -->
      <div class="metric-item">
        <div class="metric-icon icon-speed">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="13" r="8"></circle>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="9" y1="3" x2="15" y2="3"></line>
              <line x1="12" y1="3" x2="12" y2="6"></line>
            </svg>
        </div>

        <div class="metric-content">
          <div class="metric-value speed-value">
            {{ Math.min(Math.max(speed, 0), 200).toFixed(1) }}
          </div>
          <div class="metric-label">km/h</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.corridor-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #00c853;
  }

  .card-header {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0.75rem;

    .corridor-name {
      font-size: 1rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .metric-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
        border-color: #00c853;
      }

      .metric-icon {
        font-size: 1.75rem;
        flex-shrink: 0;
        color: #6d6d6d;

        &.icon-car:hover svg {
          stroke: #00c853;
        }
      }

      .metric-content {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1;

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;

          &.speed-value {
            font-size: 1.25rem;
            color: #00c853;
          }
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #7a7a7a;
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .corridor-card {
    padding: 1rem;
    .metric-value {
      font-size: 1.3rem;
    }
  }
}
</style>
