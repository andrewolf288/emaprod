import { createBrowserRouter } from 'react-router-dom'

// PAGES IMPORTADOS
import { Login } from './auth/pages/Login'
import Home from './home/pages/Home'

// ROUTERS IMPORTADOS
import { RouterAlmacen } from './almacen/router/router'
import { RouterCalidad } from './calidad/router/router'

import { RouterMolienda } from './molienda/router/router'
import { RouterSeleccion } from './seleccion/router/router'
import { RouterProduccion } from './produccion/router/router'
import { RouterFrescos } from './frescos/router/router'

// PLANTILLA NOT FOUND
import NotFound from './pages/NotFound'

// PROTECCION DE RUTAS PERSONALIZADAS
import { AuthLayout } from './components/AuthLayout'
import { ProtectedLayoutAlmacen } from './components/ProtectedLayoutAlmacen'
import { ProtectedLayoutCalidad } from './components/ProtectedLayoutCalidad'
import { ProtectedLayoutMolienda } from './components/ProtectedLayoutMolienda'
import { ProtectedLayoutSeleccion } from './components/ProtectedLayoutSeleccion'
import { ProtectedLayoutProduccion } from './components/ProtectedLayoutProduccion'
import { ProtectedLayoutFrescos } from './components/ProtectedLayoutFrescos'
import { RouterVentas } from './ventas/router/router'
import { ProtectedLayoutVentas } from './components/ProtectedLayoutVentas'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
        errorElement: <NotFound />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/almacen',
        element: <ProtectedLayoutAlmacen />,
        children: RouterAlmacen
      },
      {
        path: '/molienda',
        element: <ProtectedLayoutMolienda />,
        children: RouterMolienda
      },
      {
        path: '/seleccion',
        element: <ProtectedLayoutSeleccion />,
        children: RouterSeleccion
      },
      {
        path: '/produccion',
        element: <ProtectedLayoutProduccion />,
        children: RouterProduccion
      },
      {
        path: '/frescos',
        element: <ProtectedLayoutFrescos />,
        children: RouterFrescos
      },
      {
        path: '/calidad',
        element: <ProtectedLayoutCalidad />,
        children: RouterCalidad
      },
      {
        path: '/ventas',
        element: <ProtectedLayoutVentas />,
        children: RouterVentas
      }
    ]
  }
])
