import axios from 'axios'
import config from '../../../config'

export const getEntradasParciales = async (idProd, ordCom) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/almacen/entradas_stock/get_entradas_parciales.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idProd,
    ordCom
  })
  return data
}
