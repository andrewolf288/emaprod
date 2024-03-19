import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import queryString from 'query-string'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

import { getRequisicionSeleccionDetalleById } from './../../helpers/requisicion-seleccion/getRequisicionSeleccionDetalleById'
import { getSalidasDisponiblesForSeleccion } from './../../helpers/requisicion-seleccion/getSalidasDisponiblesForSeleccion'
import { createEntradasStockByReqSelDet } from '../../helpers/requisicion-seleccion/createEntradasStockByReqSelDet'
import FechaPicker from './../../../components/Fechas/FechaPicker'
import { RowSalidaDisponibleSeleccion } from './../../components/RowSalidaDisponibleSeleccion'
import FechaPickerYear from '../../../components/Fechas/FechaPickerYear'
import {
  DiaJuliano,
  FormatDateTimeMYSQLNow,
  letraAnio
} from '../../../utils/functions/FormatDate'
import { FilterMateriaPrimaSelecionadaByRef } from '../../../components/ReferencialesFilters/Producto/FilterMateriaPrimaSelecionadaByRef'
import { Typography } from '@mui/material'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})
export const EntradaStock = () => {
  const location = useLocation()

  const { idReqSelDet = '' } = queryString.parse(location.search)

  // ESTADOS PARA EL FORMULARIO DE SALIDA
  const [entradaSeleccion, setentradaSeleccion] = useState({
    codLotSel: '',
    idReqSelDet: 0,
    idReqSel: 0,
    codReqSel: '',
    idMatPri: 0,
    codMatPri: '',
    salStoSelDet: [],
    codProd: '',
    codProd2: '',
    canReqSelDet: 0
  })

  const {
    idReqSel,
    codLotSel,
    idMatPri,
    codProd,
    codProd2,
    nomProd,
    canReqSelDet
  } = entradaSeleccion

  // ESTADO PARA LA ENTRADA DE REQUISICION SELECCION
  const [canReqSelEnt, setCanReqSelEnt] = useState(0)

  // ESTADO PARA EL PRODUCTO DE ENTRADA
  const [datosEntrada, setdatosEntrada] = useState({
    prodtEnt: 0,
    codProdEnt: '',
    fecVenEntSto: '',
    fecEnt: FormatDateTimeMYSQLNow(),
    fecVent: ''
  })

  const { prodtEnt } = datosEntrada

  // *********** FUNCIONES PARA MANEJO DE DATOS DE ENTRADA **********
  // agregar materia prima seleccionada
  const onAddProductoSeleccionadoEntrada = ({ id, value }) => {
    setdatosEntrada({
      ...datosEntrada,
      prodtEnt: id,
      codProdEnt: value
    })
  }

  const onAddFecEntSto = (newfecEntSto) => {
    setdatosEntrada({ ...datosEntrada, fecEnt: newfecEntSto })
  }
  const onAddFecVenSto = (newfecEntSto) => {
    setdatosEntrada({ ...datosEntrada, fecVent: newfecEntSto })
  }
  // ESTADO PARA LAS SALIDAS DISPONIBLES
  const [salidasDisponibles, setsalidasDisponibles] = useState([])

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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false)

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  // CONTROLADOR DE FORMULARIO
  const handleForm = ({ target }) => {
    const { value } = target
    setCanReqSelEnt(value)
  }

  // MANEJADOR PARA ACTUALIZAR REQUISICION
  const handledSalidasDetalle = (name, value, idSalida) => {
    const updateSalidasDetalle = salidasDisponibles.map((element) => {
      if (element.id === idSalida) {
        return {
          ...element,
          [name]: value
        }
      } else {
        return element
      }
    })

    setsalidasDisponibles(updateSalidasDetalle)
  }

  // ************* REPARTIR LA ENTRADA DE LA REQUISICION SELECCION ENTRE SUS DIFERENTES SALIDAS *************
  const repartirEntradaRequisicionSeleccion = () => {
    if (canReqSelEnt > 0) {
      // parseamos el valor de la cantidad de ingreso de la requisicion
      // const cantidadRequisicion = parseInt(canReqSelDet, 10);
      const cantidadRequisicion = parseFloat(canReqSelDet)

      // recorremos las salidas y las actualizamos segun la regla de 3 simple
      const salidasRequisicionSeleccion = salidasDisponibles.map((element) => {
        const canEntStoReqSel =
          (element.canSalStoReqSel * canReqSelEnt) / cantidadRequisicion
        return {
          ...element,
          canEntStoReqSel: parseFloat(canEntStoReqSel).toFixed(3),
          merReqSel: parseFloat(
            element.canSalStoReqSel - canEntStoReqSel
          ).toFixed(3)
        }
      })

      // console.log(salidasRequisicionSeleccion);
      setsalidasDisponibles(salidasRequisicionSeleccion)
    } else {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'La entrada debe ser mayor que 0'
      })
      handleClickFeeback()
    }
  }

  // TRAER DATOS DE REQUISICION SELECCION DETALLE
  const traerDatosRequisicionSeleccionDetalle = async () => {
    if (idReqSelDet.length !== 0) {
      try {
        const resultData = await getRequisicionSeleccionDetalleById(
          idReqSelDet
        )
        const { message_error, description_error, result } = resultData

        if (message_error.length === 0) {
          const {
            idReqSel,
            nomProd,
            idMatPri,
            codLotSel,
            codProd,
            codProd2,
            canReqSelDet
          } = result[0]
          setentradaSeleccion({
            ...entradaSeleccion,
            idReqSel,
            idReqSelDet: parseInt(idReqSelDet, 10),
            nomProd,
            idMatPri,
            codLotSel,
            codProd,
            codProd2,
            canReqSelDet
          })
          traerDatosEntradasDisponibles(idReqSel, idMatPri)
        } else {
          console.log('Se proporciono un id inexistente')
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
        setdisableButton(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const traerDatosEntradasDisponibles = async (idReqSel, idMatPri) => {
    const { result } = await getSalidasDisponiblesForSeleccion(
      idReqSel,
      idMatPri
    )

    console.log(result)
    setsalidasDisponibles(result)
  }

  const crearEntradasStockByRequisicionSeleccionDetalle = async () => {
    // const fechaIngreso = FormatDateTimeMYSQLNow();
    const datEntSto = {
      ...datosEntrada,
      letAniEntSto: letraAnio(datosEntrada.fecEnt),
      diaJulEntSto: DiaJuliano(datosEntrada.fecEnt),
      fecEntSto: datosEntrada.fecEnt
    }

    const data = {
      ...entradaSeleccion,
      salStoSelDet: salidasDisponibles,
      datEntSto
    }
    console.log(data)

    // setdisableButton(false);
    // return;

    const resultPeticion = await createEntradasStockByReqSelDet(data)
    console.log(resultPeticion)
    const { message_error, description_error } = resultPeticion

    if (message_error.length === 0) {
      // Volvemos a la vista de requisiciones
      onNavigateBack()
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
    setdisableButton(false)
  }

  // enviar salida
  const onSubmitSalidaStock = (e) => {
    e.preventDefault()

    let handleErrors = ''

    if (
      salidasDisponibles.length === 0 ||
      idReqSel === 0 ||
      idMatPri === 0 ||
      prodtEnt === 0 ||
      datosEntrada.fecVent.length === 0
    ) {
      if (salidasDisponibles.length === 0) {
        handleErrors += '- No se encontraron salidas disponibles\n'
      }

      if (prodtEnt === 0) {
        handleErrors += '- Debes elegir un producto de entrada\n'
      }

      if (datosEntrada.fecVent.length === 0) {
        handleErrors +=
          '- No ha proporcionado una fecha de vencimiento para la entrada\n'
      }

      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
    } else {
      // establecemos un mensaje
      let message_error = ''
      // recorremos las salidas disponibles
      for (let i = 0; i < salidasDisponibles.length; i++) {
        const element = { ...salidasDisponibles[i] }
        if (element.canEntStoReqSel < 0 || element.merReqSel < 0) {
          message_error =
            'No se proporciono las cantidades de las salidas realizadas'
          break
        } else {
          const canPlusMer =
            parseFloat(element.canEntStoReqSel) + parseFloat(element.merReqSel)
          console.log(
            parseFloat(element.canEntStoReqSel),
            parseFloat(element.merReqSel),
            parseFloat(canPlusMer).toFixed(2),
            parseFloat(element.canSalStoReqSel),
            parseFloat(canPlusMer).toFixed(3) !=
              parseFloat(element.canSalStoReqSel).toFixed(3)
          )

          if (
            parseFloat(canPlusMer).toFixed(3) !=
            parseFloat(element.canSalStoReqSel).toFixed(3)
          ) {
            message_error = `En la salida de: ${element.canSalStoReqSel} no coinciden la cantidad entrada y la merma`
            break
          }
        }
      }

      // evaluamos el valor del mensaje de error

      if (message_error.length === 0) {
        setdisableButton(true)
        crearEntradasStockByRequisicionSeleccionDetalle()
      } else {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: message_error
        })
        handleClickFeeback()
      }
    }
  }

  useEffect(() => {
    traerDatosRequisicionSeleccionDetalle()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar Entrada de seleccion</h1>
        <div className="mt-4 form-inline">
          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Requisicion Seleccion
              </h6>
              <div className="card-body">
                <div className="row">
                  {/* CODIGO DEL LOTE */}
                  <div className="form-group col-md-2">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Codigo del Lote</b>
                    </label>
                    <input
                      type="text"
                      name="codLotSel"
                      value={codLotSel}
                      disabled
                      className="form-control"
                    />
                  </div>
                  {/* CANTIDAD DE LA REQUISICION DE SELECCION */}
                  <div className="form-group col-md-3">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Cantidad de requisicion</b>
                    </label>
                    <input
                      type="text"
                      name="canReqSelDet"
                      value={canReqSelDet}
                      disabled
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Materia Prima
              </h6>
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-5">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Nombre</b>
                    </label>
                    <input
                      type="text"
                      name="nomProd"
                      value={nomProd}
                      disabled
                      className="form-control"
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Codigo Sigo</b>
                    </label>
                    <input
                      type="text"
                      name="codProd"
                      value={codProd === null ? 'No establecido' : codProd}
                      disabled
                      className="form-control"
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Codigo EMAPROD</b>
                    </label>
                    <input
                      type="text"
                      name="codProd"
                      value={codProd2 === null ? 'No establecido' : codProd2}
                      disabled
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DATOS DE LA ENTRADA */}
          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                <b>Datos de entrada</b>
              </h6>
              <div className="card-body">
                <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                  <div className="col-md-4">
                    <label htmlFor="inputPassword4" className="form-label">
                      Materia Prima Seleccionada
                    </label>
                    {/* <FilterAllProductos
                      onNewInput={onAddProductoSeleccionadoEntrada}
                    /> */}
                    {idMatPri !== 0 && (
                      <FilterMateriaPrimaSelecionadaByRef
                        onNewInput={onAddProductoSeleccionadoEntrada}
                        prodRef={idMatPri}
                      />
                    )}
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="inputPassword4" className="form-label">
                      Fecha de entrada
                    </label>
                    <br />
                    <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="inputPassword4" className="form-label">
                      Fecha de vencimiento
                    </label>
                    <br />
                    <FechaPickerYear onNewfecEntSto={onAddFecVenSto} />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                <b>Salidas realizadas</b>
              </h6>
              <div className="card-body">
                <div className="row">
                  <form>
                    <div className="form-group col-md-6 d-flex">
                      <label
                        htmlFor="codigo-materia-prima"
                        className="col-form-label"
                      >
                        Total seleccionado
                      </label>
                      <div className="col d-flex ms-3">
                        <input
                          type="number"
                          name="canReqSelEnt"
                          value={canReqSelEnt}
                          onChange={handleForm}
                        />
                        <button
                          onClick={repartirEntradaRequisicionSeleccion}
                          className="btn btn-success ms-2"
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-calculator-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="table-responsive mt-4">
                  <table className="table text-center">
                    <thead className="table-success ">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Codigo entrada</th>
                        <th scope="col">Salida</th>
                        <th scope="col">Ingreso</th>
                        <th scope="col">Merma</th>
                        <th scope="col">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salidasDisponibles.map((element, i) => (
                        <RowSalidaDisponibleSeleccion
                          key={element.id}
                          index={i}
                          element={element}
                          onChangeInputValue={handledSalidasDetalle}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={disableButton}
              onClick={(e) => onSubmitSalidaStock(e)}
              className="btn btn-primary"
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
