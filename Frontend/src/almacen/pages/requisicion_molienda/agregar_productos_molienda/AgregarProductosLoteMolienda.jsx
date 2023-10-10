import React, { useState, useEffect } from "react";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { getProduccionWhitProductosFinales } from "./../../../helpers/producto-produccion/getProduccionWhitProductosFinales";
import { useLocation, useNavigate } from "react-router-dom";
import { RowProductosAgregadosProduccion } from "./../../../components/RowProductosAgregadosProduccion";
import { FilterProductoProduccion } from "../../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { RowProductosDisponiblesProduccion } from "./../../../components/RowProductosDisponiblesProduccion";
import queryString from "query-string";
import { FilterAllProductos } from "../../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { TextField } from "@mui/material";
import { getMateriaPrimaById } from "../../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { createProductoIntermedioLoteMolienda } from "./../../../helpers/producto-produccion/createProductoIntermedioLoteMolienda";
import {
  DiaJuliano,
  FormatDateTimeMYSQLNow,
  FormatDateTimeMYSQL,
  letraAnio,
  _parseInt,
} from "../../../../utils/functions/FormatDate";
import { DetalleProductosFinales } from "./DetalleProductosFinales";
import FechaPicker from "../../../../../src/components/Fechas/FechaPicker";
import FechaPickerYear from "../../../../components/Fechas/FechaPickerYear";
import { viewMoliendaRequisicionId } from "./../../../helpers/requisicion-molienda/viewMoliendaRequisicionId";
import Checkbox from "@mui/material/Checkbox";
import { useAuth } from "../../../../hooks/useAuth";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarProductosLoteMolienda = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const location = useLocation();
  const { idReq = "" } = queryString.parse(location.search);
  const [finalizarOrden, setFinalizarOrden] = useState(false);

  const { user } = useAuth();


  // ESTADOS DE LOS PRODUCTOS FINALES DE LA PRODUCCION
  const [proFinProd, setProFinProd] = useState({
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
    proFinProdDet: [],
    canIng: "",
    pedidoCompletado: false,
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
    proFinProdDet,
    canIng,
    pedidoCompletado,
  } = proFinProd;

  // PRODUCTOS FINALES DISPONIBLES POR PRODUCCIÓN
  const [detalleProductosFinales, setdetalleProductosFinales] = useState([]);

  // STATES PARA AGREGAR PRODUCTOS
  const [productoFinal, setproductoFinal] = useState({
    idProdFin: 0,
    cantidadIngresada: 0.0,
    fecEntSto: FormatDateTimeMYSQLNow(),
    fecVenSto: "",
  });
  const { idProdFin, cantidadIngresada, fecEntSto, fecVenSto } = productoFinal;

  // ******* ACCIONES DE FILTER PRODUCTO FINAL ******
  // MANEJADOR DE PRODUCTO
  const onAddProductoFinalSubProducto = (value) => {
    setproductoFinal({
      ...productoFinal,
      idProdFin: value.id, // id de producto de la tabla productos
      idProdfinal: value.idProdFin, // id record de la tabla produccion_producto_final
    });
  };

  // MANEJADOR DE CANTIDAD
  const handledFormCantidadIngresada = ({ target }) => {
    const { name, value } = target;
    setproductoFinal({
      ...productoFinal,
      [name]: value,
    });
  };

  const onAddFecEntSto = (newfecEntSto) => {
    setproductoFinal({
      ...productoFinal,
      fecEntSto: newfecEntSto,
    });
  };

  const onAddFecVenSto = (newfecEntSto) => {
    setproductoFinal({
      ...productoFinal,
      fecVenSto: newfecEntSto,
    });
  };

  // ********* ESTADO PARA CONTROLAR EL FEEDBACK **********
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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoFinal = async ({ target }, idItem) => {
    const { value, name } = target;
    const editFormDetalle = detalleProductosFinales.map((element) => {
      if (element.idProdt === idItem) {
        return {
          ...element,
          [name]: value,
        };
      } else {
        return element;
      }
    });
    setdetalleProductosFinales(editFormDetalle);
  };

  // ACCION PARA ELIMINA DEL DETALLE UN PRODUCTO FINAL
  const handleDeleteProductoDevuelto = async (idItem) => {
    // filtramos el elemento eliminado
    const dataDetalleProductosDevueltos = detalleProductosFinales.filter(
      (element) => {
        if (element.idProdt !== idItem) {
          return true;
        } else {
          return false;
        }
      }
    );

    // establecemos el detalle
    setdetalleProductosFinales(dataDetalleProductosDevueltos);
  };

  // ******** OBTENER DATA DE PRODUCTOS FINALES *********
  const obtenerDataProductosFinalesProduccion = async () => {
    //const resultPeticion = await getProduccionWhitProductosFinales(idLotProdc);

    var idProdc = -1;

    const resultPeticion = await viewMoliendaRequisicionId(idProdc, idReq);

    const { message_error, description_error, result } = resultPeticion;

    result[0].numop = result[0].prodLotReq[0].codReq;
    result[0].canLotProd = result[0].prodLotReq[0].cantProg;
    result[0].canIng = result[0].prodLotReq[0].canIng;
    result[0].nomProd = result[0].prodLotReq[0].nomProd;
    result[0].desProdTip = "POLVOS";
    result[0].idProdt = result[0].prodLotReq[0].idProdt;
    result[0].idReq = result[0].prodLotReq[0].id;
    result[0].idReq = result[0].prodLotReq[0].id;
    result[0].pedidoCompletado = result[0].prodLotReq[0].reqFinEst;
    result[0].variacion = result[0].prodLotReq[0].variacion;
    result[0].codLotProd = result[0].prodLotReq[0].codLotProd;
    result[0].canLotProd = result[0].prodLotReq[0].canLotProd;
    result[0].klgLotProd = result[0].prodLotReq[0].klgLotProd;

    var check = result[0].prodLotReq.some((item) => item.idReqEst !== 3);

    if (check) {
      alert("falta terminar de atender los insumos para el producto intemedio");
      window.close();
    }

    //console.log(result[0]);

    getProdIntermedio(result[0]);

    if (message_error.length === 0) {
      setProFinProd(result[0]);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  async function getProdIntermedio(produccion) {
    var idProdt = produccion.idProdt;
    var idProdc = produccion.idReq;
    var idReq = produccion.idReq;

    const resultPeticion = await getMateriaPrimaById(idProdt);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const {
        id: idProd,
        codProd,
        codProd2,
        desCla,
        desSubCla,
        nomProd,
        simMed,
      } = result[0];
      // generamos nuestro detalle
      const detalle = {
        idReq,
        idProdFinal: productoFinal.idProdfinal,
        idProdc: idProdc, // lote de produccion asociado
        idProdt: idProd, // producto
        codProd: codProd, // codigo de producto
        codProd2: codProd2, // codigo emaprod
        desCla: desCla, // clase del producto
        desSubCla: desSubCla, // subclase del producto
        nomProd: nomProd, // nombre del producto
        simMed: simMed, // medida del producto
        fecVenEntProdFin: fecVenSto,
        canProdFin: cantidadIngresada,
        fecEntSto: fecEntSto,
        esMol: 1,
      };

      const dataDetalle = [...detalleProductosFinales, detalle];
      dataDetalle.map((item) => {
        var date = new Date(item.fecEntSto);
        date.setFullYear(date.getFullYear() + 4);
        item.fecVenEntProdFin = FormatDateTimeMYSQL(date);
      });
      setdetalleProductosFinales(dataDetalle);
    }
  }
  // ****** SUBMIT PRODUCTOS FINALES ******
  const crearProductosFinalesLoteProduccion = async () => {
    const { idProdTip } = proFinProd;
    //const fechaIngreso = FormatDateTimeMYSQLNow();

    var variacion =
      canIng -
      canLotProd +
      (detalleProductosFinales[0]?.canProdFin
        ? parseFloat(detalleProductosFinales[0]?.canProdFin)
        : 0);

    const dataEntrada = {
      letAniEntSto: letraAnio(fecEntSto),
      diaJulEntSto: DiaJuliano(fecEntSto),
      fechaIngreso: fecEntSto,
      pedidoCompletado: finalizarOrden,
      variacion: finalizarOrden ? variacion : 0,
      codLot: codLotProd,
    };

    // console.log(dataEntrada);
    // return;
    detalleProductosFinales.map((obj) => {
      obj.letAniEntSto = letraAnio(obj.fecEntSto);
      obj.diaJulEntSto = DiaJuliano(obj.fecEntSto);
    });
    var productoFin = {};
    detalleProductosFinales.map((obj) => {
      obj.canTotIngProdFin = parseFloat(canIng) + parseFloat(obj.canProdFin);
      if (parseFloat(obj?.canTotIngProdFin) > parseFloat(canLotProd)) {
        productoFin = obj;
        productoFin.check = true;
      }
    });

    //console.log(detalleProductosFinales, idProdTip, dataEntrada, productoFin);

    if (false && productoFin.check) {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error:
          "la suma de la cantidad ingresada para " +
          productoFin.nomProd +
          " supera a la cantidad programada",
      });
      handleClickFeeback();
      return;
    }

    const resultPeticion = await createProductoIntermedioLoteMolienda(
      detalleProductosFinales,
      idProdTip,
      dataEntrada
    );
    //console.log(resultPeticion);
    //return;
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  const handleSubmitProductosFinalesLoteProduccion = (e) => {
    e.preventDefault();

    if (detalleProductosFinales.length === 0) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "No has agregado items al detalle",
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      crearProductosFinalesLoteProduccion();
    }
  };

  useEffect(() => {
    obtenerDataProductosFinalesProduccion();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Agregar Producto intermedio</h1>
        <div className="row mt-4 mx-4">
          {/* DATOS DE LA PRODUCCION */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero lote</b>
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
                    <b>Codigo</b>
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
              </div>

              <div className="mb-3 row d-flex align-items-center">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso programado</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad ingresada</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canIng}
                    className="form-control"
                  />
                </div>
                <div className="col-md-1">
                  <label htmlFor="nombre" className="form-label">
                    <b>Finalizar orden</b>
                  </label>
                  <br />
                  <Checkbox
                    disabled={Boolean(pedidoCompletado)}
                    checked={
                      pedidoCompletado
                        ? Boolean(pedidoCompletado)
                        : finalizarOrden
                    }
                    onChange={(event) => {
                      setFinalizarOrden(event.target.checked);
                    }}
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </div>
                {pedidoCompletado ? (
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Variación</b>
                    </label>
                    <input
                      type="number"
                      disabled={true}
                      value={
                        canIng -
                        klgLotProd +
                        (detalleProductosFinales[0]?.canProdFin
                          ? parseFloat(detalleProductosFinales[0]?.canProdFin)
                          : 0)
                      }
                      className="form-control"
                    />
                  </div>
                ) : (
                  finalizarOrden && (
                    <div className="col-md-2">
                      <label htmlFor="nombre" className="form-label">
                        <b>Variación</b>
                      </label>
                      <input
                        type="number"
                        disabled={true}
                        //value={canIng - canLotProd }
                        value={
                          canIng -
                          klgLotProd +
                          (detalleProductosFinales[0]?.canProdFin
                            ? parseFloat(detalleProductosFinales[0]?.canProdFin)
                            : 0)
                        }
                        className="form-control"
                      />
                    </div>
                  )
                )}
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
              </div>
            </div>
          </div>

          {/* PRODUCTOS POR AGREGAR */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <b>producto</b>
            </h6>
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
                            <b>Nombre</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>Unidad</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Clase</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Fecha entrada</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Fecha vencimiento</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Cantidad</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleProductosFinales.map((row, i) => (
                          <RowProductosDisponiblesProduccion
                            key={row.idProdt}
                            detalle={row}
                            onDeleteDetalle={handleDeleteProductoDevuelto}
                            onChangeDetalle={handleChangeInputProductoFinal}
                            DetProdIntermdio={DetalleProductosFinales}
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
            {!pedidoCompletado && (
              <button
                type="submit"
                disabled={pedidoCompletado}
                onClick={handleSubmitProductosFinalesLoteProduccion}
                className="btn btn-primary"
              >
                Guardar
              </button>
            )}
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
