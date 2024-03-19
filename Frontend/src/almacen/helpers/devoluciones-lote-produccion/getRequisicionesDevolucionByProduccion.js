import axios from 'axios'
import config from '../.././../config'

export const getRequisicionesDevolucionByProduccion = async (idProdc) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-devoluciones/getRequisicionDevolucionesById.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    id: idProdc
  })
  return data
}
