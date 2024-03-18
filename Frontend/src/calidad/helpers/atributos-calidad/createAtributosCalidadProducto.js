import axios from 'axios'
import config from '../.././../config'

export const createAtributosCalidadProducto = async (body) => {
  const domain = config.API_URL
  const path = '/calidad/atributos-calidad/createAtributosCalidadProducto.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
