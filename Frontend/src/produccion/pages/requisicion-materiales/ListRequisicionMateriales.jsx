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
import { getRequisicionMaterialesWithDetalle } from "../../helpers/requisicion-materiales/getRequisicionMaterialesById";
import { RequisicionMoliendaDetalleOnlyView } from "../../../molienda/components/RequisicionMoliendaDetalleOnlyView";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

export const ListRequisicionMateriales = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataRequisicion, setdataRequisicion] = useState([]);
  const [dataRequisicionTemp, setdataRequisicionTemp] = useState([]);

  // ESTADOS PARA EL MODAL
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

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

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataRequisicionMateriales = async () => {
    const resultPeticion = await getRequisicionMaterialesWithDetalle();
    const { message_error, description_error, result } = resultPeticion;
    console.log(resultPeticion);
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

  // ******* REQUISICION MATERIALES DETALLE ********
  const closeDetalleRequisicionMateriales = () => {
    // ocultamos el modal
    setMostrarDetalle(false);
    // dejamos el null la data del detalle
    setDetalleSeleccionado(null);
  };

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showRequisicionMaterialesDetalle = (idPosElement) => {
    //var ss = dataRequisicionTemp[idPosElement].reqMolDet
    var ss = dataRequisicionTemp[idPosElement].reqDet;
    const requisicionMoliendaDetalle = ss;
    //return;
    setDetalleSeleccionado(requisicionMoliendaDetalle);
    setMostrarDetalle(true);
  };

  useEffect(() => {
    obtenerDataRequisicionMateriales();
  }, []);

  return (
    <>
      <div className="container-fluid">
        <div className="col-9 mt-4">
          <div className="row" style={{ border: "0px solid black" }}>
            <div
              className="col-3"
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  window.open("/produccion/requisicion-materiales/crear");
                }}
              >
                Crear Requisición
              </Button>
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
                      <b>Codigo</b>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <b>Estado</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Fecha requerido</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Fecha terminado</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRequisicionTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="left" width={100}>
                          <b>{row.codReq}</b>
                        </TableCell>
                        <TableCell align="center">
                          <span
                            className={
                              row.idReqEst === 1
                                ? "badge text-bg-danger"
                                : row.idReqEst === 2
                                ? "badge text-bg-warning"
                                : row.idReqEst === 3
                                ? "badge text-bg-success"
                                : "badge text-bg-success"
                            }
                          >
                            {row.desReqEst}
                          </span>
                        </TableCell>
                        <TableCell align="left">{row.fecPedReq}</TableCell>
                        <TableCell align="left">
                          {row.fecEntReq === null
                            ? "Aun no terminado"
                            : row.fecEntReq}
                        </TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                showRequisicionMaterialesDetalle(i);
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
        </div>
      </div>
      {mostrarDetalle && (
        <RequisicionMoliendaDetalleOnlyView
          detalle={detalleSeleccionado}
          onClose={closeDetalleRequisicionMateriales}
        />
      )}
    </>
  );
};
