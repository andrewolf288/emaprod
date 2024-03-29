import axios from 'axios'
import config from '../../../config'

export const getProductoWithAtributosCalidad = async () => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/calidad/atributos-calidad/listProductosWithAtributosCalidad.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data
}
