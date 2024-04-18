import axios from 'axios'
import config from '../../../config'

export const getOperacionesReprocesoMasivo = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/calidad/operacion-reproceso-masivo/listOperacionReprocesoMasivo.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
