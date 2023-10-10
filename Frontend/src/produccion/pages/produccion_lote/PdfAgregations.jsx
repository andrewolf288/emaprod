import React from "react";

const PdfAgregations = ({ data }) => {
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
                    ORDEN DE PRODUCCIÓN
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
                      {data.result.produccion.canLotProd + " KG"}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Tipo de Producción: {data.result.produccion.desProdTip}
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
                    <Text style={{ ...styles.gridTitle, flex: 0.7 }}>
                      Cód Ref
                    </Text>
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
                      <Text style={styles.gridContent_p}>
                        {producto.simMed}
                      </Text>
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
                    <Text style={{ ...styles.gridTitle, flex: 0.7 }}>
                      {" "}
                      Cód Aso
                    </Text>
                    <Text style={{ ...styles.gridTitle, flex: 0.7 }}>
                      Cód Ref
                    </Text>
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
                    <Text style={styles.gridTitle}>Cantidad</Text>
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
                        <Text style={styles.gridContent_p}>
                          {detalle.simMed}
                        </Text>
                        {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                        <Text style={styles.gridContent_num}>
                          {_parseInt(detalle)}
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
                  marginTop: -12,
                }}
              >
                Detalle Encajado
              </Text>
              <View style={{ ...styles.section, marginTop: -25 }}>
                <View style={styles.gridContainer}>
                  <View style={[styles.gridHeader, styles.yellow_]}>
                    <Text style={{ ...styles.gridTitle, flex: 0.7 }}>
                      Cód Aso
                    </Text>
                    <Text style={{ ...styles.gridTitle, flex: 0.7 }}>
                      Cód Ref
                    </Text>
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
                    <Text style={styles.gridTitle}>Cantidad</Text>
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
                        <Text style={styles.gridContent_p}>
                          {detalle.simMed}
                        </Text>
                        {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                        <Text style={styles.gridContent_num}>
                          {_parseInt(detalle)}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PdfAgregations;
