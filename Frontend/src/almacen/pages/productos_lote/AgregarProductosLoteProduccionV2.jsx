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

import { getProduccionWhitProductosFinales } from './../../helpers/producto-produccion/getProduccionWhitProductosFinales'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowProductosAgregadosProduccion } from './../../components/RowProductosAgregadosProduccion'
import { RowProductosDisponiblesProduccion } from './../../components/RowProductosDisponiblesProduccion'
import queryString from 'query-string'
import { TextField, Typography } from '@mui/material'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { createProductosFinalesLoteProduccion } from './../../helpers/producto-produccion/createProductosFinalesLoteProduccion'
import {
  DiaJuliano,
  FormatDateTimeMYSQLNow,
  letraAnio,
  FormatDateTimeMYSQLNowPlusYears
} from '../../../utils/functions/FormatDate'
import { DetalleProductosFinales } from './DetalleProductosFinales'
import FechaPicker from '../../../../src/components/Fechas/FechaPicker'
import FechaPickerYear from '../../../components/Fechas/FechaPickerYear'
import { EncabezadoInformacionProduccion } from '../../components/componentes-utils/EncabezadoInformacionProduccion'
import { FilterProductosProgramados } from '../../../components/ReferencialesFilters/Producto/FilterProductosProgramados'
import { updateFinEntregaProductosFinales } from '../../helpers/producto-produccion/updateFinEntregaProductosFinales'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const AgregarProductosLoteProduccionV2 = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const location = useLocation()
  const { idLotProdc = '' } = queryString.parse(location.search)

  // ESTADOS DE LOS PRODUCTOS FINALES DE LA PRODUCCION
  const [proFinProd, setProFinProd] = useState({
    id: 0,
    numop: '', // numero de orden de produccion
    canLotProd: 0, // cantidad de produccion
    codLotProd: '', // codigo de produccion
    desEstPro: '', // descripcion de estado de produccion
    desProdTip: '', // descripcion dle tipo de produccion
    fecVenLotProd: '', // fecha vencimiento de produccion
    idProdEst: 0, // id estado produccion
    idProdTip: 0, // id estado tipo produccion
    idProdt: 0, // id producto intermedio
    idSubCla: 0, // sub clase
    klgLotProd: '', // peso de la produccion
    nomProd: '', // nombre del producto intermedio
    proFinProdDet: [] // productos finales programados
  })

  const {
    id, // id del proceso de produccion
    proFinProdDet, // productos finales programados
    codLotProd, // codigo de lote de produccion
    idSubCla
  } = proFinProd

  // PRODUCTOS FINALES DISPONIBLES POR PRODUCCIÓN
  const [detalleProductosFinales, setdetalleProductosFinales] = useState([])

  // STATES PARA AGREGAR PRESENTACIONES FINALES
  const [productoFinal, setproductoFinal] = useState({
    idProdFin: 0,
    cantidadIngresada: 0.0,
    fecEntSto: FormatDateTimeMYSQLNow(),
    fecVenSto: ''
  })
  const { idProdFin, cantidadIngresada, fecEntSto, fecVenSto } = productoFinal

  // ******* ACCIONES DE FILTER PRODUCTO FINAL ******
  // MANEJADOR DE PRODUCTO
  const onAddProductoFinalSubProducto = (value) => {
    let year = 0
    // si la UM de al presentacion final es LTS, entonces year = 1
    if (idSubCla === 50) {
      year = 1 // frescos
    } else {
      year = 4 // otros
    }

    // Calculamos automaticamente su fecha de vencimiento
    const fecVenEntProdFin = FormatDateTimeMYSQLNowPlusYears(year)
    setproductoFinal({
      ...productoFinal,
      idProdFin: value.id, // id de de la presentacion final
      fecVenSto: fecVenEntProdFin // fecha de vencimiento
    })
  }

  // Manejador de cantidad de presentacion final
  const handledFormCantidadIngresada = ({ target }) => {
    const { name, value } = target
    setproductoFinal({
      ...productoFinal,
      [name]: value
    })
  }

  // Manejador de fecha de ingreso de presentacion final
  const onAddFecEntSto = (newfecEntSto) => {
    let year = 0
    // si la UM de al presentacion final es LTS, entonces year = 1
    if (idSubCla === 50) {
      year = 1 // frescos
    } else {
      year = 4 // otros
    }

    const newfecVenEnt = FormatDateTimeMYSQLNowPlusYears(year, newfecEntSto)

    setproductoFinal({
      ...productoFinal,
      fecEntSto: newfecEntSto,
      fecVenSto: newfecVenEnt
    })
  }

  // Manejador de fecha de vencimiento de presentacion final
  const onAddFecVenSto = (newfecEntSto) => {
    setproductoFinal({
      ...productoFinal,
      fecVenSto: newfecEntSto
    })
  }

  // ********* ESTADO PARA CONTROLAR EL FEEDBACK **********
  const [feedbackCreate, setfeedbackCreate] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackCreate(false)
  }

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false)

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  // ******** MANEJO PARA EL ARREGLO DE PRODUCTOS FINALES **********

  // AÑADIR PRODUCTOS FINALES AL DETALLE
  const handleAddProductoFinal = async (e) => {
    e.preventDefault()

    // comprobamos si se ingresaron los datos necesarios
    if (idProdFin !== 0 && cantidadIngresada > 0.0) {
      // primero verificamos si ya se ingreso la presentacion final
      const itemFound = detalleProductosFinales.find(
        (element) => element.idProdt === idProdFin
      )

      // si se encontro la presentacion final, mostramos una alerta
      if (itemFound) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: 'Ya se agrego esta presentación final'
        })
        handleClickFeeback()
      } else {
        // traemos los datos de presentacion final
        const resultPeticion = await getMateriaPrimaById(idProdFin)
        const { message_error, description_error, result } = resultPeticion
        if (message_error.length === 0) {
          const {
            id: idProd,
            codProd,
            codProd2,
            desCla,
            desSubCla,
            nomProd,
            simMed
          } = result[0]

          // buscamos en el detall de presentaciones programadas
          const productMatch = proFinProdDet.find(
            (element) => element.idProdt === idProd
          )

          const idProdFinal = productMatch?.id // referencia directa a la celda de producto final de lote de produccion

          // generamos nuestro detalle
          const detalle = {
            idProdFinal, // referencia directa a su producto programado
            idProdc: id, // lote de produccion asociado
            idProdt: idProd, // id producto
            codProd, // codigo de producto sigo
            codProd2, // codigo emaprod
            desCla, // clase del producto
            desSubCla, // subclase del producto
            nomProd, // nombre del producto
            simMed, // medida del producto
            fecEntSto, // fecha de entrada
            fecVenEntProdFin: fecVenSto, // fecha de vencimiento
            canProdFin: cantidadIngresada // cantidad de presentacion final ingresada
          }

          const dataDetalle = [...detalleProductosFinales, detalle]

          setdetalleProductosFinales(dataDetalle)
        } else {
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
      }
    } else {
      let handledErrors = ''

      if (idProdFin === 0) {
        handledErrors += 'No se ha proporcionado una presentación final\n'
      }

      if (cantidadIngresada <= 0) {
        handledErrors += 'No se ha proporcionado una cantidad\n'
      }

      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handledErrors
      })
      handleClickFeeback()
    }

    // reset de los filtros
    setproductoFinal({
      idProdFin: 0,
      cantidadIngresada: 0.0,
      fecEntSto: FormatDateTimeMYSQLNow(),
      fecVenSto: ''
    })
  }

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoFinal = async ({ target }, idItem) => {
    const { value, name } = target
    const editFormDetalle = detalleProductosFinales.map((element) => {
      if (element.idProdt === idItem) {
        return {
          ...element,
          [name]: value
        }
      } else {
        return element
      }
    })
    setdetalleProductosFinales(editFormDetalle)
  }

  // ACCION PARA ELIMINA DEL DETALLE UN PRODUCTO FINAL
  const handleDeleteDetallePresentacionFinal = async (idItem) => {
    // filtramos el elemento eliminado
    const dataDetalleProductosDevueltos = detalleProductosFinales.filter(
      (element) => {
        if (element.idProdt !== idItem) {
          return true
        } else {
          return false
        }
      }
    )

    // establecemos el detalle
    setdetalleProductosFinales(dataDetalleProductosDevueltos)
  }

  // ******** OBTENER DATA DE PRODUCTOS FINALES *********
  const obtenerDataProductosFinalesProduccion = async () => {
    // traer informacion de backend sobre el lote de produccion y sus productos finales
    const resultPeticion = await getProduccionWhitProductosFinales(idLotProdc)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      // establecemos el valor con la informacion de la llamada
      setProFinProd(result[0])
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  /*
    Funciones que nos permiten dar por finalizar el ingreso de una presentacion final en particular
  */
  const finalizarEntregasPresentacionFinal = async (data, variacion) => {
    const dataActualizacion = {
      dataPresentacionFinal: {
        idProdcProdFin: data.id,
        canTotProgProdFin: data.canTotProgProdFin,
        canTotIngProdFin: data.canTotIngProdFin,
        idProdt: data.idProdt,
        idProdcProdtFinEst: variacion > 0 ? 3 : variacion == 0 ? 4 : 2 // menor, conforme, mayor a lo programado
      },
      idProdc: id // id de produccion
    }

    const { message_error, description_error } =
      await updateFinEntregaProductosFinales(dataActualizacion)
    if (message_error.length === 0) {
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'Se actualizó con éxito'
      })
      handleClickFeeback()

      setTimeout(() => {
        window.close()
      }, '1000')
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  // ****** SUBMIT PRODUCTOS FINALES ******
  const crearProductosFinalesLoteProduccion = async () => {
    const datosProduccion = {
      idProduccion: id,
      codLotProd
    }

    detalleProductosFinales.forEach((obj) => {
      obj.letAniEntSto = letraAnio(obj.fecEntSto)
      obj.diaJulEntSto = DiaJuliano(obj.fecEntSto)
    })

    const resultPeticion = await createProductosFinalesLoteProduccion(
      detalleProductosFinales,
      datosProduccion
    )
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      onNavigateBack()
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'Guardado con exito'
      })
      handleClickFeeback()

      setTimeout(() => {
        window.close()
      }, '1000')
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
    setdisableButton(false)
  }

  const handleSubmitProductosFinalesLoteProduccion = (e) => {
    e.preventDefault()

    if (detalleProductosFinales.length === 0) {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'No has agregado items al detalle'
      })
      handleClickFeeback()
    } else {
      setdisableButton(true)
      crearProductosFinalesLoteProduccion()
    }
  }

  // CODIGO QUE SE EJECUTA ANTES DE LA RENDERIZACION
  useEffect(() => {
    obtenerDataProductosFinalesProduccion()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Agregar Productos Finales</h1>
        <div className="row mt-4 mx-4">
          {/* DATOS DE LA PRODUCCION */}
          <EncabezadoInformacionProduccion datosProduccion={proFinProd} />

          {/* PRODUCTOS AGREGADOS */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <b>Presentaciones finales agregadas</b>
            </h6>
            <div className="card-body">
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
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <b>Unidad</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Cantidad programada</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Cantidad ingresada</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Estado entrega</b>
                        </TableCell>
                        <TableCell align="left" width={10} sx={{ width: 5 }}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proFinProdDet.map((row, index) => (
                        <RowProductosAgregadosProduccion
                          key={index}
                          detalle={row}
                          DetalleProductosFinales={DetalleProductosFinales}
                          onTerminarIngresos={
                            finalizarEntregasPresentacionFinal
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>

          {/* PRODUCTOS POR AGREGAR */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <b>Agregar presentaciones finales</b>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-4">
                  <label className="form-label">
                    Producto final o sub producto
                  </label>
                  {proFinProdDet.length !== 0 && (
                    <FilterProductosProgramados
                      onNewInput={onAddProductoFinalSubProducto}
                      products={proFinProdDet
                        .filter((element) => !element.esTerIngProFin)
                        .map((element) => ({
                          id: element.idProdt,
                          nomProd: element.nomProd,
                          codProd2: element.codProd2,
                          simMed: element.sinMed,
                          desCla: element.desCla
                        }))}
                      defaultValue={idProdFin}
                    />
                  )}
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de entrada</label>
                  <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de vencimiento</label>
                  <FechaPickerYear
                    onNewfecEntSto={onAddFecVenSto}
                    date={fecVenSto}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <br />
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadIngresada"
                    value={cantidadIngresada}
                    onChange={handledFormCantidadIngresada}
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-2 align-self-center">
                  <button
                    onClick={handleAddProductoFinal}
                    className="btn btn-primary"
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
                  </button>
                </div>
              </form>
              {/* LISTA DE PRODUCTOS */}
              <div className="mb-3 row">
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
                          <TableCell align="left" width={200}>
                            <b>Nombre</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>Unidad</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Clase</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Fecha entrada</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Fecha vencimiento</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Cantidad</b>
                          </TableCell>
                          <TableCell align="center" width={100}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleProductosFinales.map((row, index) => (
                          <RowProductosDisponiblesProduccion
                            key={index}
                            detalle={row}
                            onDeleteDetalle={
                              handleDeleteDetallePresentacionFinal
                            }
                            onChangeDetalle={handleChangeInputProductoFinal}
                            showButtonDelete={true}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>

          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar mt-4">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Volver
            </button>
            <button
              type="submit"
              onClick={handleSubmitProductosFinalesLoteProduccion}
              className="btn btn-primary"
              value={disableButton}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: '100%' }}
        >
          <Typography whiteSpace={'pre-line'}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}
