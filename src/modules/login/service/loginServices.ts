import api from '@/utils/servicesUtils.ts'

const login = {
  login: (email: string, password: string): Promise<{ token: string; permission: string }> =>
    api.post('/auth/login', { email, password }),
}

export default login
