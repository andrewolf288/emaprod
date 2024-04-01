import { useEffect, useState } from 'react'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionGeneralMaterialById } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialById'
import { useNavigate, useParams } from 'react-router-dom'
import { createRequisicionDevolucionMateriales } from '../../helpers/requisicion-materiales/createRequisicionDevolucionMateriales'
import { createRoot } from 'react-dom/client'
import { PDFDevolucionesRequisicionMateriales } from '../../components/requisicion-materiales/PDFDevolucionesRequisicionMateriales'

export function useDevolucionRequisicionGeneralMateriales () {
  const { idReqMat } = useParams()
  const navigate = useNavigate()
  const [requisicionMaterial, setRequisicionMaterial] = useState(
    {
      id: 0,
      idReqEst: 0,
      codReqMat: '',
      desReqEst: '',
      desMotReqMat: '',
      idAre: '',
      desAre: '',
      notReqMat: '',
      fecCreReqMat: '',
      detReq: [],
      detDev: []
    }
  )

  const [detalleDevolucion, setDetalleDevolucion] = useState([])
  const [productosDevolucion, setProductosDevolucion] = useState(
    {
      idProdtDev: 0,
      cantDev: 0
    }
  )

  // añadir producto
  const handleChangeProductoDevolucion = (value) => {
    const { item } = value
    const findElement = requisicionMaterial.detReq.find((element) => element.idProdt === item.idProdt)
    setProductosDevolucion({
      ...productosDevolucion,
      idProdtDev: item.idProdt,
      cantDev: findElement.canReqMatDet
    })
  }

  // funcion para añadir devolucion
  const handleAddProductoDevuelto = async (e) => {
    e.preventDefault()
    // verificamos si la cantidad de producto es mayor a 0
    if (productosDevolucion.cantDev > 0 && productosDevolucion.idProdtDev !== 0) {
      const findElementDuplicated = detalleDevolucion.find((element) => element.idProdt === productosDevolucion.idProdtDev)
      if (!findElementDuplicated) {
        // buscamos el elemento con el id de producto
        const findElement = requisicionMaterial.detReq.find((element) => element.idProdt === productosDevolucion.idProdtDev)
        const detalleRequisicionMotivos = {
          id: findElement.id,
          idReqMat: requisicionMaterial.id,
          idProdt: findElement.idProdt,
          nomProd: findElement.nomProd,
          simMed: findElement.simMed,
          canReqProdLot: productosDevolucion.cantDev,
          motivos: [
            {
              idProdDevMot: 4,
              idProdt: findElement.idProdt,
              nomDevMot: 'Devolucion',
              canProdDev: 0
            },
            {
              idProdDevMot: 2,
              idProdt: findElement.idProdt,
              nomDevMot: 'Desmedro',
              canProdDev: productosDevolucion.cantDev
            }
          ]
        }
        setDetalleDevolucion([...detalleDevolucion, detalleRequisicionMotivos])
        setProductosDevolucion({
          idProdtDev: 0,
          cantDev: 0
        })
      } else {
        alertWarning('Este producto ya fue agregado')
      }
    } else {
      let handleError = ''
      if (productosDevolucion.cantDev > 0) {
        handleError += 'Debes proporcionar una cantidad mayor a 0\n'
      }

      if (productosDevolucion.idProdtDev === 0) {
        handleError += 'Debes elegir un producto a devolver'
      }
      alertWarning(handleError)
    }
  }

  // EDIT DETALLE DE CAMBIOS
  const handleDeleteRequisicionDevolucion = (idItem) => {
    const dataDetalleProductosDevueltos = detalleDevolucion.filter(
      (element) => {
        if (element.idProd !== idItem) {
          return true
        } else {
          return false
        }
      }
    )
    setDetalleDevolucion(dataDetalleProductosDevueltos)
  }

  // DELETE REQUISICION DE DEVOLUCION
  const handleEditMotivoRequisicionDevolucion = (
    { target },
    detalle,
    indexProd) => {
    const { value } = target
    // Crear una copia del arreglo de detalles
    const editFormDetalle = detalleDevolucion.map((element) => {
      // Si el idProdt coincide con el detalle proporcionado, actualiza los motivos
      if (detalle.idProdt === element.idProdt) {
        // Crear una copia del arreglo de motivos
        const nuevosMotivos = [...element.motivos]

        // Si el índice coincide con el índice proporcionado, actualiza canProdDev
        if (nuevosMotivos[indexProd]) {
          nuevosMotivos[indexProd].canProdDev = value
        }

        // Actualiza los motivos en el detalle
        element.motivos = nuevosMotivos
      }

      return element
    })
    setDetalleDevolucion(editFormDetalle)
  }

  // FUNCION PARA GUARDAR LAS REQUISICIONES DE DEVOLUCION

  const traerInformacionRequisicionMaterial = async () => {
    const resultPeticion = await getRequisicionGeneralMaterialById(idReqMat)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionMaterial(result)
    } else {
      alertError(description_error)
    }
  }

  const handleCreateDevolucionRequisicionMateriales = async () => {
    // primero debemos verificar que el detalle no se encuentre vacio
    if (detalleDevolucion.length !== 0) {
      const formatDetalleDevolucion = []
      // luego debemos filtrar
      detalleDevolucion.forEach(element => {
        element.motivos.forEach((elementMotivos) => {
          const parserCantidad = parseFloat(elementMotivos.canProdDev)
          if (!isNaN(parserCantidad) && parserCantidad !== 0) {
            formatDetalleDevolucion.push(elementMotivos)
          }
        })
      })

      if (formatDetalleDevolucion.length !== 0) {
        const correlativo =
        `${requisicionMaterial.codReqMat}-D${String(requisicionMaterial.detDev.length + 1).padStart(2, '0')}`
        const formatData = {
          idReqMat: requisicionMaterial.id,
          correlativo,
          devoluciones: formatDetalleDevolucion
        }

        const resultPeticion = await createRequisicionDevolucionMateriales(formatData)
        console.log(resultPeticion)
        const { message_error, description_error } = resultPeticion

        if (message_error.length === 0) {
          alertSuccess()
          // regresamos a la vista de lista de requisicion de materiales
          navigate(-1)
        } else {
          alertError(description_error)
        }
      } else {
        alertWarning('Los detalles de motivos tienen cantidades no validas o menores o iguales a 0')
      }
    } else {
      alertWarning('El detalle de la devolucion no debe estar vacio')
    }
  }

  // obtener acumulado
  const obtenerAcumulado = (requisicion) => {
    const { detDev } = requisicion
    // esta variable guardara los totales: {idProdt: cantidad, idProdt: cantidad}
    const totales = {}
    // esta variable guardara los repetidos: {idProdt: {item}, idProdt: {item}}
    const repetidos = {}

    // recorremos el detalle de requisicion
    detDev.forEach((item) => {
      // obtenemos id y cantidad
      const { idProdt, canReqDevMatDet } = item
      // si aun no existe en totales, lo agregamos
      if (!totales[idProdt]) {
        totales[idProdt] = 0
      } else {
        // caso contrario chancamos repetios[idProdt] cada vez que se repita
        repetidos[idProdt] = { ...item }
      }

      // sumamos el total en totales[idProdt]
      totales[idProdt] += parseFloat(canReqDevMatDet)
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
    return totalesFinales
  }

  // funcion para mostrar pdf
  const generatePDF = (data, index) => {
    const acumulado = obtenerAcumulado(data)
    const formatData = {
      requisicion: data,
      acumulado
    }
    const newWindow = window.open('', 'Devoluciones', 'fullscreen=yes')
    // Crear un contenedor específico para tu aplicación
    const appContainer = newWindow.document.createElement('div')
    newWindow.document.body.appendChild(appContainer)
    const root = createRoot(appContainer)
    root.render(<PDFDevolucionesRequisicionMateriales data={formatData} index={index} />)
  }

  useEffect(() => {
    traerInformacionRequisicionMaterial()
  }, [])

  return {
    requisicionMaterial,
    handleCreateDevolucionRequisicionMateriales,
    productosDevolucion,
    handleChangeProductoDevolucion,
    detalleDevolucion,
    handleAddProductoDevuelto,
    handleDeleteRequisicionDevolucion,
    handleEditMotivoRequisicionDevolucion,
    generatePDF
  }
}
