import axios from 'axios'
import config from '../.././../config'

export const createRequisicionEmpaquetadoPromocional = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-empaquetado-promocional/createRequisicionEmpaquetadoPromocional.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
