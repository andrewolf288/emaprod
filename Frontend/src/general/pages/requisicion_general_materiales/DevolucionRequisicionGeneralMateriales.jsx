import React from 'react'
import { useDevolucionRequisicionGeneralMateriales } from '../../hooks/requisicion-general-materiales/useDevolucionRequisicionGeneralMateriales'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const DevolucionRequisicionGeneralMateriales = () => {
  const { requisicionMaterial, handleCreateDevolucionRequisicionMateriales } = useDevolucionRequisicionGeneralMateriales()

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Detalle requisicion materiales</h1>
        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisicion: <strong>{requisicionMaterial.codReqMat}</strong></h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Área</b>
                  </label>
                  <input
                    type="text"
                    name="desAre"
                    value={requisicionMaterial.desAre}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado requisición</b>
                  </label>
                  <input
                    type="text"
                    name="desReqEst"
                    value={requisicionMaterial.desReqEst}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo Requisición</b>
                  </label>
                  <input
                    type="text"
                    name="desMotReqMat"
                    value={requisicionMaterial.desMotReqMat}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha requisición</b>
                  </label>
                  <input
                    type="text"
                    name="fecCreReqMat"
                    value={requisicionMaterial.fecCreReqMat}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="nombre" className="form-label">
                  <b>Nota requisición</b>
                </label>
                <textarea className="form-control"
                  name="notReqMat"
                  rows="2"
                  disabled
                  readOnly
                  value={requisicionMaterial.notReqMat}>
                </textarea>
              </div>
            </div>
          </div>
        </div>
        {/* DETALLE DE REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
            Detalle de la requisicion
            </h6>

          </div>
        </div>
        {/* ACTIONS */}
        < CustomActionsView
          onSaveOperation={handleCreateDevolucionRequisicionMateriales}
        />
      </div>
    </>
  )
}
