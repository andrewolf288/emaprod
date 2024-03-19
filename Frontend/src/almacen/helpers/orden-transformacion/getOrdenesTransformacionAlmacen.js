import axios from 'axios'
import config from '../.././../config'

export const getOrdenesTransformacionAlmacen = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-transformacion/listOrdenesTransformacionAlmacen.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
