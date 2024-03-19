import axios from 'axios'
import config from '../../../config'

export const getEstadoOrdenIrradiacion = async () => {
  const domain = config.API_URL
  const path =
    '/referenciales/orden_irradiacion_estado/list_orden_irradiacion_estado.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data.result
}
