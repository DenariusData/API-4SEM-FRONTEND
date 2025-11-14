import axios from 'axios'

export async function getRegionsLevel() {
  const response = await axios.get('/alert/per-region')
  return response.data
}
