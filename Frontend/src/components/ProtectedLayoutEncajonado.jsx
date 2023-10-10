import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavEncajonado from "./../encajonado/components/NavEncajonado";

export const ProtectedLayoutEncajonado = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();
  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    if (idAre !== 6) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavEncajonado />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
