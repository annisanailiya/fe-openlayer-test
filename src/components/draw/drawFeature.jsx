import { useContext, useRef } from "react";
import { Draw, Snap } from "ol/interaction.js";
import { MapContext } from "../map-view/hooks/useMap";
import { LineString, Polygon } from "ol/geom";
import { Circle as CircleStyle, Stroke, Style, Fill } from "ol/style.js";
import { Overlay } from "ol";

import { formatLength } from "../map-view/utils/format-line/formatLength";

export const DrawFeature = () => {
  const {
    mapInstanceRef,
    drawRef,
    drawingMode,
    setDrawingMode,
    setEditorStatus,
    sourceRef,
  } = useContext(MapContext);

  const measureTooltipElementRef = useRef();
  const measureTooltipRef = useRef();

  const addInteraction = (type) => {
    setDrawingMode(true);
    mapInstanceRef.current.removeInteraction(drawRef.current);
    drawRef.current = new Draw({
      source: sourceRef.current,
      type,
      style:  new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new Stroke({
        color: "rgba(255, 255, 255, 1)",
        lineDash: [10, 10],
        width: 4,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: "rgba(1, 186, 239)",
        }),
        fill: new Fill({
          color: "rgba(1, 186, 239)",
        }),
      }),
    }),
    });

    measureTooltipRef.current = new Overlay({
      element: measureTooltipElementRef.current,
      offset: [15, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    
    mapInstanceRef.current.addOverlay(measureTooltipRef.current);

    drawRef.current.on("drawstart", (evt) => {
      let sketch = evt.feature;
      let tooltipCoord = evt.coordinate;

      sketch.getGeometry().on("change", (evt) => {
        const geom = evt.target;
        if ((geom instanceof LineString, Polygon)) {
          let output;
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
          measureTooltipElementRef.current.style.display = "block";
          measureTooltipElementRef.current.innerHTML = output;
          measureTooltipRef.current.setPosition(tooltipCoord);
        }
      });
    });

    drawRef.current.on("drawend", () => {
      measureTooltipElementRef.current.style.display = "none";
    });

    mapInstanceRef.current.addInteraction(drawRef.current);
  };

  const toggleDrawInteraction = (type) => {
    const map = mapInstanceRef.current;
    if (drawingMode) {
      map.removeInteraction(drawRef.current);
      setDrawingMode(null);
      setEditorStatus("");
    } else {
      addInteraction(type);
      console.log("tes")
      console.log(sourceRef.current);
      const snap = new Snap({ source: sourceRef.current });
      map.addInteraction(snap);
    }
  };

  return {
    addInteraction,
    toggleDrawInteraction,
    measureTooltipElementRef,
    measureTooltipRef,
  };
};