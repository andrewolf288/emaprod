import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { viewOperacionDevolucionCalidadById } from '../../helpers/operacion-devolucion/viewOperacionDevolucionCalidadById'
import { FilterMotivoDevolucionCalidad } from '../../../components/ReferencialesFilters/MotivoDevolucionCalidad/FilterMotivoDevolucionCalidad'
import { Snackbar, Typography } from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import { RowOperacionDevolucionCalidadDetalle } from '../../components/operacion-devolucion/RowOperacionDevolucionCalidadDetalle'
import { generateDetalleCambioProductos } from '../../helpers/operacion-devolucion/generateDetalleCambioProductos'
import { createOperacionDevolucionWithDetalle } from '../../helpers/operacion-devolucion/createOperacionDevolucionWithDetalle'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewOperacionDevolucionCalidad = () => {
  const { idOpeDevCal } = useParams()
  const [dataOperacionDevolucionCalidad, setOperacionDevolucionCalidad] =
    useState({
      idOpeDev: 0,
      invSerFac: '',
      invNumFac: '',
      idOpeDevDet: 0,
      idProdt: 0,
      nomProd: '',
      codProd: '',
      codProd2: '',
      canOpeDevDet: 0,
      idMotDevCal: null,
      numLots: 0,
      fueCom: 0,
      fecCreOpeDev: ''
    })
  const {
    invSerFac,
    invNumFac,
    idProdt,
    nomProd,
    canOpeDevDet,
    idMotDevCal,
    numLots,
    fecCreOpeDev
  } = dataOperacionDevolucionCalidad

  const [
    dataOperacionDevolucionCalidadDetalle,
    setDataOperacionDevolucionCalidadDetalle
  ] = useState([])

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false)

  // HANDLE CHANGE MOTIVO DEVOLUCION CALIDAD
  const handleChangeMotivoDevolucionCalidad = (value) => {
    const { id } = value
    setOperacionDevolucionCalidad({
      ...dataOperacionDevolucionCalidad,
      idMotDevCal: id
    })
  }

  // HANDLE CHANGE NUMERO DE LOTES
  const handleChangeNumeroLotes = ({ target }) => {
    const { value } = target
    setOperacionDevolucionCalidad({
      ...dataOperacionDevolucionCalidad,
      numLots: isNaN(value) ? value : parseInt(value)
    })
  }

  // ESTADO PARA CONTROLAR EL FEEDBACK
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

  // GENERAR DETALLE DE OPERACION DEVOLUCION CALIDAD
  const generateDetalleOperacionDevolucionCalidad = () => {
    if (isNaN(numLots) || numLots <= 0) {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'El numero de lotes debe ser mayor a 0'
      })
      handleClickFeeback()
    } else {
      const dataAux = []
      for (let i = 0; i < parseInt(numLots); i++) {
        const auxDetalle = {
          index: i,
          idOpeDevCal,
          idProdc: 0,
          idProdt,
          codLotProd: '',
          canLotProd: 0,
          fecVenLotProd: '',
          pH: '',
          consistencia30: '',
          consistencia60: '',
          color: '',
          sabor: '',
          olor: '',
          observacion: '',
          esReproceso: 0,
          esDetCamProd: false,
          detCamProd: []
        }
        dataAux.push(auxDetalle)
      }
      setDataOperacionDevolucionCalidadDetalle(dataAux)
    }
  }

  // funcion para cambiar valor de operacion devolucion caldiad
  const handleChangeValueDetalle = (index, name, value) => {
    const formatData = dataOperacionDevolucionCalidadDetalle.map((element) => {
      if (element.index === index) {
        return {
          ...element,
          [name]: value
        }
      } else {
        return element
      }
    })
    setDataOperacionDevolucionCalidadDetalle(formatData)
  }

  // funcion para asociar lote al detalle
  const handleAddLoteProduccionDetalle = (index, data) => {
    console.log(index, data)
    const { id, codLotProd, fecVenLotProd } = data
    const indexFilterData = dataOperacionDevolucionCalidadDetalle.findIndex(
      (element) => element.index === index
    )

    const dataFormat = [...dataOperacionDevolucionCalidadDetalle]
    dataFormat[indexFilterData] = {
      ...dataFormat[indexFilterData],
      idProdc: id,
      codLotProd,
      fecVenLotProd
    }
    console.log(dataFormat)

    setDataOperacionDevolucionCalidadDetalle(dataFormat)
  }

  // funcion para detalle de cambios
  const handleGenerateDetalleCambio = async (index, item) => {
    const { canLotProd } = item
    // primero obtenemos el valor numerico de la cantidad del detalle
    const parserCantidad = isNaN(canLotProd) ? 0 : parseInt(canLotProd)
    console.log(parserCantidad)

    // si es mayor a 0
    if (parserCantidad > 0) {
      let detalleCambioProducto = []
      let canTotDetCal = 0
      // recorremos el detalle para obtener informacion de las cantidades de los otros detalles
      dataOperacionDevolucionCalidadDetalle.forEach((element) => {
        if (element.index !== index) {
          detalleCambioProducto = [
            ...detalleCambioProducto,
            ...element.detCamProd
          ]
        }
        canTotDetCal += isNaN(element.canLotProd)
          ? 0
          : parseInt(element.canLotProd)
      })

      // si la cantidad total de los detalles es menor o igual al total del detalle
      if (canTotDetCal <= canOpeDevDet) {
        const formatData = {
          idProdt,
          canLotProd: parserCantidad,
          detalleCambiosRegistrados: detalleCambioProducto
        }
        console.log(formatData)

        const resultPeticion = await generateDetalleCambioProductos(formatData)

        const { message_error, description_error, result } = resultPeticion
        if (message_error.length === 0) {
          const indexFilterData =
            dataOperacionDevolucionCalidadDetalle.findIndex(
              (element) => element.index === index
            )

          const dataFormat = [...dataOperacionDevolucionCalidadDetalle]
          dataFormat[indexFilterData] = {
            ...dataFormat[indexFilterData],
            detCamProd: result
          }
          console.log(dataFormat)

          setDataOperacionDevolucionCalidadDetalle(dataFormat)
        } else {
          // mostramos el error recepcionado del backend
          setfeedbackMessages({
            style_message: 'warning',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
      } else {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error:
            'Para generar el detalle de cambios el total de cantidades debe ser menor o igual a la cantidad del detalle'
        })
        handleClickFeeback()
      }
    } else {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error:
          'Para generar el detalle de cambios debes ingresar una cantidad del total'
      })
      handleClickFeeback()
    }
  }

  // handle eliminar detalle de cambio de productos
  const handleChangeDetalleCambioProductos = (index, target) => {
    const { name, value } = target
    if (!value) {
      const indexFilterData = dataOperacionDevolucionCalidadDetalle.findIndex(
        (element) => element.index === index
      )

      const dataFormat = [...dataOperacionDevolucionCalidadDetalle]
      dataFormat[indexFilterData] = {
        ...dataFormat[indexFilterData],
        detCamProd: [],
        [name]: value
      }
      setDataOperacionDevolucionCalidadDetalle(dataFormat)
    } else {
      handleChangeValueDetalle(index, name, value)
    }
  }

  // funcion para crear la operacion devolucion calidad con su detalle
  const crearOperacionDevolucionCalidadWithDetalle = async () => {
    setdisableButton(true)
    let handleErrors = []
    if (
      idMotDevCal === 0 ||
      dataOperacionDevolucionCalidadDetalle.length === 0
    ) {
      if (idMotDevCal === 0) {
        handleErrors +=
          'Debes seleccionar un motivo de devolucion de calidad\n'
      }
      if (dataOperacionDevolucionCalidadDetalle.length === 0) {
        handleErrors +=
          'No se ha generado el detalle de devolucion de calidad\n'
      }
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
      setdisableButton(false)
    } else {
      // ningun lote debe estar vacio
      // la suma de cantidades de cada detalle debe sumar el total de la operacion de la devolucion
      const verificacionLote = dataOperacionDevolucionCalidadDetalle.some(
        (element) => element.idProdc === 0
      )
      let sumaTotal = 0
      dataOperacionDevolucionCalidadDetalle.forEach((element) => {
        sumaTotal += isNaN(element.canLotProd)
          ? 0
          : parseInt(element.canLotProd)
      })

      if (verificacionLote || sumaTotal !== canOpeDevDet) {
        if (verificacionLote) {
          handleErrors += 'Hay detalles que no tienen lote de destino\n'
        }

        if (sumaTotal !== canOpeDevDet) {
          handleErrors +=
            'El total de las cantidades de los detalles no es igual al detalle total de la devolución\n'
        }

        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: handleErrors
        })
        handleClickFeeback()
        setdisableButton(false)
      } else {
        const formatData = {
          ...dataOperacionDevolucionCalidad,
          detOpeDevCal: dataOperacionDevolucionCalidadDetalle
        }
        console.log(formatData)
        const resultPeticion = await createOperacionDevolucionWithDetalle(
          formatData
        )
        const { message_error, description_error } = resultPeticion
        if (message_error.length === 0) {
          setfeedbackMessages({
            style_message: 'success',
            feedback_description_error: 'Se realizó la operación con éxtio'
          })
          handleClickFeeback()
          setdisableButton(false)
          // cerramos
          setTimeout(() => {
            window.close()
          }, 1000)
        } else {
          setfeedbackMessages({
            style_message: 'warning',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
        setdisableButton(false)
      }
    }
  }

  // funcion para traer informacion de la operacion devolucion calidad
  const traerInformacionOperacionDevolucionCalidad = async () => {
    const resultPeticion = await viewOperacionDevolucionCalidadById(
      idOpeDevCal
    )
    const { result, message_error, description_error } = resultPeticion

    if (message_error.length === 0) {
      setOperacionDevolucionCalidad(result)
    } else {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  useEffect(() => {
    traerInformacionOperacionDevolucionCalidad()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Operacion devolucion</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos del Retorno Venta</h6>
            <div className="card-body">
              {/* FIRST ROW */}
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Correlativo</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${invSerFac}-${invNumFac}`}
                    className="form-control"
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canOpeDevDet}
                    className="form-control"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha creación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecCreOpeDev}
                    className="form-control"
                  />
                </div>
              </div>
              {/* SECOND ROW */}
              <div className="mb-3 row">
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo devolución calidad</b>
                  </label>
                  <FilterMotivoDevolucionCalidad
                    defaultValue={idMotDevCal}
                    onNewInput={handleChangeMotivoDevolucionCalidad}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Número de lotes</b>
                  </label>
                  <input
                    type="number"
                    value={numLots}
                    className="form-control"
                    onChange={handleChangeNumeroLotes}
                  />
                </div>
              </div>
              {/* BOTON CORRESPONDIENTE */}
              <div className="mb-3 row">
                <button
                  className="btn btn-primary"
                  onClick={generateDetalleOperacionDevolucionCalidad}
                >
                  Generar Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* DETALLES */}
        {dataOperacionDevolucionCalidadDetalle.length !== 0 && (
          <div className="row mt-4 mx-4">
            {dataOperacionDevolucionCalidadDetalle.map((element) => (
              <RowOperacionDevolucionCalidadDetalle
                key={element.index}
                nomProd={nomProd}
                detalle={element}
                onChangeValueDetalle={handleChangeValueDetalle}
                onAddLoteProduccion={handleAddLoteProduccionDetalle}
                onAddDetalleCambioProdutos={handleGenerateDetalleCambio}
                onChangeDetalleCambioProductos={
                  handleChangeDetalleCambioProductos
                }
              />
            ))}
          </div>
        )}
        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4 mb-4">
          <button
            type="button"
            onClick={() => {
              window.close()
            }}
            className="btn btn-secondary me-2"
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={disableButton}
            onClick={crearOperacionDevolucionCalidadWithDetalle}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>
      {/* FEEDBACK */}
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
