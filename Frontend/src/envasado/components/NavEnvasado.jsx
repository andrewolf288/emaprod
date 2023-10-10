import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-oficial.png";
import { useAuth } from "../../hooks/useAuth";

const NavEnvasado = () => {
  const { logout } = useAuth();
  const logoutUser = () => {
    // cerramos sesion
    logout();
  };
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to={"/envasado"}>
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
              {/* REQUISICIONES */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Requisiciones
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={"/envasado/requisicion"}
                    >
                      Administrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={"/envasado/requisicion/crear"}
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
  );
};

export default NavEnvasado;
