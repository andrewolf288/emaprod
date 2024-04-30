import React, { useEffect, useState } from 'react'
// IMPORT DE EFECHA PICKER
import FechaPicker from './../../../components/Fechas/FechaPicker'
// FUNCIONES UTILES
import { DiaJuliano, FormatDateTimeMYSQLNow, letraAnio } from '../../../utils/functions/FormatDate'
import { useNavigate } from 'react-router-dom'
import { createEntradaStock } from './../../helpers/entradas-stock/createEntradaStock'
import { FilterAlmacenDynamic } from '../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic'
import { FilterProveedorDynamic } from '../../../components/ReferencialesFilters/Proveedor/FilterProveedorDynamic'
import { FilterAllProductosDynamic } from '../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'

export const AgregarEntradaStockV2 = () => {
  const [formState, setFormState] = useState({
    idProd: 0,
    idProv: 0,
    idAlm: 1,
    esSel: false,
    canTotCom: 0,
    canTotEnt: 0,
    canVar: 0,
    docEntSto: '',
    fecEntSto: '',
    codProd: '',
    codProv: '',
    codAlm: '001',
    obsEnt: '',
    ordCom: '',
    guiRem: ''
  })
  const {
    idProd,
    idProv,
    idAlm,
    canTotCom,
    canTotEnt,
    canVar,
    docEntSto,
    fecEntSto,
    codProd,
    codProv,
    codAlm,
    ordCom,
    guiRem
  } = formState

  // inputs para manejar los inputs de texto
  const onInputChange = ({ target }) => {
    const { name, value } = target
    setFormState({
      ...formState,
      [name]: value
    })
  }

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false)

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  // INPUT CODIGO MATERIA PRIMA
  const onAddCodProd = ({ value, id }) => {
    setFormState({ ...formState, codProd: value, idProd: id })
  }

  // INPUT CODIGO PROVEEDOR
  const onAddCodProv = ({ value, id }) => {
    setFormState({ ...formState, codProv: value, idProv: id })
  }

  // INPUT CODIGO ALMACEN
  const onAddCodAlm = ({ value, id }) => {
    console.log(value)
    setFormState({ ...formState, codAlm: value, idAlm: id })
  }

  // SET VALOR DE FECHA DE formState
  const onAddFecEntSto = (newfecEntSto) => {
    setFormState({
      ...formState,
      fecEntSto: newfecEntSto
    })
  }

  // CREAR ENTRADA DE STOCK
  const crearEntradaStock = async () => {
    let requestJSON = { ...formState }
    // verificamos si se ingreso una fecha de ingreso
    if (fecEntSto.length === 0) {
      requestJSON = {
        ...requestJSON,
        fecEntSto: FormatDateTimeMYSQLNow()
      }
    }
    requestJSON = {
      ...requestJSON,
      diaJulEntSto: DiaJuliano(requestJSON.fecEntSto),
      letAniEntSto: letraAnio(requestJSON.fecEntSto)
    }
    const { message_error, description_error } = await createEntradaStock(requestJSON)
    if (message_error.length === 0) {
      // alerta de satisfaccion
      alertSuccess()
      // regresamos
      onNavigateBack()
    } else {
      alertError(description_error)
    }
    setdisableButton(false)
  }

  // SUBMIT DE UNA formState COMUNICACION CON BACKEND
  const onSubmitformState = (event) => {
    event.preventDefault()

    let advertenciaFormularioIncompleto = ''
    // VERIFICAMOS SI SE INGRESARON LOS CAMPOS REQUERIDOS
    if (
      idProd === 0 ||
      idProv === 0 ||
      idAlm === 0 ||
      docEntSto.length === 0 ||
      canTotEnt <= 0 ||
      canTotCom <= 0) {
      if (idProd === 0) {
        advertenciaFormularioIncompleto +=
          'Falta llenar informacion del producto\n'
      }
      if (idProv === 0) {
        advertenciaFormularioIncompleto +=
          'Falta llenar informacion del provedor\n'
      }
      if (idAlm === 0) {
        advertenciaFormularioIncompleto +=
          'Falta llenar informacion del almacen\n'
      }
      if (docEntSto.length === 0) {
        advertenciaFormularioIncompleto +=
          'Falta llenar informacion del documento de entrada\n'
      }
      if (canTotCom <= 0) {
        advertenciaFormularioIncompleto +=
          'Asegurarse de proporcionar informacion de la cantidad de compra\n'
      }
      if (canTotEnt <= 0) {
        advertenciaFormularioIncompleto +=
          'Asegurarse de proporcionar informacion de la cantidad de entrada\n'
      }

      // mostramos el error recepcionado del backend
      alertWarning(advertenciaFormularioIncompleto)
    } else {
      setdisableButton(true)
      crearEntradaStock()
    }
  }

  useEffect(() => {
    if (canTotCom.length === 0 || canTotEnt.length === 0) {
      setFormState({
        ...formState,
        canVar: 0
      })
    } else {
      const cantidadVariacion = (
        parseFloat(canTotEnt) - parseFloat(canTotCom)
      ).toFixed(3)
      setFormState({
        ...formState,
        canVar: cantidadVariacion
      })
    }
  }, [canTotCom, canTotEnt])

  return (
    <>
      <div
        className="w"
        style={{
          // border: "1px solid black",
          paddingLeft: '70px',
          paddingRight: '100px'
        }}
      >
        <h1 className="mt-4 text-center">Registrar Entrada de stock</h1>

        <div
          className="row mt-4"
          // style={{ border: "1px solid black" }}
        >
          <div className="card d-flex">
            <h6 className="card-header">Sección de Almacén</h6>
            <div className="card-body">
              {/* CODIGO MATERIA PRIMA */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Producto</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codProd}
                    readOnly
                    type="text"
                    name="codProd"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PRODUCTO */}
                <div className="col-md-8">
                  <FilterAllProductosDynamic
                    onNewInput={onAddCodProd}
                    defaultValue={idProd}
                  />
                </div>
              </div>

              {/* CODIGO PROVEEDOR */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Proveedor</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codProv}
                    readOnly
                    type="text"
                    name="codProv"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-8">
                  {
                    <FilterProveedorDynamic
                      onNewInput={onAddCodProv}
                      defaultValue={idProv}
                    />
                  }
                </div>
              </div>

              {/* CODIGO ALMACEN */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Almacén</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codAlm}
                    readOnly
                    type="text"
                    name="codAlm"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-6">
                  <FilterAlmacenDynamic
                    onNewInput={onAddCodAlm}
                    defaultValue={idAlm}
                  />
                </div>
              </div>

              {/* FECHA DE LA formState */}
              <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Fecha de Entrada
                </label>
                <div className="col-md-4">
                  <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                </div>
              </div>

              {/* INPUT DOCUMENTO formState */}
              <div className="mb-3 row">
                <label
                  htmlFor={'documento-formState'}
                  className="col-sm-2 col-form-label"
                >
                  Documento
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={docEntSto}
                    type="text"
                    name="docEntSto"
                    className="form-control"
                  />
                </div>
              </div>

              {/* INPUT ORDEN DE COMPRA */}
              <div className="mb-3 row">
                <label
                  htmlFor={'documento-formState'}
                  className="col-sm-2 col-form-label"
                >
                  Orden de compra
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={ordCom}
                    type="text"
                    name="ordCom"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label
                  htmlFor={'documento-formState'}
                  className="col-sm-2 col-form-label"
                >
                  Guia de remisión
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={guiRem}
                    type="text"
                    name="guiRem"
                    className="form-control"
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD COMPRA */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad total compra
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={canTotCom}
                    type="number"
                    name="canTotCom"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD formState */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad ingresada
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={canTotEnt}
                    type="number"
                    name="canTotEnt"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD EXEDIDA */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad variación
                </label>
                <div className="col-md-2">
                  <input
                    disabled={true}
                    onChange={onInputChange}
                    value={canVar}
                    type="number"
                    name="canVar"
                    className={`form-control ${
                      parseFloat(canVar) < 0 ? 'text-danger' : 'text-success'
                    }`}
                  />
                </div>
              </div>
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
            disabled={disableButton}
            onClick={onSubmitformState}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>
    </>
  )
}
