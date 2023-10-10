import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { TextField } from "@mui/material";
import { FilterAlmacen } from "../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
import { FilterMotivoAgregacion } from "./../../../components/ReferencialesFilters/MotivoAgregacion/FilterMotivoAgregacion";

function calculate(item) {
  return item;
}

export const RowEditDetalleRequisicionProduccion = ({
  detalle,
  onChangeItemDetalle,
  onDeleteItemRequisicion,
  onChangeMotivoAgregacion,
  onValidate,
  isAggregation,
  entradasNoDisponible,
}) => {
  const [disabledInputs, setdisabledInputs] = useState(true);
  const handleDetalleChangeMotivoAgregacion = (value) => {
    //console.log(value, detalle);
    onChangeMotivoAgregacion(value.id, detalle.id);
  };
  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        ...{
          backgroundColor: entradasNoDisponible?.includes(detalle.nomProd)
            ? "#BC2503"
            : "",
        },
      }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        {detalle.indexProdFin}
      </TableCell>
      <TableCell
        component="th"
        scope="row"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        {detalle.nomProd}
      </TableCell>
      <TableCell
        component="th"
        scope="row"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        {detalle.simMed}
      </TableCell>

      <TableCell
        component="th"
        scope="row"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        {detalle.canForProDet}
      </TableCell>

      {isAggregation && (
        <TableCell>
          <FilterMotivoAgregacion
            onNewInput={handleDetalleChangeMotivoAgregacion}
            defaultValueFlag={true}
            //disabled={disabledInput}
          />
        </TableCell>
      )}

      <TableCell
        component="th"
        scope="row"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        <TextField
          sx={{
            ...{
              color: entradasNoDisponible?.includes(detalle.nomProd)
                ? "white"
                : "",
            },
          }}
          size="small"
          disabled={disabledInputs} //calculate(detalle.canForProDet,detalle.canReqProdLot)
          value={calculate(detalle.canReqProdLot)} //calculate(detalle.canReqProdLot)
          name={"canReqProdLot"}
          onChange={(e) => {
            //if(isAggregation){
            e.target.value = onValidate(e.target);
            console.log(e.target.value);

            //}
            if (isNaN(e.target.value)) {
              return;
            }
            onChangeItemDetalle(e, detalle.idProd, detalle.indexProdFin);
          }}
        />
      </TableCell>
      <TableCell
        align="center"
        sx={{
          ...{
            color: entradasNoDisponible?.includes(detalle.nomProd)
              ? "white"
              : "",
          },
        }}
      >
        <div className="btn-toolbar">
          <button
            onClick={() => {
              setdisabledInputs(!disabledInputs);
              console.log("click set disable");
            }}
            className="btn btn-success me-2"
            style={{
              ...{
                color: entradasNoDisponible?.includes(detalle.nomProd)
                  ? "white"
                  : "",
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil-fill"
              viewBox="0 0 16 16"
            >
              <path
                fill="#FFFFFF"
                d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              onDeleteItemRequisicion(detalle.idProd, detalle.indexProdFin);
            }}
            className="btn btn-danger"
            style={{
              ...{
                backgroundColor: entradasNoDisponible?.includes(detalle.nomProd)
                  ? "#BC2503"
                  : "",
                color: entradasNoDisponible?.includes(detalle.nomProd)
                  ? "black"
                  : "",
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-trash-fill"
              viewBox="0 0 16 16"
            >
              <path
                fill={
                  entradasNoDisponible?.includes(detalle.nomProd) ? "white" : ""
                }
                d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
              />
            </svg>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

/*
cunatas bolsasd eoreca en un cajon 
frascos por un cajon
sales parrilleras
y los paquetes en un cajon
*/
