// pendiente de implementacion
import axios from 'axios'
import config from '../.././../config'

export const createEntradaRequisicionGeneralMaterialesDetalle = async (body) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/crearEntradaRequisicionGeneralMaterialesDetalle.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
