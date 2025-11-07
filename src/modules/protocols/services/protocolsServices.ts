import api from '@/utils/servicesUtils'

interface RootCauseBackendDTO {
  id: number
  name: string
  description: string
  createdAt: string
  personName: string
}

interface ProtocolBackendDTO {
  id: number
  name: string
  description: string
  createdAt: string
  createdByName: string
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
}

const protocols = {
  getAllRootCauses: (): Promise<{ data: RootCauseBackendDTO[] }> => 
    api.get('/root-causes'),
  
  getRootCauseById: (id: number): Promise<{ data: RootCauseBackendDTO }> => 
    api.get(`/root-causes/${id}`),
  
  createRootCause: (data: RootCauseRequestDTO): Promise<{ data: RootCauseBackendDTO }> => 
    api.post('/root-causes', data),
  
  updateRootCause: (id: number, data: RootCauseRequestDTO): Promise<{ data: RootCauseBackendDTO }> => 
    api.put(`/root-causes/${id}`, data),
  
  deleteRootCause: (id: number): Promise<void> => 
    api.delete(`/root-causes/${id}`),
  
  searchRootCauses: (name: string): Promise<{ data: RootCauseBackendDTO[] }> => 
    api.get('/root-causes', { params: { name } }),

  getAllProtocols: (): Promise<{ data: ProtocolBackendDTO[] }> => 
    api.get('/protocols'),
  
  getProtocolById: (id: number): Promise<{ data: ProtocolBackendDTO }> => 
    api.get(`/protocols/${id}`),
  
  createProtocol: (data: ProtocolRequestDTO): Promise<{ data: ProtocolBackendDTO }> => 
    api.post('/protocols', data),
  
  updateProtocol: (id: number, data: ProtocolRequestDTO): Promise<{ data: ProtocolBackendDTO }> => 
    api.put(`/protocols/${id}`, data),
  
  deleteProtocol: (id: number): Promise<void> => 
    api.delete(`/protocols/${id}`),
  
  searchProtocols: (name: string): Promise<{ data: ProtocolBackendDTO[] }> => 
    api.get('/protocols', { params: { name } }),
}

export default protocols
