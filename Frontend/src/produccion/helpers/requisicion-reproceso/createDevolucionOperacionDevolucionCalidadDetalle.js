import axios from 'axios'
import config from '../.././../config'

export const createDevolucionOperacionDevolucionCalidadDetalle = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-reproceso/createDevolucionRequisicionDevolucion.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
