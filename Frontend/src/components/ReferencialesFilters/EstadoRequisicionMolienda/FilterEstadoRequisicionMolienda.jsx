import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoRequisicionMolienda } from "./../../../helpers/Referenciales/entradasStock/getEstadoRequisicionMolienda";

export const FilterEstadoRequisicionMolienda = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoRequisicionMolienda = async () => {
    const resultPeticion = await getEstadoRequisicionMolienda();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desReqMolEst,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoRequisicionMolienda();
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
