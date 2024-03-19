import axios from 'axios'
import config from '../../../config'

export const getStockAlmacenVentas = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/almacen/stock-almacen/listAlmacenStockVentas.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
