import axios from 'axios'
import config from '../.././../config'

export const getRetornoLoteStock = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/operacion-facturacion/find_lote_produccion_retorno_by_producto.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
