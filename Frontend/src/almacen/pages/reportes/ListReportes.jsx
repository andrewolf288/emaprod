import React from 'react'
import { Link } from 'react-router-dom'

export const ListReportes = () => {
  return (
    <div className="container">
      <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
        Reportes disponibles
      </h2>
      <section className="container px-lg-5 pt-4">
        <div className="row gx-lg-5">
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">
                  Reporte trazabilidad entrada stock
                </h2>
                <Link
                  to="/almacen/reportes-almacen/reporte-entrada-salida-stock"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte de stock total</h2>
                <Link
                  to="/almacen/reportes-almacen/reporte-stock-total"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">
                  Reporte productos finales con lotes
                </h2>
                <Link
                  to="/almacen/reportes-almacen/reporte-producto-final-lotes"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte mermas de entradas</h2>
                <Link
                  to="/almacen/reportes-almacen/reporte-entrada-merma"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">
                  Reporte trazabilidad salida producto final
                </h2>
                <Link
                  to="/almacen/reportes-almacen/reporte-producto-final-stock"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
