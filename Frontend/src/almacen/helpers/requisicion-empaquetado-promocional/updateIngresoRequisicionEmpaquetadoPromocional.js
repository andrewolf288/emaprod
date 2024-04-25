import axios from 'axios'
import config from '../.././../config'

export const updateIngresoRequisicionEmpaquetadoPromocional = async (body, inputValue) => {
  const domain = config.API_URL
  const path = '/almacen/requisicion-empaquetado-promocional/updateIngresoRequisicionEmpaquetadoPromocional.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body,
    canProdIngNew: inputValue
  })
  return data
}
