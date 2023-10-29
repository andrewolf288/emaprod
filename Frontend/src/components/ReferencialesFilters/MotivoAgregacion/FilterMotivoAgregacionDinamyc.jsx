import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMotivoAgregaciones } from "./../../../helpers/Referenciales/motivo_agregaciones/getMotivoAgregaciones";

const defaultOption = {
  value: 0,
  label: "Selecciona un motivo",
  id: 0,
};

export const FilterMotivoAgregacionDynamic = ({
  defaultValue = 0,
  onNewInput,
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataMotivoAgregacion = async () => {
    const result = await getMotivoAgregaciones();
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: element.desProdAgrMot,
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

  // esto se llama cuando se carga el componente
  useEffect(() => {
    const controller = new AbortController();
    obtenerDataMotivoAgregacion();
    return () => controller.abort();
  }, []);

  // esto se llama cada vez que se da un cambio en el defaultValue
  useEffect(() => {
    // verficar si defualtvalue coincide
    const defaultValueOption = options.find(
      (option) => option.id === defaultValue
    );
    if (defaultValueOption) {
      setValue(defaultValueOption);
    }
  }, [defaultValue]);

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
