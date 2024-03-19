import axios from 'axios'
import config from './../../config'

export const consultUser = async (body) => {
  const domain = config.API_URL
  const path = '/auth/login/consult_user.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })

  return data
}
