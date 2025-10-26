export interface CausaRaiz {
  id: number;
  nome: string;
  criterioId: number;
  criterioNome: string;
  ativo: boolean;
  protocolosIds: number[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Protocolo {
  id: number;
  titulo: string;
  causaRaizId: number;
  passos: string[];
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
  criterioId: number | string;
  ativo: boolean;
}

export interface FormProtocolo {
  titulo: string;
  causaRaizId: number | string;
  passos: string[];
}

export type ModalType = 'causa' | 'protocolo';

export type TabType = 'causas' | 'protocolos';

export const initialFormCausa: FormCausa = {
  nome: '',
  criterioId: '',
  ativo: true
};

export const initialFormProtocolo: FormProtocolo = {
  titulo: '',
  causaRaizId: '',
  passos: ['']
};
