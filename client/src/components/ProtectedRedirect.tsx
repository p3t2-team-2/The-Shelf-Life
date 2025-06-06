import { Navigate } from "react-router-dom";
import Auth from "../utils/auth";

const ProtectedRedirect = () => {
  return Auth.loggedIn() ? <Navigate to="/home" /> : <Navigate to="/login" />;
};

export default ProtectedRedirect;
