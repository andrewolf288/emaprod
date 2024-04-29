import { useState } from 'react'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { createFormulaEmpaquetadoPromocional } from '../../helpers/formula-empaquetado-promocional/createFormulaEmpaquetadoPromocional'
import { useNavigate } from 'react-router-dom'

export function useCreateFormulaEmpaquetadoPromocional () {
  const navigate = useNavigate()
  const [formulaEmpaquetadorPromocional, setFormulaEmpaquetadorPromocional] = useState(
    {
      idProdt: 0,
      nomForEmpProm: '',
      desForEmpProm: '',
      detProdFinForEmpProm: [],
      detReqMatForEmpProm: []
    }
  )

  const [productoFinalSelected, setProductoFinalSelected] = useState({
    idProdt: 0,
    canForProdtFin: 0
  })

  // funcion para cambiar el producto combo
  const onChangeProductoPromocionalCombo = ({ id }) => {
    setFormulaEmpaquetadorPromocional({
      ...formulaEmpaquetadorPromocional,
      idProdt: id
    })
  }

  // funcion para cambiar datos de formula
  const onChangeDatosFormulaEmpaquetadorPromocional = ({ target }) => {
    const { name, value } = target
    setFormulaEmpaquetadorPromocional({
      ...formulaEmpaquetadorPromocional,
      [name]: value
    })
  }

  // funcion cambiar producto final a empaquetado
  const onChangeProductoFinalFormulaEmpaquetadoPromocional = (value) => {
    const { id } = value
    setProductoFinalSelected({
      ...productoFinalSelected,
      idProdt: id
    })
  }

  // funcion cambiar cantidad en producto final a empaquetado
  const onChangeCantidadFormulaEmpaquetadorPromocional = ({ target }) => {
    const { value } = target
    setProductoFinalSelected({
      ...productoFinalSelected,
      canForProdtFin: value
    })
  }

  // funcion eliminar producto final a empaquetado
  const onDeleteProductoFinalFormulaEmpaquetadoPromocional = (idProdt) => {
    const filterData = formulaEmpaquetadorPromocional.detProdFinForEmpProm.filter((element) => element.id !== idProdt)
    setFormulaEmpaquetadorPromocional(
      {
        ...formulaEmpaquetadorPromocional,
        detProdFinForEmpProm: filterData
      }
    )
  }

  // funcion editar producto final a empaquetado
  const onUpdateProductoFinalFormulaEmpaquetadoPromocional = ({ target }, idProdt) => {
    const { value } = target
    const findIndex = formulaEmpaquetadorPromocional.detProdFinForEmpProm.findIndex((element) => element.id === idProdt)
    if (findIndex !== -1) {
      const formatAux = [...formulaEmpaquetadorPromocional.detProdFinForEmpProm]
      formatAux[findIndex] = {
        ...formatAux[findIndex],
        canProdFinFor: value
      }
      setFormulaEmpaquetadorPromocional({
        ...formulaEmpaquetadorPromocional,
        detProdFinForEmpProm: formatAux
      })
    }
  }

  // funcion añadir al detalle producto final a empaquetado
  const onAddProductoFinalFormulaEmpaquetadoPromocional = async (e) => {
    e.preventDefault()
    const formatCantidad = isNaN(productoFinalSelected.canForProdtFin) ? 0 : parseFloat(productoFinalSelected.canForProdtFin)
    let handleErrors = ''
    if (productoFinalSelected.idProdt === 0 || formatCantidad <= 0) {
      if (productoFinalSelected.idProdt === 0) {
        handleErrors += 'Debes seleccionar un producto\n'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes ingresar una cantidad mayor a 0'
      }
      alertWarning(handleErrors)
    } else {
      // debemos verificar elementos agregados
      const findElement = formulaEmpaquetadorPromocional.detProdFinForEmpProm.find((element) => element.id === productoFinalSelected.idProdt)
      if (!findElement) {
        // si ya se ingreso el producto
        const resultPeticion = await getMateriaPrimaById(productoFinalSelected.idProdt)
        const { message_error, description_error, result } = resultPeticion

        if (message_error.length === 0) {
          const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed } =
                  result[0]
          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            id,
            codProd,
            codProd2,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            canProdFinFor: formatCantidad
          }

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...formulaEmpaquetadorPromocional.detProdFinForEmpProm,
            detalleFormulaMateriaPrima
          ]

          setFormulaEmpaquetadorPromocional({
            ...formulaEmpaquetadorPromocional,
            detProdFinForEmpProm: dataMateriaPrimaDetalle
          })
        } else {
          alertError(description_error)
        }
      } else {
        alertWarning('El producto ya fué registrado')
      }
    }
  }

  const [materialSelected, setMaterialSelected] = useState({
    idProdt: 0,
    canForMatReq: 0
  })

  // funcion cambiar producto material a empaquetado
  const onChangeRequisicionFormulaEmpaquetadoPromocional = (value) => {
    const { id } = value
    setMaterialSelected({
      ...materialSelected,
      idProdt: id
    })
  }

  // funcion cambiar cantidad a empaquetado
  const onChangeCantidadRequisicionFormulaEmpaquetadoPromocional = ({ target }) => {
    const { value } = target
    setMaterialSelected({
      ...materialSelected,
      canForMatReq: value
    })
  }

  // funcion eliminar material a empaquetado
  const onDeleteMaterialFormulaEmpaquetadorPromocional = (idProdt) => {
    const filterData = formulaEmpaquetadorPromocional.detReqMatForEmpProm.filter((element) => element.id !== idProdt)
    setFormulaEmpaquetadorPromocional(
      {
        ...formulaEmpaquetadorPromocional,
        detReqMatForEmpProm: filterData
      }
    )
  }

  // funcion editar material a empaquetado
  const onUpdateMaterialFormulaEmpaquetadorPromocional = ({ target }, idProdt) => {
    const { value } = target
    const findIndex = formulaEmpaquetadorPromocional.detReqMatForEmpProm.findIndex((element) => element.id === idProdt)
    if (findIndex !== -1) {
      const formatAux = [...formulaEmpaquetadorPromocional.detReqMatForEmpProm]
      formatAux[findIndex] = {
        ...formatAux[findIndex],
        canMatReqFor: value
      }
      setFormulaEmpaquetadorPromocional({
        ...formulaEmpaquetadorPromocional,
        detReqMatForEmpProm: formatAux
      })
    }
  }

  // funcion añadir material a empaquetado
  const onAddRequisicionFormulaEmpaquetadorPromocional = async (e) => {
    e.preventDefault()
    const formatCantidad = isNaN(materialSelected.canForMatReq) ? 0 : parseFloat(materialSelected.canForMatReq)
    let handleErrors = ''
    if (materialSelected.idProdt === 0 || formatCantidad <= 0) {
      if (materialSelected.idProdt === 0) {
        handleErrors += 'Debes seleccionar un producto\n'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes ingresar una cantidad mayor a 0'
      }
      alertWarning(handleErrors)
    } else {
      // debemos verificar elementos agregados
      const findElement = formulaEmpaquetadorPromocional.detReqMatForEmpProm.find((element) => element.id === materialSelected.idProdt)
      if (!findElement) {
        // si ya se ingreso el producto
        const resultPeticion = await getMateriaPrimaById(materialSelected.idProdt)
        const { message_error, description_error, result } = resultPeticion

        if (message_error.length === 0) {
          const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed } =
                  result[0]
          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            id,
            codProd,
            codProd2,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            canMatReqFor: formatCantidad
          }

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...formulaEmpaquetadorPromocional.detReqMatForEmpProm,
            detalleFormulaMateriaPrima
          ]

          setFormulaEmpaquetadorPromocional({
            ...formulaEmpaquetadorPromocional,
            detReqMatForEmpProm: dataMateriaPrimaDetalle
          })
        } else {
          alertError(description_error)
        }
      } else {
        alertWarning('El producto ya fué registrado')
      }
    }
  }

  // funcion para crear formula empaquetado promocional
  const onCreateFormulaEmpaquetadoPromocional = async () => {
    // primero debemos realizar las validaciones
    let handleErrors = ''
    if (formulaEmpaquetadorPromocional.idProdt === 0 ||
        formulaEmpaquetadorPromocional.nomForEmpProm.length === 0 ||
        formulaEmpaquetadorPromocional.detProdFinForEmpProm.length === 0) {
      if (formulaEmpaquetadorPromocional.idProdt === 0) {
        handleErrors += '- Debes ingresar un producto promocional.\n'
      }
      if (formulaEmpaquetadorPromocional.nomForEmpProm.length === 0) {
        handleErrors += '- Debes ingresar un nombre a la formula.\n'
      }
      if (formulaEmpaquetadorPromocional.detProdFinForEmpProm.length === 0) {
        handleErrors += '- Debes ingresar productos finales a la promoción.\n'
      }
      alertWarning(handleErrors)
    } else {
      const resultPeticion = await createFormulaEmpaquetadoPromocional(formulaEmpaquetadorPromocional)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        alertSuccess()
        // regresamos a la vista de lista de requisicion de materiales
        navigate(-1)
      } else {
        alertError(description_error)
      }
    }
  }

  return {
    formulaEmpaquetadorPromocional,
    onChangeDatosFormulaEmpaquetadorPromocional,
    onChangeProductoPromocionalCombo,
    productoFinalSelected,
    onChangeProductoFinalFormulaEmpaquetadoPromocional,
    onChangeCantidadFormulaEmpaquetadorPromocional,
    onDeleteProductoFinalFormulaEmpaquetadoPromocional,
    onUpdateProductoFinalFormulaEmpaquetadoPromocional,
    onAddProductoFinalFormulaEmpaquetadoPromocional,
    materialSelected,
    onChangeRequisicionFormulaEmpaquetadoPromocional,
    onChangeCantidadRequisicionFormulaEmpaquetadoPromocional,
    onDeleteMaterialFormulaEmpaquetadorPromocional,
    onUpdateMaterialFormulaEmpaquetadorPromocional,
    onAddRequisicionFormulaEmpaquetadorPromocional,
    onCreateFormulaEmpaquetadoPromocional
  }
}
