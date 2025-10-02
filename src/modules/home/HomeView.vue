<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const test = ref([])

// Ref para o mapa
const mapContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (mapContainer.value) {
    const map = L.map(mapContainer.value).setView([-23.1896, -45.8842], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
  }
})
</script>

<template>
  <div class="home">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 400px;
  margin-top: 24px;
  border-radius: 12px;
  border: 1px solid #ccc;
}
</style>