import axios from 'axios'
import config from '../.././../config'

export const deleteRequisicionIngresoProductoDetalleById = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-ingreso-producto/deleteRequisicionIngresoProducto.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
