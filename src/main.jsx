import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import MapLayer from './components/map-view/MapLayer';
import { MapContextProvider } from './components/map-view/hooks/useMap';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MapContextProvider>
      <MapLayer />
    </MapContextProvider>
  </React.StrictMode>
);
