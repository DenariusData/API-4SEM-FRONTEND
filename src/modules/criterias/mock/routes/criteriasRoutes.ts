import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

const criteriasRoutes = [
  mockFlag(
    {
      method: 'get',
      url: '/criterias',
      result: () => {
        const response = [
          { id: 1, name: 'Critério 1', description: 'Descrição do Critério 1' },
          { id: 2, name: 'Critério 2', description: 'Descrição do Critério 2' },
          { id: 3, name: 'Critério 3', description: 'Descrição do Critério 3' },
          { id: 4, name: 'Critério 4', description: 'Descrição do Critério 4' },
          { id: 5, name: 'Critério 5', description: 'Descrição do Critério 5' },
        ]

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: 'Erro ao listar critérios',
        })
      },
    },
    'on',
  ),
]

export default criteriasRoutes
