import React from 'react'
import { FilterProductosCombos } from '../../../components/ReferencialesFilters/Producto/FilterProductosCombos'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { useCreateRequisicionEmpaquetadoPromocional } from '../../hooks/requisicion-empaquetado-promocional/useCreateRequisicionEmpaquetadoPromocional'
import { RowEditRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/RowEditRequisicionEmpaquetadoPromocional'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const CreateRequisicionEmpaquetadoPromocional = () => {
  const {
    requisicionEmpaquetadoPromocional,
    onChangeCantidadRequisicionEmpaquetadoPromocional,
    onChangeProductoRequisicionEmpaquetadoPromocional,
    traerFormulaProductoEmpaquetadoPromocional,
    onDeleteRequisicionEmpaquetadoPromocionalDetalle,
    onUpdateRequisicionEmpaquetadoPromocionalDetalle,
    crearRequisicionEmpaquetadoPromocional
  } = useCreateRequisicionEmpaquetadoPromocional()

  return (
    <>
      <div className='container-flex m-4'>
        <h1 className='text-center fs-2 mt-4 mb-4'>Creación de operación de reproceso masivo</h1>
        <div className='card mb-4'>
          <div className='card-header fw-bold'>Datos requisición</div>
          <div className='card-body d-flex justify-content-center'>
            <div className='col-6'>
              <label className='form-label fw-semibold'>Producto promocional</label>
              <FilterProductosCombos
                onNewInput={onChangeProductoRequisicionEmpaquetadoPromocional}
                defaultValue={requisicionEmpaquetadoPromocional.idProdt}
              />
            </div>
            <div className='col-2 ms-4'>
              <label className='form-label fw-semibold'>Cantidad</label>
              <TextField
                type='number'
                onWheel={(e) => { e.target.blur() }}
                autoComplete='off'
                size='small'
                onChange={onChangeCantidadRequisicionEmpaquetadoPromocional}
              />
            </div>
            <button
              className='btn btn-primary align-self-center ms-4'
              onClick={traerFormulaProductoEmpaquetadoPromocional}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className='card'>
          <div className='card-header fw-bold'>Detalle requisición</div>
          <div className='card-body'>
            <div className='card mb-4'>
              <div className='card-header fw-bold'>Detalle presentaciones finales</div>
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
                          <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Clase
                          </TableCell>
                          <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                          </TableCell>
                          <TableCell align='center' width={80} sx={{ fontWeight: 'bold' }}>
                            Unidad
                          </TableCell>
                          <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Total
                          </TableCell>
                          <TableCell align="center" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requisicionEmpaquetadoPromocional.detReqEmpProm.map((element, index) => {
                          if (element.esProdFin === 1) {
                            return (<RowEditRequisicionEmpaquetadoPromocional
                              key={index}
                              item={element}
                              onEdit={onUpdateRequisicionEmpaquetadoPromocionalDetalle}
                              onDelete={onDeleteRequisicionEmpaquetadoPromocionalDetalle}
                            />
                            )
                          } else {
                            return null
                          }
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
            <div className='card'>
              <div className='card-header fw-bold'>Detalle requisición materiales</div>
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
                          <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Clase
                          </TableCell>
                          <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                          </TableCell>
                          <TableCell align='center' width={80} sx={{ fontWeight: 'bold' }}>
                            Unidad
                          </TableCell>
                          <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Total
                          </TableCell>
                          <TableCell align="center" width={150} sx={{ fontWeight: 'bold' }}>
                          Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requisicionEmpaquetadoPromocional.detReqEmpProm.map((element, index) => {
                          if (element.esMatReq === 1) {
                            return (<RowEditRequisicionEmpaquetadoPromocional
                              key={index}
                              item={element}
                              onEdit={onUpdateRequisicionEmpaquetadoPromocionalDetalle}
                              onDelete={onDeleteRequisicionEmpaquetadoPromocionalDetalle}
                            />
                            )
                          } else {
                            return null
                          }
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>
        </div>
        <CustomActionsView
          onSaveOperation={crearRequisicionEmpaquetadoPromocional}
        />
      </div>
    </>
  )
}
