
import {
  CircleStop,
  CircleDot,
  Spline,
  Hexagon,
  ZoomOut,
  ZoomIn,
} from "lucide-react";

import { MapContext } from "./hooks/useMap";
import { ZoomFeature } from "../zoom/zoomFeature";
import { Button } from "./utils/button/Button";
import { DrawFeature } from "../draw/drawFeature";
import { useContext } from "react";

const MapLayer = () => {
  const { mapRef, mapInstanceRef, editorStatus, setEditorStatus } =
    useContext(MapContext);

  const { handleZoom } = ZoomFeature();

  const { toggleDrawInteraction, measureTooltipElementRef } = DrawFeature();

  return (
    <div>
      <div className="w-full h-screen relative" ref={mapRef}>
        <div
          ref={measureTooltipElementRef}
          className="bg-gray-500 text-white absolute z-10 px-1 rounded-md font-bold ol-tooltip ol-tooltip-measure text-xs"
        />
        <div className="absolute z-10 gap-2 m-4">
          <Button 
            onClick={() => {
              setEditorStatus("Point");
              toggleDrawInteraction("Point");
            }}
          >
            {editorStatus === "Point" ? <CircleStop /> : <CircleDot />}
          </Button>
          <Button 
            onClick={() => {
              setEditorStatus("LineString");
              toggleDrawInteraction("LineString");
            }}
          >
            {editorStatus === "LineString" ? <CircleStop /> : <Spline />}
          </Button>
          <Button 
            onClick={() => {
              setEditorStatus("Polygon");
              toggleDrawInteraction("Polygon");
            }}
          >
            {editorStatus === "Polygon" ? <CircleStop /> : <Hexagon />}
          </Button>
          <Button onClick={() => handleZoom(mapInstanceRef, +2)}
          >
            <ZoomIn />
          </Button>
          <Button onClick={() => handleZoom(mapInstanceRef, -2)}
          >
            <ZoomOut />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapLayer;