import React from 'react'
import { useIngresarRequisicionSubproducto } from '../../hooks/requisicion-subproducto/useIngresarRequisicionSubproducto'

export const IngresarRequisicionSubproducto = () => {
  const { requisicionSubproducto } = useIngresarRequisicionSubproducto()

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Ingreso subproducto</h1>
        {/* DATOS DE REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de Requisición</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Número de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={requisicionSubproducto.codLotProd}
                    className="form-control"
                  />
                </div>

                {/* PRODUCTO */}
                <div className="col-md-6 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={requisicionSubproducto.nomProd}
                    className="form-control"
                  />
                </div>

                {/* KILOGRAMOS DE LOTE */}

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso programado</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={requisicionSubproducto.canLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* INGRESO DE PRODUCTOS INTERMEDIOS */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de ingresos</h6>
            <div className="card-body">

            </div>
          </div>
        </div>
        {/* REALIZAR INGESO DE PRODUCTO INTERMEDIO */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Realizar ingreso de subproducto</h6>
            <div className="card-body">

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
