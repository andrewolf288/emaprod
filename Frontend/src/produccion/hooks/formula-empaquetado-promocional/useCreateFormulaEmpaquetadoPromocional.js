import { useState } from 'react'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'

export function useCreateFormulaEmpaquetadoPromocional () {
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
    console.log(value)
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
  const onUpdateProductoFinalFormulaEmpaquetadoPromocional = (idProdt, { target }) => {

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
      if (findElement) {
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
  const onChangeRequisicionFormulaEmpaquetadoPromocional = () => {

  }

  // funcion cambiar cantidad a empaquetado
  const onChangeCantidadRequisicionFormulaEmpaquetadoPromocional = () => {

  }

  // funcion eliminar material a empaquetado
  const onDeleteMaterialFormulaEmpaquetadorPromocional = () => {

  }

  // funcion editar material a empaquetado
  const onUpdateMaterialFormulaEmpaquetadorPromocional = () => {

  }

  // funcion añadir material a empaquetado
  const onAddRequisicionFormulaEmpaquetadorPromocional = () => {

  }

  // funcion para crear formula empaquetado promocional
  const onCreateFormulaEmpaquetadoPromocional = async () => {

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
