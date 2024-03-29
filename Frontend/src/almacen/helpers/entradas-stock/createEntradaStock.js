import axios from 'axios'
import config from '../.././../config'

export const createEntradaStock = async (body, entradasParciales) => {
  const domain = config.API_URL
  const path = '/almacen/entradas_stock/create_entrada_stock2.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body,
    entradasParciales
  })
  return data
}
