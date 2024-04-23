import axios from 'axios'
import config from '../.././../config'

export const createFormulaEmpaquetadoPromocional = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/formula-empaquetado-promocional/createFormulaEmpaquetadoPromocional.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
