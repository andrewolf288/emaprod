import React, { useEffect, useState } from "react";
import { FormatDateMYSQL } from "../../../utils/functions/FormatDate";
import FechaPickerMonth from "../../../components/Fechas/FechaPickerMonth";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField
} from "@mui/material";
import { FilterEstadoRequisicion } from "../../../components/ReferencialesFilters/EstadoRequisicion/FilterEstadoRequisicion";
import { getOrdenesIrradiacion } from "../../helpers/orden-irradiacion/getOrdenesIrradiacion";
import { FilterEstadoOrdenIrradiacion } from "../../../components/ReferencialesFilters/EstadoOrdenIrradiacion/FilterEstadoOrdenIrradiacion";

export const ListOrdenesIrradiacion = () => {
  const [dataOrdenIrradiacion, setdataOrdenIrradiacion] = useState([]);
  const [dataOrdenIrradiacionTemp, setdataOrdenIrradiacionTemp] = useState([]);

  // filtros
  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: ""
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

  // Filtros generales que hacen nuevas consultas
  const handleFechaInicioChange = (newfecEntSto) => {
    let dateFormat = newfecEntSto.split(" ")[0];
    setformState({
      ...formState,
      fechaInicio: dateFormat
    });

    // armamos el body
    let body = {
      ...formState,
      fechaInicio: dateFormat
    };
    obtenerdataOrdenIrradiacion(body);
  };

  const handleFechaFinChange = (newfecEntSto) => {
    let dateFormat = newfecEntSto.split(" ")[0];
    setformState({
      ...formState,
      fechaFin: dateFormat
    });

    // armamos el body
    let body = {
      ...formState,
      fechaFin: dateFormat
    };
    obtenerdataOrdenIrradiacion(body);
  };

  const [dataFilter, setDataFilter] = useState({
    invSerFac: "",
    invNumFac: "",
    idOrdIrraEst: 0
  });
  const { invSerFac, invNumFac, idOrdIrraEst } = dataFilter;

  const handleChangeInputValue = ({ target }) => {
    const { value, name } = target;
    setDataFilter({
      ...dataFilter,
      [name]: value
    });
    filter(value, name);
  };

  const handleChangeSelectValue = (value) => {
    const { id, label } = value;
    setDataFilter({
      ...dataFilter,
      idOrdIrraEst: id
    });
    filter(label, "idOrdIrraEst");
  };

  const filter = (terminoBusqueda, name) => {
    if (name == "invSerFac") {
      let resultadoBusqueda = dataOrdenIrradiacion.filter((element) => {
        if (
          element.invSerFac
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element;
        }
      });
      setdataOrdenIrradiacionTemp(resultadoBusqueda);
    }
    if (name == "invNumFac") {
      let resultadoBusqueda = dataOrdenIrradiacion.filter((element) => {
        if (
          element.invNumFac
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element;
        }
      });
      setdataOrdenIrradiacionTemp(resultadoBusqueda);
    }
    if (name == "idOrdIrraEst") {
      let resultadoBusqueda = dataOrdenIrradiacion.filter((element) => {
        if (
          element.desOrdIrraEst
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element;
        }
      });
      setdataOrdenIrradiacionTemp(resultadoBusqueda);
    }
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerdataOrdenIrradiacion = async (formState) => {
    const resultPeticion = await getOrdenesIrradiacion(formState);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      setdataOrdenIrradiacion(result);
      setdataOrdenIrradiacionTemp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerdataOrdenIrradiacion();
  }, []);

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
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
                        backgroundColor: "#f5f5f5"
                      }
                    }}
                  >
                    <TableCell align="left" width={50}>
                      <b>Serie</b>
                      <TextField
                        size="small"
                        type="text"
                        onChange={handleChangeInputValue}
                        value={invSerFac}
                        name="invSerFac"
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Numero</b>
                      <TextField
                        size="small"
                        type="number"
                        onChange={handleChangeInputValue}
                        value={invNumFac}
                        name="invNumFac"
                      />
                    </TableCell>
                    <TableCell align="center" width={50}>
                      <b>Estado orden de irradiacion</b>
                      <FilterEstadoOrdenIrradiacion
                        onNewInput={handleChangeSelectValue}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha creación</b>
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataOrdenIrradiacionTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        <TableCell align="left">{row.invSerFac}</TableCell>
                        <TableCell align="left">{row.invNumFac}</TableCell>
                        <TableCell align="center">
                          {row.idOrdIrraEst === 1 ? (
                            <span className={"badge text-bg-danger"}>
                              {row.desOrdIrraEst}
                            </span>
                          ) : row.idOrdIrraEst === 2 ? (
                            <span className={"badge text-bg-warning"}>
                              {row.desOrdIrraEst}
                            </span>
                          ) : row.idOrdIrraEst === 3 ? (
                            <span className={"badge text-bg-success"}>
                              {row.desOrdIrraEst}
                            </span>
                          ) : row.idOrdIrraEst === 3 ? (
                            <span className={"badge text-bg-success"}>
                              {row.desOrdIrraEst}
                            </span>
                          ) : (
                            <span className={"badge text-bg-success"}>
                              {row.desOrdIrraEst}
                            </span>
                          )}
                        </TableCell>
                        <TableCell align="left">{row.fecCreOrdIrra}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                window.open(
                                  `/almacen/orden-irradiacion/viewSalida/${row.id}`,
                                  "_blank"
                                );
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
              count={dataOrdenIrradiacionTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </>
  );
};
