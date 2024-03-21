import axios from 'axios'
import config from '../.././../config'

export const getRequisicionGeneralMaterialesByArea = async (body) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/listRequisicionGeneralMaterialesByArea.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
