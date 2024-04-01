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
import { PDFRequisicionDevolucionMaterialesDetalle } from './PDFRequisicionDevolucionMaterialesDetalle'

const styles = stylesPDF

export const PDFDevolucionesRequisicionMateriales = ({ data }) => {
  const { requisicion, acumulado } = data
  console.log(requisicion)
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
                        {requisicion.correlativo}
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
                      Fecha de pedido: {requisicion.fecCreReqDevMat}
                      </Text>
                      <Text
                        style={{
                          ...styles.content,
                          marginLeft: 10,
                          marginTop: 4,
                          maxWidth: '100%'
                        }}
                      >
                      Fecha de completado: {requisicion.fecComReqDevMat ? requisicion.fecComReqDevMat : '' }
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* DETALLE DE REQUISICION DE AGREGACION */}
            <PDFRequisicionDevolucionMaterialesDetalle
              requisicion={requisicion}
              acumulado={acumulado}
            />
          </View>
        </Page>
      </Document>
    </PDFViewer>
  )
}
