import ListSalidaStock from "./ListSalidaStock";
import { AgregarSalidaStock } from "./AgregarSalidaStock";
import ActualizarSalidaStock from "./ActualizarSalidaStock";

export const RouterAlmacenSalidasStock = [
  {
    path: "",
    element: <ListSalidaStock />,
  },
  {
    path: "crear",
    element: <AgregarSalidaStock />,
  },
  {
    path: "actualizar",
    element: <ActualizarSalidaStock />,
  },
];
