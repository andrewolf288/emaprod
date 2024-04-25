import axios from 'axios'
import config from '../.././../config'

export const createSalidaRequisicionEmpaquetadoPromocional = async (
  body
) => {
  const domain = config.API_URL
  const path = '/almacen/requisicion-empaquetado-promocional/createSalidaRequisicionEmpaquetadoPromocional.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
