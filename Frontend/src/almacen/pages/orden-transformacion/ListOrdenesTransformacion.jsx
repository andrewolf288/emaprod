import React, { useEffect, useState } from 'react'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material'
import { getOrdenesTransformacionAlmacen } from '../../helpers/orden-transformacion/getOrdenesTransformacionAlmacen'

export const ListOrdenesTransformacion = () => {
  const [dataOrdenTransformacion, setdataOrdenTransformacion] = useState([])

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
    obtenerdataOrdenTransformacion(body)
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
    obtenerdataOrdenTransformacion(body)
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerdataOrdenTransformacion = async (formState) => {
    const resultPeticion = await getOrdenesTransformacionAlmacen(formState)
    const { message_error, description_error, result } = resultPeticion
    console.log(result)
    if (message_error.length === 0) {
      setdataOrdenTransformacion(result)
    } else {
      console.log(description_error)
    }
  }

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerdataOrdenTransformacion()
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
                      <strong>Codigo lote</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Producto a transformar</strong>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <strong>Cantidad a transformar</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Producto transformado</strong>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <strong>Cantidad transformada</strong>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Env. y Enc.</b>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Ingresos</b>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Devolucion</b>
                    </TableCell>
                    <TableCell align="left" width={70}>
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataOrdenTransformacion
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="left">{row.codLotProd}</TableCell>
                        <TableCell align="left">{row.nomProd1}</TableCell>
                        <TableCell align="center">
                          {row.canUndProdtOri}
                        </TableCell>
                        <TableCell align="left">{row.nomProd2}</TableCell>
                        <TableCell align="center">
                          {row.canUndProdtDes}
                        </TableCell>
                        <TableCell align="center">
                          {row.req_env_enc
                            ? (
                              <React.Fragment>
                                {row.req_env_enc[0].requerido != 0 && (
                                  <span className="d-block mb-2 badge text-bg-danger p-2">
                                    {`Requerido: ${row.req_env_enc[0].requerido}`}
                                  </span>
                                )}
                                {row.req_env_enc[0].en_proceso != 0 && (
                                  <span className="d-block badge text-bg-warning p-2">
                                    {`En proceso: ${row.req_env_enc[0].en_proceso}`}
                                  </span>
                                )}
                                {row.req_env_enc[0].terminado != 0 && (
                                  <span className="d-block badge text-bg-success p-2">
                                    {`Completo: ${row.req_env_enc[0].terminado}`}
                                  </span>
                                )}
                                {row.req_env_enc[0].requerido == 0 &&
                                row.req_env_enc[0].en_proceso == 0 &&
                                row.req_env_enc[0].terminado == 0 && (
                                  <p>No hay requisiciones</p>
                                )}
                              </React.Fragment>
                            )
                            : (
                              <p>No hay requisiciones</p>
                            )}
                        </TableCell>
                        <TableCell align="center">
                          {row.req_ing_prod
                            ? (
                              <React.Fragment>
                                {row.req_ing_prod[0].requerido != 0 && (
                                  <span className="d-block mb-2 badge text-bg-danger p-2">
                                    {`Requerido: ${row.req_ing_prod[0].requerido}`}
                                  </span>
                                )}
                                {row.req_ing_prod[0].requerido == 0 &&
                                row.req_ing_prod[0].terminado != 0 && (
                                  <span className="d-block badge text-bg-success p-2">
                                    {`Completo: ${row.req_ing_prod[0].terminado}`}
                                  </span>
                                )}
                                {row.req_ing_prod[0].requerido == 0 &&
                                row.req_ing_prod[0].terminado == 0 && (
                                  <p>No hay requisiciones</p>
                                )}
                              </React.Fragment>
                            )
                            : (
                              <p>No hay requisiciones</p>
                            )}
                        </TableCell>
                        <TableCell align="center">
                          {row.req_dev
                            ? (
                              <React.Fragment>
                                {row.req_dev[0].requerido != 0 && (
                                  <span className="d-block mb-2 badge text-bg-danger p-2">
                                    {`Requerido: ${row.req_dev[0].requerido}`}
                                  </span>
                                )}
                                {row.req_dev[0].en_proceso != 0 && (
                                  <span className="d-block badge text-bg-warning p-2">
                                    {`En proceso: ${row.req_dev[0].en_proceso}`}
                                  </span>
                                )}

                                {row.req_dev[0].terminado != 0 && (
                                  <span className="d-block badge text-bg-success p-2">
                                    {`Completo: ${row.req_dev[0].terminado}`}
                                  </span>
                                )}
                              </React.Fragment>
                            )
                            : (
                              <p>No hay requisiciones</p>
                            )}
                        </TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <div
                              className="btn-toolbar btn btn-primary me-2 btn"
                              onClick={() => {
                                window.open(
                                  `/almacen/orden-transformacion/view/${row.id}`,
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
              count={dataOrdenTransformacion.length}
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
