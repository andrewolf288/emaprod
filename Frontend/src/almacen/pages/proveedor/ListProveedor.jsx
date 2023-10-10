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
import { deleteProveedor } from "./../../helpers/proveedor/deleteProveedor";
import { getProveedores } from "./../../../helpers/Referenciales/proveedor/getProveedores";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ListProveedor = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataPro, setdataPro] = useState([]);
  const [dataProTmp, setdataProTmp] = useState([]);
  const [filters, setfilters] = useState({
    filterCodPro: "",
    filterNomPro: "",
  });

  const { filterCodPro, filterNomPro } = filters;

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADOS PARA EL DIALOG DELETE
  const [open, setOpen] = React.useState(false);
  const [itemDelete, setitemDelete] = useState({
    itemId: 0,
    itemCodigo: "",
    itemNom: "",
  });
  const { itemCodigo, itemNom, itemId } = itemDelete;

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

  // FUNCION PARA TRAER LA DATA DE MATERIA DE PRIMA
  const obtenerDataProveedor = async () => {
    const resultPeticion = await getProveedores();
    setdataPro(resultPeticion);
    setdataProTmp(resultPeticion);
  };

  // MANEJADORES DE LOS FILTROS
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setfilters({
      ...filters,
      [name]: value,
    });
    filter(value, name);
  };

  const filter = (terminoBusqueda, name) => {
    if (name == "filterCodPro") {
      let resultadoBusqueda = dataPro.filter((element) => {
        if (
          element.codPro
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element;
        }
      });
      setdataProTmp(resultadoBusqueda);
    } else {
      let resultadoBusqueda = dataPro.filter((element) => {
        if (
          element.nomPro
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase()) ||
          element.apePro
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return element;
        }
      });
      setdataProTmp(resultadoBusqueda);
    }
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // MANEJADORES DE CUADRO DE DIALOGO
  const handleClose = () => {
    setOpen(false);
  };
  const handleOn = () => {
    setOpen(true);
  };

  // SETEAMOS LOS VALORES DEL DIALOG DE ELIMINACION
  const openDialogDeleteItem = ({ codPro, nomPro, apePro, id }) => {
    setitemDelete({
      ...itemDelete,
      itemId: id,
      itemCodigo: codPro,
      itemNom: nomPro + " " + apePro,
    });
    handleOn();
  };

  // FUNCION PARA ELIMINAR UN PROVEEDOR
  const eliminarProveedor = async () => {
    const { message_error, description_error } = await deleteProveedor(itemId);
    if (message_error.length === 0) {
      console.log("Se elimino correctamente");
      // RECALCULAMOS LA DATA
      let dataNueva = dataPro.filter((element) => {
        if (element.id !== itemId) {
          //FILTRAMOS
          return element;
        } else {
          return false;
        }
      });
      // ACTUALIZAMOS LA DATA
      setdataPro(dataNueva);
      setdataProTmp(dataNueva);
      handleClose();
      // MOSTRAMOS FEEDBACK
      console.log("Se elimino exitosamente");
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se eliminó exitosamente",
      });
      handleClickFeeback();
    } else {
      handleClose();
      // MOSTRAMOS FEEDBACK
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // INICIALIZAMOS LA DATA ANTES DE RENDERIZAR EL COMPONENTE
  useEffect(() => {
    obtenerDataProveedor();
  }, []);

  return (
    <>
      <div className="container">
        <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
          {/* FILTRO POR MATERIA PRIMA */}
          <div className="col-md-2">
            <label htmlFor="inputEmail4" className="form-label">
              Codigo
            </label>
            <input
              type="text"
              onChange={handleFormFilter}
              value={filterCodPro}
              name="filterCodPro"
              className="form-control"
            />
          </div>

          {/* FILTRO POR NOMBRE Y APELLIDO */}
          <div className="col-md-4">
            <label htmlFor="inputPassword4" className="form-label">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              onChange={handleFormFilter}
              value={filterNomPro}
              name="filterNomPro"
              className="form-control"
            />
          </div>

          {/* BOTON AGREGAR MATERIA PRIMA */}
          <div className="col-md-3 d-flex justify-content-end ms-auto">
            <Link to={"/almacen/proveedor/crear"} className="btn btn-primary">
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
        </form>

        {/* TABLA DE RESULTADOS */}
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" width={80}>
                    Código
                  </TableCell>
                  <TableCell align="left" width={300}>
                    Nombres
                  </TableCell>
                  <TableCell align="left" width={300}>
                    Apellidos
                  </TableCell>
                  {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
                  <TableCell align="left" width={150}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataProTmp
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.codPro}
                      </TableCell>
                      <TableCell align="left">{row.nomPro}</TableCell>
                      <TableCell align="left">{row.apePro}</TableCell>
                      <TableCell align="left">
                        <div className="btn-toolbar">
                          <Link
                            to={`/almacen/proveedor/actualizar/${row.id}`}
                            className="btn btn-success me-2"
                          >
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
                          </Link>
                          <button
                            onClick={() => {
                              openDialogDeleteItem(row);
                            }}
                            className="btn btn-danger"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataProTmp.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
      {/* DIALOG DE ELIMINACION DE PROVEEDOR */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <p className="fs-3 text-danger">Eliminar Proveedor</p>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>
              <p>
                <b className="text-danger">Codigo: </b>
                {itemCodigo}
              </p>
              <p>
                <b className="text-danger">Nombre: </b>
                {itemNom}
              </p>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={eliminarProveedor}>
            Aceptar
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
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
    </>
  );
};

export default ListProveedor;
