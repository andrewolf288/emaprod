// pendiente de implementacion
import axios from 'axios'
import config from '../.././../config'

export const listRequisicionEmpaquetadoPromocional = async (body) => {
  const domain = config.API_URL
  const path = '/almacen/requisicion-empaquetado-promocional/lisRequisicionesEmpaquetadoPromocional.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
