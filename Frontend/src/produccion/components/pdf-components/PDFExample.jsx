import React from "react";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  Image,
} from "@react-pdf/renderer";
import logo from "../emaran.png";
import { DetalleOrden } from "./DetalleOrden";
import { stylesPDF } from "./stylePDF";

const styles = stylesPDF;

export const PDFExample = ({ data, show }) => {
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
