import axios from 'axios'

const randomLevel = () => Math.floor(Math.random() * 5) + 1

export async function getRegionsLevel() {
  // const response = await axios.get('/alert/per-region')
  // return response.data
  return [
    { region_id: 1, level: randomLevel() },
    { region_id: 2, level: randomLevel() },
    { region_id: 3, level: randomLevel() },
    { region_id: 4, level: randomLevel() },
    { region_id: 5, level: randomLevel() },
    { region_id: 6, level: randomLevel() },
  ]
}
