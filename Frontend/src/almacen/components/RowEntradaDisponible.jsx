import React, { useState } from "react";
import { Checkbox } from "@mui/material";

export const RowEntradaDisponible = ({ entrada, onChangeInputValue }) => {
  const [inputValue, setinputValue] = useState(0);
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    const isChecked = event.target.checked;
    setChecked(event.target.checked);
    // mandamos a realizar los cambios
    onChangeInputValue(
      isChecked,
      entrada.canTotDis,
      inputValue,
      entrada.id,
      setinputValue
    );
  };

  return (
    <tr>
      <td>{entrada.nomAlm}</td>
      <td>{entrada.codEntSto}</td>
      <td>{entrada.refNumIngEntSto}</td>
      <td>{entrada.fecEntSto}</td>
      <td>{entrada.canTotDis}</td>
      <td className="col-2">
        <div className="d-flex">
          <Checkbox
            checked={checked}
            onChange={handleChange}
            inputProps={{ "aria-label": "controlled" }}
          />
          <input
            className="form-control"
            type="number"
            value={inputValue}
            placeholder="0"
            disabled={true}
          />
        </div>
      </td>
    </tr>
  );
};
