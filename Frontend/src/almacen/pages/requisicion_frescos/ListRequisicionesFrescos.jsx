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
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { useRequisicionesFrescos } from '../../../frescos/hooks/useRequisicionesFrescos'
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
    loading
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
                    <TableCell align="left" width={100}>
                      <b>Acciones</b>
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
                        <TableCell align="left">{row.codReq}</TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="right">{row.canLotProd}</TableCell>
                        <TableCell align="center">
                          <span
                            className={
                              row.idReqEst === 1
                                ? 'badge text-bg-danger'
                                : row.idReqEst === 2
                                  ? 'badge text-bg-primary'
                                  : row.idReqEst === 3
                                    ? 'badge text-bg-success'
                                    : 'badge text-bg-primary'
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
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                window.open(
                                  `/almacen/requisicion-frescos/view/${row.idProdc}/${row.id}`,
                                  '_blank'
                                )
                              }}
                              className="btn btn-primary me-2 btn"
                              data-toggle="modal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-eye-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
      {/* DIALOG LOADING */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}
