import React from 'react'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { useIngresoAlmacenRequisicionSubproducto } from '../../hooks/requisicion-molienda/useIngresoAlmacenRequisicionSubproducto'
import { CardRequisicionIngresoProductos } from '../../components/componentes-productos-lote/CardRequisicionIngresoProductos'

export const AgregarSubProducto = () => {
  const {
    requisicionSubproducto,
    onCheckDetalleRequisicionIngresoProducto,
    onDeleteDetalleRequisicionAgregacion,
    onUpdateDetalleRequisicionAgregacion
  } = useIngresoAlmacenRequisicionSubproducto()
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
                    <strong>Número de Lote</strong>
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
                    <strong>Producto</strong>
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
                    <strong>Peso programado</strong>
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
              {requisicionSubproducto.detIng.map((element) => (
                <CardRequisicionIngresoProductos
                  key={element.id}
                  requisicion={element}
                  onCheckRequisicionAgrgeacionDetalle={onCheckDetalleRequisicionIngresoProducto}
                  onDeleteRequisicionAgregacionDetalle={onDeleteDetalleRequisicionAgregacion}
                  onUpdateRequisicionAgregacionDetalle={onUpdateDetalleRequisicionAgregacion}
                />
              ))}
            </div>
          </div>
        </div>
        {/* ACCIONES DE BOTONES */}
        < CustomActionsView
          onShowCreateButton={false}
        />
      </div>
    </>
  )
}
