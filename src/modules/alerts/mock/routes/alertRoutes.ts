import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

const alertsRoutes = [
  mockFlag(
    {
      method: 'get',
      url: '/alerts/last-ten',
      result: () => {
        const response = [
          {
            id: 1,
            indicator: 'Congestionamento',
            previousLevel: 2,
            newLevel: 4,
            location: 'Av. Paraibuna, 1234',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            indicator: 'Densidade de Veículos',
            previousLevel: 1,
            newLevel: 3,
            location: "R. Dr. Nelson D'Ávila, 567",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            indicator: 'Infrações de Velocidade',
            previousLevel: 3,
            newLevel: 5,
            location: 'Av. Florestan Fernandes, 890',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            indicator: 'Veículos de Grande Porte',
            previousLevel: 2,
            newLevel: 4,
            location: 'R. João Silva, 234',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 5,
            indicator: 'Congestionamento',
            previousLevel: 1,
            newLevel: 2,
            location: 'Av. Central, 456',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
        ]

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: 'Erro ao listar últimos 10 alertas',
        })
      },
    },
    'on',
  ),
]

export default alertsRoutes
