import { CreateRequerimientoSalidaCalidad } from "./CreateRequerimientoSalidaCalidad";
import { ListRequerimientoSalidaCalidad } from "./ListRequerimientoSalidaCalidad";
// import ActualizarEntradaStock from "./ActualizarEntradaStock";

export const RouterRequirimientoSalidaCalidad = [
  {
    path: "",
    element: <ListRequerimientoSalidaCalidad />
  },
  {
    path: "crear",
    element: <CreateRequerimientoSalidaCalidad />
  }
];
