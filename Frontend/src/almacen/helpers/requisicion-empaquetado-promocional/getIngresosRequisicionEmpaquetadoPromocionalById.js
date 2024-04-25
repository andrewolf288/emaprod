// pendiente de implementacion
import axios from 'axios'
import config from '../.././../config'

export const getIngresosRequisicionEmpaquetadoPromocionalById = async (idReqEmpProm) => {
  const domain = config.API_URL
  const path = '/almacen/requisicion-empaquetado-promocional/viewIngresosRequisicionEmpaquetadoPromocional.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idReqEmpProm
  })
  return data
}
