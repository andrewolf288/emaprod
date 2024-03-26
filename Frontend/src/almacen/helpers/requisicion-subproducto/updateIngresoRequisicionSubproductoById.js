import axios from 'axios'
import config from '../.././../config'

export const updateIngresoRequisicionSubproductoById = async (
  body,
  inputNew
) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-ingreso-subproducto/updateIngresoRequisicionSubproductoById.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body,
    canReqIngDetNew: inputNew
  })
  return data
}
