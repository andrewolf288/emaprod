import React, { useState, useEffect } from "react"
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
// IMPORTACIONES PARA EL FEEDBACK
import MuiAlert from "@mui/material/Alert"
import { Snackbar, TextField, Typography } from "@mui/material"
// IMPORTACIONES DE PETICIONES
import { getProduccionLote } from "./../../helpers/produccion_lote/getProduccionLote"
import { getProduccionSumaryData } from "../../helpers/produccion_lote/getProduccionSumaryData"
// IMPORTACIONES DE FILTROS
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion"
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth"
import { useForm } from "./../../../hooks/useForm"
// IMPORTACIONES DE NAVEGACION
import { Link } from "react-router-dom"
// COMPONENTES
import ReactDOM from "react-dom"
import { PDFExample } from "../../components/pdf-components/PDFExample"
// FUNCIONES UTILES
// ICONOS
import iconProductosFinales from "../../../../src/assets/icons/productos-finales.png"
import iconAgregaciones from "../../../../src/assets/icons/agregaciones.png"
import iconDevoluciones from "../../../../src/assets/icons/devoluciones.png"
// import { DialogProduccionSumary } from "../../components/componentes-produccion/DialogProduccionSumary"
import config from "../../../config"
import axios from "axios"

const generatePDF = (data) => {
  const windowName = data.produccion.numop
  const newWindow = window.open("", windowName, "fullscreen=yes")
  ReactDOM.render(<PDFExample result={data} />, newWindow.document.body)
}

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ListProduccionLote = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataProduccionLote, setdataProduccionLote] = useState([])
  const [dataProduccionLoteTemp, setdataProduccionLoteTemp] = useState([])

  const [inputs, setInputs] = useState({
    producto: { label: "" },
    provedor: { label: "" },
    estado: { label: "" },
    tipoProduccion: { label: "" },
    estadoInicio: { label: "" },
    numeroOP: "",
    lotePrduccion: ""
  })


  const {
    formState,
    setFormState,
  } = useForm({
    fecProdLotIni: "",
    fecProdLotFin: ""
  })

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: ""
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setfeedbackCreate(false)
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
    setInputs({
      ...inputs,
      [name]: value
    })
  }

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj
    })
  }

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0]
    setFormState({ ...formState, fecProdLotIni: dateFormat })
    let body = {
      ...formState,
      fecProdLotIni: dateFormat
    }
    obtenerDataProduccionLote(body)
  }

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0]
    setFormState({ ...formState, fecProdLotFin: dateFormat })
    let body = {
      ...formState,
      fecProdLotFin: dateFormat
    }
    obtenerDataProduccionLote(body)
  }

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  // const obtenerDataSummary = async (id) => {
  //   try {
  //     const resultPeticion = await getProduccionSumaryData(id)
  //     setData(resultPeticion.data) // Guardar los datos en el estado
  //     setOpen(true) // Abrir la ventana modal
  //   } catch (error) {
  //     // Mostramos una alerta
  //     setfeedbackMessages({
  //       style_message: "warning",
  //       feedback_description_error: "Error al obtener los datos: " + error
  //     })
  //     handleClickFeeback()
  //   }
  // }

  // boton de creacion de PDF sumary
  const handleButtonPDF = async (id) => {
    try {
      const { result } = await getProduccionSumaryData(id)
      console.log(result)

      // recorremos las requisiciones del proceso de produccion
      result?.requisiciones?.map((req) => {
        // esta variable guardara los totales: {idProdt: cantidad, idProdt: cantidad}
        const totales = {}
        // esta variable guardara los repetidos: {idProdt: {item}, idProdt: {item}}
        const repetidos = {}

        // recorremos el detalle de requisicion
        req.detalles.forEach((item) => {
          // obtenemos id y cantidad
          const { idProdt, canReqDet } = item
          // si aun no existe en totales, lo agregamos
          if (!totales[idProdt]) {
            totales[idProdt] = 0
          } else {
            // caso contrario chancamos repetios[idProdt] cada vez que se repita
            repetidos[idProdt] = { ...item }
          }

          // sumamos el total en totales[idProdt]
          totales[idProdt] += parseFloat(canReqDet)
          // añadimos la propiedad acu (acumulado parcial) al item
          item.acu = totales[idProdt]
        })

        // aqui obtenemos todos los repetidos y le establecemos el acumulado final
        const totalesFinales = Object.keys(repetidos).map((item) => {
          return {
            ...repetidos[item],
            acu: totales[item]
          }
        })

        // agregamos el resumen de productos acumulados
        req.resumenProductos = totalesFinales
        // }
      })
      generatePDF(result)
    } catch (error) {
      // Mostramos una alerta
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Error al obtener los datos: " + error
      })
      handleClickFeeback()
    }
  }

  // funcion para descargar
  const exportarReporte = (idLotProd) => {
    console.log(idLotProd)
    const domain = config.API_URL
    const path = "/produccion/produccion-lote/generate_reporte_produccion.php"
    axios({
      url: domain + path,
      data: { idLotProd },
      method: "POST",
      responseType: "blob" // Importante para recibir datos binarios (Blob)
    })
      .then((response) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-produccion-${idLotProd}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => alert("Error al descargar el archivo", error))
  }

  // MANEJO DE FILTROS
  useEffect(() => {
    let resultSearch = []
    dataProduccionLote.map((data) => {
      if (
        (inputs.estado.label.includes(data.desEstPro) ||
          inputs.estado.label.length == 0) &&
        (inputs.tipoProduccion.label.includes(data.desProdTip) ||
          inputs.tipoProduccion.label.length == 0) &&
        (inputs.producto.label.includes(data.nomProd) ||
          inputs.producto.label.length == 0) &&
        (inputs.estadoInicio.label.includes(data.desProdIniProgEst) ||
          inputs.estadoInicio.label.length == 0) &&
        (data.numop.includes(inputs.numeroOP) || inputs.numeroOP.length == 0) &&
        (data.codLotProd?.includes(inputs.lotePrduccion) ||
          inputs.lotePrduccion.length == 0)
      ) {
        resultSearch.push({ ...data })
      }
    })
    setdataProduccionLoteTemp(resultSearch)
  }, [inputs, dataProduccionLote])

  // reset filtros
  const resetData = () => {
    setdataProduccionLoteTemp(dataProduccionLote)
    setInputs({
      producto: { label: "" },
      provedor: { label: "" },
      estado: { label: "" },
      tipoProduccion: { label: "" },
      estadoInicio: { label: "" },
      numeroOP: "",
      lotePrduccion: ""
    })
  }

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataProduccionLote = async (body = {}) => {
    const resultPeticion = await getProduccionLote(body)
    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      setdataProduccionLote(result)
      setdataProduccionLoteTemp(result)
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  // TRAEMOS LOS DATOS DE ORDENES DE PRODUCCION
  useEffect(() => {
    obtenerDataProduccionLote()
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

              <div className="col-2 d-flex align-items-end">
                <button onClick={resetData} className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-clockwise"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-6">
                <Link
                  to={"/produccion/produccion-lote/crear"}
                  className="btn btn-primary d-inline-flex justify-content-end align-items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-circle-fill me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                  </svg>
                  Agregar
                </Link>
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
                      "& th": {
                        color: "rgba(96, 96, 96)",
                        backgroundColor: "#f5f5f5"
                      }
                    }}
                  >
                    <TableCell align="left">
                      <b>Lote</b>
                      <TextField
                        name="lotePrduccion"
                        value={inputs.lotePrduccion}
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                            width: 95
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left">
                      <b>Número OP</b>
                      <TextField
                        name="numeroOP"
                        value={inputs.numeroOP}
                        onChange={handleFormFilter}
                        type="text"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            textTransform: "uppercase",
                            color: "black",
                            background: "white",
                            width: 180
                          },
                          inputProps: {
                            pattern: "[A-Z0-9]*"
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left">
                      <b>Producto</b>
                      <FilterProductoProduccion
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>

                    <TableCell align="left">
                      <b>Estado</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>Inicio</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>Inicio Programado</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>Estado Inicio</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataProduccionLoteTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLotProd}
                        </TableCell>
                        <TableCell align="left">{row.numop}</TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="left">{row.desEstPro}</TableCell>
                        <TableCell align="center">{row.fecProdIni}</TableCell>
                        <TableCell align="center">
                          {row.fecProdIniProg}
                        </TableCell>
                        <TableCell align="left">
                          {row.desProdIniProgEst}
                        </TableCell>
                        <TableCell align="left">
                          <div
                            className="btn-toolbar"
                            style={{
                              display: "flex",
                              flexWrap: "nowrap"
                            }}
                          >
                            {/* RESUMEN DE PRODUCCION */}
                            {/* <button
                              title="Resumen producción"
                              onClick={async () => {
                                obtenerDataSummary(row.id)
                              }}
                              className="btn btn-primary me-2"
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
                            </button> */}
                            {/* BOTON DE PDF */}
                            <button
                              title="PDF produccion"
                              onClick={() => {
                                handleButtonPDF(row.id, "detalleOrden")
                              }}
                              className="btn btn-danger me-2 btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-file-earmark-pdf-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                                <path
                                  fillRule="evenodd"
                                  d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                                />
                              </svg>
                            </button>
                            {/* BOTON DE EXPORTACION EN EXCEL */}
                            <button
                              className="btn btn-success me-2 btn"
                              onClick={() => {
                                exportarReporte(row.id)
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-file-earmark-excel-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64" />
                              </svg>
                            </button>
                            {/* BOTON DE INGRESO DE PRODUCTOS */}
                            <div
                              className="btn btn-outline-secondary me-2"
                              title="Presentaciones finales"
                              onClick={() => {
                                window.open(
                                  `/almacen/productos-lote/crear?idLotProdc=${row.id}`,
                                  "_blank"
                                )
                              }}
                            >
                              <img
                                alt="Boton ingreso productos"
                                src={iconProductosFinales}
                                height={25}
                                width={25}
                              />
                            </div>
                            {/* BOTON DE DEVOLUCIONES */}
                            <div
                              className="btn btn-outline-secondary me-2"
                              title="Devoluciones"
                              onClick={() => {
                                window.open(
                                  `/almacen/produccion-devoluciones/crear?idLotProdc=${row.id}`,
                                  "_blank"
                                )
                              }}
                            >
                              <img
                                alt="Boton devoluciones"
                                src={iconDevoluciones}
                                height={25}
                                width={25}
                              />
                            </div>
                            {/* BOTON DE AGREGACIONES */}
                            <div
                              className="btn btn-outline-secondary me-2"
                              title="Agregaciones"
                              onClick={() => {
                                window.open(
                                  `/almacen/produccion-agregaciones/crear?idLotProdc=${row.id}`,
                                  "_blank"
                                )
                              }}
                            >
                              <img
                                alt="boton agregaciones"
                                src={iconAgregaciones}
                                height={25}
                                width={25}
                              />
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
              count={dataProduccionLoteTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
      {/* DIALOG DE SUMARY */}
      {/* <DialogProduccionSumary data={data} /> */}
      {/* ALERT */}
      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: "100%" }}
        >
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}
