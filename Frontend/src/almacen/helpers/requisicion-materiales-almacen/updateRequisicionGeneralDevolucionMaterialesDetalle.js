import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionGeneralDevolucionMaterialesDetalle = async (detalle, canReqDevMatDet) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/updateRequisicionDevolucionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...detalle,
    canReqDevMatDet
  })
  return data
}
