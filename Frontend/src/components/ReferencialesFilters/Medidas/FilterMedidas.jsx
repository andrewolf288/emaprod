import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMedidas } from "./../../../helpers/Referenciales/medida/getMedidas";

export const FilterMedidas = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataMedidas = async () => {
    const resultPeticion = await getMedidas();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: `${element.desMed} (${element.simMed})`,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataMedidas();
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
