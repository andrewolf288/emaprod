import React, { useState, useEffect } from "react";
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
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getEntradasStock } from "./../../helpers/entradas-stock/getEntradasStock";
// FILTROS
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterProveedor } from "./../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
// FECHA PICKER
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";

import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { FormatDateMYSQL } from "../../../utils/functions/FormatDate";
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
    tipoEntrada: "TODO",
    documento: "",
    procesar: false,
    merTot: ""
  });

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  const { formState, setFormState } = useForm({
    fecEntIniSto: FormatDateMYSQL(),
    fecEntFinSto: FormatDateMYSQL()
  });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

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

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  // const obtenerDataEntradaStock = async (body = {}) => {
  //   const resultPeticion = await getEntradasStock(body);
  //   const { result } = resultPeticion;
  //   return result;
  // };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj
    });
  };

  const onChangeProveedor = (obj) => {
    setInputs({
      ...inputs,
      provedor: obj
    });
  };

  const onChangeAlmacen = (obj) => {
    setInputs({
      ...inputs,
      almacen: obj
    });
  };
  // const onChangeTipoEntrada = (event) => {
  //   setInputs({
  //     ...inputs,
  //     tipoEntrada: event.target.value
  //   });
  // };
  // const onChangeDate = (newDate) => {
  //   const dateFilter = newDate.split(" ");
  //   filter(dateFilter[0], "filterFechaEntrada");
  // };

  const onChangeSeleccionado = (event, value) => {
    const valueFilter = value ? "1" : "0";
    filter(valueFilter, "filterEsSeleccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntIniSto: dateFormat });
    // let body = {
    //   ...formState,
    //   fecEntIniSto: dateFormat
    // };
    //obtenerDataEntradaStock(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntFinSto: dateFormat });
    // realizamos una promesa
    // let body = {
    //   ...formState,
    //   fecEntFinSto: dateFormat
    // };
    //obtenerDataEntradaStock(body);
  };

  useEffect(() => {
    let resultSearch = [];

    if (inputs.procesar) {
      getEntradasStock(formState)
        .then((response) => {
          var dataEntSto = response.result;
          var totalDis = 0;
          var totalMer = 0;

          function checkType(data) {
            if (inputs.tipoEntrada === "TODO") {
              return true;
            }
            if (
              inputs.tipoEntrada === "COMPRAS" &&
              data.referencia === 0 &&
              data.esSel === 0
            ) {
              return true;
            }
            if (inputs.tipoEntrada === "PRODT. FINAL" && data.referencia) {
              return true;
            }
            if (
              inputs.tipoEntrada === "DEVOLUCIONES" &&
              data.devoluciones?.length
            ) {
              return true;
            }
            if (inputs.tipoEntrada === "PRODT. SELECCION" && data.esSel) {
              return true;
            }
            if (inputs.tipoEntrada === "PRODT. MOLIENDA" && data.esMol) {
              return true;
            }
            if (inputs.tipoEntrada === "PRODT. FRESCOS" && data.esFre) {
              return true;
            } else {
              return false;
            }
          }
          dataEntSto = dataEntSto.reverse();

          dataEntSto.map((data) => {
            if (
              checkType(data) &&
              (inputs.almacen.label?.includes(data.nomAlm) ||
                inputs.almacen.label?.length === 0) &&
              (inputs.provedor.label?.includes(data.nomProv) ||
                inputs.provedor.label?.length === 0) &&
              (inputs.producto.label === data.nomProd ||
                inputs.producto.label?.length === 0) &&
              (data.codEntSto?.includes(inputs.codigo) ||
                inputs.codigo?.length === 0) &&
              (data.docEntSto?.includes(inputs.documento) ||
                inputs.documento?.length === 0) &&
              (data.canTotEnt?.includes(inputs.ingresado) ||
                inputs.ingresado?.length === 0) &&
              (data.canTotDis?.includes(inputs.disponible) ||
                inputs.disponible?.length === 0) &&
              (data.merTot?.includes(inputs.merTot) ||
                inputs.merTot?.length === 0)
            ) {
              // no sumar el acumulado del producto agua potable
              if (data.idProd !== 418) {
                totalDis += parseFloat(data.canTotDis);
                data.disAcu = totalDis.toFixed(2);
                totalMer += parseFloat(data.merTot);
                data.merAcu = totalMer.toFixed(2);
              }

              resultSearch.push({ ...data });
            }
          });

          resultSearch = resultSearch.reverse();

          setfeedbackMessages({
            style_message: "info",
            feedback_description_error: resultSearch.length + " reguistros"
          });
          handleClickFeeback();

          setdataEntSto(resultSearch);
          setInputs({
            ...inputs,
            procesar: false
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
      procesar: false
    });
  };

  useEffect(() => {
    setInputs({
      ...inputs,
      procesar: true
    });
    // obtenerDataEntradaStock();
  }, []);

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
                  alignItems: "center"
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
                  alignItems: "center"
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
                  alignItems: "center"
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  disabled={inputs.procesar}
                  onClick={() => {
                    setInputs({
                      ...inputs,
                      procesar: true
                    });
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
                className="col-3"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <button onClick={resetData} className="btn btn-success">
                  BORRAR FILTROS
                </button>
              </div>
            </div>
          </div>
          <div className="col-3 d-flex justify-content-end align-items-center">
            <div className="row">
              {/* BOTON AGREGAR MATERIA PRIMA */}
              <div className="col-6">
                <Link
                  to={"/almacen/entradas-stock/crear"}
                  className="btn btn-primary d-inline-flex justify-content-end align-items-center"
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
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div
          className="mt-4"
          style={{
            overflow: "auto",
            float: "left"
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
                        backgroundColor: "#f5f5f5"
                      }
                    }}
                  >
                    <TableCell align="left" width={160}>
                      <b>Cod Lote</b>
                    </TableCell>
                    <TableCell
                      align="left"
                      width={360}
                      sx={{
                        minWidth: 300
                      }}
                    >
                      <b>Producto</b>
                      <FilterAllProductos
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      width={160}
                      sx={{
                        minWidth: 200
                      }}
                    >
                      <b>Proveedor</b>
                      <FilterProveedor
                        onNewInput={onChangeProveedor}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      width={140}
                      sx={{
                        minWidth: 200
                      }}
                    >
                      <b>Almacen</b>
                      <FilterAlmacen
                        onNewInput={onChangeAlmacen}
                        inputs={inputs}
                      />
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
                            background: "white"
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
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
                            background: "white"
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
                      <b>Orden Compra</b>
                      <TextField
                        name="documento"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.documento}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white"
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
                      <b>Guia Remisión</b>
                      <TextField
                        name="documento"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.documento}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white"
                          }
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
                            background: "white"
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Variacion</b>
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
                            background: "white"
                          }
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
                            background: "white"
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha entrada</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha vencimiento</b>
                    </TableCell>
                    <TableCell align="center" width={50}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEntSto
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        {/**
                         <TableCell component="th" scope="row">
                          {row.rowEnt}
                        </TableCell>
                         */}
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
                        <TableCell align="left">{row.ordCom}</TableCell>
                        <TableCell align="left">{row.guiRem}</TableCell>

                        <TableCell align="center">
                          {row.esSel === 1 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              color="green"
                              className="bi bi-check-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              color="red"
                              fill="currentColor"
                              className="bi bi-x-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                            </svg>
                          )}
                        </TableCell>
                        <TableCell align="left">{row.canTotEnt}</TableCell>
                        <TableCell align="left">{row.canVar}</TableCell>
                        <TableCell align="left">{row.canTotDis}</TableCell>
                        <TableCell align="left">{row.merTot}</TableCell>
                        <TableCell align="left">{row.fecEntSto}</TableCell>
                        <TableCell align="left">{row.fecVenEntSto}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              window.open(
                                `/almacen/entradas-stock/view/${row.idEntStock}`,
                                "_blank"
                              );
                            }}
                          >
                            <VisibilityIcon fontSize="large" color="primary" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[50, 100, 150]}
              component="div"
              count={dataEntSto.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
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
