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
            example: 'Av. Paraibuna, limite: 70 km/h; velocidade: 45 km/h → 35,7% → Nível 2',
            purpose:
              'Identificar lentidão em uma via. Quanto maior a porcentagem, menor a fluidez dos veículos na via.',
            ranges: [
              { level: 1, range: '0% – 19,9%' },
              { level: 2, range: '20% – 39,9%' },
              { level: 3, range: '40% – 59,9%' },
              { level: 4, range: '60% – 79,9%' },
              { level: 5, range: '80% – 100%' },
            ],
            details: `Média de "velocidade relativa" utilizando valores de veículos que passaram na via em uma janela de tempo dos últimos 20 segundos. Esse índice será atualizado a cada 1 segundo.

Velocidade relativa = (1 - (velocidade média / velocidade permitida)) * 100%

Congestionamento = somatória da "velocidade relativa" de todos veículos que passaram na via na janela de tempo / quantidade de veículos na janela de tempo`,
            nullValue: 'NULL → Não confiável',
          },
          {
            id: 2,
            name: 'Densidade de Veículos',
            description: 'Monitoramento da ocupação de espaço por câmeras. Maior densidade = menor fluidez.',
            category: 'Ocupação',
            unit: '%',
            minValue: 0,
            maxValue: 100,
            example: 'Via de 2 faixas, 8 carros, 2 caminhões, 1 van → 66% → Nível 4',
            purpose:
              'Identificar lentidão em uma via. Quanto maior a densidade de veículos por câmera, menor a fluidez dos veículos na via, maior o desgaste da pista e maior o risco de acidentes.',
            ranges: [
              { level: 1, range: '0% – 19,9%' },
              { level: 2, range: '20% – 39,9%' },
              { level: 3, range: '40% – 59,9%' },
              { level: 4, range: '60% – 79,9%' },
              { level: 5, range: '80% – 100%' },
            ],
            details: `Cálculo da porcentagem de ocupação de espaço de veículos em uma janela de tempo dos últimos 20 segundos pelo espaço disponível da via, definida pela visão do radar. Esse índice será atualizado a cada 1 segundo.

Os ônibus não estão incluídos nesse cálculo pois é esperado que em horários de pico a prefeitura e empresas disponibilizem uma grande quantidade destes veículos, o que levaria a falsos alertas.

Consideração de espaço ocupado para cada tipo de veículo:
• Carro: 4,5 metros
• Moto: 3 metros
• Caminhão Grande: 12 metros
• Van: 6 metros
• Camionete: 6,5 metros

Janela de tempo = 20 segundos
Espaço ocupado = somatória de comprimento médio + espaço de segurança de todos veículos detectados na "Janela de tempo"
Visão do radar = 50 metros
Espaço disponível = "Visão do radar" × número de faixas
Densidade = ("Espaço ocupado" / "Espaço disponível") × 100%`,
            nullValue: 'NULL → Sem dados',
          },
          {
            id: 3,
            name: 'Veículos de Grande Porte',
            description: 'Análise da circulação de caminhões, vans e camionetes nas vias.',
            category: 'Composição do Tráfego',
            unit: '%',
            minValue: 0,
            maxValue: 100,
            example: 'Av. Florestan Fernandes - Caminhões: 10%, Vans: 6% → 16% → Nível 4',
            purpose:
              'Identificar de forma "micro" uma das causas de congestionamento. Quanto maior a quantidade de veículos de grande porte, maior a chance de congestionamento, desgaste da pista e risco de acidentes.',
            ranges: [
              { level: 1, range: '0% – 4,9%' },
              { level: 2, range: '5% – 9,9%' },
              { level: 3, range: '10% – 14,9%' },
              { level: 4, range: '15% – 19,9%' },
              { level: 5, range: '20%+' },
            ],
            details: `Cálculo da porcentagem dos veículos de grande porte pela quantidade total de veículos da via em uma janela de tempo dos últimos 20 segundos. Esse índice será atualizado a cada 1 segundo.

Veículos de grande porte são van, camionete e caminhão grande. Os ônibus não estão incluídos nesse cálculo pois é esperado que em horários de pico a prefeitura e empresas disponibilizem uma grande quantidade destes veículos, o que levaria a falsos alertas.

Porcentagem de veículos de grande porte = (quantidade de veículos de grande porte / quantidade de veículos na via) × 100%`,
            nullValue: 'NULL → Sem dados',
          },
          {
            id: 4,
            name: 'Infrações de Velocidade',
            description: 'Monitoramento de excesso de velocidade para prevenção de acidentes.',
            category: 'Segurança',
            unit: '%',
            minValue: 0,
            maxValue: 100,
            example: "Av. Dr. Nelson D'Ávila – 38% de infrações nas últimas 24h → Nível 5",
            purpose:
              'Identificar vias propensas a acidentes, para que o gestor possa tomar as ações adequadas para redução de infrações na via observada. Quanto maior a quantidade de infrações da via, maior o risco de acidentes e, consequentemente, de congestionamento.',
            ranges: [
              { level: 1, range: '0% – 4,9%' },
              { level: 2, range: '5% – 9,9%' },
              { level: 3, range: '10% – 19,9%' },
              { level: 4, range: '20% – 34,9%' },
              { level: 5, range: '35%+' },
            ],
            details: `Contador da quantidade de veículos que ultrapassam em pelo menos 20% acima da velocidade permitida da via nas últimas 24 horas. Esse índice será atualizado a cada 60 segundos.

Quantidade de infrações da via = (veículos únicos infracionários das últimas 24 horas / total de veículos únicos das últimas 24 horas) × 100%`,
            nullValue: 'NULL → Sem dados',
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
