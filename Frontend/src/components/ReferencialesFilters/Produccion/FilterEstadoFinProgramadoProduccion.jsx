import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoFinProgramadoProduccion } from "./../../../helpers/Referenciales/produccion/getEstadoFinProgramadoProduccion";

export const FilterEstadoFinProgramadoProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoFinProgramadoProduccion = async () => {
    const resultPeticion = await getEstadoFinProgramadoProduccion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desProdFinProgEst,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoFinProgramadoProduccion();
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
