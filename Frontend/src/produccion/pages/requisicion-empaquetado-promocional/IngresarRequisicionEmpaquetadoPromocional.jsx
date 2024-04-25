import React from 'react'
import { useIngresarRequisicionEmpaquetadoPromocional } from '../../hooks/requisicion-empaquetado-promocional/useIngresarRequisicionEmpaquetadoPromocional'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowIngresoRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/RowIngresoRequisicionEmpaquetadoPromocional'

export const IngresarRequisicionEmpaquetadoPromocional = () => {
  const {
    productoFinal,
    requisicionEmpaquetadoPromocional,
    handleChangeInputProductoFinal,
    crearIngresoRequisicionEmpaquetadoPromocional
  } = useIngresarRequisicionEmpaquetadoPromocional()

  return (
    <div className="container-fluid">
      <h1 className="mt-4 text-center">Ingreso requisición empaquetado promocional</h1>
      {/* INFORMACIÓN REQUISICIÓN */}
      <div className='card mx-4 mb-4'>
        <div className='card-header fw-semibold'>Información requisición</div>
        <div className='card-body'>
          <div className='row mb-2 mb-md-2'>
            <div className='col-md-2 col-12 mb-2'>
              <label className="form-label fw-semibold">Producto combo</label>
              <input
                type="text"
                disabled={true}
                value={requisicionEmpaquetadoPromocional.correlativo}
                className="form-control"
              />
            </div>
            <div className='col-md-6 col-12 mb-2'>
              <label className="form-label fw-semibold">Producto combo</label>
              <input
                type="text"
                disabled={true}
                value={requisicionEmpaquetadoPromocional.nomProd}
                className="form-control"
              />
            </div>
            <div className='col-md-2 col-12 mb-2'>
              <label className="form-label fw-semibold">Cantidad</label>
              <input
                type="text"
                disabled={true}
                value={`${requisicionEmpaquetadoPromocional.canReqEmpPro} ${requisicionEmpaquetadoPromocional.simMed}`}
                className="form-control"
              />
            </div>
          </div>
          <div className='row mb-2 mb-md-2'>
            <div className='col-md-2 col-12 mb-2'>
              <label className="form-label fw-semibold">Fecha requerido</label>
              <input
                type="text"
                disabled={true}
                value={requisicionEmpaquetadoPromocional.fecCreReqEmpProm}
                className="form-control"
              />
            </div>
            <div className='col-md-2 col-12 mb-2'>
              <label className="form-label fw-semibold">Estado requisición</label>
              <input
                type="text"
                disabled={true}
                value={requisicionEmpaquetadoPromocional.desReqEst}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>
      {/* INGRESO DE PRODUCTOS INTERMEDIOS */}
      <div className="row mt-4 mx-4">
        <div className="card d-flex">
          <h6 className="card-header">Datos de ingresos</h6>
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
                        <strong>Nombre</strong>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <strong>Cantidad</strong>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <strong>Fecha entrada</strong>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <strong>Fecha vencimiento</strong>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <strong>Estado</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requisicionEmpaquetadoPromocional.detIngReqEmpProm.map((element) => (
                      <TableRow key={element.id}>
                        <TableCell>{element.nomProd}</TableCell>
                        <TableCell>{element.canProdIng}</TableCell>
                        <TableCell>{element.fecProdIng}</TableCell>
                        <TableCell>{element.fecProdVen}</TableCell>
                        <TableCell>
                          <span className={`badge ${element.esComProdIng === 0 ? 'bg-danger' : 'bg-success'}`}>
                            {element.esComProdIng === 0 ? 'Requerido' : 'Completado'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </div>
      </div>
      {/* REALIZAR INGESO DE PRODUCTO INTERMEDIO */}
      <div className="row mt-4 mx-4">
        <div className="card d-flex">
          <h6 className="card-header">Realizar ingreso de producto promocional</h6>
          <div className="card-body">
            {/* LISTA DE PRODUCTOS */}
            <div className="mb-3 row">
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
                          <strong>Nombre</strong>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <strong>Unidad</strong>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <strong>Clase</strong>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <strong>Fecha entrada</strong>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <strong>Fecha vencimiento</strong>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <strong>Cantidad</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <RowIngresoRequisicionEmpaquetadoPromocional
                        detalle={productoFinal}
                        onChangeDetalle={handleChangeInputProductoFinal}
                        showButtonDelete={true}
                      />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
      </div>
      <CustomActionsView
        onSaveOperation={crearIngresoRequisicionEmpaquetadoPromocional}
      />
    </div>
  )
}
