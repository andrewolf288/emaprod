import React, { useEffect, useState } from 'react'
import { getOrdenesReproceso } from '../../helpers/orden-reproceso/getOrdenesReproceso'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'

export const ListOrdenesReproceso = () => {
  const [dataOrdenReproceso, setDataOrdenReproceso] = useState([])

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
    obtenerdataOrdenReproceso(body)
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
    obtenerdataOrdenReproceso(body)
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerdataOrdenReproceso = async (formState) => {
    const resultPeticion = await getOrdenesReproceso(formState)
    const { message_error, description_error, result } = resultPeticion
    console.log(result)
    if (message_error.length === 0) {
      setDataOrdenReproceso(result)
    } else {
      console.log(description_error)
    }
  }

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerdataOrdenReproceso()
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
                      <strong>Numero lotes</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Código producto</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Producto reprocesado</strong>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <strong>Cantidad total</strong>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Devolucion</b>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Fecha creación</b>
                    </TableCell>
                    <TableCell align="left" width={70}>
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataOrdenReproceso
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="left">{row.numLots}</TableCell>
                        <TableCell align="left">{row.codProd2}</TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="center">
                          {row.canOpeDevDet}
                        </TableCell>
                        <TableCell align="center">
                          <React.Fragment>
                            {row.requeridas != 0 && (
                              <span className="d-block mb-2 badge text-bg-danger p-2">
                                {`Requerido: ${row.requeridas}`}
                              </span>
                            )}
                            {row.en_proceso != 0 && (
                              <span className="d-block badge text-bg-warning p-2">
                                {`En proceso: ${row.en_proceso}`}
                              </span>
                            )}

                            {row.completadas != 0 && (
                              <span className="d-block badge text-bg-success p-2">
                                {`Completo: ${row.completadas}`}
                              </span>
                            )}
                          </React.Fragment>

                        </TableCell>
                        <TableCell>{row.fecCreOpeDevCal}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <div
                              className="btn-toolbar btn btn-primary me-2 btn"
                              onClick={() => {
                                window.open(
                                  `/almacen/orden-reproceso/view/${row.id}`,
                                  '_blank'
                                )
                              }}
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
                            </div>
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
              count={dataOrdenReproceso.length}
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
