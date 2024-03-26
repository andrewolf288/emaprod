import React from 'react'
import { useIngresarRequisicionSubproducto } from '../../hooks/requisicion-subproducto/useIngresarRequisicionSubproducto'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowProductosDisponiblesProduccion } from '../../../almacen/components/RowProductosDisponiblesProduccion'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const IngresarRequisicionSubproducto = () => {
  const {
    requisicionSubproducto,
    productoFinal,
    handleChangeInputProductoFinal,
    crearIngresoRequisicionSubproducto
  } = useIngresarRequisicionSubproducto()

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
                      {requisicionSubproducto.detIng.map((element) => (
                        <TableRow key={element.id}>
                          <TableCell>{element.nomProd}</TableCell>
                          <TableCell>{element.canProdIng}</TableCell>
                          <TableCell>{element.fecProdIng}</TableCell>
                          <TableCell>{element.fecProdVen}</TableCell>
                          <TableCell>
                            <span className={`badge ${element.esComReqProdIng === 0 ? 'bg-danger' : 'bg-success'}`}>
                              {element.esComReqProdIng === 0 ? 'Requerido' : 'Completado'}
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
            <h6 className="card-header">Realizar ingreso de subproducto</h6>
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
                        <RowProductosDisponiblesProduccion
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
        {/* ACCIONES DE BOTONES */}
        < CustomActionsView
          onSaveOperation={crearIngresoRequisicionSubproducto}
        />
      </div>
    </>
  )
}
