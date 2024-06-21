import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DiaJuliano, FormatDateTimeMYSQLNow, letraAnio } from '../../../utils/functions/FormatDate'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { createEntradaStock } from '../../helpers/entradas-stock/createEntradaStock'
import { searchRegistroCompra } from '../../helpers/entradas-stock/searchRegistroCompra'

export function useCreateEntradaStock () {
  const [entrada, setEntrada] = useState({
    Cd_Com: '',
    FecED: '',
    idProd: 0,
    idProv: 0,
    docProv: '',
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

  const onInputChange = ({ target }) => {
    const { name, value } = target
    setEntrada({
      ...entrada,
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
    setEntrada({ ...entrada, codProd: value, idProd: id })
  }

  // INPUT CODIGO PROVEEDOR
  const onAddCodProv = ({ value, id, docProv }) => {
    setEntrada({ ...entrada, codProv: value, idProv: id, docProv })
  }

  // INPUT CODIGO ALMACEN
  const onAddCodAlm = ({ value, id }) => {
    const valueA = id === 8 ? '' : entrada.Cd_Com
    const valueB = id === 8 ? '' : entrada.FecED
    setEntrada({ ...entrada, codAlm: value, idAlm: id, Cd_Com: valueA, FecED: valueB })
  }

  // SET VALOR DE FECHA DE entrada
  const onAddFecEntSto = (newfecEntSto) => {
    setEntrada({
      ...entrada,
      fecEntSto: newfecEntSto
    })
  }

  // CREAR ENTRADA DE STOCK
  const crearEntradaStock = async () => {
    let requestJSON = { ...entrada }
    // verificamos si se ingreso una fecha de ingreso
    if (entrada.fecEntSto.length === 0) {
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

  const onSearchRegistroCompraContanet = async (data) => {
    let handledError = ''
    if (entrada.docProv.length === 0 || entrada.codProd.length === 0) {
      if (entrada.docProv.length === 0) {
        handledError += '- Falta informacion del proveedor\n'
      }
      if (entrada.codProd.length === 0) {
        handledError += '- Falta informacion del producto\n'
      }
      alertWarning(handledError)
    } else {
      const formatData = {
        ...data,
        documento: entrada.docProv,
        producto: entrada.codProd
      }
      console.log(formatData)
      const resultPeticion = await searchRegistroCompra(formatData)
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        setEntrada({
          ...entrada,
          Cd_Com: result.RegCtb,
          FecED: result.FecED,
          ordCom: `${result.NroSre}-${result.NroDoc}`,
          canTotCom: result.cantidad ? parseFloat(result.cantidad).toFixed(3) : 0
        })
      } else {
        alertError(description_error)
      }
    }
  }

  // SUBMIT DE UNA entrada COMUNICACION CON BACKEND
  const onSubmitEntradaStock = (event) => {
    event.preventDefault()

    let advertenciaFormularioIncompleto = ''
    // VERIFICAMOS SI SE INGRESARON LOS CAMPOS REQUERIDOS
    if (
      entrada.idProd === 0 ||
        entrada.idProv === 0 ||
        entrada.idAlm === 0 ||
        entrada.docEntSto.length === 0 ||
        entrada.canTotEnt <= 0 ||
        entrada.canTotCom <= 0) {
      // (entrada.Cd_Com.length === 0 && entrada.idAlm === 1)) {
      if (entrada.idProd === 0) {
        advertenciaFormularioIncompleto +=
          '- Falta llenar informacion del producto\n'
      }
      if (entrada.idProv === 0) {
        advertenciaFormularioIncompleto +=
          '- Falta llenar informacion del provedor\n'
      }
      if (entrada.idAlm === 0) {
        advertenciaFormularioIncompleto +=
          '- Falta llenar informacion del almacen\n'
      }
      if (entrada.docEntSto.length === 0) {
        advertenciaFormularioIncompleto +=
          '- Asegurate de ingresar el documento de entrada\n'
      }
      if (entrada.canTotCom <= 0) {
        advertenciaFormularioIncompleto +=
          '- Asegurarse de ingresar la cantidad de compra\n'
      }
      if (entrada.canTotEnt <= 0) {
        advertenciaFormularioIncompleto +=
          '- Asegurarse de ingresar la cantidad de entrada\n'
      }
      // if (entrada.Cd_Com.length === 0 && entrada.idAlm === 1) {
      //   advertenciaFormularioIncompleto +=
      //   '- Debe buscar la compra correspondiente\n'
      // }

      // mostramos el error recepcionado del backend
      alertWarning(advertenciaFormularioIncompleto)
    } else {
      setdisableButton(true)
      crearEntradaStock()
    }
  }

  useEffect(() => {
    if (entrada.canTotCom.length === 0 || entrada.canTotEnt.length === 0) {
      setEntrada({
        ...entrada,
        canVar: 0
      })
    } else {
      const cantidadVariacion = (
        parseFloat(entrada.canTotEnt) - parseFloat(entrada.canTotCom)
      ).toFixed(3)
      setEntrada({
        ...entrada,
        canVar: cantidadVariacion
      })
    }
  }, [entrada.canTotCom, entrada.canTotEnt])

  return {
    entrada,
    onInputChange,
    disableButton,
    onAddCodProd,
    onAddCodProv,
    onSearchRegistroCompraContanet,
    onAddCodAlm,
    onAddFecEntSto,
    onSubmitEntradaStock,
    onNavigateBack
  }
}
