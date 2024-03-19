import axios from 'axios'
import config from '../.././../config'

export const getReporteStockTotal = async (idProducto) => {
  const domain = config.API_URL
  const path = '/almacen/reportes/reporte-stock-total.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    producto: idProducto
  })
  return data
}
