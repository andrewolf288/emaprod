import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMotivoDevoluciones } from "./../../../helpers/Referenciales/motivo_devoluciones/getMotivoDevoluciones";

export const FilterMotivoDevolucion = ({ onNewInput, disabled }) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({});

  const obtenerDataMotivoDevolucion = async () => {
    const resultPeticion = await getMotivoDevoluciones();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desProdDevMot,
        id: element.id,
      };
    });
    //console.log(formatSelect)
    if(formatSelect.length){
      //console.log(formatSelect)
      setValue(formatSelect[0])
    }
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataMotivoDevolucion();
  }, []);

 


  const handledChange = (event, value) => {
    setValue(value)
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        disabled={disabled}
        options={result}
        value={value}
        disableClearable
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
