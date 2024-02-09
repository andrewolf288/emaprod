import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoOrdenIrradiacion } from "../../../helpers/Referenciales/orden_irradiacion/getEstadoOrdenIrradiacion";

export const FilterEstadoOrdenIrradiacion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoOrdenIrradiacion = async () => {
    const resultPeticion = await getEstadoOrdenIrradiacion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desOrdIrraEst,
        id: element.id
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoOrdenIrradiacion();
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
