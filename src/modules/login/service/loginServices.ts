import api from '@/utils/servicesUtils.ts'
import { UserRole } from '@/modules/users/enum/roles'
import type { AxiosResponse } from 'axios'

interface LoginResponse {
  token: string
  role: UserRole
}

const login = {
  login: (email: string, password: string): Promise<AxiosResponse<LoginResponse>> =>
    api.post<LoginResponse>('/auth/login', { email, password }),
}

export default login
