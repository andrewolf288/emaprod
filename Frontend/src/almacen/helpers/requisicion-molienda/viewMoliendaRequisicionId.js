import axios from 'axios'
import config from '../.././../config'

export const viewMoliendaRequisicionId = async (idReq) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-molienda/view_molienda_lote_with_requisiciones.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idReq
  })
  return data
}
