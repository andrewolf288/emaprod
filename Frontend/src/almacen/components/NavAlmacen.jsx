import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo-oficial.png'
import { useAuth } from '../../hooks/useAuth'

const NavAlmacen = () => {
  const { logout } = useAuth()
  const logoutUser = () => {
    // cerramos sesion
    logout()
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to={'/almacen'}>
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
              {/* PRODUCCION */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Lote produccion
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/lote-produccion'}
                    >
                      Ordenes produccion
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/produccion-agregaciones'}
                    >
                      Agregaciones
                    </Link>
                  </li>
                </ul>
              </li>
              {/* ENTRADAS STOCK */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Entradas Stock
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/entradas-stock'}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        window.open('/almacen/entradas-stock/crear', '_blank')
                      }}
                    >
                      Crear
                    </div>
                  </li>
                </ul>
              </li>
              {/* REQUISICION SELECCION */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Requisicion seleccion
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/requisicion-seleccion'}
                    >
                      Administrar
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      className="dropdown-item"
                      to={"/almacen/entradas-stock/crear"}
                    >
                      Crear
                    </Link>
                  </li> */}
                </ul>
              </li>
              {/* REQUISICION MOLIENDA */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Requisicion molienda
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/requisicion-molienda'}
                    >
                      Administrar
                    </Link>
                  </li>
                </ul>
              </li>

              {/* REQUISICION FRESCOS */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Requisicion frescos
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={'/almacen/requisicion-frescos'}
                    >
                      Administrar
                    </Link>
                  </li>
                </ul>
              </li>
              {/* MATERIAS PRIMAS */}
              {/* <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Materia Prima
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={"/almacen/materia-prima"}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={"/almacen/materia-prima/crear"}
                    >
                      Crear
                    </Link>
                  </li>
                </ul>
              </li> */}

              {/* PROVEEDORES */}
              {/* <li className="nav-item dropdown">
                <button
                  className="btn btn-lg dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Proveedor
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to={"/almacen/proveedor"}>
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={"/almacen/proveedor/crear"}
                    >
                      Crear
                    </Link>
                  </li>
                </ul>
              </li> */}
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

export default NavAlmacen
