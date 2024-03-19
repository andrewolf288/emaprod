import axios from 'axios'
import config from '../.././../config'

export const getSalidasLoteStockDisponibles = async (idProdt, detSal) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-facturacion/find_lote_produccion_by_producto.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idProdt,
    lotUsa: detSal
  })
  return data
}
