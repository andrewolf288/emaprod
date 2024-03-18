import React, { useEffect, useState } from "react";
import { FormatDateMYSQL } from "../../../utils/functions/FormatDate";
import { listOperacionesDevolucion } from "../../helpers/operacion-devolucion/listOperacionesDevolucion";
import FechaPickerMonth from "../../../components/Fechas/FechaPickerMonth";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { RowOperacionDevolucionNoRetorno } from "../../components/operacion-devolucion/RowOperacionDevolucionNoRetorno";

export const ListOperacionDevolucionWithCalidad = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataOperacionDevolucion, setdataOperacionDevolucion] = useState([]);

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  // filtros
  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  });
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
    obtenerDataOperacionDevolucion(body);
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
    obtenerDataOperacionDevolucion(body);
  };

  const obtenerDataOperacionDevolucion = async (body = null) => {
    const resultPeticion = await listOperacionesDevolucion(body);
    const { result, message_error, description_error } = resultPeticion;
    console.log(resultPeticion);
    if (message_error.length === 0) {
      setdataOperacionDevolucion(result);
    } else {
      alert(description_error);
    }
  };

  useEffect(() => {
    obtenerDataOperacionDevolucion();
  }, []);

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4 mb-4">
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
                  onNewfecEntSto={handleFechaInicioChange}
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
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE CONTENIDO */}
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
                <TableCell align="left" width={50}>
                  <b>Serie</b>
                </TableCell>
                <TableCell align="left" width={50}>
                  <b>Numero</b>
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Estado</b>
                </TableCell>
                <TableCell align="center" width={120}>
                  <b>Motivo</b>
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
              {dataOperacionDevolucion.map((element) => (
                <RowOperacionDevolucionNoRetorno
                  key={element.id}
                  detalle={element}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
