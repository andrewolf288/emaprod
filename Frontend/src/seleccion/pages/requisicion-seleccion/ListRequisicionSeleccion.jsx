import React, { useState, useEffect } from 'react'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { getRequisicionSeleccionWithDetalle } from './../../helpers/requisicion/getRequisicionSeleccionWithDetalle'
import FechaPickerMonth from './../../../components/Fechas/FechaPickerMonth'
import { useForm } from './../../../hooks/useForm'
import { TablePagination, TextField } from '@mui/material'
import { FilterEstadoRequisicionSeleccion } from '../../../components/ReferencialesFilters/EstadoRequisicionSeleccion/FilterEstadoRequisicionSeleccion'
import { RequisicionSeleccionDetalle } from './../../components/RequisicionSeleccionDetalle'
import config from '../../../config'
import axios from 'axios'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ListRequisicionSeleccion = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataRequisicion, setdataRequisicion] = useState([])
  const [dataRequisicionTemp, setdataRequisicionTemp] = useState([])

  // ESTADOS PARA EL MODAL
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)

  // filtros
  const { fecReqMolIni, fecReqMolFin, formState, setFormState } =
    useForm({
      fecReqMolIni: '',
      fecReqMolFin: ''
    })

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackDelete(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackDelete(false)
  }

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    filter(value, name)
  }

  const onChangeEstadoRequisicionSeleccion = ({ label }) => {
    filter(label, 'filterEstado')
  }

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    const dateFormat = newDate.split(' ')[0]
    setFormState({ ...formState, fecReqMolIni: dateFormat })
    // realizamos una promesa
    const body = {
      ...formState,
      fecReqMolIni: dateFormat
    }
    obtenerDataRequisicionSeleccion(body)
  }

  const onChangeDateEndData = (newDate) => {
    const dateFormat = newDate.split(' ')[0]
    setFormState({ ...formState, fecReqMolFin: dateFormat })
    // realizamos una promesa
    const body = {
      ...formState,
      fecReqMolFin: dateFormat
    }
    obtenerDataRequisicionSeleccion(body)
  }

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {
    let resultSearch = []
    switch (name) {
    case 'filterLoteRequisicionSeleccion':
      resultSearch = dataRequisicion.filter((element) => {
        if (
          element.codLotSel
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataRequisicionTemp(resultSearch)
      break
    case 'filterEstado':
      resultSearch = dataRequisicion.filter((element) => {
        if (
          element.desReqSelEst
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataRequisicionTemp(resultSearch)
      break
    case 'filterFechaRequerido':
      resultSearch = dataRequisicion.filter((element) => {
        const aux = element.fecPedReqSel.split(' ')
        if (
          aux[0]
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataRequisicionTemp(resultSearch)
      break
    case 'filterFechaTerminado':
      resultSearch = dataRequisicion.filter((element) => {
        if (element.fecTerReqSel !== null) {
          const aux = element.fecTerReqSel.split(' ')
          if (
            aux[0]
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true
          } else {
            return false
          }
        } else {
          return null
        }
      })
      setdataRequisicionTemp(resultSearch)
      break
    default:
      break
    }
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataRequisicionSeleccion = async (body = {}) => {
    const resultPeticion = await getRequisicionSeleccionWithDetalle(body)
    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      setdataRequisicion(result)
      setdataRequisicionTemp(result)
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  // ******* REQUISICION SELECCION DETALLE ********

  const closeDetalleRequisicionSeleccion = () => {
    // ocultamos el modal
    setMostrarDetalle(false)
    // dejamos el null la data del detalle
    setDetalleSeleccionado(null)
  }

  // export excel
  const exportExcel = () => {
    const domain = config.API_URL
    const path = '/almacen/reportes/reporte-requisicion-seleccion.php'
    axios({
      url: domain + path,
      data: {
        fecReqIni: fecReqMolIni,
        fecReqFin: fecReqMolFin
      },
      method: 'POST',
      responseType: 'blob' // Importante para recibir datos binarios (Blob)
    })
      .then((response) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = 'reporte-requisiciones-seleccion.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => alert('Error al descargar el archivo', error))
  }

  // TRAEMOS LA DATA ANTES DE QUE SE RENDERICE EL COMPONENTE
  useEffect(() => {
    obtenerDataRequisicionSeleccion()
  }, [])

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                Desde
                <FechaPickerMonth onNewfecEntSto={onChangeDateStartData} />
              </div>
              <div className="col-4">
                Hasta
                <FechaPickerMonth onNewfecEntSto={onChangeDateEndData} />
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-6">
                <button className="btn btn-success" onClick={exportExcel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
                  </svg>
                </button>
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
                    <TableCell align="left" width={70}>
                      <b>Lote</b>
                      <TextField
                        name="filterLoteRequisicionSeleccion"
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
                    <TableCell align="left" width={140}>
                      <b>Estado</b>
                      <FilterEstadoRequisicionSeleccion
                        onNewInput={onChangeEstadoRequisicionSeleccion}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha de requerimiento</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha terminado</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Materia prima</b>
                    </TableCell>

                    <TableCell align="left" width={140}>
                      <b>Cantidad</b>
                    </TableCell>

                    <TableCell align="left" width={100}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRequisicionTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="center">{row.codLotSel}</TableCell>
                        <TableCell align="left">
                          <span
                            className={
                              row.reqSelDet.find(
                                (obj) => obj.idReqDet === row.idReqDet
                              ).idReqSelDetEst === 1
                                ? 'badge text-bg-danger p-2'
                                : row.reqSelDet.find(
                                  (obj) => obj.idReqDet === row.idReqDet
                                ).idReqSelDetEst === 2
                                  ? 'badge text-bg-primary p-2'
                                  : row.reqSelDet.find(
                                    (obj) => obj.idReqDet === row.idReqDet
                                  ).idReqSelDetEst === 3
                                    ? 'badge text-bg-warning p-2'
                                    : 'badge text-bg-success p-2'
                            }
                          >
                            {
                              row.reqSelDet.find(
                                (obj) => obj.idReqDet === row.idReqDet
                              ).desReqSelDetEst
                            }
                          </span>
                        </TableCell>
                        <TableCell align="left">{row.fecPedReqSel}</TableCell>
                        <TableCell align="left">
                          {row.fecTerReqSel === null
                            ? 'Aun no terminado'
                            : row.fecTerReqSel}
                        </TableCell>
                        <TableCell align="left">
                          {
                            row.reqSelDet.find(
                              (obj) => obj.idReqDet === row.idReqDet
                            ).nomProd
                          }
                        </TableCell>

                        <TableCell align="left">
                          {
                            row.reqSelDet.find(
                              (obj) => obj.idReqDet === row.idReqDet
                            ).canReqSelDet
                          }
                        </TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              disabled={row.idReqMolEst !== 3}
                              // onClick={() => {
                              //   openDialogVerificarRequisicion(row.id);
                              // }}
                              className="btn btn-success btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-shield-fill-check"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"
                                />
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
              count={dataRequisicionTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          {mostrarDetalle && (
            <RequisicionSeleccionDetalle
              detalle={detalleSeleccionado}
              onClose={closeDetalleRequisicionSeleccion}
            />
          )}
        </div>
        {/* FEEDBACK DELETE */}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={feedbackDelete}
          autoHideDuration={6000}
          onClose={handleCloseFeedback}
        >
          <Alert
            onClose={handleCloseFeedback}
            severity={style_message}
            sx={{ width: '100%' }}
          >
            {feedback_description_error}
          </Alert>
        </Snackbar>
      </div>
    </>
  )
}
