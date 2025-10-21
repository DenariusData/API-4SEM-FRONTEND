import api from '@/utils/servicesUtils.ts'

const routine = {
  updateDatabase: (): Promise<void> => api.post('/radar-base-data/force-processing'),
}

export default routine
