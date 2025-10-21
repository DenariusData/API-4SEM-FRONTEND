import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

const problemRoutes = [
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
]

export default problemRoutes
