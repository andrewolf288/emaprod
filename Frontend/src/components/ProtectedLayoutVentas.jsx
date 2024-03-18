import { Navigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavVentas from '../ventas/components/NavVentas'

export const ProtectedLayoutVentas = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth()
  const outlet = useOutlet()

  if (!user) {
    return <Navigate to={'/login'} />
  } else {
    return (
      <>
        <NavVentas />
        <main>{outlet}</main>
        <footer></footer>
      </>
    )
  }
}
