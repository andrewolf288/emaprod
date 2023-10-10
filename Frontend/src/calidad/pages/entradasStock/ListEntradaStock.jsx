import React, { useState, useEffect, useMemo } from "react";
// HOOKS
import { useForm } from "../../../hooks/useForm";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
//IMPORTACIONES PARA DIALOG DELETE
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getEntradasStock } from "./../../helpers/entradas-stock/getEntradasStock";
import { updateEntradasStock } from "./../../helpers/entradas-stock/updateEntradasStock";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterMateriaPrima } from "./../../../components/ReferencialesFilters/Producto/FilterMateriaPrima";
import { FilterProveedor } from "./../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import ExportExcel from "../entradasStock/ExportExcel";
import TypeEntrada from "./TypeEntrada";

import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import BlockIcon from "@mui/icons-material/Block";
import CircularProgress from "@mui/material/CircularProgress";
import { FormatDateMYSQL } from "../../../utils/functions/FormatDate";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import FormCalidad from "./FormCalidad";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

// CONFIGURACIONES DE ESTILOS
const label = { inputProps: { "aria-label": "Checkbox demo" } };
// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ListEntradaStock = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataEntSto, setdataEntSto] = useState([]);
  const [inputs, setInputs] = useState({
    producto: { label: "" },
    provedor: { label: "" },
    almacen: { label: "" },
    codigo: "",
    seleccion: false,
    ingresado: "",
    disponible: "",
    tipoEntrada: "COMPRAS",
    documento: "",
    procesar: false,
    merTot: "",
  });

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  const { fecEntIniSto, fecEntFinSto, formState, setFormState, onInputChange } =
    useForm({
      fecEntIniSto: FormatDateMYSQL(),
      fecEntFinSto: FormatDateMYSQL(),
    });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [entrada, setEntrada] = useState({});

  const [openForm, setOpenForm] = useState(false);
  const handleClickOpen = (row) => {
    setEntrada({ ...row });
    setOpenForm(true);
  };

  const handleClose = () => {
    setOpenForm(false);
  };

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackDelete(true);
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  const obtenerDataEntradaStock = async (body = {}) => {
    const resultPeticion = await getEntradasStock(body);
    const { result } = resultPeticion;
    return result;
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj,
    });
  };

  const onChangeProveedor = (obj) => {
    setInputs({
      ...inputs,
      provedor: obj,
    });
  };

  const onChangeAlmacen = (obj) => {
    setInputs({
      ...inputs,
      almacen: obj,
    });
  };
  const onChangeTipoEntrada = (event) => {
    setInputs({
      ...inputs,
      tipoEntrada: event.target.value,
    });
  };
  const onChangeDate = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaEntrada");
  };

  const onChangeSeleccionado = (event, value) => {
    const valueFilter = value ? "1" : "0";
    filter(valueFilter, "filterEsSeleccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntIniSto: dateFormat });
    let body = {
      ...formState,
      fecEntIniSto: dateFormat,
    };
    //obtenerDataEntradaStock(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntFinSto: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecEntFinSto: dateFormat,
    };
    //obtenerDataEntradaStock(body);
  };

  //useMemo(() => {}, [inputs, formState]);

  useEffect(() => {
    let resultSearch = [];

    if (inputs.procesar) {
      getEntradasStock(formState)
        .then(({ result }) => {
          console.log(result);
          // return;
          var dataEntSto = result;
          var totalDis = 0;
          var totalMer = 0;

          function checkType(data) {
            if (inputs.tipoEntrada == "TODO") {
              return true;
            }
            if (
              inputs.tipoEntrada == "COMPRAS" &&
              data.referencia == 0 &&
              data.esSel == 0
            ) {
              return true;
            }
            if (inputs.tipoEntrada == "PRODT. FINAL" && data.referencia) {
              return true;
            }
            if (
              inputs.tipoEntrada == "DEVOLUCIONES" &&
              data.devoluciones?.length
            ) {
              return true;
            }
            if (inputs.tipoEntrada == "PRODT. SELECCION" && data.esSel) {
              return true;
            }
            if (inputs.tipoEntrada == "PRODT. MOLIENDA" && data.esMol) {
              return true;
            }
            if (inputs.tipoEntrada == "PRODT. FRESCOS" && data.esFre) {
              return true;
            } else {
              return false;
            }
          }
          dataEntSto = dataEntSto.reverse();

          dataEntSto.map((data) => {
            //console.log(data);
            if (
              checkType(data) &&
              (inputs.almacen.label?.includes(data.nomAlm) ||
                inputs.almacen.label?.length == 0) &&
              (inputs.provedor.label?.includes(data.nomProv) ||
                inputs.provedor.label?.length == 0) &&
              (inputs.producto.label == data.nomProd ||
                inputs.producto.label?.length == 0) &&
              (data.codEntSto?.includes(inputs.codigo) ||
                inputs.codigo?.length == 0) &&
              (data.docEntSto?.includes(inputs.documento) ||
                inputs.documento?.length == 0) &&
              (data.canTotEnt?.includes(inputs.ingresado) ||
                inputs.ingresado?.length == 0) &&
              (data.canTotDis?.includes(inputs.disponible) ||
                inputs.disponible?.length == 0) &&
              (data.merTot?.includes(inputs.merTot) ||
                inputs.merTot?.length == 0)
            ) {
              // no sumar el acumulado del producto agua potable
              if (data.idProd !== 418) {
                totalDis += parseFloat(data.canTotDis);
                data.disAcu = totalDis.toFixed(2);
                totalMer += parseFloat(data.merTot);
                data.merAcu = totalMer.toFixed(2);
              }
              //console.log(data);
              resultSearch.push({ ...data });
            }
          });

          resultSearch = resultSearch.reverse();

          var provedorEmaran = 1;
          resultSearch = resultSearch.filter(
            (item) => item.idProv != provedorEmaran
          );

          setfeedbackMessages({
            style_message: "info",
            feedback_description_error: resultSearch.length + " reguistros",
          });
          handleClickFeeback();

          setdataEntSto(resultSearch);
          setInputs({
            ...inputs,
            procesar: false,
          });
        })
        .catch((error) => console.log(error));
    }
  }, [inputs, formState]);

  function filter() {}

  const resetData = () => {
    setdataEntSto(dataEntSto);
    setInputs({
      producto: { label: "" },
      provedor: { label: "" },
      almacen: { label: "" },
      codigo: "",
      seleccion: false,
      ingresado: "",
      disponible: "",
      tipoEntrada: "TODO",
      documento: "",
      procesar: false,
    });
  };

  useEffect(() => {
    onClickProcesar();
  }, []);

  const onClickProcesar = () => {
    setInputs({
      ...inputs,
      procesar: true,
    });
  };
  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <div className="col-9">
            <div className="row" style={{ border: "0px solid black" }}>
              <div
                className="col-2"
                style={{
                  border: "0px solid black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={onChangeDateStartData}
                  label="Desde"
                />
              </div>
              <div
                className="col-2"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={onChangeDateEndData}
                  label="Hasta"
                />
              </div>

              <div
                className="col-2"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TypeEntrada
                  inputs={inputs}
                  onChangeTipoEntrada={onChangeTipoEntrada}
                />
              </div>

              <div
                className="col-2"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  disabled={inputs.procesar}
                  style={{ marginTop: "10px" }}
                  onClick={() => {
                    onClickProcesar();
                  }}
                >
                  Procesar
                  {inputs.procesar && (
                    <CircularProgress
                      size={30}
                      style={{ position: "absolute" }}
                    />
                  )}
                </Button>
              </div>

              <div
                className="col-2"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button onClick={resetData} className="btn btn-success">
                  reset
                </button>
              </div>
            </div>
          </div>
          <div className="col-3 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-3">
                {/* <button className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
                  </svg>
                </button> */}
                <ExportExcel exelData={dataEntSto} />
              </div>
              <div className="col-3">
                {/* <button className="btn btn-danger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-pdf-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                    <path
                      fillRule="evenodd"
                      d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                    />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div
          className="mt-4"
          style={{
            //overflowY: "auto",
            overflow: "auto",
            float: "left",
            //position: "relative",
            //border: "1px solid black",
          }}
        >
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "rgba(96, 96, 96)",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell align="left" width={160}>
                      <b>Cod Lote</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Producto</b>
                      <FilterAllProductos
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Proveedor</b>
                      <FilterProveedor
                        onNewInput={onChangeProveedor}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Almacen</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Codigo</b>
                      <TextField
                        name="codigo"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.codigo}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Doc.</b>
                      <TextField
                        name="documento"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.documento}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={20}>
                      <b>Seleccion</b>
                      <div className="d-flex justify-content-center">
                        <Checkbox
                          {...label}
                          name="seleccion"
                          value={inputs.seleccion}
                          defaultChecked={false}
                          onChange={onChangeSeleccionado}
                        />
                      </div>
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Ingresado</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="ingresado"
                        value={inputs.ingresado}
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Merma</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="merTot"
                        value={inputs.merTot}
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Disponible</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="disponible"
                        value={inputs.disponible}
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha ent.</b>
                      {/**
                       <FechaPickerDay onNewfecEntSto={onChangeDate} />
                      */}
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha ven.</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha cre.</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Variacion</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Disponible Acu.</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Merma Acu.</b>
                    </TableCell>

                    <TableCell align="left" width={160}>
                      <b>Presentación Producto</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Cert. Calidad</b>
                    </TableCell>

                    <TableCell align="left" width={160}>
                      <b>Lote Provedor</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha de producción</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>% Humedad </b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Responsable Evaluacion</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Observación</b>
                    </TableCell>
                    <TableCell align="center" width={50}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEntSto.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {row.codLot}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.nomProd}
                      </TableCell>
                      <TableCell align="left">{row.nomProv}</TableCell>
                      <TableCell align="left">{row.nomAlm}</TableCell>
                      <TableCell align="left">{row.codEntSto}</TableCell>
                      <TableCell align="left">{row.docEntSto}</TableCell>
                      <TableCell align="center">
                        {row.esSel === 1 ? (
                          <CheckCircleIcon />
                        ) : (
                          <HighlightOffIcon />
                        )}
                      </TableCell>
                      <TableCell align="left">{row.canTotEnt}</TableCell>
                      <TableCell align="left">{row.merTot}</TableCell>
                      <TableCell align="left">{row.canTotDis}</TableCell>
                      <TableCell align="left">{row.fecEntSto}</TableCell>
                      <TableCell align="left">{row.fecVenEntSto}</TableCell>
                      <TableCell align="left">{row.fecCreEntSto}</TableCell>
                      <TableCell align="left">{row.canVar}</TableCell>
                      <TableCell align="left">{row.disAcu}</TableCell>
                      <TableCell align="left">{row.merAcu}</TableCell>
                      <TableCell align="left">{row.prestProdt}</TableCell>
                      <TableCell align="left">
                        {row.certCal ? (
                          <CheckCircleIcon />
                        ) : (
                          <HighlightOffIcon />
                        )}
                      </TableCell>
                      <TableCell align="left">{row.lotProv}</TableCell>
                      <TableCell align="left">{row.fecProduccion}</TableCell>
                      <TableCell align="left">{row.humedad}</TableCell>
                      <TableCell align="left">{row.resbEval}</TableCell>
                      <TableCell align="left">{row.obsEnt}</TableCell>

                      <TableCell
                        align="left"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          //border: "5px solid black",
                          width: "110px",
                        }}
                      >
                        {/**
                          <div
                          className="btn-toolbar"
                          style={{
                            backgroundColor: "#0E80E5",
                            borderRadius: "9px",
                          }}
                          onClick={() => {
                            window.open(
                              `/almacen/entradas-stock/view/${row.idEntStock}`,
                              "_blank"
                            );
                          }}
                        >
                          <IconButton>
                            <VisibilityIcon
                              fontSize="small"
                              sx={{ color: "white" }}
                            />
                          </IconButton>
                        </div>
                       */}

                        <div
                          className="btn-toolbar"
                          style={{
                            backgroundColor: "#0E80E5",
                            borderRadius: "9px",
                          }}
                        >
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => {
                                handleClickOpen(row);
                              }}
                            >
                              <EditIcon
                                fontSize="small"
                                sx={{ color: "white" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/**
               <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataEntStoTmp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
               */}
          </Paper>
          <FormCalidad
            formState={entrada}
            setFormState={setEntrada}
            handleClose={handleClose}
            open={openForm}
            updateEntradasStock={updateEntradasStock}
            onClickProcesar={onClickProcesar}
          />
        </div>
      </div>

      {/* FEEDBACK */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={feedbackDelete}
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

export default ListEntradaStock;
