import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilterTipoProduccion } from "./../../../components/ReferencialesFilters/TipoProduccion/FilterTipoProduccion";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FechaPicker from "../../../components/Fechas/FechaPicker";
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { TextField, Typography } from "@mui/material";
import FechaPickerYear from "./../../../components/Fechas/FechaPickerYear";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { getFormulaProductoDetalleByProducto } from "../../helpers/formula_producto/getFormulaProductoDetalleByProducto";
import { RowEditDetalleProductosFinales } from "./../../components/componentes-lote-produccion/RowEditDetalleProductosFinales";
import { RowEditDetalleRequisicionProduccion } from "../../components/componentes-lote-produccion/RowEditDetalleRequisicionProduccion";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { FilterAreaEncargada } from "./../../components/FilterAreaEncargada";
import { createProduccionLoteWithRequisiciones } from "./../../helpers/produccion_lote/createProduccionLoteWithRequisiciones";
import {
  FormatDateTimeMYSQLNow,
  FormatDateTimeMYSQLNowPlusYears,
} from "../../../utils/functions/FormatDate";

// IMPROTACIONES PARA LINEA DE PROGRESION
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { FilterPresentacionFinal } from "../../../components/ReferencialesFilters/Producto/FilterPresentacionFinal";
import { getRequisicionProcesoProduccion } from "../../helpers/produccion_lote/getRequisicionProcesoProduccion";
import { FilterPresentacionFinalDynamic } from "../../../components/ReferencialesFilters/Producto/FilterPresentacionFinalDynamic";
import { FilterProductoProduccionDynamic } from "../../../components/ReferencialesFilters/Producto/FilterProductoProduccionDynamic";
import { FilterAllProductosDynamic } from "../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic";
import { FilterTipoProduccionDynamic } from "../../../components/ReferencialesFilters/TipoProduccion/FilterTipoProduccionDynamic";
import { createProduccionLoteWithRequisiciones2 } from "../../helpers/produccion_lote/createProduccionLoteWithRequisiciones2";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CrearProduccionLote2 = () => {
  function onValidate(e) {
    var t = e.value;
    e.value = t.indexOf(".") >= 0 ? t.slice(0, t.indexOf(".") + 3) : t;
    return e.value;
  }

  function _parseInt(str) {
    if (str.canReqProdLot) {
      str.canReqDet = str.canReqProdLot;
    }

    if (str.canTotProgProdFin) {
      str.canReqDet = str.canTotProgProdFin;
    }
    str.canReqDet = parseFloat(str.canReqDet).toFixed(2);
    let index = str.canReqDet.toString().indexOf(".");
    let result = str.canReqDet.toString().substring(index + 1);
    //console.log("index: ",index, "result: ", result)
    let val =
      parseInt(result) >= 1 && str.simMed !== "KGM"
        ? Math.trunc(str.canReqDet) + 1
        : str.canReqDet;
    return val;
  }

  // ESTADO PARA LINEA DE PROGRESO
  const [showLinearProgress, setshowLinearProgress] = useState(false);
  const [_klgLotProd, setKlgLotProd] = useState(0);

  // ESTADO PARA CONTROLAR EL FEEDBACK
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

  // ESTADO PARA LOS DATOS DE PRODUCCION LOTE
  const [produccionLote, setproduccionLote] = useState({
    idProdt: 0, // producto intermedio (viene del backend)
    idReq: 0,
    idProdTip: 6, // envasado y encajado
    codTipProd: "EE",
    codLotProd: "", // codigo de lote (viene del backend)
    klgLotProd: 1, // kilogramos del lote (viene del backend)
    canLotProd: 1, // cantidad (viene del backend)
    klgTotalLoteProduccion: 0,
    klgDisponibleLoteProduccion: 0,
    totalUnidadesLoteProduccion: 0, // cantidad
    obsProd: "", // observaciones
    fecProdFinProg: "", // fecha de fin programado
    fecVenLotProd: "", // fecha de vencimiento del lote
    reqDetProdc: [], // detalle requisicion de lote
    prodDetProdc: [], // detalle de productos finales esperados
    fecProdIniProg: FormatDateTimeMYSQLNow(),
  });

  const {
    idProdt,
    idReq,
    idProdTip,
    codLotProd,
    klgLotProd,
    canLotProd,
    obsProd,
    fecProdIniProg,
    fecProdFinProg,
    fecVenLotProd,
    reqDetProdc,
    prodDetProdc,
  } = produccionLote;

  // ESTADO DE KLG DISPONIBLES PARA LOTE PRODUCCION
  const [cantidadLoteProduccion, setcantidadLoteProduccion] = useState({
    totalUnidadesLoteProduccion: 0,
    klgTotalLoteProduccion: 0,
    klgDisponibleLoteProduccion: 0,
  });

  const {
    totalUnidadesLoteProduccion,
    klgTotalLoteProduccion,
    klgDisponibleLoteProduccion,
  } = cantidadLoteProduccion;

  // useeffect change cantidad lote produccion
  useEffect(() => {
    setcantidadLoteProduccion({
      ...cantidadLoteProduccion,
      klgLotProd: parseFloat(klgLotProd),
      klgDisponibleLoteProduccion:
        parseFloat(klgLotProd) * parseFloat(canLotProd),
    });
  }, [klgLotProd, canLotProd]);

  // STATE PARA CONTROLAR LA AGREGACION DE PRODUCTOS FINALES DEL LOTE
  const [productoLoteProduccion, setproductoLoteProduccion] = useState({
    idProdFin: 0,
    cantidadDeLote: 0.0,
    cantidadDeProducto: 0,
  });

  // producto final informacion
  const [formulaProductoFinal, setFormulaProductoFinal] = useState(null);

  // STATE PARA CONTROLAR LOS PRODUCTOS ADITIVOS A LAS REQUISICIONES DEL LOTE
  const [productoRequisicionProduccion, setproductoRequisicionProduccion] =
    useState({
      idProdReq: 0,
      cantidadRequisicion: 0,
      idAre: 0,
    });

  const { idProdReq, cantidadRequisicion, idAre } =
    productoRequisicionProduccion;

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // ******** DATOS DEL LOTE DE PRODUCCION ********
  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setproduccionLote({
      ...produccionLote,
      [name]: value,
    });
  };

  // Evento para traer requisicion correspondiente al producto intermedio
  const onAddProductoProduccion = async ({ id }) => {
    // const response = await getLoteStockEnt({ idProdt: id });
    const response = await getRequisicionProcesoProduccion({ idProdt: id });
    var { result } = response;

    console.log(result);
    if (result.length === 0) {
      // Mostramos una alerta
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error:
          "No hay requisiciones disponibles para este proceso de produccion",
      });
      handleClickFeeback();
    } else {
      // si hay 2 requisiciones disponibles para este lote entonces mostramos una alerta
      if (result.length > 1) {
        // Mostramos una alerta
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Hay mas de una requisicion disponible para este proceso de produccion\n" +
            "Por defecto tomaremos la más reciente, pero asegurate de verificar si es correcto",
        });
        handleClickFeeback();
      }
      const canLotProd = parseFloat(result[0].canIng);
      setproduccionLote({
        ...produccionLote,
        idProdt: id,
        idReq: result[0].id,
        canLotProd: canLotProd,
        klgLotProd: canLotProd,
        codLotProd: result[0].codLotProd,
      });
      setKlgLotProd(canLotProd);
    }
  };

  // EVENTO DE TIPO DE PRODUCCION
  const onAddTipoProduccion = ({ id, cod }) => {
    setproduccionLote({
      ...produccionLote,
      idProdTip: id,
      codTipProd: cod,
    });
  };

  // ENVENTO DE FECHA INICIO PROGRAMADO
  const onAddFechaInicioProgramado = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecProdIniProg: newFecha });
  };
  // EVENTO DE FECHA FIN PROGRAMADO
  const onAddFechaFinProgramado = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecProdFinProg: newFecha });
  };

  // EVENTO DE FECHA VENCIMIENTO LOTE
  const onAddFechaVencimientoLoteProduccion = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecVenLotProd: newFecha });
  };

  // ******** EVENTOS DEL FILTRO DE PRODUCTO *********

  const onAddProductoFinalLoteProduccion = async ({ id, value }) => {
    const { result } = await getFormulaProductoDetalleByProducto(id);

    if (result.length === 1) {
      const { reqDet } = result[0]; // obtenemos las requisiciones

      let reqProdInt = {};
      let reqEnvEnc = [];

      reqDet.forEach((detalle) => {
        if (detalle.idAre === 2 || detalle.idAre === 7) {
          reqProdInt = detalle;
        } else {
          reqEnvEnc.push(detalle);
        }
      });

      const formulaPresentacionFinal = {
        id: result[0].id,
        idProdFin: result[0].idProdFin,
        nomProd: result[0].nomProd,
        simMed: result[0].simMed,
        canForProInt: reqProdInt.canForProDet,
        reqDet: reqEnvEnc,
      };

      setFormulaProductoFinal(formulaPresentacionFinal);

      setproductoLoteProduccion({
        ...productoLoteProduccion,
        idProdFin: id,
      });
    } else {
      console.log(
        "No hay formulas o hay mas de una formula para esta presetacion final"
      );
    }
  };

  // funcion para manejar la cantidad de klg requerida
  const handleInputsProductoFinalLote = async ({ target }) => {
    var { value } = target;
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadKlgRequerida = value;

      let cantidadUniRequerida = 0;

      if (formulaProductoFinal !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni = formulaProductoFinal.canForProInt;
        // cantidad de unidades obtenidas segun klg requerido ingresado
        cantidadUniRequerida = parseInt(
          cantidadKlgRequerida / canKlgProdIntByUni
        );

        setproductoLoteProduccion({
          ...productoLoteProduccion,
          cantidadDeLote: cantidadKlgRequerida,
          cantidadDeProducto: cantidadUniRequerida,
        });
      } else {
        console.log("No has seleccionado una presentacion final");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // funcion para manejar la cantidad de unidades requeridas
  const handleInputsProductoFinalCantidad = async ({ target }) => {
    var { value } = target;
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadUniRequerida = value;
      let cantidadKlgRequerida = 0;

      if (formulaProductoFinal !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni = formulaProductoFinal.canForProInt;
        // cantidad de unidades obtenidas segun klg requerido ingresado
        cantidadKlgRequerida = cantidadUniRequerida * canKlgProdIntByUni;
        cantidadKlgRequerida = cantidadKlgRequerida.toFixed(5);
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          cantidadDeLote: cantidadKlgRequerida,
          cantidadDeProducto: cantidadUniRequerida,
        });
      } else {
        console.log("No has seleccionado una presentacion final");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onAddProductoRequisicionLoteProduccion = (value) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idProdReq: value.id,
    });
  };
  // MANEJADOR DE INPUTS REQUISICION
  const handleInputsProductosRequisicion = ({ target }) => {
    const { value, name } = target;
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      [name]: value,
    });
  };

  // MAJEADOR PARA AGREGAR EL AREA AL FILTRO
  const handleAreaIdProductoRequisicion = ({ id }) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idAre: id,
    });
  };

  // añadir un detalle
  const handleAddProductoRequisicionLote = async (e) => {
    e.preventDefault();

    if (idProdReq !== 0 && idAre !== 0 && cantidadRequisicion > 0.0) {
      const itemFound = reqDetProdc.find(
        (element) => element.idProd === idProdReq
      );
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Ya se agrego este producto a la requisicion",
        });
        handleClickFeeback();
      } else {
        // solo permitir agregaciones de area embalaje y encajonado
        if (idAre === 5 || idAre === 6) {
          const resultPeticion = await getMateriaPrimaById(idProdReq);
          const { message_error, description_error, result } = resultPeticion;

          if (message_error.length === 0) {
            const { id, codProd, desCla, desSubCla, nomProd, simMed } =
              result[0];
            // generamos nuestro detalle de formula
            const detalleFormulaProducto = {
              idProd: id,
              idAre: idAre, // area
              idAlm: 1, // almacen de orgien
              nomAlm: "Almacen Principal",
              codProd: codProd,
              desCla: desCla,
              desSubCla: desSubCla,
              nomProd: nomProd,
              simMed: simMed,
              canForProDet: 1,
              canReqProdLot: cantidadRequisicion, // cantidad
            };

            // seteamos el detalle en general de la formula
            const dataDetalle = [...reqDetProdc, detalleFormulaProducto];

            setproduccionLote({
              ...produccionLote,
              reqDetProdc: dataDetalle,
            });
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
              "Solo se adminte areas de envasado y encajonado",
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaDetalleRequisicion = "";
      if (idProdReq === 0) {
        advertenciaDetalleRequisicion +=
          "Debe elegir un envase, embalaje u otro material para agregar el detalle\n";
      }
      if (idAre === 0) {
        advertenciaDetalleRequisicion +=
          "Debe asignar un area para agregar el detalle\n";
      }
      if (cantidadRequisicion <= 0) {
        advertenciaDetalleRequisicion +=
          "Debe proporcionar una cantidad mayor a 0 para agregar el detalle\n";
      }

      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaDetalleRequisicion,
      });
      handleClickFeeback();
    }
  };

  const handleDeleteItemRequisicionProduccion = (idItem, index) => {
    const dataDetalleRequisicionProduccion = reqDetProdc.filter((element) => {
      if (element.idProd === idItem && element.indexProdFin === index) {
        return false;
      } else {
        return true;
      }
    });

    setproduccionLote({
      ...produccionLote,
      reqDetProdc: dataDetalleRequisicionProduccion,
    });
  };

  const handleEditItemRequisicionProduccion = ({ target }, idItem, index) => {
    const { value } = target;
    //console.log("test ", value);
    const editFormDetalle = reqDetProdc.map((element) => {
      if (element.idProd === idItem && element.indexProdFin === index) {
        return {
          ...element,
          canReqProdLot: value,
        };
      } else {
        return element;
      }
    });
    setproduccionLote({
      ...produccionLote,
      reqDetProdc: editFormDetalle,
    });
  };

  const handleAddProductoProduccionLote = async (e) => {
    e.preventDefault();
    const cantidadDeLote = productoLoteProduccion.cantidadDeLote;
    const cantidadDeProducto = productoLoteProduccion.cantidadDeProducto;

    // primero verificamos si se ha ingresado la data necesaria
    if (
      productoLoteProduccion.idProdFin !== 0 &&
      (cantidadDeLote > 0.0 || cantidadDeProducto > 0)
    ) {
      const itemFound = prodDetProdc.find(
        (element) => element.idProdFin === productoLoteProduccion.idProdFin
      );

      // verificamos si este producto final ha sido agregado previamente
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto a la orden",
        });
        handleClickFeeback();
      } else {
        if (formulaProductoFinal !== null) {
          const { nomProd, simMed, reqDet, canForProInt } =
            formulaProductoFinal;

          console.log(canForProInt);

          // primero verificamos si la cantidad nueva ingresada supera nuestro limite de peso de lote
          let klgTotalOrdenProduccion = parseFloat(klgTotalLoteProduccion);
          klgTotalOrdenProduccion = klgTotalOrdenProduccion;

          let klgTotalPresentacionFinal = parseFloat(cantidadDeLote);
          klgTotalPresentacionFinal = klgTotalPresentacionFinal;

          const cantTotKlgAgr =
            klgTotalOrdenProduccion + klgTotalPresentacionFinal;

          const pesoOrdenProduccion = parseFloat(klgLotProd);

          console.log(cantTotKlgAgr, pesoOrdenProduccion, klgLotProd);

          if (cantTotKlgAgr <= pesoOrdenProduccion) {
            // calculamos el total de unidades
            const canTotUndAgr =
              parseInt(totalUnidadesLoteProduccion) + cantidadDeProducto;

            // actualizamos las cantidades actuales
            setcantidadLoteProduccion({
              ...cantidadLoteProduccion,
              klgTotalLoteProduccion: cantTotKlgAgr,
              totalUnidadesLoteProduccion: canTotUndAgr,
            });

            // actualizamos requisicion de productos finales
            const nextIndex = prodDetProdc.length + 1;
            const detalleProductosFinales = [
              ...prodDetProdc,
              {
                idProdFin: productoLoteProduccion.idProdFin,
                index: nextIndex,
                nomProd,
                simMed,
                canUnd: cantidadDeProducto,
                canKlg: cantidadDeLote,
              },
            ];

            let detalleRequisicionesFormula = [];

            reqDet.forEach((detalle) => {
              detalleRequisicionesFormula.push({
                ...detalle,
                indexProdFin: nextIndex,
                idProdFin: productoLoteProduccion.idProdFin,
                canReqProdLot: parseFloat(
                  cantidadDeProducto * detalle.canForProDet
                ).toFixed(5),
              });
            });

            const detalleRequisicion = [
              ...reqDetProdc,
              ...detalleRequisicionesFormula,
            ];

            // lo insertamos en el detalle
            setproduccionLote({
              ...produccionLote,
              prodDetProdc: detalleProductosFinales,
              reqDetProdc: detalleRequisicion,
            });

            // reseteamos los campos
            setproductoLoteProduccion({
              idProdFin: 0,
              cantidadDeLote: 0.0,
              cantidadDeProducto: 0,
            });

            setFormulaProductoFinal(null);
          } else {
            setfeedbackMessages({
              style_message: "warning",
              feedback_description_error:
                "Asegurese de que la asignancion de kg de lote sea menor al peso total permitido",
            });
            handleClickFeeback();
          }
        } else {
          setfeedbackMessages({
            style_message: "warning",
            feedback_description_error:
              "No se ha seleccionado ninguna presentacion final",
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaPresentacionFinal = "";
      if (productoLoteProduccion.idProdFin === 0) {
        advertenciaPresentacionFinal +=
          "Se debe proporcionar una presentacion final para agregar a la orden\n";
      }
      if (
        productoLoteProduccion.cantidadDeLote <= 0.0 ||
        productoLoteProduccion.cantidadDeProducto <= 0
      ) {
        advertenciaPresentacionFinal +=
          "Se debe proporcionar una cantidad mayor a 0 para agregar a la orden\n";
      }

      // mostramos el mensaje de error
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaPresentacionFinal,
      });
      handleClickFeeback();
    }
  };

  // ELIMINAR UN PRODUCTO FINAL Y SU REQUISICION
  const handleDeleteDetalleProducto = (idItem) => {
    let totalKlgProductoFinal = 0;
    let totalUnidadesProductoFinal = 0;
    // filtramos el elemento eliminado
    const dataDetalleProductoFinalProduccion = prodDetProdc.filter(
      (element) => {
        if (element.idProdFin !== idItem) {
          return true;
        } else {
          totalKlgProductoFinal = element.canKlg;
          totalUnidadesProductoFinal = element.canUnd;
          return false;
        }
      }
    );

    const dataDetalleRequisicionProduccion = reqDetProdc.filter((element) => {
      if (element.idProdFin !== idItem) {
        return true;
      } else {
        return false;
      }
    });

    // descontamos del total acumulado de klg
    setcantidadLoteProduccion({
      ...cantidadLoteProduccion,
      klgTotalLoteProduccion: parseFloat(
        klgTotalLoteProduccion - totalKlgProductoFinal
      ),
      totalUnidadesLoteProduccion: parseInt(
        totalUnidadesLoteProduccion - totalUnidadesProductoFinal
      ),
    });

    // lo insertamos en el detalle
    setproduccionLote({
      ...produccionLote,
      prodDetProdc: dataDetalleProductoFinalProduccion,
      reqDetProdc: dataDetalleRequisicionProduccion,
    });
  };

  const crearProduccionLote = async () => {
    console.log(totalUnidadesLoteProduccion);
    // actualizamos los valores correspondientes a klg y total de unidades
    const formatProduccionLote = {
      ...produccionLote,
      totalUnidadesLoteProduccion: totalUnidadesLoteProduccion,
      klgTotalLoteProduccion: klgTotalLoteProduccion,
      fecVenLotProd:
        fecVenLotProd.length === 0
          ? FormatDateTimeMYSQLNowPlusYears(4)
          : fecVenLotProd,
    };
    console.log(formatProduccionLote);
    return;

    const resultPeticion = await createProduccionLoteWithRequisiciones2(
      formatProduccionLote
    );

    const { message_error, description_error, result } = resultPeticion;

    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
    } else {
      // hubo error en la insercion
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }

    // habilitamos el boton de crear
    setdisableButton(false);
  };

  // SUBMIT FORMULARIO DE REQUISICION (M-D)
  const handleSubmitProduccionLote = (e) => {
    e.preventDefault();
    if (
      codLotProd.length === 0 ||
      idProdt === 0 ||
      idProdTip === 0 ||
      fecProdIniProg.length === 0 ||
      fecProdFinProg.length === 0
    ) {
      let advertenciaOrdenProduccion = "";
      if (codLotProd.length === 0) {
        advertenciaOrdenProduccion +=
          "No se ha proporcionado el código de lote\n";
      }
      if (idProdt === 0) {
        advertenciaOrdenProduccion += "No se ha proporcionado el subproducto\n";
      }
      if (idProdTip === 0) {
        advertenciaOrdenProduccion +=
          "No se ha proporcionado el tipo de producción\n";
      }
      if (klgLotProd <= 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar un peso mayor a 0 para buscar la formula\n";
      }
      if (canLotProd <= 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una cantidad mayor a 0\n";
      }
      if (fecProdIniProg.length === 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una fecha de inicio programado\n";
      }
      if (fecProdFinProg.length === 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una fecha de fin programado\n";
      }

      // Mostramos el feedback
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaOrdenProduccion,
      });
      handleClickFeeback();
    } else {
      let advertenciaSubProductos = "";
      // solo los lotes de subproductos no tienen detalle de presentaciones finales
      if (
        idProdTip !== 5 &&
        (prodDetProdc.length === 0 || reqDetProdc.length === 0)
      ) {
        advertenciaSubProductos +=
          "Solo los lotes de subproducto no pueden tener detalle de presentaciones finales\n";

        // Mostramos el feedback
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: advertenciaSubProductos,
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        crearProduccionLote();
      }
    }
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Crear Orden de Proceso</h1>

        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <form>
                <div className="mb-3 row">
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Número de Lote</b>
                    </label>
                    <input
                      type="text"
                      name="codLotProd"
                      onChange={handledForm}
                      value={codLotProd}
                      className="form-control"
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 me-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Producto Intermedio</b>
                    </label>
                    <FilterProductoProduccionDynamic
                      defaultValue={idProdt}
                      onNewInput={onAddProductoProduccion}
                    />
                  </div>
                  <div className="col-md-1">
                    <label htmlFor="nombre" className="form-label">
                      <b>Peso de Lote</b>
                    </label>
                    <input
                      type="number"
                      name="canLotProd"
                      onChange={(e) => {
                        const { name, value } = e.target;

                        var data = 0;
                        if (value <= _klgLotProd) {
                          data = value;
                        } else {
                          data = klgLotProd;
                          setfeedbackMessages({
                            style_message: "error",
                            feedback_description_error:
                              "la cantidad de peso no puede ser mayor a la cantidad disponible",
                          });
                          handleClickFeeback();
                        }

                        setproduccionLote({
                          ...produccionLote,
                          [name]: data,
                        });
                      }}
                      value={canLotProd}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-1">
                    <label htmlFor="nombre" className="form-label">
                      <b>Can dis Lote</b>
                    </label>
                    <input
                      type="text"
                      name="codLotProd"
                      onChange={handledForm}
                      value={_klgLotProd - canLotProd}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-3 row d-flex align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Tipo de Producción</b>
                    </label>
                    <FilterTipoProduccionDynamic
                      onNewInput={onAddTipoProduccion}
                      defaultValue={idProdTip}
                    />
                  </div>
                  <div className="col-md-6 me-6">
                    <label htmlFor="nombre" className="form-label">
                      <b>Fecha Vencimiento Lote</b>
                    </label>
                    <br />
                    <FechaPickerYear
                      onNewfecEntSto={onAddFechaVencimientoLoteProduccion}
                      date={fecVenLotProd}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* DATOS DE PROGRAMACION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Datos de Programación</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Inicio Programado</b>
                  </label>
                  <br />
                  <FechaPicker onNewfecEntSto={onAddFechaInicioProgramado} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Fin Programado</b>
                  </label>
                  <br />
                  <FechaPicker onNewfecEntSto={onAddFechaFinProgramado} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">
                    <b>Observaciones</b>
                  </label>
                  <textarea
                    value={obsProd}
                    name="obsProd"
                    onChange={handledForm}
                    className="form-control"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle Presentaciones Finales</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">Presentación Final</label>
                  {/* <FilterAllProductos onNewInput={onProductoId} /> */}
                  <FilterPresentacionFinalDynamic
                    defaultValue={idProdt}
                    onNewInput={onAddProductoFinalLoteProduccion}
                    idProdt={idProdt}
                  />
                </div>
                {/* KILOGRAMOS DE LOTE ASIGNADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad Lote (KG)</label>
                  <TextField
                    //type="number"
                    autoComplete="off"
                    size="small"
                    type="number"
                    name="cantidadDeLote"
                    value={productoLoteProduccion.cantidadDeLote}
                    onChange={handleInputsProductoFinalLote}
                  />
                </div>

                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS
                 */}

                <div className="col-md-2">
                  <label className="form-label">Cantidad Producto</label>
                  <TextField
                    //type="number"
                    autoComplete="off"
                    size="small"
                    type="number"
                    name="cantidadDeProducto"
                    value={productoLoteProduccion.cantidadDeProducto}
                    onChange={handleInputsProductoFinalCantidad}
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoProduccionLote}
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
              {/* PRODUCTOS FINALES O SUBPRODUCTOS */}
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
                        <TableCell align="left" width={20}>
                          <b>Prod-Asociado</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <b>U.M</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Unidades</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Peso Lote (kg)</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prodDetProdc.map((row, i) => {
                        return (
                          <RowEditDetalleProductosFinales
                            key={row.idProdFin}
                            detalle={row}
                            onDeleteItemProductoFinal={
                              handleDeleteDetalleProducto
                            }
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              {/* DETALLES DE LA CANTIDAD */}
              <div className="mt-4 d-flex justify-content-end align-items-center">
                <p className="me-4 p-2 bg-dark-subtle">
                  <b>Total Unidades: </b>
                  {totalUnidadesLoteProduccion}
                </p>
                <p className="p-2 bg-danger-subtle">
                  <b>Total Peso: </b>
                  {klgTotalLoteProduccion} / {klgLotProd}
                </p>
              </div>
            </div>
          </div>
          {/* DATOS DEL DETALLE */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de las Requisiciones</h6>
            <div className="card-body">
              {/* AÑADIR PRODUCTOS ADICICONALES */}
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">
                    Envases, Embalajes u otros Materiales
                  </label>
                  {/* <FilterAllProductos onNewInput={onProductoId} /> */}
                  <FilterAllProductosDynamic
                    onNewInput={onAddProductoRequisicionLoteProduccion}
                  />
                </div>
                {/* AGREGAR AREA */}
                <div className="col-md-2">
                  <label className="form-label">Área Destino</label>
                  <FilterAreaEncargada
                    onNewInput={handleAreaIdProductoRequisicion}
                  />
                </div>
                {/* KILOGRAMOS DE LOTE ASIGNADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <TextField
                    size="small"
                    type="number"
                    name="cantidadRequisicion"
                    onChange={handleInputsProductosRequisicion}
                  />
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoRequisicionLote}
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
              {/* DETALLE DE ENVASADO */}
              <div className="card text-bg-success d-flex mt-3">
                <h6 className="card-header">Detalle Envasado</h6>
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
                            <TableCell align="left" width={230}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>Unidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align="left" width={150}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDetProdc.map((row, i) => {
                            if (row.idAre === 5) {
                              return (
                                <RowEditDetalleRequisicionProduccion
                                  key={`${row.idProd}-${i}`}
                                  detalle={row}
                                  type="number"
                                  onDeleteItemRequisicion={
                                    handleDeleteItemRequisicionProduccion
                                  }
                                  onChangeItemDetalle={
                                    handleEditItemRequisicionProduccion
                                  }
                                  onValidate={onValidate}
                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
              {/* DETALLE DE ENCAJONADO */}
              <div className="card text-bg-warning d-flex mt-3">
                <h6 className="card-header">Detalle Encajado</h6>
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
                            <TableCell align="left" width={230}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>Unidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align="left" width={150}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDetProdc.map((row, i) => {
                            if (row.idAre === 6) {
                              return (
                                <RowEditDetalleRequisicionProduccion
                                  key={`${row.idProd}-${i}`}
                                  detalle={row}
                                  onDeleteItemRequisicion={
                                    handleDeleteItemRequisicionProduccion
                                  }
                                  onChangeItemDetalle={
                                    handleEditItemRequisicionProduccion
                                  }
                                  onValidate={onValidate}
                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4 ms-4">
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
            onClick={handleSubmitProduccionLote}
            className="btn btn-primary"
          >
            Guardar
          </button>
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
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>

      {/* LINEAR PROGRESS */}
      {showLinearProgress && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
    </>
  );
};
