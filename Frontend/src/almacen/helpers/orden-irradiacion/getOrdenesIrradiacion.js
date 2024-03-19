import axios from 'axios'
import config from '../.././../config'

export const getOrdenesIrradiacion = async (body) => {
  const domain = config.API_URL
  const path = '/almacen/operacion-irradiacion/listOrdenIrradiacion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
