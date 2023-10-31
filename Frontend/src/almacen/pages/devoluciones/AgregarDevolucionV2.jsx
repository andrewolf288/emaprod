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
import { RowDetalleDevolucionLoteProduccionEdit } from "./RowDetalleDevolucionLoteProduccionEdit";
import { TextField } from "@mui/material";

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
    canLotProd: 0,
    codLotProd: "",
    desEstPro: "",
    desProdTip: "",
    fecVenLotProd: "",
    idProdEst: 0,
    idProdTip: 0,
    idProdt: 0,
    klgLotProd: "",
    nomProd: "",
    prodDetProdc: [],
    prodDetDev: [],
  });

  const {
    id,
    idProdt,
    canLotProd,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgLotProd,
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
    console.log(formulaProductoFinal);
    const { idProdFin, nomProd, simMed, reqDet } = formulaProductoFinal;
    const productoFinalProduccion = prodDetProdc.find(
      (element) => element.idProdt === idProdFin
    );
    const { canTotProgProdFin, canTotIngProdFin } = productoFinalProduccion;
    const cantidadSobrante = canTotProgProdFin - canTotIngProdFin;
    if (cantidadSobrante > 0) {
      console.log(cantidadSobrante);
      let detalleRequisicion = [];
      reqDet.forEach((detalle) => {
        const cantidadRequisicionDevuelta = parseFloat(
          cantidadSobrante * detalle.canForProDet
        ).toFixed(5);
        detalleRequisicion.push({
          ...detalle,
          idProdFin: productoLoteProduccion.idProdFin,
          canReqProdLot: cantidadRequisicionDevuelta,
          motivos: [
            {
              idProdDevMot: 1,
              nomDevMot: "Sobrantes de requisicion",
              canProdDev: cantidadRequisicionDevuelta,
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
        });

        detalleRequisicion.map((obj) => {
          obj.canReqProdLot = parseIntCantidad(obj);
        });
      });
      console.log(detalleRequisicion);

      // actualizamos el detalle de requisicion de devolucion
      setDetalleRequisicionDevolucion({
        requisicionDevolucion: {
          ...productoLoteProduccion,
          cantidadDeProducto: cantidadSobrante,
        },
        detalleProductosDevueltos: detalleRequisicion,
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
    var productos = detalleProductosDevueltos?.filter(
      (obj) => parseFloat(obj.canProdDev) > 0
    );
    const resultPeticion = await createDevolucionesLoteProduccion(productos);
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
      const validMotivoDevolucion = detalleProductosDevueltos.find(
        (element) => element.idProdDevMot === 0
      );

      if (validMotivoDevolucion) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar el motivo de la devolucion para cada item",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // crear devolucion
        crearDevolucionesLoteProduccion();
      }
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

            {/* <div className="card-body">
              <div className="mb-3 row">
                <div className="btn-toolbar">
                  <button
                    onClick={() => {
                      //handleButtonClick(idLotProdc, "agregaciones", row.flag);

                      const newWindow = window.open(
                        "",
                        "windowName",
                        "fullscreen=yes"
                      );
                      ReactDOM.render(
                        <PdfDevoluciones
                          data={"data"}
                          codLotProd={codLotProd}
                          canLotProd={canLotProd}
                          numop={numop}
                          nomProd={nomProd}
                          desProdTip={desProdTip}
                          detDev={detDev}
                          prodToDev={detalleProductosDevueltos}
                        />,
                        newWindow.document.body
                      );
                    }}
                    className="btn btn-primary me-2 btn"
                  >
                    <PictureAsPdfIcon />
                  </button>
                </div>
              </div>
            </div>
          </div> */}

            {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
            <div className="card d-flex mt-4">
              <h6 className="card-header">Devoluciones registradas</h6>

              <div className="card-body">
                <div></div>
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
                <div className="col-md-3">
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
                            <RowDetalleDevolucionLoteProduccionEdit
                              key={index}
                              detalle={detalle}
                              // onChangeInputDetalle={
                              //   handleChangeInputProductoDevuelto
                              // }
                              // onDeleteItemDetalle={handleDeleteProductoDevuelto}
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
