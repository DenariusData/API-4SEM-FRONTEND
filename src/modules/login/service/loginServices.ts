import api from '@/utils/servicesUtils.ts'
import { UserRole } from '../store/roleStore'

interface LoginResponse {
  token: string
  role: UserRole
}

const login = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', { email, password }),
}

export default login
