import { ListAgregacion } from "./ListAgregacion";
import { AtenderAgregaciones } from "./AtenderAgregaciones";
import { AgregarAgregacionV2 } from "./AgregarAgregacionV2";

export const RouterAlmacenAgregaciones = [
  {
    path: "",
    element: <ListAgregacion />,
  },
  {
    path: "crear",
    element: <AgregarAgregacionV2 />,
  },
  {
    path: "assist-agregation/:id/:codAgre",
    element: <AtenderAgregaciones />,
  },
];
