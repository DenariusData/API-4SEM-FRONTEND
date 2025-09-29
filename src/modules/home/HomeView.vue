<template>
  <div id="map" style="height: 100vh; width: 100%"></div>
</template>

<script setup>
import { onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

onMounted(() => {
  // Inicializa o mapa centralizado em São José dos Campos
  const map = L.map("map").setView([-23.2, -45.9], 11);

  // Camada base do OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
  }).addTo(map);

  // Carregar GeoJSON unificado (município + zonas)
  fetch("/sjc.geojson")
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: feature => ({
          color: "#333",
          weight: feature.properties.layer === "municipio" ? 2 : 1,
          fillColor: feature.properties.color || "#3388ff",
          fillOpacity: feature.properties.layer === "municipio" ? 0.2 : 0.6
        }),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;

          // Popup do limite municipal
          if (props.layer === "municipio") {
            layer.bindPopup(`<b>${props.name}</b><br>${props.description}`);
          }

          // Popup das zonas
          if (props.layer === "zona") {
            layer.bindPopup(
              `<b>Zona ${props.regiao}</b><br>População: ${props.populacao || "N/D"}`
            );
          }
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
