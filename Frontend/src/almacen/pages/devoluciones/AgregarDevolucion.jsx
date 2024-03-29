import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import queryString from 'query-string'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { getProduccionLoteWithDevolucionesById } from './../../../produccion/helpers/produccion_lote/getProduccionLoteWithDevolucionesById'
import { RowDetalleDevolucionLoteProduccion } from './../../components/componentes-devoluciones/RowDetalleDevolucionLoteProduccion'
import { FilterAllProductos } from './../../../components/ReferencialesFilters/Producto/FilterAllProductos'
import { TextField } from '@mui/material'
import { getMateriaPrimaById } from './../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { RowDetalleDevolucionLoteProduccionEdit } from './RowDetalleDevolucionLoteProduccionEdit'
import { createDevolucionesLoteProduccion } from './../../helpers/devoluciones-lote-produccion/createDevolucionesLoteProduccion'
import { getProduccionWhitProductosFinales } from './../../helpers/producto-produccion/getProduccionWhitProductosFinales'
import { getFormulaProductoDetalleByProducto } from '../../../../src/produccion/helpers/formula_producto/getFormulaProductoDetalleByProducto'
import { _parseInt } from '../../../utils/functions/FormatDate'
import PdfDevoluciones from './PdfDevoluciones'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ReactDOM from 'react-dom'
import { getMotivoDevoluciones } from './../../../helpers/Referenciales/motivo_devoluciones/getMotivoDevoluciones'

const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const AgregarDevolucion = () => {
  const location = useLocation()
  const { idLotProdc = '' } = queryString.parse(location.search)

  // Data de devoluciones asociadas a un procesao de produccion
  const [devolucionesProduccionLote, setdevolucionesProduccionLote] = useState({
    id: 0,
    canLotProd: 0,
    codLotProd: '',
    desEstPro: '',
    desProdTip: '',
    fecVenLotProd: '',
    idProdEst: 0,
    idProdTip: 0,
    idProdt: 0,
    klgLotProd: '',
    nomProd: '',
    detDev: []
  })

  const {
    id,
    canLotProd,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgLotProd,
    nomProd,
    detDev,
    numop
  } = devolucionesProduccionLote

  // detalle de productos devueltos
  const [detalleProductosDevueltos, setdetalleProductosDevueltos] = useState(
    []
  )

  // Estados para el producto agregado
  const [productoDevuelto, setproductoDevuelto] = useState({
    idProdDev: 0,
    cantidadDevuelta: 0.0,
    idProdDevMot: 0
  })

  const { idProdDev, cantidadDevuelta } = productoDevuelto

  // ************ ESTADO PARA CONTROLAR EL FEEDBACK **************
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

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  const [disableButton, setdisableButton] = useState(false)

  const onAddProductoDevuelto = (value) => {
    setproductoDevuelto({
      ...productoDevuelto,
      idProdDev: value.id
    })
  }

  // Manejador de cantidad del filtro
  const handledFormCantidadDevuelta = ({ target }) => {
    const { name, value } = target
    setproductoDevuelto({
      ...productoDevuelto,
      [name]: value
    })
  }

  // Manejador de agregar materia prima al detalle de devolucion
  const handleAddProductoDevuelto = async (e) => {
    e.preventDefault()
    if (idProdDev !== 0 && cantidadDevuelta > 0.0) {
      const itemFound = detalleProductosDevueltos.find(
        (element) => element.idProdt === idProdDev
      )

      if (itemFound) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: 'Ya se agrego este producto al detalle'
        })
        handleClickFeeback()
      } else {
        const resultPeticion = await getMateriaPrimaById(idProdDev)

        const { message_error, description_error, result } = resultPeticion
        if (message_error.length === 0) {
          const {
            id: idProd,
            codProd,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            idMed
          } = result[0]
          // generamos nuestro detalle
          const detalle = {
            idProdc: id, // lote de produccion asociado
            idProdt: idProd, // producto
            idProdDevMot: 1, // motivo de devolucion
            codProd, // codigo de producto
            desCla, // clase del producto
            desSubCla, // subclase del producto
            nomProd, // nombre del producto
            idMed,
            simMed, // medida del producto
            canProdDev: cantidadDevuelta, // cantidad devuelta
            motivos: [
              {
                idProdDevMot: 1,
                nomDevMot: 'Sobrantes de requisicion',
                canProdDev: cantidadDevuelta
              },
              {
                idProdDevMot: 2,
                nomDevMot: 'Desmedros de produccion',
                canProdDev: 0
              },
              {
                idProdDevMot: 3,
                nomDevMot: 'Otros',
                canProdDev: 0
              }
            ]
          }

          const dataDetalle = [...detalleProductosDevueltos, detalle]
          setdetalleProductosDevueltos(dataDetalle)
        } else {
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
      }
    } else {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'Asegurese de llenar los datos requeridos'
      })
      handleClickFeeback()
    }
  }

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoDevuelto = async (
    { target },
    detalle,
    indexProd
  ) => {
    const { value } = target
    // Crear una copia del arreglo de detalles
    const editFormDetalle = detalleProductosDevueltos.map((element) => {
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

        // Calcula la suma de canProdDev en motivos
        const sumaMotivos = nuevosMotivos.reduce(
          (suma, motivo) => suma + Number(motivo.canProdDev || 0),
          0
        )

        // Actualiza canProdDev en el detalle del producto con la suma de motivos
        element.canProdDev = sumaMotivos
      }

      return element
    })
    setdetalleProductosDevueltos(editFormDetalle)
  }

  // Manejador de eliminacion de un detalle de devolucion
  const handleDeleteProductoDevuelto = async (idItem) => {
    const dataDetalleProductosDevueltos = detalleProductosDevueltos.filter(
      (element) => {
        if (element.idProdt !== idItem) {
          return true
        } else {
          return false
        }
      }
    )

    setdetalleProductosDevueltos(dataDetalleProductosDevueltos)
  }

  // esta funcion se encarga de traer
  async function handleAddProductoProduccionLote (
    detalleRequisiciones,
    idProdFin,
    cantDevProd
  ) {
    if (idProdFin !== 0) {
      // traer formula de producto final
      const resultPeticion = await getFormulaProductoDetalleByProducto(
        idProdFin
      )
      const { message_error, result } = resultPeticion

      if (message_error.length === 0) {
        const { idProdFin, reqDet } = result[0]
        let equivalenteKilogramos = 0

        reqDet.forEach((element) => {
          if (element.idAre === 2 || element.idAre === 7) {
            equivalenteKilogramos = parseFloat(element.canForProDet)
          }
        })

        let cantidadUnidades = 0
        let cantidadklgLote = 0
        cantidadUnidades = Math.round(parseFloat(cantDevProd))
        cantidadklgLote = parseFloat(
          (equivalenteKilogramos * parseFloat(cantDevProd)).toFixed(2)
        )

        reqDet.forEach((element) => {
          if (element.idAre === 5 || element.idAre === 6) {
            detalleRequisiciones.push({
              ...element,
              idProdFin,
              idProdAgrMot: 1,
              cantidadUnidades,
              cantidadklgLote,
              canReqProdLot: parseFloat(
                (parseFloat(element.canForProDet) * cantidadUnidades).toFixed(2)
              )
            })
          }
        })

        detalleRequisiciones.forEach((obj) => {
          obj.canReqProdLot = _parseInt(obj)
        })
      }
    }

    return detalleRequisiciones
  }

  function getAcuIns (products) {
    const copyProducts = products.reduce((accumulator, currentValue) => {
      if (accumulator.some((obj) => obj.idProdt === currentValue.idProdt)) {
        accumulator.forEach((obj) => {
          if (obj.idProdt === currentValue.idProdt) {
            obj.canReqDet =
              parseFloat(obj.canReqDet) + parseFloat(currentValue.canReqDet)
          }
        })
      } else {
        accumulator.push(currentValue)
      }
      return accumulator
    }, [])

    return copyProducts
  }

  /*
  Esta funcion se encarga de traer los insumos utilizados en las requisiciones de envasado y encajado por producto final
  Ademas, calcula cuanto ha sido la cantidad ingresada por el momento de cada producto final.
  */
  async function getProductToDev (idLotProdc) {
    // se trae los productos utilizados en la orden de proceso junto con sus insumos de envasado y encajado
    const resultPeticion = await getProduccionWhitProductosFinales(idLotProdc)
    const { result } = resultPeticion
    const products = result[0].proFinProdDet

    const copyProducts = products.reduce((accumulator, currentValue) => {
      if (accumulator.some((obj) => obj.idProdt === currentValue.idProdt)) {
        accumulator.forEach((obj) => {
          if (obj.idProdt === currentValue.idProdt) {
            // acumulado de la cantidad de producto programada
            obj.canTotProgProdFin =
              parseFloat(obj.canTotProgProdFin) +
              parseFloat(currentValue.canTotProgProdFin)
            obj.canTotProgProdFin = parseFloat(obj.canTotProgProdFin).toFixed(
              2
            )

            // acumulado de la cantidad de producto ingresado
            // canTotIngProdFin => la cantidad de producto terminado registrada
            obj.canTotIngProdFin =
              parseFloat(obj.canTotIngProdFin) +
              parseFloat(currentValue.canTotIngProdFin)
            obj.canTotIngProdFin = parseFloat(obj.canTotIngProdFin).toFixed(2)

            currentValue.total = obj.canTotProgProdFin

            // de la orden de producción y agregación, obtenemos las requisiciones por producto terminado.
            obj.insumos = [...obj.insumos, ...currentValue.insumos]
            obj.insumos = getAcuIns(obj.insumos)
          }
        })
      } else {
        currentValue.cantDev =
          parseFloat(currentValue.canTotProgProdFin) -
          parseFloat(currentValue.canTotIngProdFin)
        accumulator.push(currentValue)
      }
      return accumulator
    }, [])

    return copyProducts
  }

  /* Esta es una fucnion que se encarga cuando carga la vista y se encarga de traer toda la data necesaria
     para mostrar las devoluciones correspondientes a un proceso de produccion
  */

  const traerDatosProduccionLoteWithDevoluciones = async () => {
    if (idLotProdc.length !== 0) {
      /* Se realiza una consulta al backend donde se obtiene informacion de las devoluciones por proceso de produccion:
        - informacion del proceso de produccion
        - informacion de las requisiciones utilizadas en el proceso de produccion (requisiciones)
        - información del detalle de devoluciones (detDev)
      */
      const resultPeticion = await getProduccionLoteWithDevolucionesById(
        idLotProdc
      )

      /* Se realiza una consulta al backend que trae la informacion de los productos finales de el proceso de */
      const productos = await getProductToDev(idLotProdc)

      const devoluciones = []
      await Promise.all(
        productos.map(async (prodt) => {
          const nomProdFin = prodt.nomProd
          let detalleRequisiciones = []

          /**
           *  Enviamos la cantidad ingresada de producto final a la función de obtencion de insumos => handleAddProductoProduccionLote() de la orden de producción,
           *  para luego obtener la cantidad real de insumos utilizados.
           *
           * a los insumos programados se le restara los insumos utilizados, entonces con eso ya se tiene la cantidad a devolver.
           */

          detalleRequisiciones = await handleAddProductoProduccionLote(
            detalleRequisiciones,
            prodt.idProdt,
            prodt.canTotIngProdFin
          )

          detalleRequisiciones.forEach((obj) => {
            const producto = prodt.insumos.find(
              (item) => item.idProdt == obj.idProd
            )
            const flag =
              parseFloat(producto?.canReqDet) - parseFloat(obj.canReqProdLot)
            if (producto && flag > 0) {
              devoluciones.push({
                nomProdFin,
                canProdDev: flag.toFixed(2),
                codProd: '',
                desCla: obj.desAre,
                desSubCla: '',
                idMed: 7,
                idProdDevMot: 1,
                idProdc: idLotProdc,
                idProdt: obj.idProd,
                nomProd: obj.nomProd,
                simMed: obj.simMed,
                codProd2: obj.codProd2
              })
            }
          })
        })
      )

      const { message_error, description_error, result } = resultPeticion

      /**
       *  de las insumos duplicadas, lo convertimos a un registro,
       *  también actualizamos el campo "canProdDev" a un acumulativo
       */
      result[0].detDev = result[0].detDev.reduce(
        (accumulator, currentValue) => {
          if (accumulator.some((obj) => obj.idProdt == currentValue.idProdt)) {
            accumulator.forEach((obj) => {
              if (obj.idProdt == currentValue.idProdt) {
                obj.canProdDev =
                  parseFloat(obj.canProdDev) +
                  parseFloat(currentValue.canProdDev)
                obj.canProdDev = parseFloat(obj.canProdDev).toFixed(2)
              }
            })
          } else {
            currentValue.canProdDev = parseFloat(
              currentValue.canProdDev
            ).toFixed(2)
            accumulator.push(currentValue)
          }
          return accumulator
        },
        []
      )

      /**
       * obtenemos la cantidad estimada a devolver por cada insumo
       */
      let total = 0
      result[0].detDev.forEach((obj) => {
        total = parseFloat(total) + parseFloat(obj.canProdDev)
        obj.acumulado = total
        function getVal () {
          const cantDev = 0
          devoluciones.forEach((prod) => {
            if (prod.idProdt == obj.idProdt) {
              obj.cantDev = prod.canProdDev
            }
          })
          return cantDev
        }
        getVal()
      })

      /**
       * Actualizamos la cantidad a devolver de cada insumo, lo restamos por la cantidad que ya ha sido devuelto
       */
      devoluciones.forEach((obj) => {
        result[0].detDev.forEach((prod) => {
          if (prod.idProdt == obj.idProdt) {
            obj.canProdDev = (
              parseFloat(obj.canProdDev) - parseFloat(prod.canProdDev)
            ).toFixed(2)
          }
        })
      })

      const dataDetalle = [...detalleProductosDevueltos, ...devoluciones]
      const motivos = await getMotivoDevoluciones()
      dataDetalle.forEach((item) => {
        item.motivos = []
        motivos.forEach((val, index) => {
          item.motivos.push({
            nomDevMot: val.desProdDevMot,
            canProdDev: index === 0 ? item.canProdDev : 0,
            idProdDevMot: val.id
          })
        })
      })
      setdetalleProductosDevueltos(dataDetalle)

      if (message_error.length === 0) {
        setdevolucionesProduccionLote(result[0])
      } else {
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    }
  }

  const crearDevolucionesLoteProduccion = async () => {
    const productos = detalleProductosDevueltos?.filter(
      (obj) => parseFloat(obj.canProdDev) > 0
    )

    const desmedrosAux = []

    productos.forEach((objeto) => {
      objeto.motivos.forEach((motivo) => {
        const canProdDevMot = motivo.canProdDev
        const idMotivo = motivo.idProdDevMot
        if (canProdDevMot !== 0) {
          const nuevoObjeto = {
            ...objeto,
            canProdDev: canProdDevMot,
            idProdDevMot: idMotivo
          }
          delete nuevoObjeto.motivos
          desmedrosAux.push(nuevoObjeto)
        }
      })
    })

    const resultPeticion = await createDevolucionesLoteProduccion(desmedrosAux)

    const { message_error, description_error } = resultPeticion

    if (message_error.length === 0) {
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

  const handleSubmitDevolucionesLoteProduccion = (e) => {
    e.preventDefault()
    if (detalleProductosDevueltos.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'No has agregado items al detalle'
      })
      handleClickFeeback()
    } else {
      setdisableButton(true)
      // crear devolucion
      crearDevolucionesLoteProduccion()
    }
  }

  useEffect(() => {
    traerDatosProduccionLoteWithDevoluciones()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar devoluciones</h1>

        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero OP</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={numop}
                    className="form-control"
                  />
                </div>

                {/* PRODUCTO */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                {/* KILOGRAMOS DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso de Lote</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* TIPO DE PRODUCCION */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Tipo de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desProdTip}
                    className="form-control"
                  />
                </div>
                {/* ESTADO DE PRODUCCION */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desEstPro}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE VENCIMIENTO */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha vencimiento lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecVenLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card d-flex mt-4">
            <h6 className="card-header"></h6>

            <div className="card-body">
              <div className="mb-3 row">
                <div className="btn-toolbar">
                  <button
                    onClick={() => {
                      // handleButtonClick(idLotProdc, "agregaciones", row.flag);

                      const newWindow = window.open(
                        '',
                        'windowName',
                        'fullscreen=yes'
                      )
                      ReactDOM.render(
                        <PdfDevoluciones
                          data={'data'}
                          codLotProd={codLotProd}
                          canLotProd={canLotProd}
                          numop={numop}
                          nomProd={nomProd}
                          desProdTip={desProdTip}
                          detDev={detDev}
                          prodToDev={detalleProductosDevueltos}
                        />,
                        newWindow.document.body
                      )
                    }}
                    className="btn btn-primary me-2 btn"
                  >
                    <PictureAsPdfIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Devoluciones registradas</h6>

            <div className="card-body">
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
                            <b>U.M</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Almacen destino</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Motivo devolucion</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>Cantidad devuelta</b>
                          </TableCell>

                          {/**
                           <TableCell align="left" width={20}>
                            <b>Acumulado</b>
                          </TableCell>
                          */}

                          {/* <TableCell align="left" width={20}>
                            <b>Cantidad estimada a devolver</b>
                          </TableCell> */}
                          <TableCell align="left" width={20}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detDev.map((row, i) => (
                          <RowDetalleDevolucionLoteProduccion
                            key={row.id}
                            detalle={row}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>

          {/* AGREGAR PRODUCTOS AL DETALLE  */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de devoluciones</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">Producto devuelto</label>
                  <FilterAllProductos
                    onNewInput={onAddProductoDevuelto}
                    productos={devolucionesProduccionLote.requisiciones}
                  />
                </div>

                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad producto</label>
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadDevuelta"
                    onChange={handledFormCantidadDevuelta}
                  />
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoDevuelto}
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
              <div>
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
                          <TableCell align="left" width={100}>
                            <b>Clase</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>U.M</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Cantidad</b>
                          </TableCell>

                          <TableCell align="left" width={120}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleProductosDevueltos.map((row, i) => {
                          return (
                            <RowDetalleDevolucionLoteProduccionEdit
                              key={row.idProdt}
                              detalle={row}
                              onChangeInputDetalle={
                                handleChangeInputProductoDevuelto
                              }
                              onDeleteItemDetalle={handleDeleteProductoDevuelto}
                            />
                          )
                        })}
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
              disabled={disableButton}
              onClick={handleSubmitDevolucionesLoteProduccion}
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
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  )
}
