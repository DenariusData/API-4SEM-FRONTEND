import { APIFailureWrapper, mockFlag } from '@/utils/mockUtils.ts'

interface MockParams {
  id?: string
  problemId?: string
}

const protocolRoutes = [
  mockFlag(
    {
      method: 'get',
      url: '/protocols/:problemId',
      result: (params: MockParams) => {
        const protocols: Record<
          number,
          {
            id: number
            problem_id: number
            title: string
            steps: string[]
          }
        > = {
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
]

export default protocolRoutes
