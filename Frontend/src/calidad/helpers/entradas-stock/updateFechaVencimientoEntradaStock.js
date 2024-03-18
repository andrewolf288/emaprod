import axios from 'axios'
import config from '../../../config'

export const updateFechaVencimientoEntradaStock = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/calidad/entradas_stock/update_fecha_vencimiento_entrada_stock.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
