import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getAlmacenes } from "./../../../helpers/Referenciales/almacen/getAlmacenes";

export const FilterAlmacen = ({ onNewInput, disabled, inputs, mostrarCodigo }) => {
  const [result, setResult] = useState([]);

  const getDataAlmacenes = async () => {
    const resultPeticion = await getAlmacenes();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.codAlm,
        label: `${element.nomAlm}`,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    getDataAlmacenes();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  var d = {}
  if(inputs?.almacen){
    d.value = inputs.almacen
  }
  return (
    <>
      <Autocomplete
        disabled={disabled}
        options={result}
        disableClearable
        autoHighlight={true}

        //value={inputs.almacen}
        {...d}
        //getOptionLabel={(option) => option.label}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : ( mostrarCodigo  && option.value ? (option.value + " - ") : "") + option.label
        }
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {(mostrarCodigo   ? (option.value + " - ") : "" )+ (option.label)}
            </li>
          );
        }}
        onChange={handledChange}
        onInputChange={(event, value, reason) => {
          if (reason == "input" && value == "") {
            onNewInput({ label: value });
          }
        }}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
