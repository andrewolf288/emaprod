import React from 'react'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
// IMPORTACIONES PARA EL FEEDBACK
import { TextField } from '@mui/material'
import { FilterEstadoRequisicionMolienda } from './../../../components/ReferencialesFilters/EstadoRequisicionMolienda/FilterEstadoRequisicionMolienda'
import { FilterProductoProduccion } from './../../../components/ReferencialesFilters/Producto/FilterProductoProduccion'
import { RequisicionMoliendaDetalleOnlyView } from './../../components/RequisicionMoliendaDetalleOnlyView'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { useRequisicionesFrescos } from '../../hooks/useRequisicionesFrescos'
import { Link } from 'react-router-dom'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'

export const ListRequisicionesFrescos = () => {
  const {
    dateState,
    handleStartDateChange,
    handleEndDateChange,
    handleFormFilter,
    onChangeProducto,
    onChangeEstadoRequisicionMolienda,
    requisicionMoliendaTemp,
    loading,
    detalleSeleccionado,
    mostrarDetalle,

    closeDetalleRequisicionMolienda
  } = useRequisicionesFrescos()

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row me-4">
              <Link
                to={'crear'}
                className="btn btn-primary"
              >
                Crear requisición
              </Link>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
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
                      <b>Lote</b>
                      <TextField
                        name="filterLoteProduccion"
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={70}>
                      <b>Codigo</b>
                      <TextField
                        name="filterCodReq"
                        onChange={handleFormFilter}
                        // type="number"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Producto</b>
                      <FilterProductoProduccion onNewInput={onChangeProducto} />
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Peso</b>
                      <TextField
                        name="filterPeso"
                        type="number"
                        onChange={handleFormFilter}
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Estado</b>
                      <FilterEstadoRequisicionMolienda
                        onNewInput={onChangeEstadoRequisicionMolienda}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha requerido</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha terminado</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requisicionMoliendaTemp
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLotProd}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.codReq}
                        </TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="left">{row.canLotProd}</TableCell>
                        <TableCell align="center">
                          <span
                            className={
                              row.idReqEst === 1
                                ? 'badge text-bg-danger'
                                : row.idReqEst === 2
                                  ? 'badge text-bg-warning'
                                  : 'badge text-bg-success'
                            }
                          >
                            {row.desReqEst}
                          </span>
                        </TableCell>
                        <TableCell align="left">{row.fecPedReq}</TableCell>
                        <TableCell align="left">
                          {row.fecEntReq === null
                            ? 'Aun no terminado'
                            : row.fecEntReq}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          {mostrarDetalle && (
            <RequisicionMoliendaDetalleOnlyView
              detalle={detalleSeleccionado}
              onClose={closeDetalleRequisicionMolienda}
            />
          )}
        </div>
      </div>
      {/* CUSTOM LOADING */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}
