import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import MuiAlert from "@mui/material/Alert";

import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import ReactDOM from "react-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import logo from "./emaran.png";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SvgIcon from "@mui/material/SvgIcon";

import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

//***********************************************GENERATE PDF ********************************************* */

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  section_io: {
    margin: 1,
    padding: 1,
    flexGrow: 1,
  },
  title: {
    fontSize: 15, // Modifica el tamaño de letra del título
    marginBottom: 10,
    textAlign: "center",
  },
  content: {
    fontSize: 10, // Modifica el tamaño de letra del contenido
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
    flexGrow: 1,
    fontWeight: "bold",
  },
  rightAlign: {
    textAlign: "right",
  },
  grayBox: {
    backgroundColor: "#F0F0F0", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },
  vertical: {
    flexDirection: "column",
    marginRight: 10,
  },
  grayBox_yellow: {
    backgroundColor: "#ecf7ab", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },

  grayBox_blue: {
    backgroundColor: "#bef0f7", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },

  gridContainer: {
    marginTop: 10,
    borderWidth: 0.7,
    borderColor: "#000",
    flexDirection: "column",
  },

  gridContainer_row: {
    marginTop: 10,
    //borderWidth: 0.7,
    borderColor: "#000",
    flexDirection: "row", // Cambiado a 'row' para alinear elementos horizontalmente
    justifyContent: "space-between", // Distribuye los elementos equitativamente en el eje X
    alignItems: "center", // Centra verticalmente los elementos en el eje Y
  },
  gridHeader: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderBottomWidth: 0.4,
    borderColor: "#000",
  },
  gridRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottomWidth: 0.1,
    borderColor: "#000",
    fontSize: 15,
  },
  gridTitle: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 7,
  },
  gridContent: {
    flex: 1,
    textAlign: "center",
  },
  gridContent_p: {
    flex: 1,
    textAlign: "center",
    fontSize: 5.5,
  },
  gridContent_num: {
    flex: 1,
    textAlign: "center",
    fontSize: 6.5,
  },

  container: {
    position: "relative", // Establece la posición del contenedor como relativa
  },
  logo: {
    position: "absolute", // Establece la posición del logo como absoluta
    top: 0, // Ajusta la posición vertical del logo (0 para estar en la parte superior)
    left: 0, // Ajusta la posición horizontal del logo (0 para estar en la parte izquierda)
    width: 150,
    height: 150,
  },
  greenBackground: {
    backgroundColor: "#baeaf7",
  },
  greenText: {
    color: "green",
  },
  green_: {
    backgroundColor: "#bdf0da",
  },
  yellow_: {
    backgroundColor: "#faf4b9",
  },
  sectionWithBorder: {
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginBottom: 10,
    borderColor: "#000", // Color del borde
    borderWidth: 0.1, // Ancho del borde
  },
});
function _parseInt(str) {
  // console.log(str)
  if (str.canProdAgr) {
    str.canReqDet = str.canProdAgr;
  }
  if (str.canTotProgProdFin) {
    str.canReqDet = str.canTotProgProdFin;
  }
  str.canReqDet = parseFloat(str.canReqDet).toFixed(2);
  let index = str.canReqDet.toString().indexOf(".");
  let result = str.canReqDet.toString().substring(index + 1);
  //console.log("index: ",index, "result: ", result)
  let val =
    parseInt(result) >= 1 && str.simMed !== "KGM"
      ? Math.trunc(str.canReqDet) + 1
      : str.canReqDet;
  return val;
}
const PdfDevoluciones = ({
  numop,
  nomProd,
  detDev,
  prodToDev,
  codLotProd,
  canLotProd,
  desProdTip,
}) => {
  // return;
  //var agregaciones = data.result.agregaciones.detAgr;
  //var prodsFinal = data.result.agregaciones.prodsFinal;
  //console.log(prodsFinal)
  //var fecCreProdAgr = data.result.agregaciones.detAgr[0]?.fecCreProdAgr;
  //var fechaInicio = data.result.agregaciones.detAgr[0]?.fechaInicio;
  //var fechaFin = data.result.agregaciones.detAgr[0]?.fechaFin;
  //var flag = data.result.agregaciones.detAgr[0]?.flag;

  var fechaInicio = "";
  var devoluciones = detDev;

  console.log(devoluciones);

  return (
    <PDFViewer width="100%" height="100%">
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            marginTop: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              ...styles.section,
              //border: "1px solid black"
            }}
          >
            <View style={styles.container}>
              <Image
                src={logo}
                style={{ ...styles.logo, marginTop: -105, marginLeft: 20 }}
              />
            </View>

            <View
              style={{
                ...styles.row,
                marginTop: -10,
                //border: "1px solid black",
              }}
            >
              <View style={styles.column}>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Producto Intermedio: {nomProd}
                </Text>
                {/**
                   <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Fecha de Inicio Programado: {fechaInicio}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Fecha de Fin Programado: {"fechaFin"}
                </Text>
                 */}
                {/**
                         <Text
                        style={{
                          ...styles.content,
                          fontWeight: "bold",
                          fontSize: 9,
                          maxWidth: "50%",
                          marginBottom: 2,
                          marginLeft: 20,
                        }}
                      >
                        Fecha de Vencimiento Lt:{" "}
                        {data.result.produccion.fecVenLotProd}
                      </Text>
                         */}
              </View>

              <View style={{ ...styles.row, marginTop: -40 }}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.content,
                      fontWeight: "bold",
                      borderRadius: 5,
                      fontSize: 16,
                      marginBottom: 1,
                      backgroundColor: "#d8dbe3",
                      padding: 5,
                      marginRight: 20,
                    }}
                  >
                    DEVOLUCIONES
                  </Text>
                  <View
                    style={{
                      ...styles.row,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        //flex: 1,
                        textAlign: "center",
                        //marginLeft: 10,
                        marginRight: 40,
                        marginTop: 10,
                      }}
                    >
                      {numop}
                    </Text>
                  </View>

                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 10,
                      backgroundColor: "#d8dbe3",
                      width: 220,
                      height: 60,
                      borderRadius: 5,
                      marginRight: 20,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                      }}
                    >
                      Número de Lote: {codLotProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                      }}
                    >
                      Peso Total de Lote: {canLotProd + " KG"}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Tipo de Producción: {desProdTip}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text
              style={{
                ...styles.title,
                fontWeight: "bold",
                fontSize: 7,
                marginLeft: -440,
                marginTop: 12,
                //border: "1px solid black",
              }}
            >
              Devoluciones registradas
            </Text>

            <View
              style={{
                margin: 10,
                padding: 10,
                flexGrow: 0.1,
                marginTop: -25,
                //border: "2px solid black",
                //maxHeight: "50px",
              }}
            >
              <View
                style={{
                  ...styles.gridContainer,
                  //border: "1px solid black",
                  //minHeight: "10%",
                }}
              >
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 0.4,
                      //border: "1px solid black",
                    }}
                  >
                    Codigo
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 2,
                      //border: "1px solid black",
                    }}
                  >
                    Nombre
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      textAlign: "center",
                      //border: "1px solid black",
                    }}
                  >
                    Almacen
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      textAlign: "center",
                      //border: "1px solid black",
                    }}
                  >
                    U.M
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 0.7,
                      textAlign: "center",
                      //border: "1px solid black",
                    }}
                  >
                    Motivo
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      //border: "1px solid black",
                    }}
                  >
                    Cant. Devuelta
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      //border: "1px solid black",
                    }}
                  >
                    Cant. estimada a devolver
                  </Text>
                </View>
                {devoluciones.map((detalle, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridRow,
                      index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                    ]}
                  >
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.3,
                        // border: "1px solid black",
                      }}
                    >
                      {detalle.codProd2}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1.6,
                        // border: "1px solid black",
                      }}
                    >
                      {detalle.nomProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.nomAlm}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.5,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.simMed}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.desProdDevMot}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.7,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.canProdDev}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.7,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.cantDev}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text
              style={{
                ...styles.title,
                fontWeight: "bold",
                fontSize: 7,
                marginLeft: -440,
                marginTop: 1,
                //border: "1px solid black",
              }}
            >
              Productos a devolver
            </Text>
            <View
              style={{
                ...styles.section,
                marginTop: -25,
                //border: "1px solid black",
              }}
            >
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 0.3,
                      //border: "1px solid black",
                    }}
                  >
                    Codigo
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1.6,
                      //border: "1px solid black",
                    }}
                  >
                    Nombre
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      textAlign: "center",
                      //border: "1px solid black",
                    }}
                  >
                    Clase
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 0.5,
                      textAlign: "center",
                      //border: "1px solid black",
                    }}
                  >
                    U.M
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 0.8,
                      //border: "1px solid black",
                    }}
                  >
                    Cantidad
                  </Text>
                </View>
                {prodToDev.map((detalle, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridRow,
                      index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                    ]}
                  >
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.3,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.codProd2}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1.6,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.nomProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.desCla}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.5,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.simMed}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 0.8,
                        //border: "1px solid black",
                      }}
                    >
                      {detalle.canProdDev}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PdfDevoluciones;
