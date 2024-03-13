import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getMotivoDevolucionesCalidad } from "../../../helpers/Referenciales/motivo_devoluciones_calidad/getMotivoDevolucionesCalidad";

const defaultOption = {
  value: null,
  label: "Selecciona un motivo de devolucion",
  id: null
};

export const FilterMotivoDevolucionCalidad = ({
  defaultValue = null,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataProducto = async () => {
    var result = await getMotivoDevolucionesCalidad();
    result = result.filter(
      (element) => element.idCla !== 2 && element.idCla !== 4
    );
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: element.desMotDevCal,
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
