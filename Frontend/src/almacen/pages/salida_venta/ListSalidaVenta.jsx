import React, { useEffect, useState } from 'react'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { getSalidasVenta } from '../../helpers/salida-venta/getSalidasVenta'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField
} from '@mui/material'
import { FilterEstadoRequisicion } from '../../../components/ReferencialesFilters/EstadoRequisicion/FilterEstadoRequisicion'

export const ListSalidaVenta = () => {
  const [dataSalidasVenta, setDataSalidasVenta] = useState([])
  const [dataSalidasVentaTemp, setDataSalidasVentaTemp] = useState([])

  // filtros
  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  })

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Filtros generales que hacen nuevas consultas
  const handleFechaInicioChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaInicio: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaInicio: dateFormat
    }
    obtenerDataSalidasVenta(body)
  }

  const handleFechaFinChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaFin: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaFin: dateFormat
    }
    obtenerDataSalidasVenta(body)
  }

  const [dataFilter, setDataFilter] = useState({
    invSerFac: '',
    invNumFac: '',
    idReqEst: 0
  })
  const { invSerFac, invNumFac } = dataFilter

  const handleChangeInputValue = ({ target }) => {
    const { value, name } = target
    setDataFilter({
      ...dataFilter,
      [name]: value
    })
    filter(value, name)
  }

  const handleChangeSelectValue = (value) => {
    const { id, label } = value
    setDataFilter({
      ...dataFilter,
      idReqEst: id
    })
    filter(label, 'idReqEst')
  }

  const filter = (terminoBusqueda, name) => {
    if (name === 'invSerFac') {
      const resultadoBusqueda = dataSalidasVenta.filter((element) => {
        if (
          element.invSerFac
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element
        } else {
          return false
        }
      })
      setDataSalidasVentaTemp(resultadoBusqueda)
    }
    if (name === 'invNumFac') {
      const resultadoBusqueda = dataSalidasVenta.filter((element) => {
        if (
          element.invNumFac
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element
        } else {
          return false
        }
      })
      setDataSalidasVentaTemp(resultadoBusqueda)
    }
    if (name === 'idReqEst') {
      const resultadoBusqueda = dataSalidasVenta.filter((element) => {
        if (
          element.desReqEst
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element
        } else {
          return false
        }
      })
      setDataSalidasVentaTemp(resultadoBusqueda)
    }
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataSalidasVenta = async (formState) => {
    const resultPeticion = await getSalidasVenta(formState)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setDataSalidasVenta(result)
      setDataSalidasVentaTemp(result)
    } else {
      alert(description_error)
    }
  }

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerDataSalidasVenta()
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
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
                    <TableCell align="left" width={50}>
                      <b>Serie</b>
                      <TextField
                        size="small"
                        type="text"
                        onChange={handleChangeInputValue}
                        value={invSerFac}
                        name="invSerFac"
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Numero</b>
                      <TextField
                        size="small"
                        type="number"
                        onChange={handleChangeInputValue}
                        value={invNumFac}
                        name="invNumFac"
                      />
                    </TableCell>
                    <TableCell align="center" width={50}>
                      <b>Estado</b>
                      <FilterEstadoRequisicion
                        onNewInput={handleChangeSelectValue}
                      />
                    </TableCell>
                    <TableCell align="center" width={40}>
                      <b>Afectado</b>
                    </TableCell>
                    <TableCell align="center" width={40}>
                      <b>Anulado</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha creación</b>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSalidasVentaTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="left">{row.invSerFac}</TableCell>
                        <TableCell align="left">{row.invNumFac}</TableCell>
                        <TableCell align="center">
                          {row.idReqEst === 1
                            ? (
                              <span className={'badge text-bg-danger'}>
                                {row.desReqEst}
                              </span>
                            )
                            : row.idReqEst === 2
                              ? (
                                <span className={'badge text-bg-warning'}>
                                  {row.desReqEst}
                                </span>
                              )
                              : row.idReqEst === 3
                                ? (
                                  <span className={'badge text-bg-success'}>
                                    {row.desReqEst}
                                  </span>
                                )
                                : (
                                  <span className={'badge text-bg-secondary'}>
                                    {row.desReqEst}
                                  </span>
                                )}
                        </TableCell>
                        <TableCell align="center">
                          {row.fueAfePorDev === 1
                            ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-check-circle-fill"
                                viewBox="0 0 16 16"
                                color="green"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                              </svg>
                            )
                            : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-x-circle-fill"
                                viewBox="0 0 16 16"
                                color="red"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                              </svg>
                            )}
                        </TableCell>
                        <TableCell align="center">
                          {row.fueAfePorAnul === 1
                            ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-check-circle-fill"
                                viewBox="0 0 16 16"
                                color="green"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                              </svg>
                            )
                            : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-x-circle-fill"
                                viewBox="0 0 16 16"
                                color="red"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                              </svg>
                            )}
                        </TableCell>
                        <TableCell align="left">{row.fecCreOpeFac}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                window.open(
                                  `/almacen/salida-venta/view/${row.id}`,
                                  '_blank'
                                )
                              }}
                              disabled={row.fueAfePorAnul === 1}
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
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataSalidasVentaTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </>
  )
}
