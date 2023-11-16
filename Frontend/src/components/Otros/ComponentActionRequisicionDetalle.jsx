import React from "react";
import iconSalidaTotal from "../../assets/icons/logo-salida-total.png";
import iconSalidaParcial from "../../assets/icons/logo-salida-parcial.png";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const options = ["Ver salidas parciales", "Editar", "Eliminar"];
const ITEM_HEIGHT = 48;

export const ComponentActionRequisicionDetalle = ({
  onUpdateDetalleRequisicion,
  onDeleteDetalleRequisicion,
  onViewSalidasParciales,
  onCreateSalidaTotal,
  onCreateSalidaParcial,
  onTerminarSalidaParcial,
  detalle,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="btn-toolbar">
      {/* Boton de entrega total */}
      <div
        className="btn btn-outline-warning me-2"
        title="Salida Total"
        onClick={() => {}}
      >
        <img src={iconSalidaTotal} height={25} width={25} />
      </div>
      {/* Boton de entrega parcial */}
      <div
        className="btn btn-outline-primary me-2"
        title="Salida Parcial"
        onClick={() => {}}
      >
        <img src={iconSalidaParcial} height={25} width={25} />
      </div>
      {/* Boton de terminar entrega parcial */}
      <button
        className="btn btn-outline-success me-2"
        title="Terminar Salidas parciales"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-clipboard2-check-fill"
          viewBox="0 0 16 16"
        >
          <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z" />
          <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5Zm6.769 6.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708Z" />
        </svg>
      </button>
      {/* Menu options de otras opciones */}
      <div>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} onClick={handleClose}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </div>
  );
};
