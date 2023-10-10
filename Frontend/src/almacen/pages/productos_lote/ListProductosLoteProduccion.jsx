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
import MuiAlert from "@mui/material/Alert";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import { useForm } from "./../../../hooks/useForm";
import { getProduccionLote } from "./../../../produccion/helpers/produccion_lote/getProduccionLote";
import { TextField } from "@mui/material";
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { FilterEstadoProduccion } from "./../../../components/ReferencialesFilters/Produccion/FilterEstadoProduccion";
import { FilterTipoProduccion } from "./../../../components/ReferencialesFilters/TipoProduccion/FilterTipoProduccion";
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import { FilterEstadoInicioProgramadoProduccion } from "./../../../components/ReferencialesFilters/Produccion/FilterEstadoInicioProgramadoProduccion";
import { Link } from "react-router-dom";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ListProductosLoteProduccion = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataProduccionLote, setdataProduccionLote] = useState([]);
  const [dataProduccionLoteTemp, setdataProduccionLoteTemp] = useState([]);

  // filtros
  const {
    fecProdLotIni,
    fecProdLotFin,
    formState,
    setFormState,
    onInputChange,
  } = useForm({
    fecProdLotIni: "",
    fecProdLotFin: "",
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

  const onChangeProducto = ({ label }) => {
    filter(label, "filterProducto");
  };

  const onChangeEstadoProduccion = ({ label }) => {
    filter(label, "filterEstadoProduccion");
  };

  const onChangeTipoProduccion = ({ label }) => {
    filter(label, "filterTipoProduccion");
  };

  const onChangeDateFechaIniciado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaInicioProduccion");
  };

  const onChangeDateFechaFin = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaFinProduccion");
  };

  const onChangeDateFechaVencimiento = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaVencimientoProduccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotIni: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecProdLotIni: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotFin: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecProdLotFin: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {
    let resultSearch = [];
    switch (name) {
      case "filterLoteProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          if (
            element.codLotProd
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterProducto":
        resultSearch = dataProduccionLote.filter((element) => {
          if (
            element.nomProd
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterEstadoProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          if (
            element.desEstPro
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterTipoProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          if (
            element.desProdTip
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterFechaVencimientoProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          if (
            element.fecVenLotProd
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterFechaInicioProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          let aux = element.fecProdIni.split(" ");
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
        setdataProduccionLoteTemp(resultSearch);
        break;
      case "filterFechaFinProduccion":
        resultSearch = dataProduccionLote.filter((element) => {
          let aux = element.fecProdFin.split(" ");
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
        setdataProduccionLoteTemp(resultSearch);
        break;

      default:
        break;
    }
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataProduccionLote = async (body = {}) => {
    const resultPeticion = await getProduccionLote(body);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      setdataProduccionLote(result);
      setdataProduccionLoteTemp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerDataProduccionLote();
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
                        name="filterLoteProduccion"
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
                      <b>Producto</b>
                      <FilterProductoProduccion onNewInput={onChangeProducto} />
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Estado</b>
                      <FilterEstadoProduccion
                        onNewInput={onChangeEstadoProduccion}
                      />
                    </TableCell>
                    <TableCell align="left" width={100}>
                      <b>Tipo</b>
                      <FilterTipoProduccion
                        onNewInput={onChangeTipoProduccion}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Produccion Inicio</b>
                      <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaIniciado}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Produccion Fin</b>
                      <FechaPickerDay onNewfecEntSto={onChangeDateFechaFin} />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha Vencimiento</b>
                      <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaVencimiento}
                      />
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataProduccionLoteTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLotProd}
                        </TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="left">{row.desEstPro}</TableCell>
                        <TableCell align="left">{row.desProdTip}</TableCell>
                        <TableCell align="center">{row.fecProdIni}</TableCell>
                        <TableCell align="center">
                          {row.fecProdFin === null
                            ? "Aún no terminado"
                            : row.fecProdFin}
                        </TableCell>
                        <TableCell align="left">{row.fecVenLotProd}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <Link
                              // disabled={row.idProdEst < 3 ? true : false}
                              // onClick={() => {
                              //   showOpcionesProduccionLote(i);
                              // }}
                              to={`/almacen/productos-lote/agregar/${row.id}`}
                              className="btn btn-success me-2 btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-plus-circle-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                              </svg>
                            </Link>
                            {/* <button className="btn btn-warning btn">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-pencil-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                              </svg>
                            </button> */}
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
              count={dataProduccionLoteTemp.length}
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
