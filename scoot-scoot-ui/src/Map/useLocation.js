import { useState, useEffect } from 'react';

const DC_CENTER = [38.9072, -77.0369]

const useLocation = (coords) => {
  const [center, setCenter] = useState(DC_CENTER)
  useEffect(() => {
    setCenter(coords ? [coords.latitude, coords.longitude] : DC_CENTER)
  }, [coords])
  return center;
}

export default useLocation