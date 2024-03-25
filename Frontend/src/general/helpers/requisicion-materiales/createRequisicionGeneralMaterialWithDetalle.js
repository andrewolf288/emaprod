import axios from 'axios'
import config from '../.././../config'

export const createRequisicionGeneralMaterialWithDetalle = async (body) => {
  const domain = config.API_URL
  const path =
    '/general/requisicion-materiales/createRequisicionGeneralMateriales.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
