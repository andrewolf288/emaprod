import AddCircle from "@mui/icons-material/AddCircle";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup
} from "@mui/material";
import React from "react";

export const RowOperacionDevolucionCalidadDetalle = ({
  detalle,
  onChangeValueDetalle
}) => {
  const {
    index,
    idOpeDevCal,
    idProdc,
    codLotProd,
    canLotProd,
    pH,
    consistencia30,
    consistencia60,
    color,
    sabor,
    olor,
    observacion,
    esReproceso,
    esDetCamProd
  } = detalle;

  console.log(index);
  // HANDLE CHANGE INPUT NAME
  const handleChangeInputName = ({ target }) => {
    const { name, value } = target;
    onChangeValueDetalle(index, name, value);
  };

  return (
    <div className="card mb-5">
      <div className="card-header">
        <div className="form-group row">
          <div className="col">
            <div className="row">
              <label htmlFor="lote" className="col-form-label col-2">
                LOTE:
              </label>
              <div className="col-2">
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={codLotProd}
                />
              </div>
              <div className="col-2">
                <IconButton color="primary">
                  <AddCircle />
                </IconButton>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <label htmlFor="lote" className="col-form-label col-3">
                CANTIDAD:
              </label>
              <div className="col-3">
                <input
                  type="number"
                  name="canLotProd"
                  className="form-control"
                  value={canLotProd}
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            <h5 className="card-title mb-4">Fisicoquímico</h5>
            <div className="form-group row mb-3">
              <label htmlFor="ph" className="col-sm-4 col-form-label">
                pH:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={pH}
                  name="pH"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label
                htmlFor="consistencia30"
                className="col-sm-4 col-form-label"
              >
                Consistencia 30:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={consistencia30}
                  name="consistencia30"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label
                htmlFor="consistencia60"
                className="col-sm-4 col-form-label"
              >
                Consistencia 60:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={consistencia60}
                  name="consistencia60"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
          </div>
          <div className="col">
            <h5 className="card-title mb-4">Orgánicos</h5>
            <div className="form-group row mb-3">
              <label htmlFor="color" className="col-sm-4 col-form-label">
                Color:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={color}
                  name="color"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label htmlFor="sabor" className="col-sm-4 col-form-label">
                Sabor:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={sabor}
                  name="sabor"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label htmlFor="olor" className="col-sm-4 col-form-label">
                Olor:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={olor}
                  name="olor"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            <textarea
              className="form-control"
              placeholder="Observaciones"
              value={observacion}
              name="observacion"
              onChange={handleChangeInputName}
            ></textarea>
          </div>
        </div>
        <div className="row mt-3 justify-content-center">
          <div className="col-6">
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                Acción
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={esReproceso}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Reproceso"
                />
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Desmedro"
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div className="col-6">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={esDetCamProd} />}
                label="Detalle cambio producto"
              />
            </FormGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
