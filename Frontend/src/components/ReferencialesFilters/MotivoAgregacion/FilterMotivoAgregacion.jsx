import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMotivoAgregaciones } from "./../../../helpers/Referenciales/motivo_agregaciones/getMotivoAgregaciones";

export const FilterMotivoAgregacion = ({ onNewInput, inputs, defaultValueFlag }) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({value:"", label:""});

  const obtenerDataMotivoAgregacion = async () => {
    const resultPeticion = await getMotivoAgregaciones();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desProdAgrMot,
        id: element.id,
      };
    });

    if(defaultValueFlag){
      setValue(formatSelect[0])
    }
    setResult(formatSelect);

  };

  useEffect(() => {
    obtenerDataMotivoAgregacion();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };
  
  useEffect(() => {

    if(inputs){
      setValue(inputs.motivo)
    }
    }, [inputs]);

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        value={value}
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
