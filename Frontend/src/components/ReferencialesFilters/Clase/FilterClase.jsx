import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getClases } from "./../../../helpers/Referenciales/clase/getClases";

export const FilterClase = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataClases = async () => {
    const resultPeticion = await getClases();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: `${element.desCla}`,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataClases();
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
