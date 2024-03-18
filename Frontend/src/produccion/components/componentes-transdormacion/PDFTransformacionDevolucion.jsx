import React from 'react'
import { Text, View } from '@react-pdf/renderer'

export const PDFTransformacionDevolucion = ({ requisicion, styles }) => {
  const requisicionDevolucion = requisicion[0]
  const { detReqDev } = requisicionDevolucion
  return (
    <View>
      <Text
        style={{
          ...styles.title,
          fontWeight: 'bold',
          fontSize: 7,
          marginLeft: -435,
          marginTop: 10
        }}
      >
        DETALLE DEVOLUCION
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.green_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
            {/* <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text> */}
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                flex: 3,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              Motivo
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: 'center'
                // border: "1px solid black",
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
                // border: "1px solid black",
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
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              Cantidad
            </Text>
          </View>
          {detReqDev.map((detalle, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {requisicion.idProdFin}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'left',
                  fontSize: 5.5,
                  maxWidth: '40px'
                }}
              >
                {detalle.codProd2}
              </Text>
              <Text
                style={{
                  flex: 3,
                  textAlign: 'left',
                  fontSize: 5.5,
                  maxWidth: '40px'
                }}
              >
                {detalle.desProdDevMot}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  paddingLeft: 4,
                  textAlign: 'left'
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
                {detalle.canReqDevDet}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
