import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getProduccionLoteWithDevolucionesById } from "./../../../produccion/helpers/produccion_lote/getProduccionLoteWithDevolucionesById";
import { createDevolucionesLoteProduccion } from "./../../helpers/devoluciones-lote-produccion/createDevolucionesLoteProduccion";
import { getFormulaProductoDetalleByProducto } from "../../../../src/produccion/helpers/formula_producto/getFormulaProductoDetalleByProducto";
import { _parseInt } from "../../../utils/functions/FormatDate";
import { FilterProductosProgramados } from "../../../components/ReferencialesFilters/Producto/FilterProductosProgramados";
import { TextField } from "@mui/material";
import { RowDevolucionLoteProduccionEdit } from "./RowDevolucionLoteProduccionEdit";
import { RowDetalleDevolucionLoteProduccion } from "../../components/componentes-devoluciones/RowDetalleDevolucionLoteProduccion";
import { createRoot } from "react-dom/client";
import { PDFDevoluciones } from "../../components/componentes-devoluciones/PDFDevoluciones";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function parseIntCantidad(str, property) {
  str.canReqProdLot = parseFloat(str.canReqProdLot).toFixed(5);
  let index = str.canReqProdLot.toString().indexOf(".");
  let result = str.canReqProdLot.toString().substring(index + 1);
  let val =
    parseInt(result) >= 1 && str.simMed !== "KGM"
      ? Math.trunc(str.canReqProdLot) + 1
      : str.canReqProdLot;
  return val;
}

export const AgregarDevolucionV2 = () => {
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);

  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [devolucionesProduccionLote, setdevolucionesProduccionLote] = useState({
    id: 0,
    idProdt: 0,
    nomProd: "",
    idProdEst: 0,
    desEstPro: "",
    idProdTip: 0,
    desProdTip: "",
    codLotProd: "",
    klgTotalLoteProduccion: "",
    totalUnidadesLoteProduccion: 0,
    fecVenLotProd: "",
    fecProdIniProg: "",
    fecProdFinProg: "",
    numop: "",
    prodDetProdc: [],
    prodDetDev: [],
  });

  const {
    id,
    totalUnidadesLoteProduccion,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgTotalLoteProduccion,
    nomProd,
    prodDetProdc,
    prodDetDev,
  } = devolucionesProduccionLote;

  // productos disponibles
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // detalle de requisicion agregacion
  const [detalleRequisicionDevolucion, setDetalleRequisicionDevolucion] =
    useState({
      requisicionDevolucion: null,
      detalleProductosDevueltos: [],
    });

  const { requisicionDevolucion, detalleProductosDevueltos } =
    detalleRequisicionDevolucion;

  // STATES PARA AGREGAR PRODUCTOS
  const [productoDevuelto, setproductoDevuelto] = useState({
    idProdDev: 0,
    cantidadDevuelta: 0.0,
    idProdDevMot: 0,
  });

  const { idProdDev, cantidadDevuelta } = productoDevuelto;

  // ************ ESTADO PARA CONTROLAR EL FEEDBACK **************
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackCreate(false);
  };

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  const [disableButton, setdisableButton] = useState(false);

  // ******* MANEJADORES PARA EL AGREGADO DE PRODUCCION *******
  // producto final informacion
  const [formulaProductoFinal, setFormulaProductoFinal] = useState(null);

  // STATE PARA CONTROLAR LA AGREGACION DE PRODUCTOS FINALES DEL LOTE
  const [productoLoteProduccion, setproductoLoteProduccion] = useState({
    idProdFin: 0,
    cantidadDeProducto: 0,
  });

  const { idProdFin, cantidadDeProducto } = productoLoteProduccion;

  // funcion para agregar presentacion final para la agregacion
  const onAddProductoFinalLoteProduccionDevolucion = async ({ id, value }) => {
    const { result } = await getFormulaProductoDetalleByProducto(id);
    if (result.length === 1) {
      const { reqDet } = result[0]; // obtenemos las requisiciones

      let reqProdInt = null;
      let reqEnvEnc = [];

      reqDet.forEach((detalle) => {
        if (detalle.idAre === 2 || detalle.idAre === 7) {
          reqProdInt = detalle;
        } else {
          reqEnvEnc.push(detalle);
        }
      });

      if (reqProdInt !== null) {
        const formulaPresentacionFinal = {
          id: result[0].id,
          idProdFin: result[0].idProdFin,
          nomProd: result[0].nomProd,
          simMed: result[0].simMed,
          canForProInt: reqProdInt.canForProDet,
          reqDet: reqEnvEnc,
        };

        setFormulaProductoFinal(formulaPresentacionFinal);

        // seteamos
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          idProdFin: id,
        });
      } else {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Esta formula no tiene información de su producto intermedio",
        });
        handleClickFeeback();

        // reseteamos los campos
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          idProdFin: 0,
          cantidadDeProducto: 0,
        });
      }
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "No hay formulas o hay mas de una formula para esta presetacion final",
      });
      handleClickFeeback();

      // reseteamos los campos
      setproductoLoteProduccion({
        ...productoLoteProduccion,
        idProdFin: 0,
        cantidadDeProducto: 0,
      });
    }
  };

  const handleAddProductoDevuelto = async (e) => {
    e.preventDefault();
    const { idProdFin, nomProd, simMed, reqDet } = formulaProductoFinal;
    const productoFinalProduccion = prodDetProdc.find(
      (element) => element.idProdt === idProdFin
    );
    const { canTotProgProdFin, canTotIngProdFin } = productoFinalProduccion;
    const cantidadSobrante = canTotProgProdFin - canTotIngProdFin;
    if (cantidadSobrante > 0) {
      let detalleRequisicion = [];
      reqDet.forEach((detalle) => {
        const cantidadRequisicionDevuelta = parseFloat(
          cantidadSobrante * detalle.canForProDet
        ).toFixed(5);
        detalleRequisicion.push({
          ...detalle,
          idProdFin: productoLoteProduccion.idProdFin,
          canReqProdLot: cantidadRequisicionDevuelta,
        });
      });

      // detalleRequisicion.map((obj) => {
      //   obj.canReqProdLot = parseIntCantidad(obj);
      // });

      const detalleRequisicionMotivos = detalleRequisicion.map((obj) => {
        const cantidadParser = parseIntCantidad(obj);
        return {
          ...obj,
          canReqProdLot: cantidadParser,
          motivos: [
            {
              idProdDevMot: 1,
              nomDevMot: "Sobrantes de requisicion",
              canProdDev: cantidadParser,
            },
            {
              idProdDevMot: 2,
              nomDevMot: "Desmedros de produccion",
              canProdDev: 0,
            },
            {
              idProdDevMot: 3,
              nomDevMot: "Otros",
              canProdDev: 0,
            },
          ],
        };
      });

      // actualizamos el detalle de requisicion de devolucion
      setDetalleRequisicionDevolucion({
        requisicionDevolucion: {
          ...productoLoteProduccion,
          cantidadDeProducto: cantidadSobrante,
        },
        detalleProductosDevueltos: detalleRequisicionMotivos,
      });
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "No sobra cantidad para devolver de esta presentación",
      });
      handleClickFeeback();
    }
  };

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoDevuelto = async (
    { target },
    detalle,
    indexProd
  ) => {
    const { value } = target;
    // Crear una copia del arreglo de detalles
    const editFormDetalle = detalleProductosDevueltos.map((element) => {
      // Si el idProdt coincide con el detalle proporcionado, actualiza los motivos
      if (detalle.idProd === element.idProd) {
        // Crear una copia del arreglo de motivos
        const nuevosMotivos = [...element.motivos];

        // Si el índice coincide con el índice proporcionado, actualiza canProdDev
        if (nuevosMotivos[indexProd]) {
          nuevosMotivos[indexProd].canProdDev = value;
        }

        // Actualiza los motivos en el detalle
        element.motivos = nuevosMotivos;

        // Calcula la suma de canProdDev en motivos
        const sumaMotivos = nuevosMotivos.reduce(
          (suma, motivo) => suma + Number(motivo.canProdDev || 0),
          0
        );

        // Actualiza canProdDev en el detalle del producto con la suma de motivos
        element.canProdDev = sumaMotivos;
      }

      return element;
    });

    setDetalleRequisicionDevolucion({
      ...detalleRequisicionDevolucion,
      detalleProductosDevueltos: editFormDetalle,
    });
  };

  // Manejador de eliminacion de un detalle de devolucion
  const handleDeleteProductoDevuelto = async (idItem) => {
    const dataDetalleProductosDevueltos = detalleProductosDevueltos.filter(
      (element) => {
        if (element.idProd !== idItem) {
          return true;
        } else {
          return false;
        }
      }
    );

    setDetalleRequisicionDevolucion({
      ...detalleRequisicionDevolucion,
      detalleProductosDevueltos: dataDetalleProductosDevueltos,
    });
  };

  const obtenerAcumulado = (requisicion) => {
    const { detReqDev } = requisicion;
    // esta variable guardara los totales: {idProdt: cantidad, idProdt: cantidad}
    const totales = {};
    // esta variable guardara los repetidos: {idProdt: {item}, idProdt: {item}}
    const repetidos = {};

    // recorremos el detalle de requisicion
    detReqDev.forEach((item) => {
      // obtenemos id y cantidad
      const { idProdt, canReqDevDet } = item;
      // si aun no existe en totales, lo agregamos
      if (!totales[idProdt]) {
        totales[idProdt] = 0;
      } else {
        // caso contrario chancamos repetios[idProdt] cada vez que se repita
        repetidos[idProdt] = { ...item };
      }

      // sumamos el total en totales[idProdt]
      totales[idProdt] += parseFloat(canReqDevDet);
      // añadimos la propiedad acu (acumulado parcial) al item
      item.acu = totales[idProdt];
    });

    // aqui obtenemos todos los repetidos y le establecemos el acumulado final
    const totalesFinales = Object.keys(repetidos).map((item) => {
      return {
        ...repetidos[item],
        acu: totales[item],
      };
    });
    return totalesFinales;
  };

  // funcion para mostrar pdf
  const generatePDF = (data) => {
    const acumulado = obtenerAcumulado(data);
    const formatData = {
      produccion: devolucionesProduccionLote,
      requisicion: data,
      acumulado,
    };
    const newWindow = window.open("", "Devoluciones", "fullscreen=yes");
    // Crear un contenedor específico para tu aplicación
    const appContainer = newWindow.document.createElement("div");
    newWindow.document.body.appendChild(appContainer);
    const root = createRoot(appContainer);
    root.render(<PDFDevoluciones data={formatData} />);
  };

  // traer informacion de devolucion de produccion
  const traerDatosProduccionLoteWithDevoluciones = async () => {
    if (idLotProdc.length !== 0) {
      const resultPeticion = await getProduccionLoteWithDevolucionesById(
        idLotProdc
      );
      const { message_error, description_error, result } = resultPeticion;

      if (message_error.length === 0) {
        const { idProdt, prodDetProdc } = result[0];

        // ahora debemos obtener los productos que se podran agregar
        const productosDisponibles = prodDetProdc.map((element) => {
          return {
            id: element.idProdt, // producto
            idProdFin: element.id, // referencia a producto final lote
            nomProd: element.nomProd, // nombre de producto
            simMed: element.simMed, // simbolo de la medida
            codProd2: element.codProd2, // codigo
          };
        });
        // seteamos la informacion de productos disponibles
        setProductosDisponibles(productosDisponibles);
        // seteamos la informacion de produccion de lote
        setdevolucionesProduccionLote(result[0]);
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error,
        });
        handleClickFeeback();
      }
    }
  };

  const crearDevolucionesLoteProduccion = async () => {
    const detalleDevoluciones = [];
    const informacionRequisicionDevolucion =
      detalleRequisicionDevolucion["requisicionDevolucion"];
    const { idProdFin } = informacionRequisicionDevolucion;

    let formatDataRequisicion = null;

    const referenciaProductoFinal = prodDetProdc.find(
      (element) => idProdFin === element.idProdt
    );

    detalleProductosDevueltos.forEach((element) => {
      element.motivos.forEach((motivo) => {
        const canProdDevMot = parseFloat(motivo.canProdDev);
        const idMotivo = motivo.idProdDevMot;
        if (!isNaN(canProdDevMot) && canProdDevMot !== 0) {
          const nuevoObjeto = {
            ...element,
            canProdDev: canProdDevMot,
            idProdDevMot: idMotivo,
          };
          delete nuevoObjeto.motivos;
          detalleDevoluciones.push(nuevoObjeto);
        }
      });
    });

    if (detalleDevoluciones.length !== 0) {
      formatDataRequisicion = {
        detalleProductosDevueltos: detalleDevoluciones,
        requisicionDevolucion: {
          ...informacionRequisicionDevolucion,
          idProdc: idLotProdc,
          idProdFin: referenciaProductoFinal.id,
          idProdt: informacionRequisicionDevolucion["idProdFin"],
        },
      };

      const resultPeticion = await createDevolucionesLoteProduccion(
        formatDataRequisicion
      );
      const { message_error, description_error } = resultPeticion;

      if (message_error.length === 0) {
        //onNavigateBack();
        setfeedbackMessages({
          style_message: "success",
          feedback_description_error: "Guardado con exito",
        });
        handleClickFeeback();
        setTimeout(() => {
          window.close();
        }, "1000");
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error,
        });
        handleClickFeeback();
      }
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "No hay productos por devolver, revisa las cantidades",
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  const handleSubmitDevolucionesLoteProduccion = (e) => {
    e.preventDefault();
    if (detalleProductosDevueltos.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "No has agregado items al detalle",
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      // crear devolucion
      crearDevolucionesLoteProduccion();
    }
  };

  useEffect(() => {
    traerDatosProduccionLoteWithDevoluciones();
  }, []);

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
                    type="text"
                    disabled={true}
                    value={`${klgTotalLoteProduccion} KG`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad Unidades</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${totalUnidadesLoteProduccion} UND`}
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

            {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
            <div className="card d-flex mt-4">
              <h6 className="card-header">Devoluciones registradas</h6>
              <div className="card-body">
                <div className="mb-3 row">
                  {/* <Paper> */}
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              color: "rgba(96, 96, 96)",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell align="left" width={30}>
                            <b>Ref.</b>
                          </TableCell>
                          <TableCell align="left" width={200}>
                            <b>Presentacion</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Cantidad devuelta</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Estado</b>
                          </TableCell>
                          <TableCell align="left" width={80}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prodDetDev.map((row, i) => (
                          <RowDetalleDevolucionLoteProduccion
                            key={row.id}
                            detalle={row}
                            onRenderPDF={generatePDF}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* </Paper> */}
                </div>
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
                  <label className="form-label">Presentación final</label>
                  <FilterProductosProgramados
                    defaultValue={productoLoteProduccion.idProdFin}
                    onNewInput={onAddProductoFinalLoteProduccionDevolucion}
                    products={productosDisponibles}
                  />
                </div>

                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS */}
                <div className="col-md-2 d-flex flex-column">
                  <label className="form-label">Cantidad devuelta</label>
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadDevuelta"
                    disabled={true}
                    value={
                      requisicionDevolucion
                        ? requisicionDevolucion.cantidadDeProducto
                        : 0
                    }
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
                            "& th": {
                              color: "rgba(96, 96, 96)",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell align="left" width={200}>
                            <b>Presentación final</b>
                          </TableCell>
                          <TableCell align="left" width={50}>
                            <b>Medida</b>
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
                        {requisicionDevolucion !== null &&
                          detalleProductosDevueltos.length !== 0 &&
                          detalleProductosDevueltos.map((detalle, index) => (
                            <RowDevolucionLoteProduccionEdit
                              key={index}
                              detalle={detalle}
                              onChangeInputDetalle={
                                handleChangeInputProductoDevuelto
                              }
                              onDeleteItemDetalle={handleDeleteProductoDevuelto}
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
              //disabled={disableButton}
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
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};
