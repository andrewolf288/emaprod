import React from 'react'
import { Link } from 'react-router-dom'

const HomeCalidad = () => {
  return (
    <>
      <div className="container">
        <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
          Acciones Frecuentes
        </h2>
        <section className="pt-4">
          <div className="container px-lg-5">
            <div className="row gx-lg-5">
              {/* ENTRADAS DE STOCK CALIDAD */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Entradas stock</h2>
                    <Link
                      to="/calidad/entradas-stock"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REPORTES DE CALIDAD */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Reportes calidad</h2>
                    <Link
                      to="/calidad/reportes-calidad"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* OPERACION DE DEVOLUCION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Operación devolución</h2>
                    <Link
                      to="/calidad/operacion-devolucion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION GENERAL */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisición general</h2>
                    <Link
                      to="/calidad/requisicion-general"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REPROCESO MASIVO */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Operacion reproceso masivo</h2>
                    <Link
                      to="/calidad/requisicion-devolucion-masiva"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomeCalidad
