export interface RootCauseBackendDTO {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  personName: string;
}

export interface ProtocolBackendDTO {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdByName: string;
}

export interface RootCauseRequestDTO {
  name: string;
  description: string;
  createdBy: number;
}

export interface ProtocolRequestDTO {
  name: string;
  description: string;
  createdBy: number;
}

export interface CausaRaiz {
  id: number;
  nome: string;
  criterioId: number;
  criterioNome: string;
  ativo: boolean;
  protocolosIds: number[];
  description?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Protocolo {
  id: number;
  titulo: string;
  causaRaizId: number;
  passos: string[];
  description?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Criterio {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface FormCausa {
  nome: string;
  description: string;
  criterioId: number | string;
  ativo: boolean;
}

export interface FormProtocolo {
  titulo: string;
  description: string;
  causaRaizId: number | string;
  passos: string[];
}

export type ModalType = 'causa' | 'protocolo';

export type TabType = 'causas' | 'protocolos';

export const initialFormCausa: FormCausa = {
  nome: '',
  description: '',
  criterioId: '',
  ativo: true
};

export const initialFormProtocolo: FormProtocolo = {
  titulo: '',
  description: '',
  causaRaizId: '',
  passos: ['']
};

export const mapRootCauseToFrontend = (
  backendData: RootCauseBackendDTO,
  criterioId: number = 1,
  criterioNome: string = 'Padrão',
  ativo: boolean = true,
  protocolosIds: number[] = []
): CausaRaiz => ({
  id: backendData.id,
  nome: backendData.name,
  description: backendData.description,
  criterioId,
  criterioNome,
  ativo,
  protocolosIds,
  criadoEm: backendData.createdAt,
  atualizadoEm: backendData.createdAt
});

export const mapProtocolToFrontend = (
  backendData: ProtocolBackendDTO,
  causaRaizId: number = 1,
  passos: string[] = []
): Protocolo => ({
  id: backendData.id,
  titulo: backendData.name,
  description: backendData.description,
  causaRaizId,
  passos: passos.length > 0 ? passos : [backendData.description],
  criadoEm: backendData.createdAt,
  atualizadoEm: backendData.createdAt
});

export const mapCausaToBackend = (
  formData: FormCausa,
  createdBy: number
): RootCauseRequestDTO => ({
  name: formData.nome,
  description: formData.description || '',
  createdBy
});

export const mapProtocoloToBackend = (
  formData: FormProtocolo,
  createdBy: number
): ProtocolRequestDTO => ({
  name: formData.titulo,
  description: formData.passos.filter(p => p.trim()).join(' |-| '),
  createdBy
});
