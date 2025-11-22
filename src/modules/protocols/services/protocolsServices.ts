import api from '@/utils/servicesUtils'

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
  causaRaizId?: number
}

interface RootCauseRequestDTO {
  name: string
  description: string
  createdBy: number
}

interface ProtocolRequestDTO {
  name: string
  description: string
  createdBy: number
  causaRaizId: number
}

const protocols = {
  getAllRootCauses: (): Promise<{ data: RootCauseBackendDTO[] }> => api.get('/root-causes'),

  createRootCause: (data: RootCauseRequestDTO): Promise<{ data: RootCauseBackendDTO }> =>
    api.post('/root-causes', data),

  updateRootCause: (id: number, data: RootCauseRequestDTO): Promise<{ data: RootCauseBackendDTO }> =>
    api.put(`/root-causes/${id}`, data),

  deleteRootCause: (id: number): Promise<void> => api.delete(`/root-causes/${id}`),

  getAllProtocols: (): Promise<{ data: ProtocolBackendDTO[] }> => api.get('/protocols'),

  getProtocolByRootCause: (rootCauseId: number): Promise<{ data: ProtocolBackendDTO }> =>
    api.get(`/protocols/root-cause/${rootCauseId}`),

  getProtocolById: (id: number): Promise<{ data: ProtocolBackendDTO }> => api.get(`/protocols/${id}`),

  createProtocol: (data: ProtocolRequestDTO): Promise<{ data: ProtocolBackendDTO }> => api.post('/protocols', data),

  updateProtocol: (id: number, data: ProtocolRequestDTO): Promise<{ data: ProtocolBackendDTO }> =>
    api.put(`/protocols/${id}`, data),

  deleteProtocol: (id: number): Promise<void> => api.delete(`/protocols/${id}`),
}

export default protocols
