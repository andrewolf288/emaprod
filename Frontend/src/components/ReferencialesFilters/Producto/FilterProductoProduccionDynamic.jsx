import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getProductosProduccion } from "./../../../helpers/Referenciales/producto/getProductosProduccion";

const defaultOption = {
  value: 0,
  label: "Selecciona producto intermedio",
  id: 0,
};

export const FilterProductoProduccionDynamic = ({
  onNewInput,
  defaultValue = null,
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataProductoProduccion = async () => {
    const result = await getProductosProduccion();
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: element.nomProd,
          id: element.id,
        };
      }),
    ];
    setOptions(formatSelect);
    // verficar si defualtvalue coincide
    const defaultValueOption = formatSelect.find(
      (option) => option.id === defaultValue
    );
    if (defaultValueOption) {
      setValue(defaultValueOption);
    }
  };

  const handleChange = (event, value) => {
    onNewInput(value);
    setValue(value);
  };

  useEffect(() => {
    const controller = new AbortController();
    obtenerDataProductoProduccion();
    return () => controller.abort();
  }, []);

  return (
    <Autocomplete
      options={options}
      value={value}
      disableClearable
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      isOptionEqualToValue={(option, value) => option.id == value.id}
      renderInput={(params) => <TextField {...params} size="small" />}
    />
  );
};
