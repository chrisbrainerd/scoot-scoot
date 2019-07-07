import React from "react";
import Directions from "@material-ui/icons/Directions";

const GoogleMapsLink = ({ lat, lng }) => (
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&dirflg=w`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Directions /> Show me how to get here!
  </a>
);

export default GoogleMapsLink;
