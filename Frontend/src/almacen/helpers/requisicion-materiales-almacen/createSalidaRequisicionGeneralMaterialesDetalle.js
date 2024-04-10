import axios from 'axios'
import config from '../.././../config'

export const createSalidaRequisicionGeneralMaterialesDetalle = async (body) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/crearSalidaRequisicionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
