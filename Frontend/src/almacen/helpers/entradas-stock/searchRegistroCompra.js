import axios from 'axios'
import config from '../.././../config'

export const searchRegistroCompra = async (dataAux) => {
  const domain = config.API_URL
  const path = '/almacen/entradas_stock/search_orden_compra.php'
  const url = domain + path

  const { data } = await axios.post(url, dataAux)
  return data
}
