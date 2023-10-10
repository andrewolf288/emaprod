import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMateriaPrimaPorSeleccionar } from "./../../../helpers/Referenciales/producto/getMateriaPrimaPorSeleccionar";

export const FilterMateriaPrimaPorSeleccionar = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataMateriaPrimaPorSeleccionar = async () => {
    const resultPeticion = await getMateriaPrimaPorSeleccionar();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.codProd2,
        label: element.nomProd,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataMateriaPrimaPorSeleccionar();
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
