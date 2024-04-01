import React from 'react'
import { useDevolucionRequisicionGeneralMateriales } from '../../hooks/requisicion-general-materiales/useDevolucionRequisicionGeneralMateriales'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { FilterProductosProgramados } from '../../../components/ReferencialesFilters/Producto/FilterProductosProgramados'
import { RowDevolucionLoteProduccionEdit } from '../../../almacen/pages/devoluciones/RowDevolucionLoteProduccionEdit'
import { RowDetalleDevolucionRequisicionMateriales } from '../../components/requisicion-materiales/RowDetalleDevolucionRequisicionMateriales'

export const DevolucionRequisicionGeneralMateriales = () => {
  const {
    requisicionMaterial,
    handleCreateDevolucionRequisicionMateriales,
    productosDevolucion,
    handleChangeProductoDevolucion,
    handleAddProductoDevuelto,
    detalleDevolucion,
    handleEditMotivoRequisicionDevolucion,
    handleDeleteRequisicionDevolucion,
    generatePDF
  } = useDevolucionRequisicionGeneralMateriales()

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
            Devoluciones registradas
            </h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* <Paper> */}
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
                        <TableCell align="left" width={70}>
                          <b>Correlativo</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Fecha requerimiento</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Fecha cumplimiento</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Estado</b>
                        </TableCell>
                        <TableCell align="left" width={80}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requisicionMaterial.detDev.map((row, i) => (
                        <RowDetalleDevolucionRequisicionMateriales
                          key={row.id}
                          detalle={row}
                          onRenderPDF={generatePDF}
                          index={i}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* </Paper> */}
              </div>
            </div>

          </div>
        </div>
        {/* DETALLE DE REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
            Detalle de devoluciones
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">Presentación final</label>
                  <FilterProductosProgramados
                    defaultValue={productosDevolucion.idProdtDev}
                    onNewInput={handleChangeProductoDevolucion}
                    products={requisicionMaterial.detReq}
                  />
                </div>

                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS */}
                <div className="col-md-3 d-flex flex-column">
                  <label className="form-label">Cantidad</label>
                  <div className="d-flex">
                    <TextField
                      type="number"
                      autoComplete="off"
                      size="small"
                      disabled
                      value={productosDevolucion.cantDev}
                    />
                  </div>
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoDevuelto}
                    className="btn btn-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus-circle-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
                    Agregar
                  </button>
                </div>
              </form>
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
                          <b>Presentación final</b>
                        </TableCell>
                        <TableCell align="left" width={50}>
                          <b>Medida</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Recomendado</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Total</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleDevolucion.length !== 0 &&
                          detalleDevolucion.map((detalle, index) => (
                            <RowDevolucionLoteProduccionEdit
                              key={index}
                              detalle={detalle}
                              onChangeInputDetalle={handleEditMotivoRequisicionDevolucion}
                              onDeleteItemDetalle={handleDeleteRequisicionDevolucion}
                            />
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
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
