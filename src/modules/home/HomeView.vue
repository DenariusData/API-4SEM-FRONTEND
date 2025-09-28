<template>
  <div id="map" style="height: 100vh; width: 100%"></div>
</template>

<script setup>
import { onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

onMounted(() => {
  // Inicializa o mapa
  const map = L.map("map").setView([-23.2, -45.9], 11);

  // Adiciona camada base (mapa)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
  }).addTo(map);

  // Carrega o GeoJSON de São José dos Campos
  fetch("/sjc.geojson")
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: feature => ({
          color: feature.properties.color || "#3388ff",   // borda
          fillColor: feature.properties.color || "#3388ff", // preenchimento
          weight: 2,
          fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
          const { name, description } = feature.properties;
          layer.bindPopup(`<b>${name}</b><br>${description}`);
        }
      }).addTo(map);
    });
});
</script>

<style>
#map {
  height: 100vh;
  width: 100%;
}
</style>
