import { TableCell, TableRow } from "@mui/material";
import React, { useState } from "react";
import { RowOperacionesDevolucionCalidad } from "./RowOperacionesDevolucionCalidad";

export const RowOperacionDevolucionNoRetorno = ({ detalle }) => {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const toggleDetalle = () => {
    setMostrarDetalle(!mostrarDetalle);
  };

  return (
    <>
      <TableRow>
        <TableCell>{detalle.invSerFac}</TableCell>
        <TableCell>{detalle.invNumFac}</TableCell>
        <TableCell>
          <span
            className={
              detalle.idEstOpeDevCal === 1
                ? "badge text-bg-danger"
                : detalle.idEstOpeDevCal === 2
                ? "badge text-bg-warning"
                : "badge text-bg-success"
            }
          >
            {detalle.desEstOpeDevCal}
          </span>
        </TableCell>
        <TableCell>{detalle.desOpeFacMot}</TableCell>
        <TableCell>{detalle.fecCreOpeDev}</TableCell>
        <TableCell>
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
        </TableCell>
      </TableRow>
      {mostrarDetalle && (
        <TableRow>
          <TableCell colSpan={6}>
            <RowOperacionesDevolucionCalidad
              detalleDevolucionesCalidad={detalle["detOpeDevCal"]}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
