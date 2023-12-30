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
import { IconButton, TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterProveedor } from "./../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import CircularProgress from "@mui/material/CircularProgress";
import { FormatDateMYSQL } from "../../../utils/functions/FormatDate";
import { getEntradasStockCalidad } from "../../helpers/entradas-stock/getEntradasStockCalidad";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FilterAllProductosFilters } from "../../../components/ReferencialesFilters/Producto/FilterAllProductosFilters";

// CONFIGURACIONES DE ESTILOS
const label = { inputProps: { "aria-label": "Checkbox demo" } };
// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ListEntradaStockCalidad = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataEntSto, setdataEntSto] = useState([]);
  const [dataEntStoTemp, setdataEntStoTemp] = useState([]);

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  const { fecEntIniSto, fecEntFinSto, formState, setFormState, onInputChange } =
    useForm({
      fecEntIniSto: FormatDateMYSQL(),
      fecEntFinSto: FormatDateMYSQL()
    });

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

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
  };

  const onChangeProducto = (obj) => {};

  const onChangeProveedor = (obj) => {};
  const onChangeDate = (newDate) => {
    const dateFilter = newDate.split(" ");
  };

  const onChangeSeleccionado = (event, value) => {
    const valueFilter = value ? "1" : "0";
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntIniSto: dateFormat });
    let body = {
      ...formState,
      fecEntIniSto: dateFormat
    };
    obtenerDataEntradaStockCalidad(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntFinSto: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecEntFinSto: dateFormat
    };
    obtenerDataEntradaStockCalidad(body);
  };

  const obtenerDataEntradaStockCalidad = async (body = null) => {
    const resultPeticion = await getEntradasStockCalidad(body);
    const { result } = resultPeticion;
    setdataEntSto(result);
    setdataEntStoTemp(result);
  };

  useEffect(() => {
    obtenerDataEntradaStockCalidad();
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
            </div>
          </div>
          <div className="col-3 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-3"></div>
              <div className="col-3"></div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <TableContainer component={Paper}>
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
                <TableCell align="left" width={100}>
                  <b>Fecha entrada</b>
                  <FechaPickerDay onNewfecEntSto={onChangeDate} />
                </TableCell>
                <TableCell align="left" width={70}>
                  ¿Verificado?
                </TableCell>
                <TableCell align="left" width={70}>
                  Estado
                </TableCell>
                <TableCell align="left" width={400}>
                  <b>Producto</b>
                  <FilterAllProductosFilters onNewInput={onChangeProducto} />
                </TableCell>
                <TableCell align="left" width={200}>
                  <b>Proveedor</b>
                  <FilterProveedor onNewInput={onChangeProveedor} />
                </TableCell>
                <TableCell align="left" width={100}>
                  <b>Codigo</b>
                  <TextField
                    name="codigo"
                    onChange={handleFormFilter}
                    size="small"
                    autoComplete="off"
                    InputProps={{
                      style: {
                        color: "black",
                        background: "white"
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="left" width={70}>
                  <b>Documento entrada</b>
                  <TextField
                    name="documento"
                    onChange={handleFormFilter}
                    size="small"
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
                  <b>¿De seleccion?</b>
                  <div className="d-flex justify-content-center">
                    <Checkbox
                      {...label}
                      name="seleccion"
                      defaultChecked={false}
                      onChange={onChangeSeleccionado}
                    />
                  </div>
                </TableCell>
                <TableCell align="left" width={50}>
                  <b>Total ingreso</b>
                  <TextField
                    onChange={handleFormFilter}
                    type="number"
                    size="small"
                    name="ingresado"
                    InputProps={{
                      style: {
                        color: "black",
                        background: "white"
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataEntStoTemp.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 }
                  }}
                >
                  <TableCell align="center">{row.fecEntSto}</TableCell>
                  <TableCell>
                    {row.esAprEnt === null ? "No evaluado" : "Evaluado"}
                  </TableCell>
                  <TableCell>
                    {row.esAprEnt === null
                      ? "No evaluado"
                      : row.esAprEnt === 1
                      ? "Aprobado"
                      : "Desaprobado"}
                  </TableCell>
                  <TableCell>{row.nomProd}</TableCell>
                  <TableCell>{row.nomProv}</TableCell>
                  <TableCell>{row.codEntSto}</TableCell>
                  <TableCell>{row.docEntSto}</TableCell>
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
                  <TableCell>{row.canTotEnt}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        window.open(
                          `/calidad/entradas-stock/view/${row.id}`,
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
