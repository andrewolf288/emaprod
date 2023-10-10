import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-oficial.png";

const Home = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container px-lg-5">
          <div className="container-fluid">
            <Link className="navbar-brand" to={""}>
              <img
                src={logo}
                alt="Logo"
                width="70"
                height="60"
                className="d-inline-block align-text-top"
              />
            </Link>
          </div>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" aria-current="page" to={"/login"}>
                  Ingresar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={""}>
                  Contactos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="py-5">
        <div className="container px-lg-5">
          <div className="p-4 p-lg-5 bg-light rounded-3 text-center">
            <div className="m-4 m-lg-5">
              <h1 className="display-5 fw-bold">Emaran Produccion</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-4">
        <div className="container px-lg-5">
          <div className="row gx-lg-5">
            {/* MODULO DE ALMACEN */}
            <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Almacen</h2>
                  <Link to="almacen" className="btn btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div>
            {/* MODULO DE MOLIENDA */}
            {/* <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Molienda</h2>
                  <Link to="molienda" className="btn btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div> */}
            {/* MODULO DE FRESCOS */}
            {/* <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Frescos</h2>
                  <Link to="molienda" className="btn btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div> */}
            {/* MODULO DE SELECCION */}
            <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Seleccion</h2>
                  <Link to="seleccion" className="btn  btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div>
            {/* MODULO DE PRODUCCION */}
            <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Produccion</h2>
                  <Link to="produccion" className="btn  btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div>
            {/* MODULO DE ENVASADO */}
            {/* <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Envasado</h2>
                  <Link to="produccion" className="btn  btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div> */}
            {/* MODULO DE ENCAJADO */}
            {/* <div className="col-lg-6 col-xxl-4 mb-5">
              <div className="card bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                    <i className="bi bi-collection"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Encajonado</h2>
                  <Link to="produccion" className="btn  btn-primary">
                    Ingresar
                  </Link>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
