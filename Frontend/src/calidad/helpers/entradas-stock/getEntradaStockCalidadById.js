import axios from 'axios'
import config from '../../../config'

export const getEntradaStockCalidadById = async (idEntSto) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/calidad/entradas_stock/get_entrada_stock_calidad_byId.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    id: idEntSto
  })
  return data
}
