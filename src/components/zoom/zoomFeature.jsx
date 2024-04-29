export const ZoomFeature = () => {
  const handleZoom = (mapRef, value) => {
    const map = mapRef.current;
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({ zoom: zoom + value, duration: 300 });
  };

  return { handleZoom };
};