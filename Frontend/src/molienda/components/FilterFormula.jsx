import React from "react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { getFormulas } from "./../helpers/formula/getFormulas";

export const FilterFormula = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataFormulas = async () => {
    const { result } = await getFormulas();
    const formatSelect = result.map((element) => {
      return {
        value: element.id, //ID DE LA FORMULA
        label: element.nomFor, // NOMBRE DE LA FORMULA Y PRODUCTO
      };
    });

    console.log(formatSelect);
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataFormulas();
  }, []);

  const handledChange = ({ value }) => {
    onNewInput(value);
  };

  return (
    <>
      <Select options={result} onChange={handledChange} />
    </>
  );
};
