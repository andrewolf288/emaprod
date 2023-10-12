import React, { useState, useEffect } from "react";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
// IMPORTACIONES PARA EL FEEDBACK
import MuiAlert from "@mui/material/Alert";
import { getProduccionLote } from "./../../helpers/produccion_lote/getProduccionLote";
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { FilterEstadoProduccion } from "./../../../components/ReferencialesFilters/Produccion/FilterEstadoProduccion";
import { FilterTipoProduccion } from "./../../../components/ReferencialesFilters/TipoProduccion/FilterTipoProduccion";
import { FilterEstadoInicioProgramadoProduccion } from "./../../../components/ReferencialesFilters/Produccion/FilterEstadoInicioProgramadoProduccion";
import { useForm } from "./../../../hooks/useForm";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import { TextField } from "@mui/material";
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import { AccionesProduccionLote } from "./../../components/AccionesProduccionLote";
import { updateFechasProduccion } from "./../../helpers/produccion_lote/updateFechasProduccion";
import { Link } from "react-router-dom";
import axios from "axios";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
//import PDFExample from "../../pdf/PDFExample";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import ReactDOM from "react-dom"; // Importa ReactDOM
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import dataj from "./data.json";
import logo from "./emaran.png";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SvgIcon from "@mui/material/SvgIcon";
import iconAddFile from "../../../../src/assets/add-file-icon.svg";
import iconReturns from "../../../../src/assets/easy_returns.svg";
import ButtonPdf from "./ButtonPdf";
import { getProduccionLoteWithAgregacionesById } from "./../../helpers/produccion_lote/getProduccionLoteWithAgregacionesById";
import config from "../../../config";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BlockIcon from "@mui/icons-material/Block";

const domain = config.API_URL;

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

function _parseInt(str, property) {
  // console.log(str)
  if (str.canProdAgr) {
    str.canReqDet = str.canProdAgr;
  }
  if (str.canTotProgProdFin) {
    str.canReqDet = str.canTotProgProdFin;
  }

  if (property) {
    str.canReqDet = str[property];
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

const PDFExample = ({ data, show }) => {
  console.log(data);
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
          <View style={styles.section}>
            <View style={styles.container}>
              <Image
                src={logo}
                style={{ ...styles.logo, marginTop: -105, marginLeft: 20 }}
              />
            </View>

            <View style={{ ...styles.row, marginTop: -10 }}>
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
                  Producto Intermedio: {data.result.produccion.nomProd}
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
                  Fecha de Inicio Programado:{" "}
                  {data.result.produccion.fecProdIniProg}
                </Text>
                ,
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
                  Fecha de Fin Programado:{" "}
                  {data.result.produccion.fecProdFinProg}
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
                  Fecha de Vencimiento Lt:{" "}
                  {data.result.produccion.fecVenLotProd}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginTop: 2,
                    marginLeft: 20,
                  }}
                >
                  Observaciones
                </Text>
                <View
                  style={{
                    padding: 1,
                    fontWeight: "bold",
                    maxWidth: "90%",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#000",
                    height: 25,
                    marginTop: 2,
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={{
                      ...styles.content,
                      fontSize: 9,
                      marginLeft: 10,
                      marginRight: 0,
                      paddingRight: 0,
                      inlineSize: "50px",
                      overflowWrap: "break-word",
                      maxWidth: 275,
                      maxHeight: 275,
                    }}
                  >
                    {data.result.produccion.obsProd}
                  </Text>
                </View>
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
                    ORDEN DE PROCESO
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
                        ...styles.gridContent,
                        marginLeft: 50,
                        marginTop: 10,
                      }}
                    >
                      {data.result.produccion.numop}
                    </Text>
                  </View>

                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 10,
                      backgroundColor: "#d8dbe3",
                      width: 220,
                      height: 70,
                      borderRadius: 5,
                      marginRight: 20,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                        maxWidth: "100%",
                      }}
                    >
                      Tipo de Producción: {data.result.produccion.desProdTip}
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Número de Lote: {data.result.produccion.codLotProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                      }}
                    >
                      Peso Total de Lote:{" "}
                      {parseFloat(data.result.produccion.canLotProd).toFixed(
                        2
                      ) + " KG"}
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Peso Programado:{" "}
                      {parseFloat(
                        data.result.produccion.klgTotalLoteProduccion
                      ).toFixed(2) + " KG"}
                    </Text>

                    {/**
                       <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Total Unidades: 
                      {data.result.produccion.totalUnidadesLoteProduccion}
                    </Text>
                       */}
                  </View>

                  <Text
                    style={{
                      ...styles.content,
                      marginLeft: 130,
                      marginTop: -10,
                      maxWidth: "100%",
                      fontSize: 5,
                    }}
                  >
                    Fecha de Creación: {data.result.produccion.fecCreProd}
                  </Text>
                </View>
              </View>
            </View>

            {<DetalleOrden data={data} />}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

const DetalleOrden = ({ data }) => {
  return (
    <>
      <View>
        <Text
          style={{
            ...styles.title,
            fontWeight: "bold",
            fontSize: 7,
            marginLeft: -450,
            marginTop: -2,
          }}
        >
          Producto Final
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.greenBackground]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}> N°</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text style={{ ...styles.gridTitle, flex: 1 }}>Código</Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: "center",
                }}
              >
                Descripción de Item
              </Text>
              <Text style={styles.gridTitle}>U.M</Text>
              <Text style={styles.gridTitle}>Cantidad</Text>
            </View>
            {data.result.productos_finales?.map((producto, index) => (
              <View
                key={index}
                style={[
                  styles.gridRow,
                  index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                ]}
              >
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.id}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.codProd}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 1 }}>
                  {producto.codProd2}
                </Text>
                <Text
                  style={{
                    ...styles.gridContent_p,
                    flex: 4,
                    textAlign: "left",
                  }}
                >
                  {producto.nomProd}
                </Text>
                <Text style={styles.gridContent_p}>{producto.simMed}</Text>
                <Text style={styles.gridContent_num}>
                  {_parseInt(producto)}
                </Text>{" "}
                {/** producto.canTotProgProdFin */}
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
            marginTop: -12,
          }}
        >
          Detalle Envasado
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.green_]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Código
              </Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: "center",
                  //border: "1px solid black",
                }}
              >
                Descripción de Item
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 7,
                  maxWidth: "30px",
                  //border: "1px solid black",
                }}
              >
                U.M
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Cantidad
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Total
              </Text>
            </View>
            {data.result?.requisiciones
              ?.find((req) => req.desAre === "Envasado")
              ?.detalles?.map((detalle, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridRow,
                    index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                  ]}
                >
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.prodFCode}
                  </Text>
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.codProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 5.5,
                      //border: "1px solid black",
                      maxWidth: "40px",
                    }}
                  >
                    {detalle.codProd2}
                  </Text>
                  <Text
                    style={{
                      ...styles.gridContent_p,
                      flex: 4,
                      textAlign: "left",
                      //border: "1px solid black",
                    }}
                  >
                    {detalle.nomProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 5.5,
                      maxWidth: "25px",
                      //border: "1px solid black",
                    }}
                  >
                    {detalle.simMed}
                  </Text>
                  {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 6.5,
                      maxWidth: "40px",
                      //border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, "canReqDet")}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 6.5,
                      maxWidth: "40px",
                      //border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, "acu")}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {data.result?.requisiciones?.find((req) => req.desAre === "Envasado")
          ?.resumenProductos?.length && (
          <>
            <Text
              style={{
                ...styles.title,
                fontWeight: "bold",
                fontSize: 7,
                marginLeft: -410,
                marginTop: -12,
              }}
            >
              Acumulacion de envasado
            </Text>
            <View style={{ ...styles.section, marginTop: -25 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text style={styles.gridTitle}>Código</Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 4,
                      textAlign: "left",
                    }}
                  >
                    Descripción de Item
                  </Text>
                  <Text style={styles.gridTitle}>U.M</Text>
                  <Text style={styles.gridTitle}>Total</Text>
                </View>
                {data.result?.requisiciones
                  ?.find((req) => req.desAre === "Envasado")
                  ?.resumenProductos.map((detalle, index) => (
                    <View
                      key={index}
                      style={[
                        styles.gridRow,
                        ...[{ backgroundColor: "#a4a8b0" }],
                      ]}
                    >
                      <Text style={styles.gridContent_p}>
                        {detalle.codProd2}
                      </Text>
                      <Text
                        style={{
                          ...styles.gridContent_p,
                          flex: 4,
                          textAlign: "left",
                        }}
                      >
                        {detalle.nomProd}
                      </Text>
                      <Text style={styles.gridContent_p}>{detalle.simMed}</Text>
                      <Text style={styles.gridContent_num}>
                        {_parseInt(detalle, "acu")}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}

        <Text
          style={{
            ...styles.title,
            fontWeight: "bold",
            fontSize: 7,
            marginLeft: -440,
            marginTop: -12,
          }}
        >
          Detalle Encajado
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.yellow_]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Aso</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  // border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Código
              </Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: "center",
                  //border: "1px solid black",
                }}
              >
                Descripción de Item
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 7,
                  maxWidth: "30px",
                  //border: "1px solid black",
                }}
              >
                U.M
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Cantidad
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 7,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                Total
              </Text>
            </View>
            {data.result.requisiciones
              .find((req) => req.desAre === "Encajado")
              ?.detalles?.map((detalle, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridRow,
                    index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                  ]}
                >
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.prodFCode}
                  </Text>
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.codProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 5.5,
                      //border: "1px solid black",
                      maxWidth: "40px",
                    }}
                  >
                    {detalle.codProd2}
                  </Text>
                  <Text
                    style={{
                      ...styles.gridContent_p,
                      flex: 4,
                      textAlign: "left",
                      //border: "1px solid black",
                    }}
                  >
                    {detalle.nomProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 5.5,
                      maxWidth: "25px",
                      //border: "1px solid black",
                    }}
                  >
                    {detalle.simMed}
                  </Text>
                  {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 6.5,
                      maxWidth: "40px",
                      //border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle)}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 6.5,
                      maxWidth: "40px",
                      //border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, "acu")}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {data.result?.requisiciones?.find((req) => req.desAre === "Encajado")
          ?.resumenProductos?.length && (
          <>
            <Text
              style={{
                ...styles.title,
                fontWeight: "bold",
                fontSize: 7,
                marginLeft: -410,
                marginTop: -12,
              }}
            >
              Acumulacion de Encajado
            </Text>
            <View style={{ ...styles.section, marginTop: -25 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.yellow_]}>
                  <Text style={styles.gridTitle}>Código</Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 4,
                      textAlign: "center",
                    }}
                  >
                    Descripción de Item
                  </Text>
                  <Text style={styles.gridTitle}>U.M</Text>
                  <Text style={styles.gridTitle}>Total</Text>
                </View>
                {data.result?.requisiciones
                  ?.find((req) => req.desAre === "Encajado")
                  ?.resumenProductos.map((detalle, index) => (
                    <View
                      key={index}
                      style={[
                        styles.gridRow,
                        ...[{ backgroundColor: "#a4a8b0" }],
                      ]}
                    >
                      <Text style={styles.gridContent_p}>
                        {detalle.codProd2}
                      </Text>
                      <Text
                        style={{
                          ...styles.gridContent_p,
                          flex: 4,
                          textAlign: "left",
                        }}
                      >
                        {detalle.nomProd}
                      </Text>
                      <Text style={styles.gridContent_p}>{detalle.simMed}</Text>
                      <Text style={styles.gridContent_num}>
                        {_parseInt(detalle, "acu")}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
};

const Agregations = ({ data }) => {
  //console.log(data.result?.agregaciones.detAgr);
  return (
    <>
      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -440,
          marginTop: 12,
        }}
      >
        agregaciones
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.green_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.4 }}> Cód Aso</Text>
            <Text style={{ ...styles.gridTitle, flex: 2 }}>Nombre</Text>
            <Text style={{ ...styles.gridTitle, flex: 1, textAlign: "center" }}>
              Motivo
            </Text>
            <Text style={{ ...styles.gridTitle, flex: 1, textAlign: "center" }}>
              Almecen destino
            </Text>
            <Text style={{ ...styles.gridTitle, flex: 1 }}>Fecha</Text>
            <Text style={{ ...styles.gridTitle, flex: 1 }}>Cantidad</Text>
          </View>
          {data.result?.agregaciones.detAgr?.map((detalle, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.4 }}>
                {detalle.id}
              </Text>
              <Text style={{ ...styles.gridContent_p, flex: 2 }}>
                {detalle.nomProd}
              </Text>
              <Text style={{ ...styles.gridContent_p, flex: 1 }}>
                {detalle.desProdAgrMot}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {detalle.nomAlm}
              </Text>
              <Text style={styles.gridContent_p}>{detalle.fecCreProdAgr}</Text>
              <Text style={styles.gridContent_num}>{_parseInt(detalle)}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
};
const generatePDF = (data, show) => {
  const windowName = data.result.produccion.numop;
  const newWindow = window.open("", windowName, "fullscreen=yes");
  ReactDOM.render(
    <PDFExample data={data} show={show} />,
    newWindow.document.body
  );
};

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ListProduccionLote = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataProduccionLote, setdataProduccionLote] = useState([]);
  const [dataProduccionLoteTemp, setdataProduccionLoteTemp] = useState([]);

  const [inputs, setInputs] = useState({
    producto: { label: "" },
    provedor: { label: "" },
    estado: { label: "" },
    tipoProduccion: { label: "" },
    estadoInicio: { label: "" },
    numeroOP: "",
    lotePrduccion: "",
  });

  // ESTADOS PARA EL MODAL
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [produccionSeleccionado, setProduccionSeleccionado] = useState(null);
  //-------------my modal windows----------------
  //const [modalIsOpen, setModalIsOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataSummary = async (id) => {
    try {
      let url;

      //console.log(window.location.hostname)
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      }

      const response = await axios.get(url);
      //console.log('Datos de la API:', response.data);
      setData(response.data); // Guardar los datos en el estado
      setOpen(true); // Abrir la ventana modal
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  //----------------------------------------------

  // filtros
  const {
    fecProdLotIni,
    fecProdLotFin,
    formState,
    setFormState,
    onInputChange,
  } = useForm({
    fecProdLotIni: "",
    fecProdLotFin: "",
  });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackDelete(true);
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setInputs({
      ...inputs,
      [name]: value,
    });
    //filter(value, name);
  };

  // Manejadores de cambios
  const handleFormFilterop = (event, name) => {
    const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
    filter(inputValue, name);
  };

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj,
    });
  };

  /************************************************** */

  const onChangeEstadoProduccion = (obj) => {
    setInputs({
      ...inputs,
      estado: obj,
    });
  };

  const onChangeTipoProduccion = (obj) => {
    setInputs({
      ...inputs,
      tipoProduccion: obj,
    });
  };

  const onChangeEstadoInicioProduccion = (obj) => {
    setInputs({
      ...inputs,
      estadoInicio: obj,
    });
    //filter(label, "filterEstadoInicioProgramado");
  };

  const onChangeDateFechaIniciado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaInicioProduccion");
  };

  const onChangeDateFechaIniciadoProgramado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaInicioProgramadoProduccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotIni: dateFormat });
    let body = {
      ...formState,
      fecProdLotIni: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotFin: dateFormat });
    let body = {
      ...formState,
      fecProdLotFin: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  useEffect(() => {
    let resultSearch = [];
    dataProduccionLote.map((data) => {
      if (
        (inputs.estado.label.includes(data.desEstPro) ||
          inputs.estado.label.length == 0) &&
        (inputs.tipoProduccion.label.includes(data.desProdTip) ||
          inputs.tipoProduccion.label.length == 0) &&
        (inputs.producto.label.includes(data.nomProd) ||
          inputs.producto.label.length == 0) &&
        (inputs.estadoInicio.label.includes(data.desProdIniProgEst) ||
          inputs.estadoInicio.label.length == 0) &&
        (data.numop.includes(inputs.numeroOP) || inputs.numeroOP.length == 0) &&
        (data.codLotProd?.includes(inputs.lotePrduccion) ||
          inputs.lotePrduccion.length == 0)
      ) {
        resultSearch.push({ ...data });
      }
    });
    setdataProduccionLoteTemp(resultSearch);
  }, [inputs, dataProduccionLote]);

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {};

  // ******** ACTUALIZACION DE FECHAS ********
  const onUpdateDatesProduccion = async (id, body) => {
    const resultPeticion = await updateFechasProduccion(id, body);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // cerramos el modal
      closeOpcionesProduccionLote();
      // Actualizamos la data
      obtenerDataProduccionLote();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  const getAgregationsByOrderProduccion = async (idLotProdc) => {
    try {
      let url;
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${idLotProdc}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${idLotProdc}`;
      }

      const response = await axios.get(url);
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      return error;
    }
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataProduccionLote = async (body = {}) => {
    const resultPeticion = await getProduccionLote(body);
    const { message_error, description_error, result } = resultPeticion;

    await Promise.all(
      result.map(async (obj) => {
        var resultPeticion = await getAgregationsByOrderProduccion(obj.id);
        const { result } = resultPeticion;
        const { agregaciones, produccion } = result;
        //console.log(agregaciones.detAgr)
        obj.agregaciones = agregaciones.detAgr;
      })
    );
    console.log(result);

    //return

    if (message_error.length === 0) {
      //console.log(result); // Imprimir los datos en la consola
      setdataProduccionLote(result);
      setdataProduccionLoteTemp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // ******* REQUISICION MOLIENDA DETALLE ********

  const closeOpcionesProduccionLote = () => {
    // ocultamos el modal
    setMostrarOpciones(false);
    // dejamos el null la data del detalle
    setProduccionSeleccionado(null);
  };

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showOpcionesProduccionLote = (idPosElement) => {
    const requisicionMoliendaDetalle = dataProduccionLoteTemp[idPosElement];
    // seteamos la data de la requisicion seleccionada
    setProduccionSeleccionado(requisicionMoliendaDetalle);
    // mostramos el modal
    setMostrarOpciones(true);
  };

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerDataProduccionLote();
  }, []);

  const handleButtonClick = async (id, show) => {
    try {
      let url;
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      }

      const response = await axios.get(url);
      console.log(response);
      var productosFinal =
        response.data.result.prodFinalWithAgreg.detAgr.filter(
          (obj) => obj.id == null
        );
      var productosFinal = productosFinal.map((obj) => obj.idProdFin);
      response.data.result.productos_finales =
        response.data.result.productos_finales.filter((obj) =>
          productosFinal.includes(obj.id)
        );

      response.data.result?.requisiciones?.map((req) => {
        if (req.desAre === "Envasado") {
          var productsEnvasado = req.detalles.reduce(
            (accumulator, currentValue) => {
              if (
                accumulator.some(
                  (obj) => obj.codProd2 === currentValue.codProd2
                )
              ) {
                accumulator.map((obj) => {
                  if (obj.codProd2 === currentValue.codProd2) {
                    currentValue.acu =
                      parseFloat(obj.acu) + parseFloat(currentValue.canReqDet);
                    currentValue.isDuplicated = true;
                    accumulator.push(currentValue);
                  }
                });
              } else {
                currentValue.acu = currentValue.canReqDet;
                accumulator.push(currentValue);
              }
              return accumulator;
            },
            []
          );
          req.detalles = productsEnvasado;
          productsEnvasado = productsEnvasado.filter((obj) => obj.isDuplicated);
          req.resumenProductos = removeDuplicates(productsEnvasado);
        }

        if (req.desAre === "Encajado") {
          // var productosEncajado = req.detalles.reduce(
          //   (accumulator, currentValue) => {
          //     if (
          //       accumulator.some(
          //         (obj) => obj.codProd2 === currentValue.codProd2
          //       )
          //     ) {
          //       // fragmento de codigo erroneo
          //       accumulator.map((obj) => {
          //         if (obj.codProd2 === currentValue.codProd2) {
          //           currentValue.acu =
          //             parseFloat(obj.acu) + parseFloat(currentValue.canReqDet);
          //           currentValue.isDuplicated = true;
          //           accumulator.push(currentValue);
          //         }
          //       });
          //     } else {
          //       currentValue.acu = currentValue.canReqDet;
          //       accumulator.push(currentValue);
          //     }
          //     return accumulator;
          //   },
          //   []
          // );
          // console.log(productosEncajado);
          // req.detalles = productosEncajado;
          // productosEncajado = productosEncajado.filter(
          //   (obj) => obj.isDuplicated
          // );
          // console.log(productosEncajado);
          // req.resumenProductos = removeDuplicates(productosEncajado);
          const totales = {};
          const repetidos = [];

          req.detalles.forEach((item) => {
            const { idProdt, canReqDet } = item;
            if (!totales[idProdt]) {
              totales[idProdt] = 0;
            } else {
              repetidos[idProdt] = { ...item, isDuplicated: true };
            }
            totales[idProdt] += parseFloat(canReqDet);
            item.acu = totales[idProdt];
          });

          const totalesFinales = Object.keys(repetidos).map((item) => ({
            ...item,
            acu: totales[item.idProdt],
          }));
          console.log("repetidos", repetidos);

          console.log(req.detalles);
          console.log(totalesFinales);
        }
      });

      generatePDF(response.data, show);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  function removeDuplicates(arr) {
    return arr.filter(
      ({ codProd2 }, index) =>
        arr.map((obj) => obj.codProd2).indexOf(codProd2) === index
    );
  }

  const resetData = () => {
    setdataProduccionLoteTemp(dataProduccionLote);
    setInputs({
      producto: { label: "" },
      provedor: { label: "" },
      estado: { label: "" },
      tipoProduccion: { label: "" },
      estadoInicio: { label: "" },
      numeroOP: "",
      lotePrduccion: "",
    });
  };

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                Desde
                <FechaPickerMonth onNewfecEntSto={onChangeDateStartData} />
              </div>
              <div className="col-4">
                Hasta
                <FechaPickerMonth onNewfecEntSto={onChangeDateEndData} />
              </div>

              <div className="col-2 d-flex align-items-end">
                <button onClick={resetData} className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-clockwise"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              <div className="col-6">
                <Link
                  to={"/produccion/produccion-lote/crear"}
                  className="btn btn-primary d-inline-flex justify-content-end align-items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-circle-fill me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                  </svg>
                  Agregar
                </Link>
              </div>
              <div className="col-3">
                <button className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
                  </svg>
                </button>
              </div>
              <div className="col-3">
                <button className="btn btn-danger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-pdf-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                    <path
                      fillRule="evenodd"
                      d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "rgba(96, 96, 96)",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell align="left" width={70}>
                      <b>Lote</b>
                      <TextField
                        name="lotePrduccion"
                        value={inputs.lotePrduccion}
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    {/**********Agregando numero OP *************** */}
                    <TableCell align="left" width={140}>
                      <b>Número OP</b>
                      <TextField
                        name="numeroOP"
                        value={inputs.numeroOP}
                        onChange={handleFormFilter}
                        type="text"
                        size="small"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            textTransform: "uppercase",
                            color: "black",
                            background: "white",
                          },
                          inputProps: {
                            pattern: "[A-Z0-9]*",
                          },
                        }}
                      />
                    </TableCell>
                    {/**********Agregando numero OP *************** */}

                    <TableCell align="left" width={140}>
                      <b>Producto</b>
                      <FilterProductoProduccion
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>

                    <TableCell align="left" width={100}>
                      <b>Estado</b>
                      <FilterEstadoProduccion
                        onNewInput={onChangeEstadoProduccion}
                        inputs={inputs}
                      />
                    </TableCell>
                    {/* <TableCell align="left" width={100}>
                      <b>Tipo</b>
                      <FilterTipoProduccion
                        onNewInput={onChangeTipoProduccion}
                        inputs={inputs}
                      />
                    </TableCell> */}
                    <TableCell align="left" width={140}>
                      <b>Inicio</b>
                      {/* *
                      <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaIniciado}
                      /> */}
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Inicio Programado</b>
                      {/**
                         <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaIniciadoProgramado}
                      />
                         */}
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Estado Inicio</b>
                      <FilterEstadoInicioProgramadoProduccion
                        onNewInput={onChangeEstadoInicioProduccion}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Cant. Agreg</b>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataProduccionLoteTemp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLotProd}
                        </TableCell>
                        {/* Empty cell for "Número OP" */}
                        <TableCell align="left">{row.numop}</TableCell>
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="left">{row.desEstPro}</TableCell>
                        {/* <TableCell align="left">{row.desProdTip}</TableCell> */}
                        <TableCell align="center">{row.fecProdIni}</TableCell>
                        <TableCell align="center">
                          {row.fecProdIniProg}
                        </TableCell>
                        <TableCell align="left">
                          {row.desProdIniProgEst}
                        </TableCell>
                        <TableCell align="center" width={10}>
                          {row.agregaciones.length}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                showOpcionesProduccionLote(i);
                              }}
                              className="btn btn-warning me-2"
                              data-toggle="modal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-plus-circle-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                              </svg>
                            </button>
                          </div>

                          <div>
                            <div className="btn-toolbar">
                              <button
                                onClick={async () => {
                                  obtenerDataSummary(row.id);
                                  //console.log("show modal windows",row)
                                  //  const resultPeticion = await getProduccionLoteWithAgregacionesById(
                                  //   row.id
                                  //   );
                                  //   const { message_error, description_error, result } = resultPeticion;
                                  //   const { canLotProd, codLotProd, detAgr,
                                  //     desEstPro,desProdTip } = result[0];
                                  //   console.log(result)
                                  //   const agregations = []
                                  //   const requisiciones = []
                                  //   const productos_finales = []
                                  //   const produccion = {
                                  //     canLotProd: "100.0",
                                  //     codLotProd: "66",
                                  //     codProd: null,
                                  //     codProd2: "230207",
                                  //     desEstPro: "Produccion iniciada",
                                  //     desProdTip: "Polvos",
                                  //     fecCreProd: "2023-08-22 07:29:47",
                                  //     fecProdFinProg: "2023-08-24 07:21:43",
                                  //     fecProdIniProg: "2023-08-22 07:21:43",
                                  //     fecVenLotProd: "2023-09-06 00:00:00",
                                  //     id: 185,
                                  //     idProdEst: 1,
                                  //     idProdTip: 1,
                                  //     idProdt: 207,
                                  //     klgLotProd: "1.000",
                                  //     nomProd: "AJO MOLIDO",
                                  //     numop: "OP202308184",
                                  //     obsProd: ""
                                  //   }
                                }}
                                className="btn btn-success me-2"
                              >
                                {/* Contenido del botón */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-eye-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                                </svg>
                              </button>
                            </div>

                            {/* Ventana modal */}
                            <Dialog
                              open={open}
                              onClose={() => setOpen(false)}
                              BackdropProps={{
                                invisible: true, // Hace que el fondo no sea visible
                              }}
                              PaperProps={{
                                style: {
                                  width: "800px",
                                  height: "600px",
                                  backgroundColor: "#a7c8d1",
                                  borderRadius: "15px",
                                }, // Aquí puedes ajustar el tamaño de la ventana modal
                              }}
                            >
                              <DialogTitle
                                style={{
                                  textAlign: "center",
                                  fontSize: "20px",
                                  color: "black",
                                  fontWeight: "bold",
                                  backgroundColor: "#37c6ed",
                                }}
                              >
                                PRODUCCIÓN LOTE
                              </DialogTitle>
                              <DialogContent>
                                <form
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                  }}
                                >
                                  {/* Columna 1 */}
                                  <div>
                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        marginTop: "10px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>NÚMERO DE LOTE</strong>{" "}
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          data?.result?.produccion?.codLotProd
                                        }
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        marginTop: "10px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>NÚMERO OP</strong>{" "}
                                      <input
                                        type="text"
                                        readOnly
                                        value={data?.result?.produccion?.numop}
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>PRODUCTO</strong>{" "}
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          data?.result?.produccion?.nomProd
                                        }
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>PESO DE LOTE TOTAL</strong>{" "}
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          data?.result?.produccion?.canLotProd
                                        }
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>TIPO PRODUCCIÓN</strong>
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          data?.result?.produccion?.desProdTip
                                        }
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        fontSize: "12px",
                                        width: "200px",
                                      }}
                                    >
                                      <strong>FECHA DE VENCIMIENTO</strong>{" "}
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          data?.result?.produccion
                                            ?.fecVenLotProd
                                        }
                                        style={{
                                          width: "100%",
                                          backgroundColor: "#e3e3e3",
                                          borderRadius: "5px",
                                          paddingLeft: "10px",
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        marginTop: "10px",
                                        fontSize: "16px",
                                        width: "200px",
                                        backgroundColor: "yellow",
                                        borderRadius: "5px",
                                        paddingLeft: "10px",
                                      }}
                                    >
                                      <strong>PRODUCTOS FINALES</strong>
                                    </div>

                                    <ul>
                                      {data?.result?.productos_finales.map(
                                        (producto) => (
                                          <li
                                            key={producto.id}
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "bold",
                                              marginBottom: "10px",
                                              backgroundColor: "#ecf0e6",
                                              borderRadius: "5px",
                                              paddingLeft: "10px",
                                            }}
                                          >
                                            <strong></strong> {producto.nomProd}
                                            <div
                                              style={{
                                                backgroundColor: "white",
                                                borderRadius: "5px",
                                              }}
                                            >
                                              {/**  <strong> Cantidad ProdFin:</strong> {producto.canTotProgProdFin} */}
                                              <strong>
                                                {" "}
                                                Cantidad ProdFin:
                                              </strong>{" "}
                                              {_parseInt(producto)}
                                              <br />
                                              <strong> Code:</strong>{" "}
                                              {producto.id}
                                            </div>
                                          </li>
                                        )
                                      )}
                                    </ul>

                                    <div
                                      style={{
                                        marginBottom: "5px",
                                        marginTop: "10px",
                                        fontSize: "16px",
                                        width: "200px",
                                        backgroundColor: "red",
                                        borderRadius: "5px",
                                        color: "white",
                                        textAlign: "center",
                                        height: "25px",
                                      }}
                                    >
                                      <strong>REQUISICIONES</strong>
                                    </div>

                                    {/* Filtrar productos finales por requisición "Envasado" */}
                                    {data?.result?.requisiciones
                                      .filter(
                                        (requisicion) =>
                                          requisicion.desAre === "Envasado"
                                      )
                                      .map((requisicion) => (
                                        <div key={requisicion.id}>
                                          <h4
                                            style={{
                                              fontSize: "18px",
                                              marginTop: "10px",
                                              backgroundColor: "green",
                                              borderRadius: "5px",
                                              textAlign: "center",
                                              width: "110px",
                                              color: "white",
                                              height: "25px",
                                            }}
                                          >
                                            {requisicion.desAre}
                                          </h4>
                                          <ul>
                                            {requisicion.detalles?.map(
                                              (detalle) => (
                                                <li
                                                  key={detalle.id}
                                                  style={{
                                                    fontSize: "10px",
                                                    backgroundColor: "#93ff91",
                                                    borderRadius: "5px",
                                                    paddingLeft: "10px",
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      marginBottom: "0px",
                                                      fontSize: "12px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    <strong></strong>
                                                    {detalle.nomProd}
                                                  </div>
                                                  <div
                                                    style={{
                                                      marginBottom: "5px",
                                                      fontSize: "12px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    {/**_parseInt(detalle) + " - "+detalle.canReqDet + " - " +detalle.simMed} */}
                                                    <strong>CANTIDAD : </strong>
                                                    {_parseInt(detalle)}
                                                    <br />
                                                    <strong> Code:</strong>{" "}
                                                    {detalle.prodFCode}
                                                  </div>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      ))}

                                    {/* Filtrar productos finales por requisición "Encajonado" */}
                                    {data?.result?.requisiciones
                                      .filter(
                                        (requisicion) =>
                                          requisicion.desAre === "Encajado"
                                      )
                                      .map((requisicion) => (
                                        <div key={requisicion.id}>
                                          <h4
                                            style={{
                                              fontSize: "18px",
                                              marginTop: "10px",
                                              backgroundColor: "#d1c73f",
                                              borderRadius: "5px",
                                              textAlign: "center",
                                              width: "110px",
                                              color: "white",
                                              height: "25px",
                                            }}
                                          >
                                            {requisicion.desAre}
                                          </h4>
                                          <ul>
                                            {requisicion.detalles?.map(
                                              (detalle) => (
                                                <li
                                                  key={detalle.id}
                                                  style={{
                                                    fontSize: "10px",
                                                    backgroundColor: "#fcfc4e",
                                                    borderRadius: "5px",
                                                    paddingLeft: "10px",
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      marginBottom: "0px",
                                                      fontSize: "12px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    <strong></strong>
                                                    {detalle.nomProd}
                                                  </div>
                                                  <div
                                                    style={{
                                                      marginBottom: "5px",
                                                      fontSize: "12px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    <strong>CANTIDAD : </strong>
                                                    {_parseInt(detalle)}
                                                    <br />
                                                    <strong> Code:</strong>{" "}
                                                    {detalle.prodFCode}
                                                  </div>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      ))}
                                  </div>
                                </form>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setOpen(false)}>
                                  Cerrar
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </div>

                          <div
                            className="btn btn-primary me-2 btn"
                            onClick={() => {
                              if (row.agregaciones?.length) {
                                window.open(
                                  `/produccion/produccion-lote/produccion-agregacion?idLotProdc=${row.id}`,
                                  "_blank"
                                );
                              }
                            }}
                          >
                            {row.agregaciones.length ? (
                              <FormatListBulletedIcon />
                            ) : (
                              <BlockIcon />
                            )}
                          </div>

                          <div>
                            <div className="btn-toolbar">
                              {/**
                               <ButtonPdf
                                id={row.id}
                                handleButtonClick={handleButtonClick}
                              />
                              */}
                              <button
                                onClick={() => {
                                  handleButtonClick(row.id, "detalleOrden");
                                }}
                                className="btn btn-primary me-2 btn"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-printer-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M0 2.5A2.5 2.5 0 0 1 2.5 0h11A2.5 2.5 0 0 1 16 2.5V8h-2V2.5A.5.5 0 0 0 13.5 2h-11a.5.5 0 0 0-.5.5V8H0V2.5zM1 9h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zm2 1v2h10v-2H3zm2 3v2h6v-2H5z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div
                            className="btn-toolbar btn btn-primary me-2 btn"
                            onClick={() => {
                              window.open(
                                `/almacen/productos-lote/crear?idLotProdc=${row.id}`,
                                "_blank"
                              );
                            }}
                          >
                            <AppRegistrationIcon />
                          </div>

                          <div
                            className="btn btn-primary me-2 btn"
                            onClick={() => {
                              window.open(
                                `/almacen/produccion-devoluciones/crear?idLotProdc=${row.id}`,
                                "_blank"
                              );
                            }}
                          >
                            <img src={iconReturns} height={22} width={22} />
                          </div>

                          <div
                            className="btn btn-primary me-2 btn"
                            onClick={() => {
                              window.open(
                                `/almacen/produccion-agregaciones/crear?idLotProdc=${row.id}`,
                                "_blank"
                              );
                            }}
                          >
                            <img src={iconAddFile} height={22} width={22} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataProduccionLoteTemp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          {mostrarOpciones && (
            <AccionesProduccionLote
              detalle={produccionSeleccionado}
              onClose={closeOpcionesProduccionLote}
              onUpdateDatesProduccion={onUpdateDatesProduccion}
            />
          )}
        </div>
      </div>
    </>
  );
};
