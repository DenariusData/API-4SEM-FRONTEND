<script lang="ts" setup>
defineProps<{
  name: string
  vehicles: number
  speed: number
}>()
</script>

<template>
  <div class="corridor-card">
    <h3 class="corridor-name">{{ name }}</h3>
    <div class="car-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
        <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path>
      </svg>
    </div>
    <div class="stats">
      <p class="vehicle-count">{{ vehicles }} veículos/h</p>
      <p class="speed">{{ speed }} km/h</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.corridor-card {
  flex: 1;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #4dde7d;
  }

  .corridor-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #4d4d4d;
    margin-bottom: 20px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .car-icon {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    color: #7a7a7a;

    svg {
      transition: color 0.3s ease;
    }
  }

  &:hover .car-icon svg {
    color: #00c853;
  }

  .stats {
    .vehicle-count {
      font-size: 1.4rem;
      font-weight: bold;
      color: #4d4d4d;
      margin-bottom: 8px;
    }

    .speed {
      font-size: 1.2rem;
      color: #7a7a7a;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .corridor-card {
    .corridor-name {
      min-height: auto;
    }
  }
}
</style>
