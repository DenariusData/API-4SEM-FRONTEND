import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

const userRoutes = [
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
]

export default userRoutes
