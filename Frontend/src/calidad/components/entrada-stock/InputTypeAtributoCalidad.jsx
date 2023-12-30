import { TextField } from "@mui/material";
import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FechaPickerYear from "../../../components/Fechas/FechaPickerYear";

export const InputTypeAtributoCalidad = ({
  atributo,
  onChangeValoresAlfanumericos
}) => {
  return (
    <div className="col">
      <label
        className={`form-label ${
          atributo.esCom ? "text-success" : "text-danger"
        }`}
      >
        {atributo.nomProdAtr}
      </label>
      {atributo.idTipProdAtr === 1 ? (
        <InputNumberValue
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      ) : atributo.idTipProdAtr === 2 ? (
        <InputTextValue
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      ) : atributo.idTipProdAtr === 3 ? (
        <InputOpcionUnica
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      ) : atributo.idTipProdAtr === 4 ? (
        <InputOpcionUnica
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      ) : atributo.idTipProdAtr === 5 ? (
        <InputFechaValue
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      ) : (
        <InputOpcionesMultiples
          atributo={atributo}
          onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
        />
      )}
    </div>
  );
};

// Componente de ingreso de texto
const InputTextValue = ({ atributo, onChangeValoresAlfanumericos }) => {
  return (
    <TextField
      name={String(atributo.id)}
      size="small"
      value={String(atributo.valEntCalAtr)}
      type="text"
      onChange={(e) => {
        onChangeValoresAlfanumericos(e, atributo);
      }}
      className="form-control"
    />
  );
};

// componente de ingreso de numero
const InputNumberValue = ({ atributo, onChangeValoresAlfanumericos }) => {
  return (
    <TextField
      name={String(atributo.id)}
      size="small"
      value={atributo.valEntCalAtr}
      onWheel={(e) => e.target.blur()}
      type="number"
      onChange={(e) => {
        onChangeValoresAlfanumericos(e, atributo);
      }}
      className="form-control"
    />
  );
};

// componente de ingreso de opcion unica
const InputOpcionUnica = ({ atributo, onChangeValoresAlfanumericos }) => {
  const options = atributo["opcProdAtr"].split(",").map((item) => item.trim());
  return (
    <FormControl className="form-control">
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        // defaultValue={atributo["valEntCalAtr"]}
        value={atributo["valEntCalAtr"]}
        onChange={(e) => {
          onChangeValoresAlfanumericos(e, atributo);
        }}
      >
        {options.map((element, index) => (
          <FormControlLabel
            key={`${index}-${element.id}`}
            value={element}
            control={<Radio />}
            label={element}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

// componente de fecha
const InputFechaValue = ({ atributo, onChangeValoresAlfanumericos }) => {
  const onChangeDate = (valor) => {
    const body = {
      target: {
        value: valor
      }
    };

    onChangeValoresAlfanumericos(body, atributo);
  };
  return (
    <FechaPickerYear
      date={atributo.valEntCalAtr}
      onNewfecEntSto={onChangeDate}
    />
  );
};

// componente de ingreso de multiples opciones
const InputOpcionesMultiples = ({ atributo, onChangeValoresAlfanumericos }) => {
  // opciones marcadas
  const optionsMarcados =
    atributo["valEntCalAtr"].length === 0
      ? []
      : atributo["valEntCalAtr"].split(",").map((item) => item.trim());

  // opciones disponibles
  const options = atributo["opcProdAtr"].split(",").map((item) => {
    // buscamos si la opcion esta marcada
    const findItemMarcado = optionsMarcados.find(
      (option) => option.trim() === item.trim()
    );
    if (findItemMarcado) {
      return {
        option: item.trim(),
        check: true
      };
    } else {
      return {
        option: item.trim(),
        check: false
      };
    }
  });

  // funcion para manejar el cambio de check
  const handleChangeOptions = ({ target }, value, atributo) => {
    const { checked } = target;
    let values = [];
    // agregamos
    if (checked) {
      values = [...optionsMarcados, value.trim()];
    }
    // quitamos
    else {
      values = optionsMarcados.filter((option) => option !== value);
    }
    console.log(values);
    const body = {
      target: {
        value: values.join(",")
      }
    };
    onChangeValoresAlfanumericos(body, atributo);
  };

  return (
    <FormGroup>
      {options.map((element, index) => (
        <FormControlLabel
          key={`${index}-${element.id}`}
          control={<Checkbox checked={element.check} />}
          label={element.option}
          onChange={(e) => {
            handleChangeOptions(e, element.option, atributo);
          }}
        />
      ))}
    </FormGroup>
  );
};
