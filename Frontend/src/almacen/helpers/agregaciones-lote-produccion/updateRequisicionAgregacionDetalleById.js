import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionAgregacionDetalleById = async (
  body,
  inputNew
) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-agregaciones/updateRequisicionAgregacionDetalle.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body,
    canReqAgrDetNew: inputNew
  })
  return data
}
