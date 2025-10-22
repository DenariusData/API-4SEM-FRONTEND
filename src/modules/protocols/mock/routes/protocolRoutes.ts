import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

interface MockParams {
  id?: string
  problemId?: string
}

interface CreateCausaRaizBody {
  nome: string
  criterioId: number
  criterioNome: string
  ativo: boolean
}

interface UpdateCausaRaizBody {
  nome?: string
  criterioId?: number
  criterioNome?: string
  ativo?: boolean
}

interface CreateProtocoloBody {
  titulo: string
  causaRaizId: number
  passos: string[]
}

interface UpdateProtocoloBody {
  titulo?: string
  causaRaizId?: number
  passos?: string[]
}

// Mock data
export const mockCausasRaiz = [
  {
    id: 1,
    nome: 'Acidente de Trânsito',
    criterioId: 1,
    criterioNome: 'Velocidade Média',
    ativo: true,
    protocolosIds: [1],
  },
  {
    id: 2,
    nome: 'Veículo Quebrado',
    criterioId: 2,
    criterioNome: 'Tempo de Parada',
    ativo: true,
    protocolosIds: [2],
  },
  {
    id: 3,
    nome: 'Obras na Via',
    criterioId: 3,
    criterioNome: 'Obstrução de Faixa',
    ativo: true,
    protocolosIds: [3],
  },
  {
    id: 4,
    nome: 'Manifestação',
    criterioId: 4,
    criterioNome: 'Volume de Tráfego',
    ativo: false,
    protocolosIds: [4],
  },
  {
    id: 5,
    nome: 'Alagamento',
    criterioId: 5,
    criterioNome: 'Densidade Veicular',
    ativo: true,
    protocolosIds: [5],
  },
  {
    id: 6,
    nome: 'Semáforo com Defeito',
    criterioId: 1,
    criterioNome: 'Velocidade Média',
    ativo: true,
    protocolosIds: [6],
  }
]

export const mockProtocolos = [
  {
    id: 1,
    titulo: 'Protocolo para Acidentes',
    causaRaizId: 1,
    passos: [
      'Isolar a área do acidente com cones e faixas de segurança',
      'Acionar SAMU se houver feridos graves',
      'Fotografar a cena e coletar informações dos envolvidos',
      'Acionar guincho para remoção dos veículos',
      'Registrar ocorrência no sistema com todas as informações coletadas',
      'Liberar a via após remoção completa dos veículos',
      'Notificar o gestor sobre a conclusão',
    ],
  },
  {
    id: 2,
    titulo: 'Protocolo para Veículo Quebrado',
    causaRaizId: 2,
    passos: [
      'Contatar o motorista do veículo',
      'Solicitar que sinalize o veículo com triângulo',
      'Acionar guincho para remoção',
      'Orientar sobre estacionamento irregular se aplicável',
      'Aguardar remoção do veículo',
      'Confirmar liberação da via',
    ],
  },
  {
    id: 3,
    titulo: 'Protocolo para Obras na Via',
    causaRaizId: 3,
    passos: [
      'Verificar se há autorização para a obra',
      'Conferir sinalização adequada no local',
      'Solicitar ajustes na sinalização se necessário',
      'Registrar no sistema as informações da obra',
      'Monitorar impacto no tráfego',
      'Manter contato com responsável pela obra',
    ],
  },
  {
    id: 4,
    titulo: 'Protocolo para Manifestação',
    causaRaizId: 4,
    passos: [
      'Avaliar o tamanho e impacto da manifestação',
      'Acionar Polícia Militar se necessário',
      'Estabelecer rotas alternativas',
      'Comunicar aos órgãos competentes',
      'Monitorar evolução da situação',
      'Registrar informações detalhadas no sistema',
    ],
  },
  {
    id: 5,
    titulo: 'Protocolo para Alagamento',
    causaRaizId: 5,
    passos: [
      'Isolar a área alagada',
      'Acionar Defesa Civil',
      'Estabelecer rotas alternativas',
      'Alertar motoristas sobre o perigo',
      'Acompanhar drenagem da água',
      'Liberar via somente após segurança confirmada',
    ],
  },
  {
    id: 6,
    titulo: 'Protocolo para Semáforo com Defeito',
    causaRaizId: 6,
    passos: [
      'Identificar o tipo de defeito no semáforo',
      'Acionar equipe de manutenção',
      'Avaliar necessidade de agentes de trânsito no local',
      'Informar aos motoristas sobre o problema',
      'Aguardar reparo',
      'Confirmar funcionamento após manutenção',
    ],
  }
]

export const mockCriterios = [
  {
    id: 1,
    nome: 'Velocidade Média',
    descricao: 'Monitora velocidade média na via'
  },
  {
    id: 2,
    nome: 'Tempo de Parada',
    descricao: 'Tempo que veículos ficam parados'
  },
  {
    id: 3,
    nome: 'Obstrução de Faixa',
    descricao: 'Percentual de faixas obstruídas'
  },
  {
    id: 4,
    nome: 'Volume de Tráfego',
    descricao: 'Quantidade de veículos por hora'
  },
  {
    id: 5,
    nome: 'Densidade Veicular',
    descricao: 'Densidade de veículos por km'
  }
]

const protocolRoutes = [
  // Get protocolo by problemId
  mockFlag(
    {
      method: 'get',
      url: '/protocols/:problemId',
      result: (params: MockParams) => {
        const problemId = Number(params.problemId)
        const protocol = mockProtocolos.find(p => p.causaRaizId === problemId)

        return APIFailureWrapper({
          content: protocol || null,
          errorMessage: 'Erro ao buscar protocolo',
        })
      },
    },
    'on',
  ),

  // Get all protocolos
  mockFlag(
    {
      method: 'get',
      url: '/protocols',
      result: () => {
        return APIFailureWrapper({
          content: mockProtocolos,
          errorMessage: 'Erro ao buscar protocolos',
        })
      },
    },
    'on',
  ),

  // Get all causas raiz
  mockFlag(
    {
      method: 'get',
      url: '/root-causes',
      result: () => {
        return APIFailureWrapper({
          content: mockCausasRaiz,
          errorMessage: 'Erro ao buscar causas raiz',
        })
      },
    },
    'on',
  ),

  // Get all criterios
  mockFlag(
    {
      method: 'get',
      url: '/criteria',
      result: () => {
        return APIFailureWrapper({
          content: mockCriterios,
          errorMessage: 'Erro ao buscar critérios',
        })
      },
    },
    'on',
  ),

  // Create causa raiz
  mockFlag(
    {
      method: 'post',
      url: '/root-causes',
      result: (params: MockParams, body: unknown) => {
        const requestBody = body as CreateCausaRaizBody
        const newCausa = {
          id: mockCausasRaiz.length + 1,
          nome: requestBody.nome,
          criterioId: requestBody.criterioId,
          criterioNome: requestBody.criterioNome,
          ativo: requestBody.ativo,
          protocolosIds: [],
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        }
        mockCausasRaiz.push(newCausa)

        return APIFailureWrapper({
          content: newCausa,
          errorMessage: 'Erro ao criar causa raiz',
        })
      },
    },
    'on',
  ),

  // Update causa raiz
  mockFlag(
    {
      method: 'put',
      url: '/root-causes/:id',
      result: (params: MockParams, body: unknown) => {
        const id = Number(params.id)
        const requestBody = body as UpdateCausaRaizBody
        const index = mockCausasRaiz.findIndex(c => c.id === id)

        if (index !== -1) {
          mockCausasRaiz[index] = {
            ...mockCausasRaiz[index],
            ...requestBody,
          }
          return APIFailureWrapper({
            content: mockCausasRaiz[index],
            errorMessage: 'Erro ao atualizar causa raiz',
          })
        }

        return APIFailureWrapper({
          content: null,
          errorMessage: 'Causa raiz não encontrada',
        })
      },
    },
    'on',
  ),

  // Delete causa raiz
  mockFlag(
    {
      method: 'delete',
      url: '/root-causes/:id',
      result: (params: MockParams) => {
        const id = Number(params.id)
        const index = mockCausasRaiz.findIndex(c => c.id === id)

        if (index !== -1) {
          mockCausasRaiz.splice(index, 1)
          return APIFailureWrapper({
            content: { success: true },
            errorMessage: 'Erro ao excluir causa raiz',
          })
        }

        return APIFailureWrapper({
          content: null,
          errorMessage: 'Causa raiz não encontrada',
        })
      },
    },
    'on',
  ),

  // Create protocolo
  mockFlag(
    {
      method: 'post',
      url: '/protocols',
      result: (params: MockParams, body: unknown) => {
        const requestBody = body as CreateProtocoloBody
        const newProtocolo = {
          id: mockProtocolos.length + 1,
          titulo: requestBody.titulo,
          causaRaizId: requestBody.causaRaizId,
          passos: requestBody.passos,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        }
        mockProtocolos.push(newProtocolo)

        return APIFailureWrapper({
          content: newProtocolo,
          errorMessage: 'Erro ao criar protocolo',
        })
      },
    },
    'on',
  ),

  // Update protocolo
  mockFlag(
    {
      method: 'put',
      url: '/protocols/:id',
      result: (params: MockParams, body: unknown) => {
        const id = Number(params.id)
        const requestBody = body as UpdateProtocoloBody
        const index = mockProtocolos.findIndex(p => p.id === id)

        if (index !== -1) {
          mockProtocolos[index] = {
            ...mockProtocolos[index],
            ...requestBody,
          }
          return APIFailureWrapper({
            content: mockProtocolos[index],
            errorMessage: 'Erro ao atualizar protocolo',
          })
        }

        return APIFailureWrapper({
          content: null,
          errorMessage: 'Protocolo não encontrado',
        })
      },
    },
    'on',
  ),

  // Delete protocolo
  mockFlag(
    {
      method: 'delete',
      url: '/protocols/:id',
      result: (params: MockParams) => {
        const id = Number(params.id)
        const index = mockProtocolos.findIndex(p => p.id === id)

        if (index !== -1) {
          mockProtocolos.splice(index, 1)
          return APIFailureWrapper({
            content: { success: true },
            errorMessage: 'Erro ao excluir protocolo',
          })
        }

        return APIFailureWrapper({
          content: null,
          errorMessage: 'Protocolo não encontrado',
        })
      },
    },
    'on',
  ),
]

export default protocolRoutes
