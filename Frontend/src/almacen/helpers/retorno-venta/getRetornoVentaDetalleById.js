import axios from 'axios'
import config from '../.././../config'

export const getRetornoVentaDetalleById = async (body) => {
  const domain = config.API_URL
  const path = '/almacen/operacion-devolucion/view_operacion_devolucion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
