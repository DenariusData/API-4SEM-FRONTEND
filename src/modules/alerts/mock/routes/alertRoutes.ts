import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

interface MockParams {
  id?: string
  problemId?: string
}

const alertsRoutes = [
  // Lista dos últimos 10 alertas
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

  // Detalhes de um alerta específico
  mockFlag(
    {
      method: 'get',
      url: '/alerts/:id/details',
      result: (params: MockParams) => {
        const alertId = Number(params.id)

        const mockAlerts: Record<number, {
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
        }> = {
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

  // Lista de problemas
  mockFlag(
    {
      method: 'get',
      url: '/problems',
      result: () => {
        const response = [
          { id: 1, name: 'Acidente', description: 'Colisão entre veículos' },
          { id: 2, name: 'Veículo quebrado', description: 'Veículo parado na via' },
          { id: 3, name: 'Obra na via', description: 'Manutenção ou construção' },
          { id: 4, name: 'Manifestação', description: 'Protesto ou evento' },
          { id: 5, name: 'Alagamento', description: 'Via alagada' },
          { id: 6, name: 'Semáforo com defeito', description: 'Sinalização não funcionando' },
        ]

        return APIFailureWrapper({
          content: { items: response },
          errorMessage: 'Erro ao listar problemas',
        })
      },
    },
    'on',
  ),

  // Protocolos por problema
  mockFlag(
    {
      method: 'get',
      url: '/protocols/:problemId',
      result: (params: MockParams) => {
        const protocols: Record<number, {
          id: number
          problem_id: number
          title: string
          steps: string[]
        }> = {
          1: {
            id: 1,
            problem_id: 1,
            title: 'Protocolo para Acidentes',
            steps: [
              'Isolar a área do acidente com cones e faixas de segurança',
              'Acionar SAMU se houver feridos graves',
              'Fotografar a cena e coletar informações dos envolvidos',
              'Acionar guincho para remoção dos veículos',
              'Registrar ocorrência no sistema com todas as informações coletadas',
              'Liberar a via após remoção completa dos veículos',
              'Notificar o gestor sobre a conclusão',
            ],
          },
          2: {
            id: 2,
            problem_id: 2,
            title: 'Protocolo para Veículo Quebrado',
            steps: [
              'Contatar o motorista do veículo',
              'Solicitar que sinalize o veículo com triângulo',
              'Acionar guincho para remoção',
              'Orientar sobre estacionamento irregular se aplicável',
              'Aguardar remoção do veículo',
              'Confirmar liberação da via',
            ],
          },
          3: {
            id: 3,
            problem_id: 3,
            title: 'Protocolo para Obras na Via',
            steps: [
              'Verificar se há autorização para a obra',
              'Conferir sinalização adequada no local',
              'Solicitar ajustes na sinalização se necessário',
              'Registrar no sistema as informações da obra',
              'Monitorar impacto no tráfego',
              'Manter contato com responsável pela obra',
            ],
          },
          4: {
            id: 4,
            problem_id: 4,
            title: 'Protocolo para Manifestação',
            steps: [
              'Avaliar o tamanho e impacto da manifestação',
              'Acionar Polícia Militar se necessário',
              'Estabelecer rotas alternativas',
              'Comunicar aos órgãos competentes',
              'Monitorar evolução da situação',
              'Registrar informações detalhadas no sistema',
            ],
          },
          5: {
            id: 5,
            problem_id: 5,
            title: 'Protocolo para Alagamento',
            steps: [
              'Isolar a área alagada',
              'Acionar Defesa Civil',
              'Estabelecer rotas alternativas',
              'Alertar motoristas sobre o perigo',
              'Acompanhar drenagem da água',
              'Liberar via somente após segurança confirmada',
            ],
          },
          6: {
            id: 6,
            problem_id: 6,
            title: 'Protocolo para Semáforo com Defeito',
            steps: [
              'Identificar o tipo de defeito no semáforo',
              'Acionar equipe de manutenção',
              'Avaliar necessidade de agentes de trânsito no local',
              'Informar aos motoristas sobre o problema',
              'Aguardar reparo',
              'Confirmar funcionamento após manutenção',
            ],
          },
        }

        const problemId = Number(params.problemId)
        const protocol = protocols[problemId]

        return APIFailureWrapper({
          content: protocol || null,
          errorMessage: 'Erro ao buscar protocolo',
        })
      },
    },
    'on',
  ),

  // Lista de agentes
  mockFlag(
    {
      method: 'get',
      url: '/agents',
      result: () => {
        const response = [
          { id: 1, name: 'João Silva', phone: '5512991234567', available: true },
          { id: 2, name: 'Maria Santos', phone: '5512992345678', available: true },
          { id: 3, name: 'Pedro Costa', phone: '5512993456789', available: false },
          { id: 4, name: 'Ana Oliveira', phone: '5512994567890', available: true },
          { id: 5, name: 'Carlos Souza', phone: '5512995678901', available: true },
          { id: 6, name: 'Juliana Lima', phone: '5512996789012', available: false },
        ]

        return APIFailureWrapper({
          content: { items: response },
          errorMessage: 'Erro ao listar agentes',
        })
      },
    },
    'on',
  ),

  // Finalizar alerta
  mockFlag(
    {
      method: 'post',
      url: '/alerts/:id/finalize',
      result: (params: MockParams, body: unknown) => {
        console.log('Finalizando alerta:', params.id, body)

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
]

export default alertsRoutes
