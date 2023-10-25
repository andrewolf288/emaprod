import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export const DialogEntradasParciales = (props) => {
  const { open, handleClose, handleAccept, data } = props;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Entradas parciales</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>Orden de compra: </strong> {data.ordCom}
          <br />
          <strong>Cantidad total entradas parciales: </strong>
          {data.cantAcuIngPar}
          <br />
          <strong>Cantidad total compra: </strong> {data.canTotCom}
          <br />
          <strong>Documento de entrada: </strong> {data.docEntSto}
          <br />
          <strong>Detalles:</strong>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Codigo</TableCell>
                <TableCell>Cantidad ingresada</TableCell>
                <TableCell>Fecha ingreso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.detEntPar.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{detalle.codEntSto}</TableCell>
                  <TableCell>{detalle.canTotDis}</TableCell>
                  <TableCell>{detalle.fecEntSto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" variant="contained">
          Cerrar
        </Button>
        <Button
          onClick={() => {
            handleAccept(data);
          }}
          color="info"
          variant="contained"
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
