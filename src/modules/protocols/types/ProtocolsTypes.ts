export interface RootCauseBackendDTO {
  id: number
  name: string
  description: string
  createdAt: string
  personName: string
  protocolName?: string
}

export interface ProtocolBackendDTO {
  id: number
  name: string
  description: string
  createdAt: string
  createdByName: string
}

export interface RootCauseRequestDTO {
  name: string
  description: string
  createdBy: number
}

export interface ProtocolRequestDTO {
  name: string
  description: string
  createdBy: number
  causaRaizId: number
}

export interface CausaRaiz {
  id: number
  name: string
  description: string
  createdAt: string
  personName: string
  protocolName?: string
  ativo: boolean
}

export interface Protocolo {
  id: number
  titulo: string
  causaRaizId: number
  passos: string[]
  description?: string
  criadoEm?: string
  atualizadoEm?: string
}

export interface Criterio {
  id: number
  nome: string
  descricao?: string
}

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface FormCausa {
  name: string
  description: string
  ativo: boolean
}

export interface FormProtocolo {
  titulo: string
  description: string
  causaRaizId: number | string
  passos: string[]
}

export type ModalType = 'causa' | 'protocolo'

export type TabType = 'causas' | 'protocolos'

export const initialFormCausa: FormCausa = {
  name: '',
  description: '',
  ativo: true,
}

export const initialFormProtocolo: FormProtocolo = {
  titulo: '',
  description: '',
  causaRaizId: '',
  passos: [''],
}

export const mapProtocolToFrontend = (
  backendData: ProtocolBackendDTO,
  causaRaizId: number = 1,
  passos: string[] = [],
): Protocolo => ({
  id: backendData.id,
  titulo: backendData.name,
  description: backendData.description,
  causaRaizId,
  passos: passos.length > 0 ? passos : [backendData.description],
  criadoEm: backendData.createdAt,
  atualizadoEm: backendData.createdAt,
})

export const mapCausaToBackend = (formData: FormCausa, createdBy: number): RootCauseRequestDTO => ({
  name: formData.name,
  description: formData.description,
  createdBy,
})

export const mapProtocoloToBackend = (formData: FormProtocolo, createdBy: number): ProtocolRequestDTO => ({
  name: formData.titulo,
  description: formData.passos.filter((p) => p.trim()).join(' |-| '),
  createdBy,
  causaRaizId: parseInt(String(formData.causaRaizId)),
})
