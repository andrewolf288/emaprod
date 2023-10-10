import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getTiposProduccion } from "./../../../helpers/Referenciales/tipo_produccion/getTiposProduccion";

export const FilterTipoProduccion = ({ onNewInput, inputs }) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({});

  const obtenerDataTipoProduccion = async () => {
    const resultPeticion = await getTiposProduccion();
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.id,
        label: element.desProdTip,
        id: element.id,
        cod: element.codTipProd,
      };
    });
    if (formatSelect.length && inputs?.idProdTip) {
      var prod = formatSelect.find((item) => item.id == inputs?.idProdTip);
      setValue(prod);
    }

    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataTipoProduccion();
  }, []);

  const handledChange = (event, value) => {
    setValue(value)
    onNewInput(value);
  };

  var d = {};
  if (inputs?.tipoProduccion || inputs?.idProdTip) {
    //d.value = inputs.tipoProduccion;
    //d.value = result[1];
  }

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        //{...d}
        value={value}
        getOptionLabel={(option) => option.label}
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
