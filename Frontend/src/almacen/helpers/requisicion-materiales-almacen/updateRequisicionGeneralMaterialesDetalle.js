import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionGeneralMaterialesDetalle = async (detalle, canReqMatDet) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/updateRequisicionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...detalle,
    canReqMatDet
  })
  return data
}
