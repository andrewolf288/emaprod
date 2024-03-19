import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionDevolucionDetalleById = async (
  body,
  inputNew
) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-devoluciones/updateRequisicionDevolucionDetalle.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body,
    canReqDevDetNew: inputNew
  })
  return data
}
