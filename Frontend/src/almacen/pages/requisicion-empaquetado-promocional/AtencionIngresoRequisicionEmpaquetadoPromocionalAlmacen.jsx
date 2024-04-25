import React from 'react'
import { useIngresoRequisicionEmpaquetadoPromocionalAlmacen } from '../../hooks/requisicion-emapaquetado-promocional/useIngresoRequisicionEmpaquetadoPromocionalAlmacen'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowIngresoRequisicionEmpaquetadoPromocionalAlmacen } from '../../components/componentes-requisicion-empaquetado-promocional/RowIngresoRequisicionEmpaquetadoPromocionalAlmacen'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const AtencionIngresoRequisicionEmpaquetadoPromocionalAlmacen = () => {
  const {
    requisicionEmpaquetadoPromocional,
    onDeleteIngresoRequisicionEmpaquetadoPromocional,
    onUpdateIngresoRequisicionEmpaquetadoPromocional,
    onCreateIngresoRequisicionEmpaquetadoPromocional
  } = useIngresoRequisicionEmpaquetadoPromocionalAlmacen()
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
      {/* REQUISICIONES */}
      <div className='card mx-4'>
        <div className='card-header fw-semibold'>Detalle ingresos</div>
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
                    requisicionEmpaquetadoPromocional.detIngReqEmpProm.map((element) => (
                      <RowIngresoRequisicionEmpaquetadoPromocionalAlmacen
                        key={element.id}
                        detalle={element}
                        onUpdateDetalleRequisicion={onUpdateIngresoRequisicionEmpaquetadoPromocional}
                        onDeleteDetalleRequisicion={onDeleteIngresoRequisicionEmpaquetadoPromocional}
                        onCreateSalida={onCreateIngresoRequisicionEmpaquetadoPromocional}
                      />
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
      <CustomActionsView
        onShowCreateButton={false}
      />
    </div>
  )
}
