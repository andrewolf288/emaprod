import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo-oficial.png'
import { useAuth } from '../../hooks/useAuth'

const NavProduccion = () => {
  // controlar la visualizacion de componentes
  const [show, setShow] = useState(false)
  // logout
  const { logout } = useAuth()
  const logoutUser = () => {
    logout()
  }

  // verificamos si el usuario tiene acceso a las formulas
  const verifyAdminUser = () => {
    const { idRolUsu } = JSON.parse(localStorage.getItem('user'))
    // si es un usuario administrador
    if (idRolUsu === 1) {
      setShow(true)
    }
  }

  useEffect(() => {
    verifyAdminUser()
  }, [])

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to={'/produccion'}>
            <img
              src={logo}
              alt="Logo"
              width="70"
              height="60"
              className="d-inline-block align-text-top"
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* LOTE PRODUCCION */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Orden produccion de proceso
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/produccion-lote'}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/produccion-lote/crear'}
                    >
                      Crear
                    </Link>
                  </li>
                </ul>
              </li>

              {/* REQUISICIONES MATERIALES */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Requisiciones generales
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/requisicion-general'}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/requisicion-general/crear'}
                    >
                      Crear
                    </Link>
                  </li>
                </ul>
              </li>
              {/* FORMULAS */}
              {show && (
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-lg dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Receta subproducto
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className="dropdown-item"
                        to={'/produccion/formula'}
                      >
                        Administrar
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to={'/produccion/formula/crear'}
                      >
                        Crear
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
              {/* FORMULA POR PRODUCTO */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Formula presentaciones
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/formula-producto'}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/produccion/formula-producto/crear'}
                    >
                      Crear
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            <ul className="navbar-nav d-none d-lg-flex ml-2 order-3">
              <li className="nav-item">
                <button onClick={logoutUser} className="nav-link">
                  Cerrar Sesion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavProduccion
