import axios from 'axios'
import config from '../.././../config'

export const createRetornoLoteStockByDetalle = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-devolucion/crear_operacion_devolucion_detalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
