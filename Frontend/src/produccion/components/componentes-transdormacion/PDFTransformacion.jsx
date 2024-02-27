import React from "react";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  Image
} from "@react-pdf/renderer";
import logo from "../emaran.png";
import { stylesPDF } from "../pdf-components/stylePDF";
import { PDFTransformacionRequisicion } from "./PDFTransformacionRequisicion";
import { PDFTransformacionDevolucion } from "./PDFTransformacionDevolucion";

const styles = stylesPDF;

export const PDFTransformacion = ({ data }) => {
  const { requisicion, requisicionDevolucion, requisicionMateriales } = data;
  return (
    <PDFViewer width="100%" height="100%">
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            marginTop: 20,
            paddingTop: 20,
            paddingBottom: 40
          }}
        >
          <View style={styles.section}>
            {/* INSERTAMOS EL LOGO DE LA IMAGEN */}
            <View style={styles.container}>
              <Image
                src={logo}
                style={{ ...styles.logo, marginTop: -105, marginLeft: 20 }}
              />
            </View>
            {/* DATOS DE OPERACION */}
            <View style={{ ...styles.row, marginTop: -10 }}>
              {/* DETALLE DE PRODUCTOS TRANSFORMADOS */}
              <View style={styles.column}>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Presentación a transfomar: {requisicion.nomProd1}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Cantidad a transformar: {requisicion.canUndProdtOri}
                </Text>
                ,
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Presentación transformada: {requisicion.nomProd2}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Cantidad transformada: {requisicion.canUndProdtDes}
                </Text>
              </View>
              {/* DETALLE DE LOTE */}
              <View style={{ ...styles.row, marginTop: -40 }}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.content,
                      fontWeight: "bold",
                      borderRadius: 5,
                      fontSize: 16,
                      marginBottom: 1,
                      backgroundColor: "#d8e86f",
                      padding: 5,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingLeft: 48
                    }}
                  >
                    TRANSFORMACIÓN
                  </Text>
                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 25,
                      backgroundColor: "#d8dbe3",
                      width: 220,
                      height: 70,
                      borderRadius: 5,
                      marginRight: 20
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                        maxWidth: "100%"
                      }}
                    >
                      Tipo de Producción: Envasado y Encajado
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%"
                      }}
                    >
                      Número de Lote: {requisicion.codLotProd}
                    </Text>
                  </View>

                  <Text
                    style={{
                      ...styles.content,
                      marginLeft: 75,
                      marginTop: -5,
                      maxWidth: "100%",
                      fontSize: 8
                    }}
                  >
                    Fecha de Creación: {requisicion.fecCreOrdTrans}
                  </Text>
                </View>
              </View>
            </View>
            {/* REQUISICION DE MAERIALES */}
            <PDFTransformacionRequisicion
              requisicion={requisicionMateriales}
              styles={styles}
            />
            {/* REQUISICION DE DEVOLUCION */}
            <PDFTransformacionDevolucion
              requisicion={requisicionDevolucion}
              styles={styles}
            />
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};
