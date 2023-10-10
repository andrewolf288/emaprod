import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useAuth } from "../../../hooks/useAuth";
import FechaPicker from "./../../../components/Fechas/FechaPicker";

export default function FormCalidad({
  formState,
  setFormState,
  open,
  handleClose,
  updateEntradasStock,
  onClickProcesar,
}) {
  /**
    prestProdt: "",
    certCal: "",
    lotProv: "",
    resbEval: "",
     */
  var _presProdt = [
    "SACO X 50 KG",
    "SACO X 25 KG",
    "SACO X 20 KG",
    "YUTE X25 KG",
    "BALDE DE 20 L",
    "SACO X 15 KG",
    "SACO X 30 KG",
    "SACO X 100 KG",
  ];
  //const [formState, setFormState] = React.useState({});
  const { user } = useAuth();
  var users = [user.nomUsu + " " + user.apeUsu];

  const onAddFecProduccion = (newfecEntSto) => {
    setFormState({ ...formState, fecProduccion: newfecEntSto });
  };

  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Editar</DialogTitle>
        <DialogContent>
          <div className="card-body">
            <div className="mb-3 row">
              <label className="col-md-9 col-form-label">
                Presentacion del producto
              </label>
              <br />
              <div className="col-md-9">
                <FormControl fullWidth>
                  <Select
                    value={formState.prestProdt || ""}
                    name="prestProdt"
                    size="small"
                    onChange={onInputChange}
                  >
                    {_presProdt.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="mb-3 row">
              <label className="col-md-7 col-form-label">
                Certificado de calidad
              </label>
              <div className="col-md-7">
                <Checkbox
                  checked={Boolean(formState.certCal)}
                  name="certCal"
                  onChange={(event) => {
                    setFormState({
                      ...formState,
                      certCal: event.target.checked,
                    });
                  }}
                  sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label className="col-md-9 col-form-label">
                Lote de provedor
              </label>
              <div className="col-md-9">
                <input
                  onChange={onInputChange}
                  value={formState.lotProv}
                  type="text"
                  name="lotProv"
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label className="col-sm-9 col-form-label">
                Fecha de producción
              </label>
              <div className="col-md-9">
                <FechaPicker onNewfecEntSto={onAddFecProduccion} />
              </div>
            </div>

            <div className="mb-3 row">
              <label className="col-md-9 col-form-label">% Humedad</label>
              <div className="col-md-9">
                <input
                  onChange={onInputChange}
                  value={formState.humedad}
                  type="number"
                  name="humedad"
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label className="col-md-9 col-form-label">
                Responsable de la evaluación
              </label>
              <div className="col-md-9">
                <FormControl fullWidth>
                  <Select
                    value={formState.resbEval || ""}
                    name="resbEval"
                    size="small"
                    onChange={onInputChange}
                  >
                    {users.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="nombre" className="form-label">
                Observacion
              </label>
              <div className="col-md-9">
                <textarea
                  value={formState.obsEnt}
                  name="obsEnt"
                  onChange={onInputChange}
                  className="form-control"
                ></textarea>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={async () => {
              var response = await updateEntradasStock(formState);
              //console.log(response);
              handleClose();
              onClickProcesar();
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
