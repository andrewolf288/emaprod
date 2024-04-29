import { useState } from 'react'
import axios from 'axios'
import config from '../config'

const useAxiosWithLoading = () => {
  const [loading, setLoading] = useState(false)

  const DOMAIN = config.API_URL
  const axiosInstance = axios.create({
    baseURL: DOMAIN
  })

  // Usamos un interceptor para las solicitudes
  axiosInstance.interceptors.request.use(
    (config) => {
      setLoading(true) // Activamos el loading antes de enviar la solicitud
      return config
    },
    (error) => {
      setLoading(false) // En caso de error, desactivamos el loading
      return Promise.reject(error)
    }
  )

  // Usamos un interceptor para las respuestas
  axiosInstance.interceptors.response.use(
    (response) => {
      setLoading(false) // Desactivamos el loading después de recibir la respuesta
      return response
    },
    (error) => {
      setLoading(false) // En caso de error, desactivamos el loading
      return Promise.reject(error)
    }
  )

  return { axiosInstance, loading }
}

export default useAxiosWithLoading
