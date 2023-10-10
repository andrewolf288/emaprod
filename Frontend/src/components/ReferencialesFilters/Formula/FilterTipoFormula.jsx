import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getTipoFormula } from "./../../../helpers/Referenciales/formula/getTipoFormula";

export const FilterTipoFormula = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataTipoFormula = async () => {
    const resultPeticion = await getTipoFormula();
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.id,
        label: element.desForTip,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataTipoFormula();
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
