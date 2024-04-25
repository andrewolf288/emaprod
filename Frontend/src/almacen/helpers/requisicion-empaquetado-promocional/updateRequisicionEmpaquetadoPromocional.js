import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionEmpaquetadoPromocional = async (body, inputValue) => {
  const domain = config.API_URL
  const path = '/almacen/requisicion-empaquetado-promocional/updateRequisicionEmpaquetadoPromocional.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body,
    canReqEmpPromDetNew: inputValue
  })
  return data
}
