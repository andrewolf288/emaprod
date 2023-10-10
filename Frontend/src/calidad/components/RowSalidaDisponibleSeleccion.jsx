import React, { useState } from "react";
import FechaPicker from "./../../components/Fechas/FechaPicker";

export const RowSalidaDisponibleSeleccion = ({
  index,
  element,
  onChangeInputValue,
}) => {
  const [disabledInput, setDisabledInput] = useState(true);

  const handleChange = ({ target }, idSalida) => {
    const { name, value } = target;
    onChangeInputValue(name, value, idSalida);
  };

  return (
    <tr>
      <td scope="row">{index + 1}</td>
      <td>{element.codEntSto}</td>
      <td>{element.canSalStoReqSel}</td>
      <td>
        <input
          className=""
          name="canEntStoReqSel"
          value={element.canEntStoReqSel}
          onChange={(e) => {
            handleChange(e, element.id);
          }}
          type="number"
          disabled={disabledInput}
        />
      </td>
      <td>
        <input
          name="merReqSel"
          className="me-2"
          value={element.merReqSel}
          onChange={(e) => {
            handleChange(e, element.id);
          }}
          type="number"
          disabled={disabledInput}
        />
      </td>
      <td className="col-2">
        <button
          className="btn btn-success"
          onClick={(e) => {
            e.preventDefault();
            setDisabledInput(!disabledInput);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-pencil-fill"
            viewBox="0 0 16 16"
          >
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};
