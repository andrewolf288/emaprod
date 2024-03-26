import axios from 'axios'
import config from '../.././../config'

export const createIngresoAlmacenRequisicionSubproductoById = async (body) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-ingreso-subproducto/createIngresoAlmacenRequisicionSubproductoById.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
