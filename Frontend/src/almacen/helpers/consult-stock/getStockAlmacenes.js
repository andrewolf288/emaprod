import axios from 'axios'
import config from '../../../config'

export const getStockAlmacenes = async (idProd) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/almacen/consult-stock/getStockAlmacen.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idProd
  })
  return data
}
