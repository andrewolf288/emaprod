import React, { useState, useEffect } from 'react'
// HOOKS
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { IconButton, TextField } from '@mui/material'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { FilterProveedor } from './../../../components/ReferencialesFilters/Proveedor/FilterProveedor'
import FechaPickerMonth from './../../../components/Fechas/FechaPickerMonth'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { getEntradasStockCalidad } from '../../helpers/entradas-stock/getEntradasStockCalidad'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { FilterAllProductosFilters } from '../../../components/ReferencialesFilters/Producto/FilterAllProductosFilters'

// CONFIGURACIONES DE ESTILOS
// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ListEntradaStockCalidad = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataEntSto, setdataEntSto] = useState([])
  const [dataEntStoTemp, setdataEntStoTemp] = useState([])

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  // filtros
  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  })
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
    obtenerDataEntradaStockCalidad(body)
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
    obtenerDataEntradaStockCalidad(body)
  }

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackDelete(false)
  }

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    filter(value, name)
  }

  // Manejador de cambio de producto
  const onChangeProducto = ({ label }) => {
    filter(label, 'filterProducto')
  }

  const onChangeProveedor = ({ label }) => {
    filter(label, 'filterProveedor')
  }

  // funcion para filtrar
  const filter = (terminoBusqueda, name) => {
    let resultSearch = []
    switch (name) {
    case 'filterProducto':
      resultSearch = dataEntSto.filter((element) => {
        if (
          element.nomProd
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntStoTemp(resultSearch)
      break

    case 'filterProveedor':
      resultSearch = dataEntSto.filter((element) => {
        if (
          element.nomProv
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntStoTemp(resultSearch)
      break

    case 'filterCodigoEntrada':
      resultSearch = dataEntSto.filter((element) => {
        if (
          element.codEntSto
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntStoTemp(resultSearch)
      break

    case 'filterIngreso':
      resultSearch = dataEntSto.filter((element) => {
        if (
          element.canTotEnt
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntStoTemp(resultSearch)
      break

    default:
    }
  }

  // reset filters
  const resetFilters = () => {
    setdataEntStoTemp(dataEntSto)
  }

  const obtenerDataEntradaStockCalidad = async (body = null) => {
    const resultPeticion = await getEntradasStockCalidad(body)
    const { result, message_error, description_error } = resultPeticion
    console.log(resultPeticion)
    if (message_error.length === 0) {
      setdataEntSto(result)
      setdataEntStoTemp(result)
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
    }
  }

  useEffect(() => {
    obtenerDataEntradaStockCalidad()
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4 mb-4">
          <div className="col-9">
            <div className="row" style={{ border: '0px solid black' }}>
              <div
                className="col-2"
                style={{
                  border: '0px solid black',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div
                className="col-2"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
              <button className="btn btn-success col-1" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <TableContainer component={Paper}>
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
                <TableCell align="left" width={180}>
                  <b>Fecha entrada</b>
                </TableCell>
                <TableCell align="left" width={70}>
                  ¿Evaluado?
                </TableCell>
                <TableCell align="left" width={70}>
                  Estado
                </TableCell>
                <TableCell align="left" width={400}>
                  <b>Producto</b>
                  <FilterAllProductosFilters onNewInput={onChangeProducto} />
                </TableCell>
                <TableCell align="left" width={200}>
                  <b>Proveedor</b>
                  <FilterProveedor onNewInput={onChangeProveedor} />
                </TableCell>
                <TableCell align="left" width={100}>
                  <b>Codigo</b>
                  <TextField
                    name="filterCodigoEntrada"
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
                <TableCell align="left" width={50}>
                  <b>Ingreso</b>
                  <TextField
                    name="filterIngreso"
                    onChange={handleFormFilter}
                    type="number"
                    size="small"
                    InputProps={{
                      style: {
                        color: 'black',
                        background: 'white'
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="center" width={120}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataEntStoTemp.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell align="center">{row.fecEntSto}</TableCell>
                  <TableCell align="center">
                    {row.idEntCalEst !== null
                      ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          fill="currentColor"
                          color="green"
                          className="bi bi-check-circle-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                      )
                      : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          color="red"
                          fill="currentColor"
                          className="bi bi-x-circle-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                        </svg>
                      )}
                  </TableCell>
                  <TableCell>
                    {row.idEntCalEst === null
                      ? (
                        <span className="badge bg-secondary">No evaluado</span>
                      )
                      : row.idEntCalEst === 1
                        ? (
                          <span className="badge bg-success">
                            {row.desEntCalEst}
                          </span>
                        )
                        : (
                          <span className="badge bg-danger">
                            {row.desEntCalEst}
                          </span>
                        )}
                  </TableCell>
                  <TableCell>{row.nomProd}</TableCell>
                  <TableCell>{row.nomProv}</TableCell>
                  <TableCell>{row.codEntSto}</TableCell>
                  <TableCell>{row.canTotEnt}</TableCell>
                  <TableCell align="center">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => {
                          window.open(
                            `/calidad/entradas-stock/view/${row.id}`,
                            '_blank'
                          )
                        }}
                      >
                        <VisibilityIcon fontSize="large" color="primary" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* FEEDBACK */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    </>
  )
}
