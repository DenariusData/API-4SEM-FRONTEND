import api from '@/utils/servicesUtils.ts'
import type { Level } from '@/modules/levels/types/levelsTypes.ts'

const levels = {
  getByIndicatorId: (criterionId: string): Promise<{ data: Level }> =>
    api.get(`/criterion-levels/by-criterion/${criterionId}`),
}

export default levels
