import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { RutaProtegida } from './components/RutaProtegida.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Vehiculos from './pages/Vehiculos.jsx';
import Conductores from './pages/Conductores.jsx';
import Viajes from './pages/Viajes.jsx';
import Historial from './pages/Historial.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/vehiculos"
            element={
              <RutaProtegida>
                <Vehiculos />
              </RutaProtegida>
            }
          />
          <Route
            path="/conductores"
            element={
              <RutaProtegida>
                <Conductores />
              </RutaProtegida>
            }
          />
          <Route
            path="/viajes"
            element={
              <RutaProtegida>
                <Viajes />
              </RutaProtegida>
            }
          />
          <Route
            path="/historial"
            element={
              <RutaProtegida>
                <Historial />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
