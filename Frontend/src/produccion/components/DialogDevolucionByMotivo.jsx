import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DialogDevolucionByMotivo = ({ detalle }) => {
  console.log(detalle);
  const [open, setOpen] = React.useState(false);
  const [devolucionMotivos, setDevolucionMotivos] = React.useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const getDevolucionesByProductoAndProduccion = async () => {
    const resultPeticion = await getDevolucionesByProductoAndProduccion();
    const { message_error, description_error, result } = resultPeticion;
    setDevolucionMotivos(result);
  };

  React.useEffect(() => {
    getDevolucionesByProductoAndProduccion();
  }, []);

  return (
    <div>
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="success"
      >
        <VisibilityIcon fontSize="inherit" />
      </IconButton>

      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle productos finales
        </DialogTitle>

        <DialogContent dividers>
          <TableDevolucionDetail detalle={detalle}/>
          <TableDevolucionMotivosDetail />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};

const TableDevolucionDetail = ({ detalle }) => {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>Detalle devolucion</Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {/* <TableCell align="right">Cod Aso.</TableCell> */}
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">Descripción</TableCell>
            <TableCell align="left">U.M</TableCell>
            <TableCell align="right">Cantidad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            {/* <TableCell align="right">{detalle.id}</TableCell> */}
            <TableCell align="left">{detalle.codProd2}</TableCell>
            <TableCell align="left">{detalle.nomProd}</TableCell>
            <TableCell align="left">{detalle.simMed}</TableCell>
            {/* <TableCell align="right">{detalle.canTotProgProdFin}</TableCell> */}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TableDevolucionMotivosDetail = ({ detalleMotivos }) => {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>Detalle devolucion por motivos</Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {/* <TableCell align="right">Cod Aso.</TableCell> */}
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">Descripción</TableCell>
            <TableCell align="left">U.M</TableCell>
            <TableCell align="left">Almacen Destino</TableCell>
            <TableCell align="left">Motivo Devolucion</TableCell>
            <TableCell align="right">Cantidad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalleMotivos.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {/* <TableCell align="right">{row.id}</TableCell> */}
              <TableCell align="left">{row.codProd2}</TableCell>
              <TableCell align="left">{row.nomProd}</TableCell>
              <TableCell align="left">{row.simMed}</TableCell>
              {/* <TableCell align="left">{detalle.nomAlm}</TableCell>
            <TableCell align="left">{detalle.motDev}</TableCell> */}
              {/* <TableCell align="right">{detalle.canTotProgProdFin}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
