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
import { PDFRequisicionAgregacion } from "./PDFRequisicionAgregacion";

const styles = stylesPDF;

export const PDFAgregaciones = ({ data, show, index }) => {
  const { produccion, requisicion } = data;
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

            <View style={{ ...styles.row, marginTop: -10 }}>
              {/* DETALLE DE LA REQUISICION DE LA AGREGACIÓN */}
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
                  Presentación intermedio: {produccion.nomProd}
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
                  Fecha de Inicio Programado: {produccion.fecProdIniProg}
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
                  Fecha de Fin Programado: {produccion.fecProdFinProg}
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
                  Fecha de Vencimiento Lt: {produccion.fecVenLotProd}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginTop: 2,
                    marginLeft: 20
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
                    marginLeft: 20
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
                      maxHeight: 275
                    }}
                  >
                    {produccion.obsProd}
                  </Text>
                </View>
              </View>

              {/* DETALLE DE LA PRODUCCIÓN */}
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
                      paddingLeft: 70
                    }}
                  >
                    AGREGACIÓN
                  </Text>
                  <Text
                    style={{
                      ...styles.gridContent,
                      flexDirection: "row",
                      marginLeft: 30,
                      marginTop: 10,
                      textAlign: "center"
                    }}
                  >
                    {requisicion["correlativo"]}
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
                      Tipo de Producción: {produccion.desProdTip}
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%"
                      }}
                    >
                      Número de Lote: {produccion.codLotProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4
                      }}
                    >
                      Cantidad total de unidades:{" "}
                      {parseInt(produccion.totalUnidadesLoteProduccion) +
                        " UND"}
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%"
                      }}
                    >
                      Peso Programado:{" "}
                      {parseFloat(produccion.klgTotalLoteProduccion).toFixed(
                        2
                      ) + " KG"}
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
                    Fecha de Creación: {requisicion.fecCreReqAgr}
                  </Text>
                </View>
              </View>
            </View>

            {/* DETALLE DE REQUISICION DE AGREGACION */}
            <PDFRequisicionAgregacion requisicion={requisicion} />
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};
