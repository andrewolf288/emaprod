import axios from 'axios'
import config from '../../../config'

export const getEstadoCalidad = async () => {
  const domain = config.API_URL
  const path = '/referenciales/estado_calidad/list_estado_calidad.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data.result
}
