import React from 'react'
import { Link } from 'react-router-dom'

const HomeAlmacen = () => {
  return (
    <>
      <div className="container">
        <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
          Acciones Frecuentes
        </h2>
        <section className="pt-4">
          <div className="container px-lg-5">
            <div className="row gx-lg-5">
              {/* REQUISICIONES SELECCION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisiciones Selección</h2>
                    <Link
                      to="/almacen/requisicion-seleccion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ENTRADAS DE STOCK */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Entradas stock</h2>
                    <Link
                      to="/almacen/entradas-stock"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* LOTE PRODUCCION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Lote producción</h2>
                    <Link
                      to="/almacen/lote-produccion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* STOCK ALMACENES */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Stock almacenes</h2>
                    <Link
                      to="/almacen/stock-almacen"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ORDEN DE IRRADIACION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Orden irradiación</h2>
                    <Link
                      to="/almacen/orden-irradiacion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ORDEN DE TRANSFORMACION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Orden transformación</h2>
                    <Link
                      to="/almacen/orden-transformacion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ORDEN DE REPROCESO */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Orden reproceso</h2>
                    <Link
                      to="/almacen/orden-reproceso"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION MATERIALES */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Atención requisición general</h2>
                    <Link
                      to="/almacen/atencion-requisicion-general"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REPORTES */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Reportes</h2>
                    <Link
                      to="/almacen/reportes-almacen"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* SALIDAS VENTAS */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Salida ventas</h2>
                    <Link
                      to="/almacen/salida-venta"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ENTRADAS VENTAS */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Retorno ventas</h2>
                    <Link
                      to="/almacen/retorno-venta"
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
                    <h2 className="fs-4 fw-bold">Requisicion general</h2>
                    <Link
                      to="/almacen/requisicion-general"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* TRANSFERENCIA ENTRE ALMACENES */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Transferencia entre almacenes</h2>
                    <Link
                      to="/almacen/transferencia-almacen"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION EMPAQUETADOR PROMOCIONAL */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisición empaquetado promocional</h2>
                    <Link
                      to="/almacen/requisicion-empaquetado-promocional"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* ENCUADRE DE STOCK */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Encuadre stock</h2>
                    <Link
                      to="/almacen/encuadre-stock"
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

export default HomeAlmacen
