import axios from 'axios'
import config from '../.././../config'

export const getFormulaEmpaquetadoPromocionalByProducto = async (idProdt) => {
  const domain = config.API_URL
  const path = '/produccion/formula-empaquetado-promocional/getFormulaEmpaquetadoPromocionalByProducto.php'
  const url = domain + path
  const { data } = await axios.post(url,
    {
      idProdt
    })
  return data
}
