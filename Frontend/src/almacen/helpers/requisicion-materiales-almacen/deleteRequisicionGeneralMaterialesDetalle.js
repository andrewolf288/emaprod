import axios from 'axios'
import config from '../.././../config'

export const deleteRequisicionGeneralMaterialesDetalle = async (detalle) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/deleteRequisicionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...detalle
  })
  return data
}
