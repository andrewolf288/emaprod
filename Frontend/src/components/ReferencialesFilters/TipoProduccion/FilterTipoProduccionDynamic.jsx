import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getTiposProduccion } from "./../../../helpers/Referenciales/tipo_produccion/getTiposProduccion";

const defaultOption = {
  value: 0,
  label: "Selecciona un tipo de produccion",
  id: 0,
};

export const FilterTipoProduccionDynamic = ({
  onNewInput,
  defaultValue = null,
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataTipoProduccion = async () => {
    const result = await getTiposProduccion();
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: element.desProdTip,
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
    obtenerDataTipoProduccion();
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
