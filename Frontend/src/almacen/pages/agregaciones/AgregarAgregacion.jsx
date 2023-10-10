import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FechaPicker from "../../../components/Fechas/FechaPicker";
// IMPORTACIONES PARA TABLE
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getProduccionLoteWithAgregacionesById } from "./../../../produccion/helpers/produccion_lote/getProduccionLoteWithAgregacionesById";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { TextField } from "@mui/material";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { RowDetalleAgregacionLoteProduccion } from "./../../components/componentes-agregaciones/RowDetalleAgregacionLoteProduccion";
import { RowDetalleAgregacionLoteProduccionEdit } from "./../../components/componentes-agregaciones/RowDetalleAgregacionLoteProduccionEdit";
import { FilterAreaEncargada } from "./../../../produccion/components/FilterAreaEncargada";
import { createAgregacionesLoteProduccion } from "./../../helpers/agregaciones-lote-produccion/createAgregacionesLoteProduccion";
import { getAgregacionByIdProduccion } from "./../../helpers/agregaciones-lote-produccion/getAgregacionByIdProduccion";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FilterPresentacionFinal } from "../../../components/ReferencialesFilters/Producto/FilterPresentacionFinal";
import DetalleProducts from "./DetalleProducts";
import {
  FormatDateTimeMYSQLNow,
  _parseInt,
} from "../../../utils/functions/FormatDate";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarAgregacion = () => {
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);

  const [entradasNoDisponible, setEntradasNoDisponible] = useState([]);

  // ESTADO PARA LOS DATOS DE PRODUCCION LOTE
  const [produccionLote, setproduccionLote] = useState({
    idProdt: 0, // producto intermedio
    idProdTip: 0, // tipo de produccion
    codLotProd: "", // codigo de lote
    klgLotProd: 1, // kilogramos del lote
    canLotProd: 1, // cantidad
    obsProd: "", // observaciones
    fecProdIniProg: "", // fecha de inicio programado
    fecProdFinProg: "", // fecha de fin programado
    fecVenLotProd: "", // fecha de vencimiento del lote
    reqDetProdc: [], // detalle requisicion de lote
    prodDetProdc: [], // detalle de productos finales esperados
    finalProducts: [], // records de la tabla productos final
  });

  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [agregacionesProduccionLote, setagregacionesProduccionLote] = useState({
    id: 0,
    numop: "",
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
    detAgr: [],
  });

  const {
    id,
    numop,
    canLotProd,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgLotProd,
    nomProd,
    detAgr,
  } = agregacionesProduccionLote;

  //const [detalleProductosAgregados, setdetalleProductosAgregados] = useState(
  //  []
  //);
  var detalleProductosAgregados = [];
  // STATES PARA AGREGAR PRODUCTO
  const [productoAgregado, setproductoAgregado] = useState({
    idProdAgr: 0,
    cantidadAgregada: 0.0,
    idAreaEncargada: 0,
  });

  const { idProdAgr, cantidadAgregada, idAreaEncargada } = productoAgregado;

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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // ACCION DE AÑADIR UN PRODUCTO A DEVOLVER AL DETALLE
  const handleAddproductoAgregado = async (e) => {
    e.preventDefault();

    if (idProdAgr !== 0 && cantidadAgregada > 0.0 && idAreaEncargada !== 0) {
      if (idAreaEncargada === 5 || idAreaEncargada === 6) {
        const itemFound = detalleProductosAgregados.find(
          (element) => element.idProdt === idProdAgr
        );

        if (itemFound) {
          setfeedbackMessages({
            style_message: "warning",
            feedback_description_error: "Ya se agrego este producto al detalle",
          });
          handleClickFeeback();
        } else {
          const resultPeticion = await getMateriaPrimaById(idProdAgr);
          const { message_error, description_error, result } = resultPeticion;
          if (message_error.length === 0) {
            const {
              id: idProd,
              codProd,
              desCla,
              desSubCla,
              nomProd,
              simMed,
            } = result[0];
            // generamos nuestro detalle
            const detalle = {
              idProdc: id, // lote de produccion asociado
              idProdt: idProd, // producto
              idProdAgrMot: 0, // motivo de devolucion
              idAre: idAreaEncargada,
              codProd: codProd, // codigo de producto
              desCla: desCla, // clase del producto
              desSubCla: desSubCla, // subclase del producto
              nomProd: nomProd, // nombre del producto
              simMed: simMed, // medida del producto
              canProdAgr: cantidadAgregada, // cantidad devuelta
              idFinalProduct: productoAgregado.finalProduct,
            };
            console.log(productoAgregado);

            // seteamos el detalle
            const dataDetalle = [...detalleProductosAgregados, detalle];
            //setdetalleProductosAgregados(dataDetalle);
          } else {
            setfeedbackMessages({
              style_message: "error",
              feedback_description_error: description_error,
            });
            handleClickFeeback();
          }
        }
      } else {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Solo se pueden hacer agregaciones de envasado o encajado",
        });
        handleClickFeeback();
      }
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    }
  };

  // FUNCION PARA TRAES DATOS DE PRODUCCION LOTE
  const traerDatosProduccionLoteWithAgregaciones = async () => {
    if (idLotProdc.length !== 0) {
      const resultPeticion = await getProduccionLoteWithAgregacionesById(
        idLotProdc
      );
      const { message_error, description_error, result } = resultPeticion;
      console.log(resultPeticion);
      resultPeticion.result[0].detAgr.sort(function (a, b) {
        return a.id - b.id;
      });

      if (message_error.length === 0) {
        setproduccionLote({
          ...produccionLote,
          finalProducts: result[0].finalProducts,
        });

        setagregacionesProduccionLote(result[0]);
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error,
        });
        handleClickFeeback();
      }
    }
  };

  // ********** SUBMIT DE DEVOLUCIONES ***********
  const handleSubmitAgregacionesLoteProduccion = (e) => {
    e.preventDefault();

    //console.log(produccionLote)
    //console.log(detalleProductosAgregados)

    detalleProductosAgregados = [];
    produccionLote.reqDetProdc.map((obj) => {
      detalleProductosAgregados.push({
        idProdc: idLotProdc, // lote de produccion asociado
        idProdt: obj.idProd, // producto
        idProdAgrMot: obj.idProdAgrMot ? obj.idProdAgrMot : 1, // motivo de devolucion
        idAre: obj.idAre,
        codProd: obj.codProd, // codigo de producto
        desCla: obj.desCla, // clase del producto
        desSubCla: obj.desSubCla, // subclase del producto
        nomProd: obj.nomProd, // nombre del producto
        simMed: obj.simMed, // medida del producto
        canProdAgr: obj.canReqProdLot,
        fechaInicio: fechaAgregacion.inicio,
        fechaFin: fechaAgregacion.fin,
        indexProdFin: obj.indexProdFin ? obj.indexProdFin : 0,
        cantUnidadesProdFin: obj.cantidadUnidades ? obj.cantidadUnidades : 0,
        cantidadklgLote: obj.cantidadklgLote,
        idProdFin: obj.idProdFin ? obj.idProdFin : 0,
      });
    });

    detalleProductosAgregados.sort(function (a, b) {
      return parseFloat(a.indexProdFin) - parseFloat(b.indexProdFin);
    });

    if (detalleProductosAgregados.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "No has agregado items al detalle",
      });
      handleClickFeeback();
    } else {
      // hacemos una verificacio de los motivos
      const validMotivoDevolucion = detalleProductosAgregados.find(
        (element) => element.idProdAgrMot === 0
      );

      if (validMotivoDevolucion) {
        // MANEJAMOS FORMULARIOS INCOMPLETOS
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar el motivo de la agregacion para cada item",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // crear devolucion
        crearAgregacionesLoteProduccion();
      }
    }
  };

  async function crearAgregacionesLoteProduccion() {
    /**
      canProdAgr: "1"
      codProd: null
      desCla: "Envase y Embalaje"
      desSubCla: undefined
      idAre: 5
      idFinalProduct: undefined
      idProdAgrMot: 2
      idProdc: 189
      idProdt: 221
      nomProd: "ENV. IMPRESA - SAZONADOR COMPLETO MOLIDO GIGANTE LAMINADO POLYSTER-BOPP 600 MM"
      simMed : "KGM"
     */

    /**
      const detalle = {
        idProdc: id, // lote de produccion asociado
        idProdt: idProd, // producto
        idProdAgrMot: 0, // motivo de devolucion
        idAre: idAreaEncargada,
        codProd: codProd, // codigo de producto
        desCla: desCla, // clase del producto
        desSubCla: desSubCla, // subclase del producto
        nomProd: nomProd, // nombre del producto
        simMed: simMed, // medida del producto
        canProdAgr: cantidadAgregada, // cantidad devuelta
        idFinalProduct:productoAgregado.finalProduct,
      };
       */

    // function nextLetter(s) {
    //   return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
    //     var c = a.charCodeAt(0);
    //     //console.log("a",a.charCodeAt(0))
    //     switch (c) {
    //       case 90:
    //         return "A";
    //       case 122:
    //         return "a";
    //       default:
    //         return String.fromCharCode(++c);
    //     }
    //   });
    // }

    // console.log(nextLetter("B"))
    const res = await getAgregacionByIdProduccion(idLotProdc);

    const { result } = res;
    const { detAgr } = result;
    var my_string = "A";
    var flag = "A";
    if (detAgr?.length) {
      var my_string = detAgr[0].flag;
      flag =
        my_string.substring(0, my_string.length - 1) +
        String.fromCharCode(my_string.charCodeAt(my_string.length - 1) + 1);
    }

    detalleProductosAgregados.map((obj) => {
      obj.flag = flag;
    });

    //console.log(detalleProductosAgregados)
    //return
    const resultPeticion = await createAgregacionesLoteProduccion(
      detalleProductosAgregados
    );

    //console.log( detalleProductosAgregados, resultPeticion);
    //return;

    const { message_error, description_error, noDisponible } = resultPeticion;

    if (noDisponible?.length) {
      setEntradasNoDisponible(noDisponible);
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error:
          "No hay entradas disponibles para el producto del detalle",
      });
      handleClickFeeback();
    } else {
      setEntradasNoDisponible([]);
      if (message_error?.length === 0) {
        setfeedbackMessages({
          style_message: "success",
          feedback_description_error: "Agregacion creado con exito",
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
        setdisableButton(false);
      }
    }

    //setdisableButton(false);
  }

  useEffect(() => {
    traerDatosProduccionLoteWithAgregaciones();
  }, []);

  const [fechaAgregacion, setFechaAgregacion] = useState({
    inicio: FormatDateTimeMYSQLNow(),
    fin: FormatDateTimeMYSQLNow(),
  });

  const onAddFechaInicioProgramado = (newFecha) => {
    setFechaAgregacion({ ...fechaAgregacion, inicio: newFecha });
  };
  const onAddFechaFinProgramado = (newFecha) => {
    setFechaAgregacion({ ...fechaAgregacion, fin: newFecha });
  };

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar agregacion</h1>
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

          {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Agregaciones registradas</h6>
            <div className="card-body">
              <div className="mb-3 row">
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
                            <b>Codigo</b>
                          </TableCell>
                          <TableCell align="left" width={200}>
                            <b>Nombre</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Fecha Inicio</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Fecha Fin</b>
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
                          <TableCell align="left" width={150}>
                            <b>Cantidad</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {agregacionesProduccionLote.detAgr.map((row, i) => (
                          <RowDetalleAgregacionLoteProduccion
                            key={row.id}
                            detalle={row}
                            _parseInt={_parseInt}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>

          <div className="card d-flex mt-4">
            <h6 className="card-header">Fecha de programación</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Inicio</b>
                  </label>
                  <FechaPicker onNewfecEntSto={onAddFechaInicioProgramado} />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Fin</b>
                  </label>
                  <FechaPicker onNewfecEntSto={onAddFechaFinProgramado} />
                </div>
              </div>
            </div>
          </div>

          <DetalleProducts
            produccionLote={produccionLote}
            setproduccionLote={setproduccionLote}
            entradasNoDisponible={entradasNoDisponible}
            setEntradasNoDisponible={setEntradasNoDisponible}
          />

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
              onClick={handleSubmitAgregacionesLoteProduccion}
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
