import axios from 'axios'
import config from '../.././../config'

export const createIngresoOrdenIrradiacionByDetalle = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-irradiacion/createIngresoOrdenIrradiacionDetalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
