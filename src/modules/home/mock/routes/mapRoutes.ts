import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils'

const randomLevel = () => Math.floor(Math.random() * 5) + 1

const sjcGeoJsonRoutes = [
  mockFlag(
    {
      method: 'get',
      url: '/alerts/per-region',
      result: () => {
        return APIFailureWrapper({
          content: {
            data: [
              { region_id: 1, level: randomLevel() },
              { region_id: 2, level: randomLevel() },
              { region_id: 3, level: randomLevel() },
              { region_id: 4, level: randomLevel() },
              { region_id: 5, level: randomLevel() },
              { region_id: 6, level: randomLevel() },
            ],
          },
          errorMessage: 'Erro ao carregar os níveis das regiões',
        })
      },
    },
    'on',
  ),
]

export default sjcGeoJsonRoutes
