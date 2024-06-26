import axios from 'axios'
import config from '../.././../config'

export const getRequisicionGeneralMaterialById = async (idReqMat) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/viewDevolucionRequisicionGeneralMateriales.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idReqMat
  })
  return data
}
