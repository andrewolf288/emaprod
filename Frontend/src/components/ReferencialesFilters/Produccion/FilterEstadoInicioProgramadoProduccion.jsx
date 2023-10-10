import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoInicioProgramadoProduccion } from "./../../../helpers/Referenciales/produccion/getEstadoInicioProgramadoProduccion";

export const FilterEstadoInicioProgramadoProduccion = ({ onNewInput, inputs }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoInicioProgramadoProduccion = async () => {
    const resultPeticion = await getEstadoInicioProgramadoProduccion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desProdIniProgEst,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoInicioProgramadoProduccion();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  var d = {}
  if(inputs?.producto){
    d.value = inputs.estadoInicio

  }

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        {...d}
        onInputChange={(event, value, reason) => {
          if (reason == "input" && value == "") {
            console.log("reason: ",reason, "value:", value)
            onNewInput({ label: value });
          }
        }}
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
