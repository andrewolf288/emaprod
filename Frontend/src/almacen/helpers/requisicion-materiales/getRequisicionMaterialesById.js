import axios from 'axios'
import config from '../.././../config'

export const getRequisicionMaterialesWithDetalle = async () => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/almacen/requisicion-materiales/list_requisicion_materiales_detalle.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idAre: 4
  })

  return data
}
