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
            alert_id: 101,
            indicator: 'Congestionamento',
            previousLevel: 2,
            newLevel: 4,
            location: 'Av. Paraibuna, 1234',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            finalized: false,
          },
          {
            id: 2,
            alert_id: 102,
            indicator: 'Densidade de Veículos',
            previousLevel: 1,
            newLevel: 3,
            location: "R. Dr. Nelson D'Ávila, 567",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            finalized: false,
          },
          {
            id: 3,
            alert_id: 103,
            indicator: 'Infrações de Velocidade',
            previousLevel: 3,
            newLevel: 5,
            location: 'Av. Florestan Fernandes, 890',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            finalized: true,
          },
          {
            id: 4,
            alert_id: 104,
            indicator: 'Veículos de Grande Porte',
            previousLevel: 2,
            newLevel: 4,
            location: 'R. João Silva, 234',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            finalized: false,
          },
          {
            id: 5,
            alert_id: 101,
            indicator: 'Congestionamento',
            previousLevel: 4,
            newLevel: 5,
            location: 'Av. Paraibuna, 1234',
            timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            finalized: true,
          },
          {
            id: 6,
            alert_id: 102,
            indicator: 'Densidade de Veículos',
            previousLevel: 3,
            newLevel: 2,
            location: "R. Dr. Nelson D'Ávila, 567",
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            finalized: true,
          },
          {
            id: 7,
            alert_id: 105,
            indicator: 'Congestionamento',
            previousLevel: 2,
            newLevel: 3,
            location: 'Av. Central, 456',
            timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
            finalized: false,
          },
          {
            id: 8,
            alert_id: 106,
            indicator: 'Congestionamento',
            previousLevel: 1,
            newLevel: 2,
            location: 'Av. Central, 456',
            timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
            finalized: false,
          },
          {
            id: 9,
            alert_id: 107,
            indicator: 'Infrações de Velocidade',
            previousLevel: 4,
            newLevel: 3,
            location: 'Av. Florestan Fernandes, 890',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            finalized: true,
          },
          {
            id: 10,
            alert_id: 108,
            indicator: 'Densidade de Veículos',
            previousLevel: 2,
            newLevel: 1,
            location: 'R. João Silva, 234',
            timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
            finalized: false,
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
