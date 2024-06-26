import React from 'react'
import { Link } from 'react-router-dom'

export const ListReportesCalidad = () => {
  return (
    <div className="container">
      <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
        Reportes disponibles
      </h2>
      <section className="container px-lg-5 pt-4">
        <div className="row gx-lg-5">
          {/* REPORTE DE ENTRADAS POR PRODUCTO */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte entradas por producto</h2>
                <Link
                  to="/calidad/reportes-calidad/reporte-entrada"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          {/* CONTROL DE RECEPCIÓN DE MATERIAS PRIMAS */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte control en la recepción de materias primas (F05)</h2>
                <Link
                  to="/calidad/reportes-calidad/reporteF05"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          {/* REPORTE DE EVALUACIÓN DE MATERIA PRIMA */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte de evaluación de materia prima (F08)</h2>
                <Link
                  to="/calidad/reportes-calidad/reporteF08"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          {/* REPORTE DE EVALUACION DE EMPAQUES */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte de evaluación de empaques (F09)</h2>
                <Link
                  to="/calidad/reportes-calidad/reporteF09"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          {/* CONTROL DE VEHICULOS DE TRANSPORTE DE PRODUCTO TERMINADO */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte de vehiculos de transporte de producto terminado (F25)</h2>
                <Link
                  to="/calidad/reportes-calidad/reporteF25"
                  className="btn btn-primary"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
          {/* TRAZABILIDAD DE LOTES */}
          <div className="col-lg-6 col-xxl-4 mb-5">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="fs-4 fw-bold">Reporte de trazabilidad de lotes</h2>
                <Link
                  to="/calidad/reportes-calidad/reporte-trazabilidad-lote"
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
