import axios from 'axios'
import config from '../.././../config'

export const getOrdenesTransformacion = async (body) => {
  const domain = config.API_URL
  const path =
    '/produccion/requisicion-transformacion/listOrdenesTransformacion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
