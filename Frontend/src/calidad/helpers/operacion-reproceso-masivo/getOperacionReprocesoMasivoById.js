import axios from 'axios'
import config from '../../../config'

export const getOperacionReprocesoMasivoById = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/calidad/operacion-reproceso-masivo/getOperacionReprocesoMasivoById.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
