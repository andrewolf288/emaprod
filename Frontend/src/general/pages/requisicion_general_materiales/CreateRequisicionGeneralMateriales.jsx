import React from 'react'
import { useCreateRequisicionGeneralMateriales } from '../../hooks/requisicion-general-materiales/useCreateRequisicionGeneralMateriales'
import { FilterMotivoRequisicionMateriales } from '../../../components/ReferencialesFilters/MotivoRequisicionMateriales/FilterMotivoRequisicionMateriales'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { FilterAllProductosFilters } from '../../../components/ReferencialesFilters/Producto/FilterAllProductosFilters'
import { RowRequisicionGeneralMaterialesEdit } from '../../components/requisicion-materiales/RowRequisicionGeneralMaterialesEdit'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const CreateRequisicionGeneralMateriales = () => {
  const {
    requisicionMateriales,
    handleChangeAtributoRequisicionMateriales,
    handleChangeMotivoRequisicionMateriales,
    produtSelected,
    handleChangeCantidadRequisicionMateriales,
    handleChangeProductoRequisicionMateriales,
    handleAddProductoDetalleRequisicionMateriales,
    handleChangeProductoDetalleRequisicionMateriales,
    handleDeleteProductoDetalleRequisicionMateriales,
    handleCreateRequisicionMateriales
  } = useCreateRequisicionGeneralMateriales()

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Crear requisicion materiales</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisición</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo Requisición</b>
                  </label>
                  <FilterMotivoRequisicionMateriales
                    onNewInput={handleChangeMotivoRequisicionMateriales}
                    defaultValue={requisicionMateriales.idMotReqMat}/>
                </div>
                <div className="col-md-8">
                  <label htmlFor="nombre" className="form-label">
                    <b>Nota requisición</b>
                  </label>
                  <textarea
                    className="form-control"
                    name="notReqMat"
                    rows="2"
                    value={requisicionMateriales.notReqMat}
                    onChange={handleChangeAtributoRequisicionMateriales} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
              <b>Detalle de la requisicion</b>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MATERIA PRIMA */}
                <div className="col-md-6">
                  <label htmlFor="inputPassword4" className="form-label">
                    Material
                  </label>
                  <FilterAllProductosFilters
                    onNewInput={handleChangeProductoRequisicionMateriales}
                    defaultValue={produtSelected.idProdt}
                  />
                </div>

                {/* AGREGAR CANTIDAD */}
                <div className="col-md-3">
                  <label htmlFor="inputPassword4" className="form-label">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    onChange={handleChangeCantidadRequisicionMateriales}
                    value={produtSelected.cantReqMatDet}
                    name="cantidadMateriaPrima"
                    className="form-control"
                  />
                </div>
                {/* BOTON AGREGAR MATERIA PRIMA */}
                <div className="col-md-3 d-flex justify-content-end ms-auto">
                  <button
                    onClick={handleAddProductoDetalleRequisicionMateriales}
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
              {/* TABLA DE RESULTADOS */}
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
                        <TableCell align="left" width={100}>
                          <b>Codigo</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={140}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        requisicionMateriales.detReqMat.map((item) => (
                          <RowRequisicionGeneralMaterialesEdit
                            key={item.idProdt}
                            item={item}
                            onEdit={handleChangeProductoDetalleRequisicionMateriales}
                            onDelete={handleDeleteProductoDetalleRequisicionMateriales}
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
        {/* ACCIONES DE BOTONES */}
        < CustomActionsView
          onSaveOperation={handleCreateRequisicionMateriales}
        />
      </div>
    </>
  )
}
