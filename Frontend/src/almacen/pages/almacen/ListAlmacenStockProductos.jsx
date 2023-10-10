import React, { useState, useEffect } from "react";
// HOOKS
import { useForm } from "../../../hooks/useForm";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
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
import { Link } from "react-router-dom";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { RowStockAlmacen } from "../../components/componentes-almacen/RowStockAlmacen";
import { FilterAllProductos } from "../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { getStockAlmacenByAlmacen } from "./../../helpers/stock-almacen/getStockAlmacenByAlmacen";
import { FilterClase } from "./../../../components/ReferencialesFilters/Clase/FilterClase";
import ExportExcel from "./ExportExcel";

export const ListAlmacenStockProductos = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataStockAlmacen, setdataStockAlmacen] = useState([]);
  const [dataStockAlmacenTmp, setdataStockAlmacenTmp] = useState([]);

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

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  // ***** MANEJADORES DE FILTROS GENERALES *****
  const onChangeFilterAlmacenGeneral = (value) => {
    let body = {
      idAlm: value.id,
    };

    obtenerDataStockAlmacen(body);
  };

  // ****** FILTROS PARTICULARES POR DATO *******
  // Manejadores de cambios de inputs
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    filter(value, name);
  };

  // Manejador de cambio de producto
  const onChangeProducto = ({ label }) => {
    filter(label, "filterProducto");
  };
  // Manejador de cambio de clase
  const onChangeClase = ({ label }) => {
    filter(label, "filterClase");
  };
  // Manejador de cambio de almacen
  const onChangeAlmacen = ({ label }) => {
    filter(label, "filterAlmacen");
  };

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {
    let resultSearch = [];
    switch (name) {
      case "filterCodigo":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.codProd2
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;

      case "filterProducto":
        resultSearch = dataStockAlmacen.filter((element) => {
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
        setdataStockAlmacenTmp(resultSearch);
        break;

      // filter de clase
      case "filterClase":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.desCla
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;

      // filter de unidad de medida
      case "filterUnidadMedida":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.simMed
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;

      // filter de almacen
      case "filterAlmacen":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.nomAlm
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;

      // filter de cantidad total
      case "filterCantidadTotal":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.canSto
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;

      // filter de cantidad total disponible
      case "filterCantidadTotalDisponible":
        resultSearch = dataStockAlmacen.filter((element) => {
          if (
            element.canStoDis
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataStockAlmacenTmp(resultSearch);
        break;
    }
  };

  // Funcion para traer la data del stock de almacenes
  const obtenerDataStockAlmacen = async (body = {}) => {
    // hacer validaciones correpondientes
    const resultPeticion = await getStockAlmacenByAlmacen(body);
    const { message_error, description_error, result } = resultPeticion;

    //console.log(result)
    if (message_error.length === 0) {
      setdataStockAlmacen(result);
      setdataStockAlmacenTmp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  const resetData = () => {
    // le seteamos la data
    setdataStockAlmacenTmp(dataStockAlmacen);
  };

  useEffect(() => {
    obtenerDataStockAlmacen();
  }, []);

  return (
    <>
      <div className="container-fluid">
        {/* FILTRO DE ALMACEN */}
        <div
          className="row d-flex mt-4"
          style={{
            //border: "1px solid black",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <div
            className="col-8"
            style={{
              //border: "1px solid black",
              width: "100%",
            }}
          >
            <div
              className="row ms-3"
              style={{
                //border: "1px solid black",
                width: "100%",
              }}
            >
              <div
                className="col-5"
                style={
                  {
                    //border: "1px solid black",
                  }
                }
              >
                Almacen
                <FilterAlmacen onNewInput={onChangeFilterAlmacenGeneral} />
              </div>
              <div
                className="col-3 d-flex align-items-end"
                style={
                  {
                    //border: "1px solid black",
                  }
                }
              >
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

              <div
                className="col-2"
                style={{
                  //border: "1px solid black",
                  display: "flex",
                  //width:"50%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ExportExcel exelData={dataStockAlmacenTmp} />
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
                    <TableCell align="left" width={20}>
                      <b>Codigo</b>
                      <TextField
                        onChange={handleFormFilter}
                        name="filterCodigo"
                        size="small"
                        type="text"
                        autoComplete="off"
                      />
                    </TableCell>
                    <TableCell align="left" width={200}>
                      <b>Producto</b>
                      <FilterAllProductos onNewInput={onChangeProducto} />
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Clase</b>
                      <FilterClase onNewInput={onChangeClase} />
                    </TableCell>
                    <TableCell align="left" width={20}>
                      <b>U.M</b>
                      <TextField
                        onChange={handleFormFilter}
                        name="filterUnidadMedida"
                        size="small"
                        type="text"
                        autoComplete="off"
                      />
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Almacen</b>
                      {/**
                        <FilterAlmacen onNewInput={onChangeAlmacen} />
                      */}
                    </TableCell>
                    <TableCell align="left" width={110}>
                      <b>Total</b>
                      <TextField
                        onChange={handleFormFilter}
                        name="filterCantidadTotal"
                        size="small"
                        type="number"
                        autoComplete="off"
                      />
                    </TableCell>
                    <TableCell align="left" width={110}>
                      <b>Disponible</b>
                      <TextField
                        onChange={handleFormFilter}
                        name="filterCantidadTotalDisponible"
                        size="small"
                        type="number"
                        autoComplete="off"
                      />
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataStockAlmacenTmp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <RowStockAlmacen detalle={row} key={row.id} />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataStockAlmacenTmp.length}
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
