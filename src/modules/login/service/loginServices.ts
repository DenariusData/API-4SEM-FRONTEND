import api from '@/utils/servicesUtils.ts'
import { UserRole } from '@/modules/users/enum/roles'

interface LoginResponse {
  token: string
  role: UserRole
}

const login = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', { email, password }),
}

export default login
