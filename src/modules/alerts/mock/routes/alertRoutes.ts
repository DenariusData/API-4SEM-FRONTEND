import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

interface MockParams {
  params: {
    alertId?: string
  }
  id?: string
  problemId?: string
}

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

  mockFlag(
    {
      method: 'get',
      url: '/alerts/:id/details',
      result: (params: MockParams) => {
        const alertId = Number(params.id)

        const mockAlerts: Record<
          number,
          {
            id: number
            alert_id: number
            indicator: string
            currentLevel: number
            previousLevel: number
            location: string
            timestamp: string
            finalized: boolean
            radar_id: string
            zone: string
            description: string
            affected_radars: string[]
          }
        > = {
          101: {
            id: 1,
            alert_id: 101,
            indicator: 'Congestionamento',
            currentLevel: 4,
            previousLevel: 2,
            location: 'Av. Paraibuna, 1234',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            finalized: false,
            radar_id: 'RADAR-001',
            zone: 'Zona Leste',
            description: 'Congestionamento detectado com aumento significativo no fluxo de veículos',
            affected_radars: ['RADAR-001', 'RADAR-002', 'RADAR-003'],
          },
          102: {
            id: 2,
            alert_id: 102,
            indicator: 'Densidade de Veículos',
            currentLevel: 3,
            previousLevel: 1,
            location: "R. Dr. Nelson D'Ávila, 567",
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            finalized: false,
            radar_id: 'RADAR-005',
            zone: 'Zona Central',
            description: 'Aumento na densidade de veículos acima do esperado para o horário',
            affected_radars: ['RADAR-005', 'RADAR-006'],
          },
          103: {
            id: 3,
            alert_id: 103,
            indicator: 'Infrações de Velocidade',
            currentLevel: 5,
            previousLevel: 3,
            location: 'Av. Florestan Fernandes, 890',
            timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
            finalized: true,
            radar_id: 'RADAR-010',
            zone: 'Zona Sul',
            description: 'Múltiplas infrações de velocidade detectadas',
            affected_radars: ['RADAR-010'],
          },
        }

        const response = mockAlerts[alertId] || {
          id: alertId,
          alert_id: alertId,
          indicator: 'Alerta Genérico',
          currentLevel: 3,
          previousLevel: 2,
          location: 'Localização não especificada',
          timestamp: new Date().toISOString(),
          finalized: false,
          radar_id: 'RADAR-000',
          zone: 'Zona Desconhecida',
          description: 'Detalhes do alerta não disponíveis',
          affected_radars: ['RADAR-000'],
        }

        return APIFailureWrapper({
          content: response,
          errorMessage: 'Erro ao buscar detalhes do alerta',
        })
      },
    },
    'on',
  ),

  mockFlag(
    {
      method: 'post',
      url: '/alerts/:id/finalize',
      result: (params: MockParams) => {
        return APIFailureWrapper({
          content: {
            success: true,
            message: 'Alerta finalizado com sucesso',
            alert_id: params.id,
          },
          errorMessage: 'Erro ao finalizar alerta',
        })
      },
    },
    'on',
  ),

  mockFlag(
    {
      method: 'get',
      url: '/alerts',
      result: (params: any) => {
        const page = Number(params.queryParams?.page) || 0
        const size = Number(params.queryParams?.size) || 10

        const allAlerts = [
          { alertId: 1, alertRegion: 'Região Sul', criterionName: 'Congestionamento', alertClosedAt: null },
          { alertId: 2, alertRegion: 'Região Norte', criterionName: 'Densidade de Veículos', alertClosedAt: null },
          {
            alertId: 3,
            alertRegion: 'Região Leste',
            criterionName: 'Infrações de Velocidade',
            alertClosedAt: '2024-11-15',
          },
          { alertId: 4, alertRegion: 'Região Oeste', criterionName: 'Veículos Grandes', alertClosedAt: null },
          { alertId: 5, alertRegion: 'Região Central', criterionName: 'Congestionamento', alertClosedAt: '2024-11-18' },
          { alertId: 6, alertRegion: 'Região Sul', criterionName: 'Infrações de Velocidade', alertClosedAt: null },
          { alertId: 7, alertRegion: 'Região Norte', criterionName: 'Congestionamento', alertClosedAt: '2024-11-19' },
          { alertId: 8, alertRegion: 'Região Leste', criterionName: 'Densidade de Veículos', alertClosedAt: null },
          { alertId: 9, alertRegion: 'Região Oeste', criterionName: 'Congestionamento', alertClosedAt: null },
          {
            alertId: 10,
            alertRegion: 'Região Central',
            criterionName: 'Veículos Grandes',
            alertClosedAt: '2024-11-10',
          },
          { alertId: 11, alertRegion: 'Região Sul', criterionName: 'Congestionamento', alertClosedAt: null },
          { alertId: 12, alertRegion: 'Região Norte', criterionName: 'Infrações de Velocidade', alertClosedAt: null },
          { alertId: 13, alertRegion: 'Região Leste', criterionName: 'Congestionamento', alertClosedAt: '2024-11-12' },
          { alertId: 14, alertRegion: 'Região Oeste', criterionName: 'Densidade de Veículos', alertClosedAt: null },
          { alertId: 15, alertRegion: 'Região Central', criterionName: 'Congestionamento', alertClosedAt: null },
        ]

        const totalElements = allAlerts.length
        const totalPages = Math.ceil(totalElements / size)
        const start = page * size
        const end = start + size
        const content = allAlerts.slice(start, end)

        return APIFailureWrapper({
          content: {
            content,
            totalPages,
            totalElements,
            size,
            number: page,
          },
          errorMessage: 'Erro ao buscar alertas',
        })
      },
    },
    'on',
  ),

  mockFlag(
    {
      method: 'get',
      url: '/alert-logs/:alertId',
      result: (params: MockParams) => {
        const alertId = Number(params.params.alertId)

        const mockLogs: Record<number, any[]> = {
          1: [
            { alertLogId: 1, logDatetime: '2024-11-20 09:00', previousLevel: 1, newLevel: 2 },
            { alertLogId: 2, logDatetime: '2024-11-20 09:15', previousLevel: 2, newLevel: 3 },
            { alertLogId: 3, logDatetime: '2024-11-20 09:30', previousLevel: 3, newLevel: 2 },
            { alertLogId: 4, logDatetime: '2024-11-20 09:45', previousLevel: 2, newLevel: 3 },
          ],
          2: [
            { alertLogId: 5, logDatetime: '2024-11-20 08:00', previousLevel: 1, newLevel: 1 },
            { alertLogId: 6, logDatetime: '2024-11-20 08:30', previousLevel: 1, newLevel: 2 },
          ],
          3: [
            { alertLogId: 7, logDatetime: '2024-11-15 14:00', previousLevel: 2, newLevel: 3 },
            { alertLogId: 8, logDatetime: '2024-11-15 14:20', previousLevel: 3, newLevel: 2 },
            { alertLogId: 9, logDatetime: '2024-11-15 14:40', previousLevel: 2, newLevel: 1 },
          ],
          4: [
            { alertLogId: 10, logDatetime: '2024-11-20 10:00', previousLevel: 1, newLevel: 2 },
            { alertLogId: 11, logDatetime: '2024-11-20 10:30', previousLevel: 2, newLevel: 3 },
            { alertLogId: 12, logDatetime: '2024-11-20 11:00', previousLevel: 3, newLevel: 3 },
          ],
        }

        const response = mockLogs[alertId] || [
          { alertLogId: 100, logDatetime: '2024-11-20 12:00', previousLevel: 1, newLevel: 2 },
        ]

        return APIFailureWrapper({
          content: response,
          errorMessage: 'Erro ao buscar logs do alerta',
        })
      },
    },
    'on',
  ),
]

export default alertsRoutes
