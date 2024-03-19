import axios from 'axios'
import config from '../.././../config'

export const getSalidasVenta = async (body) => {
  const domain = config.API_URL
  const path = '/almacen/operacion-facturacion/list_operacion_facturacion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body,
    esEnt: 0,
    esSal: 1
  })
  return data
}
