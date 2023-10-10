import React from "react";
import { Link } from "react-router-dom";

export const ListReportes = () => {
  return (
    <>
      <div className="container">
        <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
          Resportes disponibles
        </h2>
        <section className="pt-4">
          <div className="container px-lg-5">
            <div className="row gx-lg-5">
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Reporte de entradas stock</h2>
                    <Link
                      to="/almacen/reportes/entradas-stock"
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
                      Reporte de salidas molienda
                    </h2>
                    <Link
                      to="/almacen/reportes/salidas-molienda"
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
                      Reporte de movimientos seleccion
                    </h2>
                    <Link
                      to="/almacen/reportes/movimientos-seleccion"
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
  );
};
