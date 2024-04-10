import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { RowRequisicionMaterialesDetalleAlmacen } from '../../components/componentes-requisicion-materiales-almacen/RowRequisicionMaterialesDetalleAlmacen'
import { useRequisicionMaterialesAtencionRequisicion } from '../../hooks/requisicion-materiales/useRequisicionMaterialesAtencionRequisicion'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'

export const ViewRequisicionMaterialesAlmacen = () => {
  const {
    requisicionMateriales,
    navigate,
    idReqMat,
    loading,
    crearSalidaRequisicionMateriales,
    editarRequisicionMaterialesDetalle,
    eliminarRequisicionMaterialesDetalle
  } = useRequisicionMaterialesAtencionRequisicion()

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Detalle requisicion materiales</h1>
        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          {/* Acciones */}
          <div className="card d-flex mb-4">
            <div className="card-body align-self-center">
              <div
                onClick={() => {
                  navigate(
                    `/almacen/requisicion-materiales/atender-devolucion/${idReqMat}`
                  )
                }}
                className="btn btn-warning ms-3"
              >
                Requisiciones de devolucion
              </div>
            </div>
          </div>
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisicion: <strong>{requisicionMateriales.codReqMat}</strong></h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Área</b>
                  </label>
                  <input
                    type="text"
                    name="desAre"
                    value={requisicionMateriales.desAre}
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
                    value={requisicionMateriales.desReqEst}
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
                    value={requisicionMateriales.desMotReqMat}
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
                    value={requisicionMateriales.fecCreReqMat}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="nombre" className="form-label">
                  <b>Nota requisición</b>
                </label>
                <textarea className="form-control" name="notReqMat" rows="2" disabled readOnly value={requisicionMateriales.notReqMat}></textarea>
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
            <div className="card-body">
              <Paper>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            color: 'rgba(96, 96, 96)',
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Estado</b>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <b>U.M</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Can. Requisicion</b>
                        </TableCell>
                        <TableCell align="center" width={180}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        requisicionMateriales.detReq.map((element) => (
                          <RowRequisicionMaterialesDetalleAlmacen
                            key={element.id}
                            detalle={element}
                            onCreateSalida={crearSalidaRequisicionMateriales}
                            onUpdateDetalleRequisicion={editarRequisicionMaterialesDetalle}
                            onDeleteDetalleRequisicion={eliminarRequisicionMaterialesDetalle}
                          />
                        ))
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
        {/* LOADING */}
        <CustomLoading open={loading}/>
        {/* ACCIONES */}
        < CustomActionsView
          onShowCreateButton={false}
        />
      </div>
    </>
  )
}
