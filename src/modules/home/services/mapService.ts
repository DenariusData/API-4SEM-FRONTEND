import axios from "axios";

export async function getGeoJson() {
  const response = await axios.get("/sjc-geojson");
  return response.data;
}
