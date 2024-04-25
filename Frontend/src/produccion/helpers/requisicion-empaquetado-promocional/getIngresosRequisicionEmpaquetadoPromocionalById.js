// pendiente de implementacion
import axios from 'axios'
import config from '../.././../config'

export const getIngresosRequisicionEmpaquetadoPromocionalById = async (idReqEmpProm) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-empaquetado-promocional/getIngresoRequisicionEmpaquetadoPromocional.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idReqEmpProm
  })
  return data
}
