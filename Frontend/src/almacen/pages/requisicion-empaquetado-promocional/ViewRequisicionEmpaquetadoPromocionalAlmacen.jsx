import React from 'react'
import { Link } from 'react-router-dom'
import { useRequisicionEmpaquetadoPromocionalAlmacen } from '../../hooks/requisicion-emapaquetado-promocional/useRequisicionEmpaquetadoPromocionalAlmacen'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowEditRequisicionEmpaquetadoPromocionalAlmacen } from '../../components/componentes-requisicion-empaquetado-promocional/RowEditRequisicionEmpaquetadoPromocionalAlmacen'

export const ViewRequisicionEmpaquetadoPromocionalAlmacen = () => {
  const {
    idReqEmpProm,
    requisicionEmpaquetadoPromocional,
    onCheckRequisicionEmpaquetadoPromocional,
    onDeleteRequisicionEmpaquetadoPromocional,
    onUpdateRequisicionEmpaquetadoPromocional
  } = useRequisicionEmpaquetadoPromocionalAlmacen()
  return (
    <div className="container-fluid">
      <h1 className="mt-4 text-center">Requisición empaquetado promocional</h1>
      {/* Acciones */}
      <div className="card mb-4 mt-4 mx-4">
        <h6 className="card-header">Acciones</h6>
        <div className="card-body align-self-center">
          <Link
            to={`/almacen/requisicion-empaquetado-promocional/atencion-ingreso/${idReqEmpProm}`}
            className="btn btn-primary"
          >
                Requisiciones de ingresos
          </Link>
        </div>
      </div>
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
      {/* REQUISICIONES */}
      <div className='card mx-4'>
        <div className='card-header fw-semibold'>Detalle requisición</div>
        <div className='card-body'>
          <div className='card mb-4'>
            <div className='card-header fw-medium'>Requisición presentaciones finales</div>
            <div className='card-body'>
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
                        <TableCell align="left" width={70} sx={{ fontWeight: 'bold' }}>
                          Lote salida
                        </TableCell>
                        <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                          Codigo
                        </TableCell>
                        <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                        </TableCell>
                        <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Estado
                        </TableCell>
                        <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Cantidad
                        </TableCell>
                        <TableCell align="center" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        requisicionEmpaquetadoPromocional.detReqEmpProm.map((element) => {
                          if (element.esProdFin === 1) {
                            return (
                              <RowEditRequisicionEmpaquetadoPromocionalAlmacen
                                key={element.id}
                                detalle={element}
                                onCreateSalida={onCheckRequisicionEmpaquetadoPromocional}
                                onDeleteDetalleRequisicion={onDeleteRequisicionEmpaquetadoPromocional}
                                onUpdateDetalleRequisicion={onUpdateRequisicionEmpaquetadoPromocional}
                              />
                            )
                          } else {
                            return null
                          }
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
          <div className='card'>
            <div className='card-header fw-medium'>Requisición materiales</div>
            <div className='card-body'>
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
                        <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                        </TableCell>
                        <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Estado
                        </TableCell>
                        <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Cantidad
                        </TableCell>
                        <TableCell align="center" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        requisicionEmpaquetadoPromocional.detReqEmpProm.map((element) => {
                          if (element.esMatReq === 1) {
                            return (
                              <RowEditRequisicionEmpaquetadoPromocionalAlmacen
                                key={element.id}
                                detalle={element}
                                onCreateSalida={onCheckRequisicionEmpaquetadoPromocional}
                                onDeleteDetalleRequisicion={onDeleteRequisicionEmpaquetadoPromocional}
                                onUpdateDetalleRequisicion={onUpdateRequisicionEmpaquetadoPromocional}
                              />
                            )
                          } else {
                            return null
                          }
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
      </div>
      <CustomActionsView
        onShowCreateButton={false}
      />
    </div>
  )
}
