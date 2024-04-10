import axios from 'axios'
import config from '../.././../config'

export const deleteRequisicionGeneralDevolucionMaterialesDetalle = async (detalle) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/deleteRequisicionDevolucionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...detalle
  })
  return data
}
