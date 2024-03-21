import axios from 'axios'
import config from '../../../config'

export const getMotivoRequisicionMateriales = async () => {
  const domain = config.API_URL
  const path =
    '/referenciales/motivo_requisicion_materiales/list_motivo_requisicion_materiales.php'
  const url = domain + path

  const { data } = await axios.post(url)
  return data.result
}
