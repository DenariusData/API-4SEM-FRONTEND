import { APIFailureWrapper, mockFlag } from "@/utils/mockUtils";
import sjcGeoJson from "@/utils/sjcGeojson.json";

const sjcGeoJsonRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/sjc-geojson",
      result: () => {
        return APIFailureWrapper({
          content: sjcGeoJson,
          errorMessage: "Erro ao carregar o mapa de São José dos Campos",
        });
      },
    },
    "on", 
  ),
];

export default sjcGeoJsonRoutes;
