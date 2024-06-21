import { Navigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavCosteo from '../costeo/components/NavCosteo'

export const ProtectedLayoutCosteo = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth()
  const outlet = useOutlet()

  if (!user) {
    return <Navigate to={'/login'} />
  } else {
    return (
      <>
        <NavCosteo />
        <main>{outlet}</main>
        <footer></footer>
      </>
    )
  }
}
