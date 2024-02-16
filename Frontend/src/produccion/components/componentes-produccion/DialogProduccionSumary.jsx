import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export const DialogProduccionSumary = ({ data }) => {
  return (
    // <Dialog
    //   open={open}
    //   onClose={() => setOpen(false)}
    //   BackdropProps={{
    //     invisible: true // Hace que el fondo no sea visible
    //   }}
    //   PaperProps={{
    //     style: {
    //       width: "800px",
    //       height: "600px",
    //       backgroundColor: "#a7c8d1",
    //       borderRadius: "15px"
    //     } // Aquí puedes ajustar el tamaño de la ventana modal
    //   }}
    // >
    //   <DialogTitle
    //     style={{
    //       textAlign: "center",
    //       fontSize: "20px",
    //       color: "black",
    //       fontWeight: "bold",
    //       backgroundColor: "#37c6ed"
    //     }}
    //   >
    //     PRODUCCIÓN LOTE
    //   </DialogTitle>
    //   <DialogContent>
    //     <form
    //       style={{
    //         display: "grid",
    //         gridTemplateColumns: "1fr 1fr",
    //         gap: "20px"
    //       }}
    //     >
    //       {/* Columna 1 */}
    //       <div>
    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             marginTop: "10px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>NÚMERO DE LOTE</strong>{" "}
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.codLotProd}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             marginTop: "10px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>NÚMERO OP</strong>{" "}
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.numop}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>PRODUCTO</strong>{" "}
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.nomProd}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>PESO DE LOTE TOTAL</strong>{" "}
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.canLotProd}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>TIPO PRODUCCIÓN</strong>
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.desProdTip}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             fontSize: "12px",
    //             width: "200px"
    //           }}
    //         >
    //           <strong>FECHA DE VENCIMIENTO</strong>{" "}
    //           <input
    //             type="text"
    //             readOnly
    //             value={data?.result?.produccion?.fecVenLotProd}
    //             style={{
    //               width: "100%",
    //               backgroundColor: "#e3e3e3",
    //               borderRadius: "5px",
    //               paddingLeft: "10px"
    //             }}
    //           />
    //         </div>
    //       </div>
    //       <div>
    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             marginTop: "10px",
    //             fontSize: "16px",
    //             width: "200px",
    //             backgroundColor: "yellow",
    //             borderRadius: "5px",
    //             paddingLeft: "10px"
    //           }}
    //         >
    //           <strong>PRODUCTOS FINALES</strong>
    //         </div>

    //         <ul>
    //           {data?.result?.productos_finales.map((producto) => (
    //             <li
    //               key={producto.id}
    //               style={{
    //                 fontSize: "12px",
    //                 fontWeight: "bold",
    //                 marginBottom: "10px",
    //                 backgroundColor: "#ecf0e6",
    //                 borderRadius: "5px",
    //                 paddingLeft: "10px"
    //               }}
    //             >
    //               <strong></strong> {producto.nomProd}
    //               <div
    //                 style={{
    //                   backgroundColor: "white",
    //                   borderRadius: "5px"
    //                 }}
    //               >
    //                 {/**  <strong> Cantidad ProdFin:</strong> {producto.canTotProgProdFin} */}
    //                 <strong> Cantidad ProdFin:</strong> {_parseInt(producto)}
    //                 <br />
    //                 <strong> Code:</strong> {producto.id}
    //               </div>
    //             </li>
    //           ))}
    //         </ul>

    //         <div
    //           style={{
    //             marginBottom: "5px",
    //             marginTop: "10px",
    //             fontSize: "16px",
    //             width: "200px",
    //             backgroundColor: "red",
    //             borderRadius: "5px",
    //             color: "white",
    //             textAlign: "center",
    //             height: "25px"
    //           }}
    //         >
    //           <strong>REQUISICIONES</strong>
    //         </div>

    //         {/* Filtrar productos finales por requisición "Envasado" */}
    //         {data?.result?.requisiciones
    //           .filter((requisicion) => requisicion.desAre === "Envasado")
    //           .map((requisicion) => (
    //             <div key={requisicion.id}>
    //               <h4
    //                 style={{
    //                   fontSize: "18px",
    //                   marginTop: "10px",
    //                   backgroundColor: "green",
    //                   borderRadius: "5px",
    //                   textAlign: "center",
    //                   width: "110px",
    //                   color: "white",
    //                   height: "25px"
    //                 }}
    //               >
    //                 {requisicion.desAre}
    //               </h4>
    //               <ul>
    //                 {requisicion.detalles?.map((detalle) => (
    //                   <li
    //                     key={detalle.id}
    //                     style={{
    //                       fontSize: "10px",
    //                       backgroundColor: "#93ff91",
    //                       borderRadius: "5px",
    //                       paddingLeft: "10px"
    //                     }}
    //                   >
    //                     <div
    //                       style={{
    //                         marginBottom: "0px",
    //                         fontSize: "12px",
    //                         fontWeight: "bold"
    //                       }}
    //                     >
    //                       <strong></strong>
    //                       {detalle.nomProd}
    //                     </div>
    //                     <div
    //                       style={{
    //                         marginBottom: "5px",
    //                         fontSize: "12px",
    //                         fontWeight: "bold"
    //                       }}
    //                     >
    //                       <strong>CANTIDAD : </strong>
    //                       {_parseInt(detalle)}
    //                       <br />
    //                       <strong> Code:</strong> {detalle.prodFCode}
    //                     </div>
    //                   </li>
    //                 ))}
    //               </ul>
    //             </div>
    //           ))}

    //         {/* Filtrar productos finales por requisición "Encajonado" */}
    //         {data?.result?.requisiciones
    //           .filter((requisicion) => requisicion.desAre === "Encajado")
    //           .map((requisicion) => (
    //             <div key={requisicion.id}>
    //               <h4
    //                 style={{
    //                   fontSize: "18px",
    //                   marginTop: "10px",
    //                   backgroundColor: "#d1c73f",
    //                   borderRadius: "5px",
    //                   textAlign: "center",
    //                   width: "110px",
    //                   color: "white",
    //                   height: "25px"
    //                 }}
    //               >
    //                 {requisicion.desAre}
    //               </h4>
    //               <ul>
    //                 {requisicion.detalles?.map((detalle) => (
    //                   <li
    //                     key={detalle.id}
    //                     style={{
    //                       fontSize: "10px",
    //                       backgroundColor: "#fcfc4e",
    //                       borderRadius: "5px",
    //                       paddingLeft: "10px"
    //                     }}
    //                   >
    //                     <div
    //                       style={{
    //                         marginBottom: "0px",
    //                         fontSize: "12px",
    //                         fontWeight: "bold"
    //                       }}
    //                     >
    //                       <strong></strong>
    //                       {detalle.nomProd}
    //                     </div>
    //                     <div
    //                       style={{
    //                         marginBottom: "5px",
    //                         fontSize: "12px",
    //                         fontWeight: "bold"
    //                       }}
    //                     >
    //                       <strong>CANTIDAD : </strong>
    //                       {_parseInt(detalle)}
    //                       <br />
    //                       <strong> Code:</strong> {detalle.prodFCode}
    //                     </div>
    //                   </li>
    //                 ))}
    //               </ul>
    //             </div>
    //           ))}
    //       </div>
    //     </form>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={() => setOpen(false)}>Cerrar</Button>
    //   </DialogActions>
    // </Dialog>
    <h1>Get</h1>
  );
};
