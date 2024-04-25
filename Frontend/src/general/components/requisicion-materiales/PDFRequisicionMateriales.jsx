import React from 'react'
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  Image
} from '@react-pdf/renderer'
import logo from '../emaran.png'
import { stylesPDF } from '../stylePDF'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

const styles = stylesPDF

export const PDFRequisicionMateriales = ({ data }) => {
  const { requisicion } = data
  const { detReq } = requisicion

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
              {/* DETALLE DE LA PRODUCCIÓN */}
              <View style={{ ...styles.row, marginTop: -40, marginLeft: 250 }}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.content,
                      fontWeight: 'bold',
                      borderRadius: 5,
                      fontSize: 16,
                      marginBottom: 1,
                      backgroundColor: '#d8e86f',
                      padding: 5,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingLeft: 20
                    }}
                  >
                    Requisición de materiales
                  </Text>
                  <View
                    style={{
                      ...styles.row,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        // ...styles.gridContent,
                        marginLeft: 20,
                        marginTop: 10
                      }}
                    >
                      {requisicion.codReqMat}
                    </Text>
                  </View>

                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 5,
                      backgroundColor: '#d8dbe3',
                      width: 220,
                      height: 70,
                      borderRadius: 5,
                      marginRight: 5
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                        maxWidth: '100%'
                      }}
                    >
                      Estado requisicion: {requisicion.desReqEst}
                    </Text>

                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: '100%'
                      }}
                    >
                      Fecha de pedido: {requisicion.fecCreReqMat}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: '100%'
                      }}
                    >
                      Motivo: {requisicion.desMotReqMat}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: '100%'
                      }}
                    >
                      Área: {requisicion.desAre}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ ...styles.section, marginTop: -10 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
                  <Text style={{ ...styles.gridTitle, flex: 0.7 }}>LOTE</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 7,
                      maxWidth: '40px'
                    }}
                  >
                    EMAPROD
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 3,
                      textAlign: 'center'
                    }}
                  >
                    Descripción de Item
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 7,
                      maxWidth: '30px'
                    }}
                  >
                    U.M
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 7,
                      maxWidth: '40px'
                    }}
                  >
                    Cantidad
                  </Text>
                </View>
                {detReq.map((detalle, index) => {
                  const { codLotProd, fecVenLotProd, idProdc } = detalle
                  const textInfoLote = idProdc === null ? 'Sin lote' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`
                  return (
                    <View
                      key={index}
                      style={[
                        styles.gridRow,
                        index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
                      ]}
                    >
                      <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                        {detalle.codProd}
                      </Text>
                      <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                        {textInfoLote}
                      </Text>
                      <Text
                        style={{
                          flex: 2,
                          textAlign: 'center',
                          fontSize: 5.5,
                          maxWidth: '40px'
                        }}
                      >
                        {detalle.codProd2}
                      </Text>
                      <Text
                        style={{
                          ...styles.gridContent_p,
                          flex: 4
                        }}
                      >
                        {detalle.nomProd}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: 5.5,
                          maxWidth: '25px'
                        }}
                      >
                        {detalle.simMed}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: 6.5,
                          maxWidth: '40px'
                        }}
                      >
                        {detalle.canReqMatDet}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  )
}
