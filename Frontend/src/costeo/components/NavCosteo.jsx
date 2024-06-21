import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo-oficial.png'
import { useAuth } from '../../hooks/useAuth'

const NavCosteo = () => {
  const { logout } = useAuth()
  const logoutUser = () => {
    // cerramos sesion
    logout()
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to={'/costeo'}>
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

export default NavCosteo
