import { createContext, useEffect, useRef, useState, useMemo } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { fromLonLat } from "ol/proj.js";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";

export const MapContext = createContext();

export const MapContextProvider = ({ children }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef();
  const sourceRef = useRef();
  const vectorLayerRef = useRef();
  const drawRef = useRef();

  const [drawingMode, setDrawingMode] = useState(null);
  const [editorStatus, setEditorStatus] = useState("None");

  const duration = 2000;

  useEffect(() => {
    const tile = new TileLayer({ source: new OSM() });
    const source = new VectorSource({ wrapX: false });
    const vector = new VectorLayer({
      source: source,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffffff",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#18f400",
        "icon-src":"src/assets/place-icon.jpg",
        "icon-width": 40,
        "icon-height": 40,
      },
    });

    const map = new Map({
      layers: [tile, vector],
      view: new View({
        center: fromLonLat([107.60981, -6.914744]),
        zoom: 12,
      }),
      target: mapRef.current,
      controls: [],  //remove controls
    });

    tile.on("prerender", (evt) => {
      // return
      if (evt.context) {
        const context = evt.context;
        context.filter = "grayscale(80%) invert(100%) ";
        context.globalCompositeOperation = "source-over";
      }
    });

    tile.on("postrender", (evt) => {
      if (evt.context) {
        const context = evt.context;
        context.filter = "none";
      }
    });

 

    source.on("addfeature", (e) => {
      const feature = e.feature;
      const start = Date.now();
      const flashGeom = feature.getGeometry().clone();
      const listenerKey = tile.on("postrender", (event) => {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
          unByKey(listenerKey);
          return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        const radius = easeOut(elapsedRatio) * 50 + 5;
        const opacity = easeOut(1 - elapsedRatio);

        const circleStyle = new Style({
          image: new CircleStyle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(217, 76, 0, " + opacity + ")",
              width: 0.75 + opacity,
            }),
          }),
        });

        vectorContext.setStyle(circleStyle);
        vectorContext.drawGeometry(flashGeom);
        mapInstanceRef.current.render();
      });
    });

    mapInstanceRef.current = map;
    sourceRef.current = source;
    vectorLayerRef.current = VectorLayer;

    return () => {
      map.setTarget(null);
    };
  }, []);
  
  const contextValue = useMemo(
    () => ({
      mapRef,
      mapInstanceRef,
      sourceRef,
      vectorLayerRef,
      drawRef,
      editorStatus,
      setEditorStatus,
      drawingMode,
      setDrawingMode,
    }),
    [
      mapRef,
      mapInstanceRef,
      sourceRef,
      vectorLayerRef,
      drawRef,
      editorStatus,
      setEditorStatus,
      drawingMode,
      setDrawingMode,
    ]
  );

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
};