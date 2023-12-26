import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getAtributoCalidadTipo } from "../../../helpers/Referenciales/atributo_calidad_tipo/getAtributoCalidadTipo";

const defaultOption = {
  value: 0,
  label: "Selecciona un tipo atributo",
  id: 0
};

export const FilterTipoAtributoDynamic = ({
  defaultValue = null,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataMateriaPrima = async () => {
    var result = await getAtributoCalidadTipo();
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: `${element.nomAtrCalTip}`,
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
    obtenerDataMateriaPrima();
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
