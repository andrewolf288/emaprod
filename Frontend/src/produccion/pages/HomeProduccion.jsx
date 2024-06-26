import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const HomeProduccion = () => {
  // controlar la visualizacion de componentes
  const [show, setShow] = useState(false)

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
      <div className="container">
        <h2 className="mt-4 p-2 bg-success-subtle text-emphasis-success">
          Acciones Frecuentes
        </h2>
        <section className="pt-4">
          <div className="container px-lg-5">
            <div className="row gx-lg-5">
              {/* PRODUCCION LOTE */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Orden de Producción</h2>
                    <Link
                      to="/produccion/produccion-lote"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* FORMULAS */}
              {show && (
                <div className="col-lg-6 col-xxl-4 mb-5">
                  <div className="card bg-light border-0 h-100">
                    <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                        <i className="bi bi-collection"></i>
                      </div>
                      <h2 className="fs-4 fw-bold">Receta SubProductos</h2>
                      <Link
                        to="/produccion/formula"
                        className="btn btn-primary"
                      >
                        Ingresar
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {/* FORMULA POR PRODUCTO */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Fórmula Presentaciones</h2>
                    <Link
                      to="/produccion/formula-producto"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION MATERIALES */}
              {/* <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisicion materiales</h2>
                    <Link
                      to="/produccion/requisicion-materiales"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div> */}
              {/* REQUISICION TRANSFORMACION */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisicion transformacion</h2>
                    <Link
                      to="/produccion/requisicion-transformacion"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION REPROCESO */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisicion reproceso</h2>
                    <Link
                      to="/produccion/requisicion-reproceso"
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
                      to="/produccion/requisicion-general"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION SUBPRODUCTO */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisicion subproducto</h2>
                    <Link
                      to="/produccion/requisicion-subproducto"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* FORMULA EMPAQUETADO PROMOCIONAL */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Fórmula empaquetado promocional</h2>
                    <Link
                      to="/produccion/formula-empaquetado-promocional"
                      className="btn btn-primary"
                    >
                      Ingresar
                    </Link>
                  </div>
                </div>
              </div>
              {/* REQUISICION EMPAQUETADO PROMOCIONAL */}
              <div className="col-lg-6 col-xxl-4 mb-5">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="fs-4 fw-bold">Requisición empaquetado promocional</h2>
                    <Link
                      to="/produccion/requisicion-empaquetado-promocional"
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
