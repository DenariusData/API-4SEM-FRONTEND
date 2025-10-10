<script lang="ts" setup>
import { ref, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import sjcGeojson from "@/utils/sjcGeojson.json";

const mapContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!mapContainer.value) return;

  const map = L.map(mapContainer.value).setView([-23.2, -45.9], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map);

  L.geoJSON(sjcGeojson, {
    style: (feature) => ({
      color: "#333",
      weight: feature?.properties?.layer === "municipio" ? 2 : 1,
      fillColor: feature?.properties?.color || "#3388ff",
      fillOpacity:
        feature?.properties?.layer === "municipio" ? 0.2 : 0.6,
    }),
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {};
      if (props.layer === "municipio") {
        layer.bindPopup(`<b>${props.name}</b><br>${props.description}`);
      } else if (props.layer === "zona") {
        layer.bindPopup(
          `<b>Zona ${props.regiao}</b><br>População: ${
            props.populacao || "N/D"
          }`
        );
      }
    },
  }).addTo(map);
});
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style scoped>
.map {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style>
