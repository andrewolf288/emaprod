import React, { useState, useEffect } from "react";
import { FilterPresentacionFinal } from "../../../components/ReferencialesFilters/Producto/FilterPresentacionFinal";
import { TextField } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { RowEditDetalleProductosFinales } from "./../../../../src/produccion/components/componentes-lote-produccion/RowEditDetalleProductosFinales";
//import { RowEditDetalleProductosFinales } from "./../../components/componentes-lote-produccion/RowEditDetalleProductosFinales";
import { FilterAllProductos } from "./../../../../src/components/ReferencialesFilters/Producto/FilterAllProductos";
//import { FilterAllProductos } from "./../../../../src/produccion/components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterAreaEncargada } from "./../../../../src/produccion/components/FilterAreaEncargada";
//import { FilterAreaEncargada } from "./../../components/FilterAreaEncargada";
import { RowEditDetalleRequisicionProduccion } from "./../../../../src/produccion/components/componentes-lote-produccion/RowEditDetalleRequisicionProduccion";
import { getFormulaProductoDetalleByProducto } from "../../../../src/produccion/helpers/formula_producto/getFormulaProductoDetalleByProducto";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function DetalleProducts({
  produccionLote,
  setproduccionLote,
  entradasNoDisponible,
  setEntradasNoDisponible,
}) {
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

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [finalProducts, setFinalProducts] = useState([]);

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

  // ESTADO PARA LOS DATOS DE PRODUCCION LOTE
  //const [produccionLote, setproduccionLote] = useState({
  //  idProdt: 0, // producto intermedio
  //  idProdTip: 0, // tipo de produccion
  //  codLotProd: "", // codigo de lote
  //  klgLotProd: 1, // kilogramos del lote
  //  canLotProd: 1, // cantidad
  //  obsProd: "", // observaciones
  //  fecProdIniProg: "", // fecha de inicio programado
  //  fecProdFinProg: "", // fecha de fin programado
  //  fecVenLotProd: "", // fecha de vencimiento del lote
  //  reqDetProdc: [], // detalle requisicion de lote
  //  prodDetProdc: [], // detalle de productos finales esperados
  //});

  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const handleClickFeeback = () => {
    setfeedbackCreate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackCreate(false);
  };

  // STATE PARA CONTROLAR LA AGREGACION DE PRODUCTOS FINALES DEL LOTE
  const [productoLoteProduccion, setproductoLoteProduccion] = useState({
    idProdFin: 0,
    cantidadDeLote: 0.0,
    cantidadDeProducto: 0,
  });

  // state producto para detalle requisicion
  const [productoRequisicionProduccion, setproductoRequisicionProduccion] =
    useState({
      idProdReq: 0,
      cantidadRequisicion: 0,
      idAre: 0,
      idAlm: 0,
    });

  const onAddProductoFinalLoteProduccion = (value) => {
    setproductoLoteProduccion({
      ...productoLoteProduccion,
      idProdFin: value.id,
    });
  };

  const handleInputsProductosFinales = ({ target }) => {
    const { value, name } = target;

    setproductoLoteProduccion({
      ...productoLoteProduccion,
      [name]: value,
    });
  };

  const onAddProductoRequisicionLoteProduccion = (value) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idProdReq: value.id,
    });
  };

  const handleAreaIdProductoRequisicion = ({ id }) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idAre: id,
    });
  };

  const handleInputsProductosRequisicion = ({ target }) => {
    const { value, name } = target;
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      [name]: value,
    });
  };

  const handleDeleteItemRequisicionProduccion = (idItem, index) => {
    const dataDetalleRequisicionProduccion = produccionLote.reqDetProdc.filter(
      (element) => {
        if (element.idProd === idItem && element.indexProdFin === index) {
          return false;
        } else {
          return true;
        }
      }
    );

    setproduccionLote({
      ...produccionLote,
      reqDetProdc: dataDetalleRequisicionProduccion,
    });
  };

  const handleEditItemRequisicionProduccion = ({ target }, idItem, index) => {
    const { value } = target;
    //console.log("test " , value)
    const editFormDetalle = produccionLote.reqDetProdc.map((element) => {
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

    //console.log(prodDetProdc,idProdFin)
    //return
    setEntradasNoDisponible([]);
    console.log(productoLoteProduccion);
    if (
      parseFloat(productoLoteProduccion.cantidadDeLote) > 0.0 &&
      productoLoteProduccion.idProdFin !== 0
    ) {
      const itemFound = produccionLote.prodDetProdc.find(
        (element) => element.idProdFin === productoLoteProduccion.idProdFin
      );
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto a la orden",
        });
        handleClickFeeback();
      } else {
        const resultPeticion = await getFormulaProductoDetalleByProducto(
          productoLoteProduccion.idProdFin
        );
        const { message_error, description_error, result } = resultPeticion;
        //console.log(result);
        //return

        if (message_error.length === 0) {
          const { idProdFin, nomProd, simMed, reqDet } = result[0]; // obtenemos la requisicion
          let equivalenteKilogramos = 0;
          //buscamos la requisicion de materia prima
          //console.log("Complete Element -> ",reqDet);

          reqDet.forEach((element) => {
            if (element.idAre === 2 || element.idAre === 7) {
              equivalenteKilogramos = parseFloat(element.canForProDet);
              //console.log("elemento are:", element.desAre);
              //console.log("elemento value: ", equivalenteKilogramos);
            }
          });

          let cantidadUnidades = 0;
          let cantidadklgLote = 0;
          //if (parseFloat(productoLoteProduccion.cantidadDeLote) > 0.0) {
          cantidadUnidades =
            parseFloat(productoLoteProduccion.cantidadDeLote) /
            equivalenteKilogramos;
          cantidadklgLote = parseFloat(
            productoLoteProduccion.cantidadDeLote
          ).toFixed(2);
          //} else {
          //cantidadUnidades = Math.round(
          //  parseFloat(productoLoteProduccion.cantidadDeProducto)
          //);
          //cantidadklgLote = parseFloat(
          //  (
          //    equivalenteKilogramos *
          //    parseFloat(productoLoteProduccion.cantidadDeProducto)
          //  ).toFixed(2)
          //);
          //}

          const cantidadTotalDelLoteProduccion = parseFloat(
            klgTotalLoteProduccion + cantidadklgLote
          );

          const cantidadTotalUnidadesDelLoteProduccion = parseInt(
            totalUnidadesLoteProduccion + cantidadUnidades
          );

          if (
            false &&
            cantidadTotalDelLoteProduccion > klgDisponibleLoteProduccion
          ) {
            setfeedbackMessages({
              style_message: "warning",
              feedback_description_error:
                "Asegurese de que la asignancion de kg de lote sea menor a lo permitido",
            });
            handleClickFeeback();
          } else {
            setcantidadLoteProduccion({
              ...cantidadLoteProduccion,
              klgTotalLoteProduccion: cantidadTotalDelLoteProduccion,
              totalUnidadesLoteProduccion:
                cantidadTotalUnidadesDelLoteProduccion,
            });

            const nextIndex = produccionLote.prodDetProdc.length + 1;
            const detalleProductosFinales = [
              ...produccionLote.prodDetProdc,
              {
                idProdFin,
                index: nextIndex,
                nomProd,
                simMed,
                canUnd: cantidadUnidades,
                canKlg: cantidadklgLote,
              },
            ];

            let detalleRequisicionesFormula = [];

            reqDet.forEach((element) => {
              if (element.idAre === 5 || element.idAre === 6) {
                detalleRequisicionesFormula.push({
                  ...element,
                  indexProdFin: nextIndex,
                  idProdFin: idProdFin,
                  idProdAgrMot: 1,
                  cantidadUnidades,
                  cantidadklgLote,
                  canReqProdLot: parseFloat(
                    (
                      parseFloat(element.canForProDet) * cantidadUnidades
                    ).toFixed(2)
                  ),
                });
              } else {
                return;
              }
            });

            //console.log(detalleRequisicionesFormula)
            detalleRequisicionesFormula.map((obj) => {
              obj.canReqProdLot = _parseInt(obj);
            });
            const detalleRequisicion = [
              ...produccionLote.reqDetProdc,
              ...detalleRequisicionesFormula,
            ];
            //console.log(detalleProductosFinales)
            setproduccionLote({
              ...produccionLote,
              prodDetProdc: detalleProductosFinales,
              reqDetProdc: detalleRequisicion,
            });
          }
        } else {
          setfeedbackMessages({
            style_message: "error",
            feedback_description_error: description_error,
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

  const handleAddProductoRequisicionLote = async (e) => {
    e.preventDefault();
    if (
      productoRequisicionProduccion.idProdReq !== 0 &&
      productoRequisicionProduccion.idAre !== 0 &&
      productoRequisicionProduccion.cantidadRequisicion > 0.0
    ) {
      const itemFound = produccionLote.reqDetProdc.find(
        (element) => element.idProd === productoRequisicionProduccion.idProdReq
      );

      //console.log(itemFound)
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Ya se agrego este producto a la requisicion",
        });
        handleClickFeeback();
      } else {
        if (
          productoRequisicionProduccion.idAre === 5 ||
          productoRequisicionProduccion.idAre === 6
        ) {
          const resultPeticion = await getMateriaPrimaById(
            productoRequisicionProduccion.idProdReq
          );
          const { message_error, description_error, result } = resultPeticion;

          if (message_error.length === 0) {
            const { id, codProd, desCla, desSubCla, nomProd, simMed } =
              result[0];
            const detalleFormulaProducto = {
              idProd: id,
              idAre: productoRequisicionProduccion.idAre, // area
              idAlm: 1, // almacen de orgien
              nomAlm: "Almacen Principal",
              codProd: codProd,
              desCla: desCla,
              desSubCla: desSubCla,
              nomProd: nomProd,
              simMed: simMed,
              canForProDet: 1,
              canReqProdLot: productoRequisicionProduccion.cantidadRequisicion,
            };

            const dataDetalle = [
              ...produccionLote.reqDetProdc,
              detalleFormulaProducto,
            ];
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
      if (productoRequisicionProduccion.idProdReq === 0) {
        advertenciaDetalleRequisicion +=
          "Debe elegir un envase, embalaje u otro material para agregar el detalle\n";
      }
      if (productoRequisicionProduccion.idAre === 0) {
        advertenciaDetalleRequisicion +=
          "Debe asignar un area para agregar el detalle\n";
      }
      if (productoRequisicionProduccion.cantidadRequisicion <= 0) {
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

  // ELIMINAR UN PRODUCTO FINAL Y SU REQUISICION
  const handleDeleteDetalleProducto = (idItem) => {
    let totalKlgProductoFinal = 0;
    let totalUnidadesProductoFinal = 0;
    // filtramos el elemento eliminado
    const dataDetalleProductoFinalProduccion =
      produccionLote.prodDetProdc.filter((element) => {
        if (element.idProdFin !== idItem) {
          return true;
        } else {
          totalKlgProductoFinal = element.canKlg;
          totalUnidadesProductoFinal = element.canUnd;
          return false;
        }
      });

    const dataDetalleRequisicionProduccion = produccionLote.reqDetProdc.filter(
      (element) => {
        if (element.idProdFin !== idItem) {
          return true;
        } else {
          return false;
        }
      }
    );

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

  //const handleSubmitProduccionLote = (e) => {
  //  e.preventDefault();
  //  console.log(produccionLote)
  //};

  useEffect(() => {
    if (produccionLote?.finalProducts?.length) {
      //console.log(produccionLote.finalProducts)
      setFinalProducts(produccionLote.finalProducts);
    }
  }, [produccionLote]);

  function onValidate(e) {
    var t = e.value;
    e.value = t.indexOf(".") >= 0 ? t.slice(0, t.indexOf(".") + 3) : t;
    return e.value;
  }

  // ACCION PARA CAMBIAR EL MOTIVO DEL DETALLE DE UN PRODUCTO DEVUELTO
  const handleChangeMotivoAgregacionProductoAgregado = async (
    idProdAgrMot,
    idItem
  ) => {
    const editFormDetalle = produccionLote.reqDetProdc.map((element) => {
      //console.log(element,idItem)

      if (element.id === idItem) {
        return {
          ...element,
          idProdAgrMot: idProdAgrMot,
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

  return (
    <>
      {/* DATOS DE PRODUCTOS FINALES O LOTES DE SUBPRODUCTOS*/}
      <div className="card d-flex mt-4">
        <h6 className="card-header">
          Detalle Presentaciones Finales{" "}
          <b className="text text-danger">(No Aplica a Lotes de Subproducto)</b>
        </h6>
        <div className="card-body">
          <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
            {/* AGREGAR PRODUCTO */}
            <div className="col-md-5">
              <label className="form-label">Presentación Final</label>
              {/* <FilterAllProductos onNewInput={onProductoId} /> */}
              <FilterPresentacionFinal
                onNewInput={onAddProductoFinalLoteProduccion}
                finalProducts={finalProducts}
              />
            </div>
            {/* KILOGRAMOS DE LOTE ASIGNADOS */}
            <div className="col-md-2">
              <label className="form-label">Cantidad Lote (KG)</label>
              <TextField
                type="number"
                autoComplete="off"
                size="small"
                name="cantidadDeLote"
                onChange={handleInputsProductosFinales}
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
                  {produccionLote.prodDetProdc.map((row, i) => {
                    return (
                      <RowEditDetalleProductosFinales
                        key={row.idProdFin}
                        detalle={row}
                        onDeleteItemProductoFinal={handleDeleteDetalleProducto}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          {/* 
              
              <div className="mt-4 d-flex justify-content-end align-items-center">
                <p className="me-4 p-2 bg-dark-subtle">
                  <b>Total Unidades: </b>
                  {totalUnidadesLoteProduccion}
                </p>
                <p className="p-2 bg-danger-subtle">
                  <b>Total Peso: </b>
                  {klgTotalLoteProduccion} / {klgDisponibleLoteProduccion}
                </p>
              </div>
              
              
              */}
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
              <FilterAllProductos
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
                        <TableCell align="left" width={20}>
                          <b>motivo</b>
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
                      {produccionLote.reqDetProdc.map((row, i) => {
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
                              isAggregation={true}
                              entradasNoDisponible={entradasNoDisponible}
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
                        <TableCell align="left" width={20}>
                          <b>motivo</b>
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
                      {produccionLote.reqDetProdc.map((row, i) => {
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
                              onChangeMotivoAgregacion={
                                handleChangeMotivoAgregacionProductoAgregado
                              }
                              onValidate={onValidate}
                              isAggregation={true}
                              entradasNoDisponible={entradasNoDisponible}
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

      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedbackMessages.style_message}
          sx={{ width: "100%" }}
        >
          {feedbackMessages.feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
}
