import axios from 'axios'
import config from '../.././../config'

export const getRequisicionEmpaquetadoPromocional = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-empaquetado-promocional/listRequisicionEmpaquetadoPromocional.php'
  const url = domain + path
  const { data } = await axios.post(url,
    {
      ...body
    })
  return data
}
