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

import { getProduccionWhitProductosFinales } from "./../../helpers/producto-produccion/getProduccionWhitProductosFinales";
import { useLocation, useNavigate } from "react-router-dom";
import { RowProductosAgregadosProduccion } from "./../../components/RowProductosAgregadosProduccion";
import { RowProductosDisponiblesProduccion } from "./../../components/RowProductosDisponiblesProduccion";
import queryString from "query-string";
import { FilterAllProductos } from "../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { TextField } from "@mui/material";
import { getMateriaPrimaById } from "../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { createProductosFinalesLoteProduccion } from "./../../helpers/producto-produccion/createProductosFinalesLoteProduccion";
import {
  DiaJuliano,
  FormatDateTimeMYSQLNow,
  FormatDateTimeMYSQL,
  letraAnio,
  _parseInt,
  FormatDateTimeMYSQLNowPlusYears,
} from "../../../utils/functions/FormatDate";
import { DetalleProductosFinales } from "./DetalleProductosFinales";
import FechaPicker from "../../../../src/components/Fechas/FechaPicker";
import FechaPickerYear from "../../../components/Fechas/FechaPickerYear";
import Checkbox from "@mui/material/Checkbox";
import { EncabezadoInformacionProduccion } from "../../components/componentes-utils/EncabezadoInformacionProduccion";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarProductosLoteProduccionV2 = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);

  // ESTADOS DE LOS PRODUCTOS FINALES DE LA PRODUCCION
  const [proFinProd, setProFinProd] = useState({
    id: 0,
    numop: "", // numero de orden de produccion
    canLotProd: 0, // cantidad de produccion
    codLotProd: "", // codigo de produccion
    desEstPro: "", // descripcion de estado de produccion
    desProdTip: "", // descripcion dle tipo de produccion
    fecVenLotProd: "", // fecha vencimiento de produccion
    idProdEst: 0, // id estado produccion
    idProdTip: 0, // id estado tipo produccion
    idProdt: 0, // id producto intermedio
    klgLotProd: "", // peso de la produccion
    nomProd: "", // nombre del producto intermedio
    proFinProdDet: [], // productos finales programados
  });

  const {
    id, // id del proceso de produccion
    proFinProdDet, // productos finales programados
  } = proFinProd;

  // PRODUCTOS FINALES DISPONIBLES POR PRODUCCIÓN
  const [detalleProductosFinales, setdetalleProductosFinales] = useState([]);

  // STATES PARA AGREGAR PRESENTACIONES FINALES
  const [productoFinal, setproductoFinal] = useState({
    idProdFin: 0,
    idProdfinal: 0,
    cantidadIngresada: 0.0,
    fecEntSto: FormatDateTimeMYSQLNow(),
    fecVenSto: "",
  });
  const { idProdFin, cantidadIngresada, fecEntSto, fecVenSto } = productoFinal;

  // ******* ACCIONES DE FILTER PRODUCTO FINAL ******
  // MANEJADOR DE PRODUCTO
  const onAddProductoFinalSubProducto = (value) => {
    var year = 0;
    // si la UM de al presentacion final es LTS, entonces year = 1
    if (value.item.simMed === "LTS") {
      year = 1;
    } else {
      year = 4;
    }

    // Calculamos automaticamente su fecha de vencimiento
    var fecVenEntProdFin = FormatDateTimeMYSQLNowPlusYears(year);

    setproductoFinal({
      ...productoFinal,
      idProdFin: value.id, // id de de la presentacion final
      idProdfinal: value.idProdFin, // id de produccion prodcuto final del item seleccionado
      fecVenSto: fecVenEntProdFin, // fecha de vencimiento
    });
  };

  // Manejador de cantidad de presentacion final
  const handledFormCantidadIngresada = ({ target }) => {
    const { name, value } = target;
    setproductoFinal({
      ...productoFinal,
      [name]: value,
    });
  };

  // Manejador de fecha de ingreso de presentacion final
  const onAddFecEntSto = (newfecEntSto) => {
    setproductoFinal({
      ...productoFinal,
      fecEntSto: newfecEntSto,
    });
  };

  // Manejador de fecha de vencimiento de presentacion final
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

  // ******** MANEJO PARA EL ARREGLO DE PRODUCTOS FINALES **********

  // AÑADIR PRODUCTOS FINALES AL DETALLE
  const handleAddProductoFinal = async (e) => {
    e.preventDefault();
    if (idProdFin !== 0 && cantidadIngresada > 0.0) {
      const itemFound = detalleProductosFinales.find(
        (element) => element.idProdt === idProdFin
      );

      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto al detalle",
        });
        handleClickFeeback();
      } else {
        const resultPeticion = await getMateriaPrimaById(idProdFin);
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
            idProdFinal: productoFinal.idProdfinal,
            idProdc: id, // lote de produccion asociado
            idProdt: idProd, // producto
            codProd: codProd, // codigo de producto sigo
            codProd2: codProd2, // codigo emaprod
            desCla: desCla, // clase del producto
            desSubCla: desSubCla, // subclase del producto
            nomProd: nomProd, // nombre del producto
            simMed: simMed, // medida del producto
            fecEntSto: fecEntSto, // fecha de entrada
            fecVenEntProdFin: fecVenSto, // fecha de vencimiento
            canProdFin: cantidadIngresada, // cantidad de presentacion final ingresada
          };

          const dataDetalle = [...detalleProductosFinales, detalle];

          setdetalleProductosFinales(dataDetalle);
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
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    }
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
    const resultPeticion = await getProduccionWhitProductosFinales(idLotProdc);

    // console.log(resultPeticion);
    const { message_error, description_error, result } = resultPeticion;
    var products = result[0].proFinProdDet;

    var copyProducts = products.reduce((accumulator, currentValue) => {
      if (accumulator.some((obj) => obj.idProdt === currentValue.idProdt)) {
        accumulator.map((obj) => {
          if (obj.idProdt === currentValue.idProdt) {
            obj.canTotProgProdFin =
              parseFloat(obj.canTotProgProdFin) +
              parseFloat(currentValue.canTotProgProdFin);

            obj.canTotProgProdFin = _parseInt(obj, "canTotProgProdFin");

            //console.log(obj)

            obj.canTotIngProdFin =
              parseFloat(obj.canTotIngProdFin) +
              parseFloat(currentValue.canTotIngProdFin);
            obj.canTotIngProdFin = parseFloat(obj.canTotIngProdFin).toFixed(2);

            currentValue.total = obj.canTotProgProdFin;
            currentValue.canTotProgProdFin = _parseInt(
              currentValue,
              "canTotProgProdFin"
            );
            const clone = structuredClone(currentValue);
            obj.detail.push(clone);
          }
        });
      } else {
        const clone = structuredClone(currentValue);
        clone.canTotProgProdFin = _parseInt(currentValue, "canTotProgProdFin");
        currentValue.canTotProgProdFin = _parseInt(
          currentValue,
          "canTotProgProdFin"
        );

        clone.total = clone.canTotProgProdFin;
        currentValue.detail = [clone];
        accumulator.push(currentValue);
      }
      return accumulator;
    }, []);
    result[0].proFinProdDet = copyProducts;
    result[0].productsAutocomplete = products;
    //console.log(result[0]);

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

  // ****** SUBMIT PRODUCTOS FINALES ******
  const crearProductosFinalesLoteProduccion = async () => {
    const { idProdTip } = proFinProd;
    //const fechaIngreso = FormatDateTimeMYSQLNow();

    const dataEntrada = {
      letAniEntSto: letraAnio(fecEntSto),
      diaJulEntSto: DiaJuliano(fecEntSto),
      fechaIngreso: fecEntSto,
      idProdc: id,
    };

    //console.log(dataEntrada);
    detalleProductosFinales.map((obj) => {
      obj.letAniEntSto = letraAnio(obj.fecEntSto);
      obj.diaJulEntSto = DiaJuliano(obj.fecEntSto);
    });
    const cloneProFinProdDet = structuredClone(proFinProdDet);
    var productoFin = {};
    detalleProductosFinales.map((obj) => {
      var producto = cloneProFinProdDet.find(
        (prodFin) => obj.codProd2 == prodFin.codProd2
      );

      if (producto) {
        producto.canTotIngProdFin =
          parseFloat(producto.canTotIngProdFin) + parseFloat(obj.canProdFin);
      }

      if (producto?.canTotIngProdFin > producto?.canTotProgProdFin) {
        productoFin = producto;
        productoFin.check = true;
      }
    });

    if (productoFin.check) {
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

    const resultPeticion = await createProductosFinalesLoteProduccion(
      detalleProductosFinales,
      idProdTip,
      dataEntrada
    );

    //console.log(resultPeticion);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      onNavigateBack();
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

  // CODIGO QUE SE EJECUTA ANTES DE LA RENDERIZACION
  useEffect(() => {
    obtenerDataProductosFinalesProduccion();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Agregar Productos Finales</h1>
        <div className="row mt-4 mx-4">
          {/* DATOS DE LA PRODUCCION */}
          <EncabezadoInformacionProduccion datosProduccion={proFinProd} />

          {/* PRODUCTOS AGREGADOS */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <b>Presentaciones finales agregadas</b>
            </h6>
            <div className="card-body">
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
                          <b>Cantidad programada</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Cantidad ingresada</b>
                        </TableCell>
                        <TableCell align="left" width={10} sx={{ width: 5 }}>
                          <b>Action</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proFinProdDet.map((row, i) => (
                        <RowProductosAgregadosProduccion
                          key={row.id}
                          detalle={row}
                          DetalleProductosFinales={DetalleProductosFinales}
                          idProduccion={proFinProd.id}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>

          {/* PRODUCTOS POR AGREGAR */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <b>Agregar presentaciones finales</b>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-4">
                  <label className="form-label">
                    Producto final o sub producto
                  </label>
                  <FilterAllProductos
                    onNewInput={onAddProductoFinalSubProducto}
                    productos={proFinProd.productsAutocomplete}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de entrada</label>
                  <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de vencimiento</label>
                  <FechaPickerYear
                    onNewfecEntSto={onAddFecVenSto}
                    date={fecVenSto}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <br />
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadIngresada"
                    onChange={handledFormCantidadIngresada}
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoFinal}
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
              {/* LISTA DE PRODUCTOS */}
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
                            showButtonDelete={true}
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
              onClick={handleSubmitProductosFinalesLoteProduccion}
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
