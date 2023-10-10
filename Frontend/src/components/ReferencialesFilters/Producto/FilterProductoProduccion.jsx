import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getProductosProduccion } from "./../../../helpers/Referenciales/producto/getProductosProduccion";

export const FilterProductoProduccion = ({
  onNewInput,
  inputs,
  idFrescos,
  idSalPar,
  idMol,
}) => {
  const [result, setResult] = useState([]);

  const obtenerDataProductoProduccion = async () => {
    const resultPeticion = await getProductosProduccion(
      idFrescos,
      idSalPar,
      idMol
    );
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.codProd2,
        label: element.nomProd,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataProductoProduccion();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  var d = {};
  if (inputs?.producto) {
    d.value = inputs.producto;
  }

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        {...d}
        //value={inputs.producto}
        onChange={handledChange}
        onInputChange={(event, value, reason) => {
          if (reason == "input" && value == "") {
            console.log("reason: ", reason, "value:", value);
            onNewInput({ label: value });
          }
        }}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
