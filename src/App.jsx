import { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import { Draw, Snap } from "ol/interaction.js";
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { fromLonLat } from "ol/proj.js";
import { LineString, Polygon } from "ol/geom";
import { Overlay } from "ol";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";
import { getArea, getLength } from "ol/sphere.js";
import {
  CircleStop,
  CircleDot,
  Spline,
  Hexagon,
  ZoomOut,
  ZoomIn,
} from "lucide-react";


function App() {
  const mapRef = useRef();
  const mapInstanceRef = useRef();
  const sourceRef = useRef(new VectorSource());
  const snapRef = useRef();
  const [drawingMode, setDrawingMode] = useState(null);
  const [editorStatus, setEditorStatus] = useState("None");

  const measureTooltipElementRef = useRef();
  const measureTooltipRef = useRef();

  const duration = 2000;
  const source = new VectorSource();
  
  useEffect(function initMap() {
    if (!mapRef.current) return;

    const tile = new TileLayer({ source: new OSM() });

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

    const vector = new VectorLayer({
      source: sourceRef.current,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffffff",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#18f400",
        "icon-src":
          "https://icon-library.com/images/place-icon-png/place-icon-png-17.jpg",
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

     //Animation
     sourceRef.current.on("addfeature", (e) => {
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

    return () => {
      map.setTarget(null);
    };
  }, []);

  // button
  const addInteraction = (type) => {
    const draw = new Draw({
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
    
    setDrawingMode(draw);
    mapInstanceRef.current.addInteraction(draw);

    measureTooltipRef.current = new Overlay({
      element: measureTooltipElementRef.current,
      offset: [15, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    
    mapInstanceRef.current.addOverlay(measureTooltipRef.current);

    draw.on("drawstart", (evt) => {
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

    draw.on("drawend", () => {
      measureTooltipElementRef.current.style.display = "none";
    });

    const snap = new Snap({ source: source });
    snapRef.current = snap;
    mapInstanceRef.current.addInteraction(snap);
  };

  const toogleDrawInteraction = (type) => {
    const map = mapInstanceRef.current;
    if (drawingMode) {
      map.removeInteraction(drawingMode);
      setDrawingMode(null);
      setEditorStatus("");
    } else {
      addInteraction(type);
      const snap = new Snap({ source: sourceRef.current });
      map.addInteraction(snap);
    }
  };

  const formatLength = function (line) {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
    return output;
  };

  const formatArea = function (polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
    } else {
      output = Math.round(area * 100) / 100 + " m\xB2";
    }
    return output;
  };

  /**
   * Handles zooming in or out of the map.
   * @param {React.MutableRefObject<Map>} mapRef - Reference to the map instance.
   * @param {number} value - Zoom level adjustment.
   */

  const handleZoom = (mapRef, value) => {
    const map = mapRef.current;
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({ zoom: zoom + value, duration: 500 });
  };


  return (
    <>
      <div>
        <div className="w-full h-screen relative" ref={mapRef}>
          <div
            ref={measureTooltipElementRef}
            className="bg-gray-500 text-white absolute z-10 px-1 rounded-md font-bold ol-tooltip ol-tooltip-measure text-xs"
          />
          <div>
            <button className="flex bg-gray-500 hover:bg-gray-700 text-white top-0 absolute z-10 p-1 m-2 px-3 rounded-md"
              onClick={() => {
                setEditorStatus("Point");
                toogleDrawInteraction("Point");
              }}
            >
              {editorStatus === "Point" ? <CircleStop /> : <CircleDot />}
            </button>
            <button className="flex bg-gray-500 hover:bg-gray-700 text-white top-10 absolute z-10 p-1 m-2 px-3 rounded-md" 
              onClick={() => {
                setEditorStatus("LineString");
                toogleDrawInteraction("LineString");
              }}
            >
              {editorStatus === "LineString" ? <CircleStop /> : <Spline />}
            </button>
            <button className="flex bg-gray-500 hover:bg-gray-700 text-white top-20 absolute z-10 p-1 m-2 px-3 rounded-md" 
              onClick={() => {
                setEditorStatus("Polygon");
                toogleDrawInteraction("Polygon");
              }}
            >
              {editorStatus === "Polygon" ? <CircleStop /> : <Hexagon />}
            </button>
            <button className="flex  bg-gray-500 hover:bg-gray-700 text-white absolute  bottom-10 z-10 bg-button p-1 m-2 px-3 rounded-md"
                onClick={() => handleZoom(mapInstanceRef, +2)}
              >
                <ZoomIn />
            </button>
            <button className="flex  bg-gray-500 hover:bg-gray-700 text-white absolute  bottom-0 z-10 bg-button p-1 m-2 px-3 rounded-md"
                onClick={() => handleZoom(mapInstanceRef, -2)}
              >
                <ZoomOut />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;