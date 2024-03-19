import axios from 'axios'
import config from '../.././../config'

export const viewMaterialesRequisicionId = async (idReq) => {
  const domain = config.API_URL
  const path =
    '/almacen/requisicion-materiales/view_requisicion_materiales_detalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idReq
  })
  return data
}
