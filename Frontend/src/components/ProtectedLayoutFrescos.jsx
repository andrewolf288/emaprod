import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavFrescos from "./../frescos/components/NavFrescos";

export const ProtectedLayoutFrescos = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();
  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    if (idAre !== 7) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavFrescos />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
