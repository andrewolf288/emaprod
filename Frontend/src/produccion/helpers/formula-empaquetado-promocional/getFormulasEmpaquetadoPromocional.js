import axios from 'axios'
import config from '../.././../config'

export const getFormulasEmpaquetadoPromocional = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/formula-empaquetado-promocional/listFormulaEmpaquetadoPromocional.php'
  const url = domain + path
  const { data } = await axios.post(url,
    {
      ...body
    })
  return data
}
