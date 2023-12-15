import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import React, { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RowDetalleRetornosVentaDetalle } from "./RowDetalleRetornosVentaDetalle";

export const CardRetornoSalidaDetalle = ({
  detalle,
  index,
  onDeleteSalidaStock,
  onUpdateSalidaStock,
  onAddSalidaStock,
  setfeedbackMessages,
  handleClickFeeback,
  generarSalidaStockDetalle
}) => {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const toggleDetalle = () => {
    setMostrarDetalle(!mostrarDetalle);
  };

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>{`Detalle #${index + 1}`}</h6>
        {detalle.esProFin === 1 && (
          <button
            className="btn btn-link ms-auto" // Utiliza ms-auto para alinear a la derecha
            onClick={toggleDetalle}
          >
            {mostrarDetalle ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-up-fill"
                viewBox="0 0 16 16"
              >
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-down-fill"
                viewBox="0 0 16 16"
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="card-body">
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: "#F3DBB6" }}>
              <TableRow>
                <TableCell width={30} align="left">
                  <b>Ref.</b>
                </TableCell>
                <TableCell width={160} align="left">
                  <b>Presentacion</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Cantidad requerida</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Cantidad actual</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Estado</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{detalle.refProdt}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell align="center">{detalle.canOpeFacDet}</TableCell>
                <TableCell
                  align="center"
                  className={
                    detalle.canOpeFacDetAct != detalle.canOpeFacDet
                      ? "text-danger font-weight-bold"
                      : "text-success font-weight-bold"
                  }
                  style={{ fontWeight: 600 }}
                >
                  {detalle.canOpeFacDetAct}
                </TableCell>
                <TableCell align="center">
                  {detalle.fueComDet == 0 ? (
                    <span className={"badge text-bg-danger"}>Requerido</span>
                  ) : (
                    <span className={"badge text-bg-success"}>Completo</span>
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="edit"
                    size="large"
                    disabled={detalle.fueComDet === 1 ? true : false}
                    color="success"
                    onClick={(e) => {
                      generarSalidaStockDetalle(detalle);
                    }}
                  >
                    <CheckCircleIcon fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {mostrarDetalle && (
          <RowDetalleRetornosVentaDetalle
            detalle={detalle}
            onDeleteSalidaStock={onDeleteSalidaStock}
            onUpdateSalidaStock={onUpdateSalidaStock}
            onAddSalidaStock={onAddSalidaStock}
            setfeedbackMessages={setfeedbackMessages}
            handleClickFeeback={handleClickFeeback}
          />
        )}
      </div>
    </div>
  );
};
