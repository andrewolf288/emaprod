import React from 'react'
import { useCreateFormulaEmpaquetadoPromocional } from '../../hooks/formula-empaquetado-promocional/useCreateFormulaEmpaquetadoPromocional'
import { FilterProductosCombos } from '../../../components/ReferencialesFilters/Producto/FilterProductosCombos'
import { FilterPresentacionFinalDynamic } from '../../../components/ReferencialesFilters/Producto/FilterPresentacionFinalDynamic'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowEditProductoFinalFormulaEmpaquetadoPromocional } from '../../components/componentes-formula-empaquetado-promocional/RowEditProductoFinalFormulaEmpaquetadoPromocional'
import { FilterEnvaseEmbalaje } from '../../../components/ReferencialesFilters/Producto/FilterEnvaseEmbalaje'
import { RowEditMaterialRequisicionFormulaEmpaquetadoPromocional } from '../../components/componentes-formula-empaquetado-promocional/RowEditMaterialRequisicionFormulaEmpaquetadoPromocional'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const AgregarFormulaEmpaquetadoPromocional = () => {
  const {
    formulaEmpaquetadorPromocional,
    onChangeDatosFormulaEmpaquetadorPromocional,
    onChangeProductoPromocionalCombo,
    productoFinalSelected,
    materialSelected,
    onChangeProductoFinalFormulaEmpaquetadoPromocional,
    onAddRequisicionFormulaEmpaquetadorPromocional,
    onAddProductoFinalFormulaEmpaquetadoPromocional,
    onChangeCantidadFormulaEmpaquetadorPromocional,
    onChangeRequisicionFormulaEmpaquetadoPromocional,
    onChangeCantidadRequisicionFormulaEmpaquetadoPromocional,
    onCreateFormulaEmpaquetadoPromocional,
    onDeleteMaterialFormulaEmpaquetadorPromocional,
    onDeleteProductoFinalFormulaEmpaquetadoPromocional,
    onUpdateMaterialFormulaEmpaquetadorPromocional,
    onUpdateProductoFinalFormulaEmpaquetadoPromocional
  } = useCreateFormulaEmpaquetadoPromocional()
  return (
    <>
      <div className='container-fluid mx-3'>
        <h1 className='text-center'>Agregar fórmula empaquetado promocional</h1>
        <div className="row mt-4 mx-2">
          {/* DATOS DE LA FORMULA */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de la formula</h6>
            <div className="card-body">
              <form>
                {/* PRODUCTO */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-sm-2 col-form-label">
                    Producto promocional
                  </label>
                  <div className="col-md-6">
                    <FilterProductosCombos
                      defaultValue={productoFinalSelected.idProdt}
                      onNewInput={onChangeProductoPromocionalCombo}
                    />
                  </div>
                </div>
                {/* NOMBRE FORMULA */}
                <div className="mb-3 row">
                  <label
                    htmlFor="categoria"
                    className="col-sm-2 col-form-label"
                  >
                    Nombre Formula
                  </label>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="nomForEmpProm"
                      autoComplete="off"
                      value={formulaEmpaquetadorPromocional.nomForEmpProm}
                      onChange={onChangeDatosFormulaEmpaquetadorPromocional}
                      className="form-control"
                    />
                  </div>
                </div>
                {/* DESCRIPCION */}
                <div className="mb-3 row">
                  <label
                    htmlFor="descripcion"
                    className="col-sm-2 col-form-label"
                  >
                    Descripción formula
                  </label>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <textarea
                        value={formulaEmpaquetadorPromocional.desForEmpProm}
                        onChange={onChangeDatosFormulaEmpaquetadorPromocional}
                        name="desForEmpProm"
                        className="form-control"
                        placeholder="Leave a comment here"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* PRODUCTOS DEL COMBO */}
          <div className="card d-flex mt-4">
            <h6 className="card-header fw-semibold">
              Detalle de productos finales
            </h6>
            <div className='card-body'>
              <form className="row mb-4 mt-2 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MATERIA PRIMA */}
                <div className="col-md-6">
                  <label htmlFor="inputPassword4" className="form-label fw-medium">
                    Producto final
                  </label>
                  <FilterPresentacionFinalDynamic
                    onNewInput={onChangeProductoFinalFormulaEmpaquetadoPromocional}
                    defaultValue={productoFinalSelected.idProdt}
                  />
                </div>

                {/* AGREGAR CANTIDAD */}
                <div className="col-md-3">
                  <label htmlFor="inputPassword4" className="form-label fw-medium">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    onChange={onChangeCantidadFormulaEmpaquetadorPromocional}
                    value={productoFinalSelected.canForProdtFin}
                    name="cantidadMateriaPrima"
                    className="form-control"
                  />
                </div>
                {/* BOTON AGREGAR MATERIA PRIMA */}
                <div className="col-md-3 d-flex justify-content-end ms-auto">
                  <button
                    onClick={onAddProductoFinalFormulaEmpaquetadoPromocional}
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
              {/* PRODUCTOS FINALES */}
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
                        <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                          Codigo
                        </TableCell>
                        <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Clase
                        </TableCell>
                        <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                        </TableCell>
                        <TableCell align="left" width={150} sx={{ fontWeight: 'bold' }}>
                          Cantidad
                        </TableCell>
                        <TableCell align="center" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formulaEmpaquetadorPromocional.detProdFinForEmpProm.map((element) => (
                        <RowEditProductoFinalFormulaEmpaquetadoPromocional
                          key={element.id}
                          item={element}
                          onEdit={onUpdateProductoFinalFormulaEmpaquetadoPromocional}
                          onDelete={onDeleteProductoFinalFormulaEmpaquetadoPromocional}
                        />
                      )) }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>

          </div>
          {/* REQUISICION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header fw-semibold">
              Detalle de materiales requisición
            </h6>
            <div className='card-body'>
              <form className="row mb-4 mt-2 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MATERIA PRIMA */}
                <div className="col-md-6">
                  <label htmlFor="inputPassword4" className="form-label fw-medium">
                    Producto final
                  </label>
                  <FilterEnvaseEmbalaje
                    onNewInput={onChangeRequisicionFormulaEmpaquetadoPromocional}
                    defaultValue={materialSelected.idProdt}
                  />
                </div>

                {/* AGREGAR CANTIDAD */}
                <div className="col-md-3">
                  <label htmlFor="inputPassword4" className="form-label fw-medium">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    onChange={onChangeCantidadRequisicionFormulaEmpaquetadoPromocional}
                    value={materialSelected.canForMatReq}
                    name="cantidadMateriaPrima"
                    className="form-control"
                  />
                </div>
                {/* BOTON AGREGAR MATERIA PRIMA */}
                <div className="col-md-3 d-flex justify-content-end ms-auto">
                  <button
                    onClick={onAddRequisicionFormulaEmpaquetadorPromocional}
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
              {/* DETALLE DE REQUISICION */}
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
                        <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                          Codigo
                        </TableCell>
                        <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Clase
                        </TableCell>
                        <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                        </TableCell>
                        <TableCell align="left" width={150} sx={{ fontWeight: 'bold' }}>
                          Cantidad
                        </TableCell>
                        <TableCell align="left" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formulaEmpaquetadorPromocional.detReqMatForEmpProm.map((element) => (
                        <RowEditMaterialRequisicionFormulaEmpaquetadoPromocional
                          key={element.id}
                          item={element}
                          onDelete={onDeleteMaterialFormulaEmpaquetadorPromocional}
                          onEdit={onUpdateMaterialFormulaEmpaquetadorPromocional}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
        <CustomActionsView
          onSaveOperation={onCreateFormulaEmpaquetadoPromocional}
        />
      </div>
    </>
  )
}
