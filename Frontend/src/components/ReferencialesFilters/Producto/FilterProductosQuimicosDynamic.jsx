import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getProductosQuimicos } from "../../../helpers/Referenciales/producto/getProductosQuimicos";

const defaultOption = {
  value: 0,
  label: "Selecciona un producto quimico",
  id: 0
};

export const FilterProductosQuimicosDynamic = ({
  defaultValue = null,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataProducto = async () => {
    var result = await getProductosQuimicos();
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: `${element.codProd2} - ${element.nomProd}`,
          id: element.id
        };
      })
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
    obtenerDataProducto();
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
