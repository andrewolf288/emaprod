import React from "react";
import { Text, View } from "@react-pdf/renderer";

export const Agregations = ({ data }) => {
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
