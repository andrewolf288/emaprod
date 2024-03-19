import axios from 'axios'
import config from '../.././../config'

export const createDevolucionOrdenReproceso = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-reproceso/createDevolucionOrdenReproceso.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
