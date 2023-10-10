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
import { getRequisicionSeleccionWithDetalle } from "./../../helpers/requisicion/getRequisicionSeleccionWithDetalle";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import { useForm } from "./../../../hooks/useForm";
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import { TextField } from "@mui/material";
import { FilterEstadoRequisicionSeleccion } from "../../../components/ReferencialesFilters/EstadoRequisicionSeleccion/FilterEstadoRequisicionSeleccion";
import { RequisicionSeleccionDetalle } from "./../../components/RequisicionSeleccionDetalle";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ListRequisicionSeleccion = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataRequisicion, setdataRequisicion] = useState([]);
  const [dataRequisicionTemp, setdataRequisicionTemp] = useState([]);

  // ESTADOS PARA EL MODAL
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  // filtros
  const { fecReqMolIni, fecReqMolFin, formState, setFormState, onInputChange } =
    useForm({
      fecReqMolIni: "",
      fecReqMolFin: "",
    });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    filter(value, name);
  };

  const onChangeEstadoRequisicionSeleccion = ({ label }) => {
    filter(label, "filterEstado");
  };

  const onChangeDateFechaPedido = (newDate) => {
    const dateFilter = newDate.split(" ");
    console.log(dateFilter);
    filter(dateFilter[0], "filterFechaRequerido");
  };

  const onChangeDateFechaTerminado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaTerminado");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecReqMolIni: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecReqMolIni: dateFormat,
    };
    obtenerDataRequisicionSeleccion(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecReqMolFin: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecReqMolFin: dateFormat,
    };
    obtenerDataRequisicionSeleccion(body);
  };

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {
    let resultSearch = [];
    switch (name) {
      case "filterLoteRequisicionSeleccion":
        resultSearch = dataRequisicion.filter((element) => {
          if (
            element.codLotSel
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataRequisicionTemp(resultSearch);
        break;
      case "filterEstado":
        resultSearch = dataRequisicion.filter((element) => {
          if (
            element.desReqSelEst
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataRequisicionTemp(resultSearch);
        break;
      case "filterFechaRequerido":
        resultSearch = dataRequisicion.filter((element) => {
          let aux = element.fecPedReqSel.split(" ");
          if (
            aux[0]
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataRequisicionTemp(resultSearch);
        break;
      case "filterFechaTerminado":
        resultSearch = dataRequisicion.filter((element) => {
          if (element.fecTerReqSel !== null) {
            let aux = element.fecTerReqSel.split(" ");
            if (
              aux[0]
                .toString()
                .toLowerCase()
                .includes(terminoBusqueda.toLowerCase())
            ) {
              return true;
            } else {
              return false;
            }
          }
        });
        setdataRequisicionTemp(resultSearch);
        break;
      default:
        break;
    }
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataRequisicionSeleccion = async (body = {}) => {
    const resultPeticion = await getRequisicionSeleccionWithDetalle(body);
    const { message_error, description_error, result } = resultPeticion;

    console.log(result);
    if (message_error.length === 0) {
      setdataRequisicion(result);
      setdataRequisicionTemp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // ******* REQUISICION SELECCION DETALLE ********

  const closeDetalleRequisicionSeleccion = () => {
    // ocultamos el modal
    setMostrarDetalle(false);
    // dejamos el null la data del detalle
    setDetalleSeleccionado(null);
  };

  const showRequisicionSeleccionDetalle = (idPosElement) => {
    dataRequisicionTemp[idPosElement].reqSelDet = dataRequisicionTemp[
      idPosElement
    ].reqSelDet.filter(
      (obj) => obj.idReqDet == dataRequisicionTemp[idPosElement].idReqDet
    );

    //console.log(dataRequisicionTemp[idPosElement]);
    const requisicionSeleccionDetalle =
      dataRequisicionTemp[idPosElement].reqSelDet;

    setDetalleSeleccionado(requisicionSeleccionDetalle);
    setMostrarDetalle(true);
  };

  // RESET FILTER
  const resetData = () => {
    setdataRequisicionTemp(dataRequisicion);
  };

  // TRAEMOS LA DATA ANTES DE QUE SE RENDERICE EL COMPONENTE
  useEffect(() => {
    obtenerDataRequisicionSeleccion();
  }, []);

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                Desde
                <FechaPickerMonth onNewfecEntSto={onChangeDateStartData} />
              </div>
              <div className="col-4">
                Hasta
                <FechaPickerMonth onNewfecEntSto={onChangeDateEndData} />
              </div>
              <div className="col-2 d-flex align-items-end">
                <button onClick={resetData} className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-clockwise"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-6">
                <button className="btn btn-success">
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
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-danger">
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
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
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
                    <TableCell align="left" width={70}>
                      <b>Lote</b>
                      <TextField
                        name="filterLoteRequisicionSeleccion"
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Estado</b>
                      <FilterEstadoRequisicionSeleccion
                        onNewInput={onChangeEstadoRequisicionSeleccion}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha de requerimiento</b>
                      {/**
                        <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaPedido}
                      />
                       */}
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha terminado</b>
                      {/**
                         <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaTerminado}
                      />
                         */}
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Materia prima</b>
                    </TableCell>

                    <TableCell align="left" width={140}>
                      <b>Cantidad</b>
                    </TableCell>

                    <TableCell align="left" width={100}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRequisicionTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.idReqDet}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{row.codLotSel}</TableCell>
                        <TableCell align="left">
                          {/**
                            <span
                            className={
                              row.idReqSelEst === 1
                                ? "badge text-bg-danger p-2"
                                : row.idReqSelEst === 2
                                ? "badge text-bg-warning p-2"
                                : "badge text-bg-success p-2"
                            }
                          >
                            {row.desReqSelEst}
                          </span>
                           */}

                          <span
                            className={
                              row.reqSelDet.find(
                                (obj) => obj.idReqDet == row.idReqDet
                              ).idReqSelDetEst === 1
                                ? "badge text-bg-danger p-2"
                                : row.reqSelDet.find(
                                    (obj) => obj.idReqDet == row.idReqDet
                                  ).idReqSelDetEst === 2
                                ? "badge text-bg-primary p-2"
                                : row.reqSelDet.find(
                                    (obj) => obj.idReqDet == row.idReqDet
                                  ).idReqSelDetEst === 3
                                ? "badge text-bg-warning p-2"
                                : "badge text-bg-success p-2"
                            }
                          >
                            {
                              row.reqSelDet.find(
                                (obj) => obj.idReqDet == row.idReqDet
                              ).desReqSelDetEst
                            }
                          </span>
                        </TableCell>
                        <TableCell align="left">
                          {
                            row.reqSelDet.find(
                              (obj) => obj.idReqDet == row.idReqDet
                            ).fecCreReqSelDet
                            //row.fecPedReqSel
                          }
                        </TableCell>
                        <TableCell align="left">
                          {row.fecTerReqSel === null
                            ? "Aun no terminado"
                            : row.fecTerReqSel}
                        </TableCell>
                        <TableCell align="left">
                          {
                            row.reqSelDet.find(
                              (obj) => obj.idReqDet == row.idReqDet
                            ).nomProd
                          }
                        </TableCell>

                        <TableCell align="left">
                          {
                            row.reqSelDet.find(
                              (obj) => obj.idReqDet == row.idReqDet
                            ).canReqSelDet
                          }
                        </TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            {/**
                               <button
                              onClick={() => {
                                showRequisicionSeleccionDetalle(i);
                              }}
                              className="btn btn-primary me-2 btn"
                              data-toggle="modal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-eye-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                              </svg>
                            </button>
                             */}
                            <button
                              disabled={row.idReqMolEst !== 3 ? true : false}
                              // onClick={() => {
                              //   openDialogVerificarRequisicion(row.id);
                              // }}
                              className="btn btn-success btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-shield-fill-check"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"
                                />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataRequisicionTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          {mostrarDetalle && (
            <RequisicionSeleccionDetalle
              detalle={detalleSeleccionado}
              onClose={closeDetalleRequisicionSeleccion}
            />
          )}
        </div>
        {/* FEEDBACK DELETE */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
      </div>
    </>
  );
};
