import React from 'react'

export const EncabezadoInformacionProduccion = ({ datosProduccion }) => {
  const {
    numop, // numero de orden de produccion
    canLotProd, // cantidad de produccion
    codLotProd, // codigo de produccion
    desEstPro, // descripcion de estado de produccion
    desProdTip, // descripcion dle tipo de produccion
    fecVenLotProd, // fecha vencimiento de produccion
    klgLotProd, // peso de la produccion
    nomProd // nombre de producto intermedio
  } = datosProduccion

  return (
    <div className="card d-flex">
      <h6 className="card-header">
        <b> Datos de produccion</b>
      </h6>
      <div className="card-body">
        <div className="mb-3 row">
          {/* NUMERO DE LOTE */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Numero de Lote</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={codLotProd}
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Numero OP</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={numop}
              className="form-control"
            />
          </div>

          {/* PRODUCTO */}
          <div className="col-md-4 me-4">
            <label htmlFor="nombre" className="form-label">
              <b>Producto</b>
            </label>
            <input
              disabled={true}
              type="text"
              value={nomProd}
              className="form-control"
            />
          </div>
          {/* KILOGRAMOS DE LOTE */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Peso de Lote</b>
            </label>
            <input
              type="number"
              disabled={true}
              value={klgLotProd}
              className="form-control"
            />
          </div>
          {/* CANTIDAD DE LOTE */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Cantidad</b>
            </label>
            <input
              type="number"
              disabled={true}
              value={canLotProd}
              className="form-control"
            />
          </div>
        </div>
        <div className="mb-3 row d-flex align-items-center">
          {/* TIPO DE PRODUCCION */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Tipo de produccion</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={desProdTip}
              className="form-control"
            />
          </div>
          {/* ESTADO DE PRODUCCION */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Estado de produccion</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={desEstPro}
              className="form-control"
            />
          </div>
          {/* FECHA DE VENCIMIENTO */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Fecha vencimiento lote</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={fecVenLotProd}
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
