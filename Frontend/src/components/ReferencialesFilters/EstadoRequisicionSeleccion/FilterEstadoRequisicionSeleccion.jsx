import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoRequisicionSeleccion } from "./../../../helpers/Referenciales/seleccion/getEstadoRequisicionSeleccion";

export const FilterEstadoRequisicionSeleccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoRequisicionSeleccion = async () => {
    const resultPeticion = await getEstadoRequisicionSeleccion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desReqSelDetEst,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoRequisicionSeleccion();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
