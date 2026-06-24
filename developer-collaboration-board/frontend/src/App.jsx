import { Navigate, Route, Routes } from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState } from "react";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  function handleAuthSuccess(newToken) {
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/board" /> : <Landing />}
      />
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/board" />
          ) : (
            <Login onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          token ? (
            <Navigate to="/board" />
          ) : (
            <Signup onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/board"
        element={
          token ? <BoardPage onLogout={handleLogout} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
