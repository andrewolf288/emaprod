import axios from 'axios'
import config from '../.././../config'

export const getReporteEntradaSalidaStock = async (idProducto) => {
  const domain = config.API_URL
  const path = '/almacen/reportes/reporte-trazabilidad-entrada.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    producto: idProducto
  })
  return data
}
