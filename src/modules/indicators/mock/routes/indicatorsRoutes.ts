import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

const indicatorsRoutes = [
  mockFlag(
    {
      method: 'get',
      url: '/indicators',
      result: () => {
        const response = [
          {
            id: 1,
            name: 'Congestionamento',
            description: 'Identifica lentidão em uma via. Quanto maior a porcentagem, menor a fluidez dos veículos.',
            category: 'Fluidez',
            unit: '%',
            minValue: 0,
            maxValue: 100,
          },
          {
            id: 2,
            name: 'Densidade de Veículos',
            description: 'Monitoramento da ocupação de espaço por câmeras. Maior densidade = menor fluidez.',
            category: 'Ocupação',
            unit: '%',
            minValue: 0,
            maxValue: 100,
          },
          {
            id: 3,
            name: 'Veículos de Grande Porte',
            description: 'Análise da circulação de caminhões, vans e camionetes nas vias.',
            category: 'Composição do Tráfego',
            unit: '%',
            minValue: 0,
            maxValue: 100,
          },
          {
            id: 4,
            name: 'Infrações de Velocidade',
            description: 'Monitoramento de excesso de velocidade para prevenção de acidentes.',
            category: 'Segurança',
            unit: '%',
            minValue: 0,
            maxValue: 100,
          },
        ]

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: 'Erro ao listar indicadores',
        })
      },
    },
    'on',
  ),
]

export default indicatorsRoutes
