import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getAreaEncargada } from "./../helpers/area-encargada/getAreaEncargada";

export const FilterAreaEncargada = ({ onNewInput, disabled = false }) => {
  const [result, setResult] = useState([]);

  const getDataArea = async () => {
    const resultPeticion = await getAreaEncargada();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: `${element.desAre}`,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    getDataArea();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        onChange={handledChange}
        disableClearable
        disabled={disabled}
        options={result}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
