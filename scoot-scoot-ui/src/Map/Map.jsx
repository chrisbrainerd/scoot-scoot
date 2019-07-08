import React, { useRef, useState, useEffect } from "react";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  AttributionControl
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import io from "socket.io-client";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import { geolocated } from "react-geolocated";
import L from "leaflet";
import useRect from "./useRect";
import useLocation from "./useLocation";
import BirdLogo from "./Bird2.png";
import BikeshareLogo from "./Bikeshare.png";
import JumpLogo from "./Jump.jpg";
import LyftLogo from "./lyft.png";
import SpinLogo from "./spin.png";

import Filters from "./Filters";

require("./Map.less");
const DancingEmoji = () => (
  <span role="img" aria-label="Dancing emoji">
    💃
  </span>
);
const ScooterEmoji = () => (
  <span role="img" aria-label="Scooter emoji">
    🛴
  </span>
);
const BikeEmoji = () => (
  <span role="img" aria-label="Bike emoji">
    🚲
  </span>
);

let mySvgString = `
<svg  height="20" width="20" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="myGradient">
      <stop offset="0%" stop-color="rgba(6,174,213, 0.2)" />
      <stop offset="35%" stop-color="rgba(6,174,213, 1)" />
    </radialGradient>
  </defs>
  <circle class='pulse-me' cx="10" cy="10" r="10" stroke-width="3" fill="url('#myGradient')"  />
</svg>
`;

let myIconUrl = encodeURI("data:image/svg+xml," + mySvgString).replace(
  "#",
  "%23"
);

const YouIcon = new L.icon({
  iconUrl: myIconUrl,
  iconSize: 20,
  className: "pulse-me"
});
const BirdIcon = new L.Icon({
  iconUrl: BirdLogo,
  iconSize: 30
});
const BikeshareIcon = new L.Icon({
  iconUrl: BikeshareLogo,
  iconSize: 30
});
const JumpIcon = new L.Icon({
  iconUrl: JumpLogo,
  iconSize: 30
});
const LyftIcon = new L.Icon({
  iconUrl: LyftLogo,
  iconSize: 30
});
const SpinIcon = new L.Icon({
  iconUrl: SpinLogo,
  iconSize: 30
});

const endpoint =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://" + document.domain;

const MapComponent = ({ coords }) => {
  const wrapperRef = useRef(null);
  const rect = useRect(wrapperRef);
  const location = useLocation(coords);

  const [corpus, setCorpus] = useState({
    birdScooters: [],
    bikeshares: [],
    jumpBikes: [],
    lyftScooters: [],
    spinScooters: []
  });

  const [filters, setFilters] = useState({
    showBirdScooters: true,
    showBikeshares: true,
    showJumpBikes: true,
    showLyftScooters: true,
    showSpinScooters: true,
    filterByBattery: false,
    minBattery: 0
  });

  useEffect(() => {
    const socket = io(endpoint);
    socket.on("data-update", corpus => {
      // console.log("received data update!", corpus);
      setCorpus(corpus);
    });

    return function cleanup() {
      socket.close();
    };
  }, []);

  const {
    birdScooters,
    bikeshares,
    jumpBikes,
    lyftScooters,
    spinScooters
  } = corpus;

  const {
    filterByBattery,
    minBattery,
    showBirdScooters,
    showBikeshares,
    showJumpBikes,
    showLyftScooters,
    showSpinScooters
  } = filters;
  return (
    <div className="map-wrapper" ref={wrapperRef}>
      <Filters updateFilters={setFilters} />
      {rect.height && (
        <Map
          center={location}
          zoom={13}
          style={{ height: `${rect.height}px`, width: `${rect.width}px` }}
          maxZoom={18}
          attributionControl={false}
        >
          <AttributionControl position="bottomright" prefix={false} />
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            attribution="©2019 <a href='mailto:christopher.brainerd@gmail.com?subject=dcscootermap'>Chris Brainerd</a>"
          />
          <Marker position={location} icon={YouIcon}>
            <Popup>
              It you
              <DancingEmoji />
            </Popup>
          </Marker>
          <MarkerClusterGroup>
            {showBirdScooters &&
              birdScooters.map(
                scooter =>
                  (!filterByBattery || scooter.battery > minBattery) && (
                    <Marker
                      key={scooter.id}
                      position={[scooter.lat, scooter.lng]}
                      icon={BirdIcon}
                    >
                      <Popup>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              <ScooterEmoji /> Bird scooter <ScooterEmoji />
                            </Typography>
                            <Typography>Battery: {scooter.battery}%</Typography>
                            <Typography
                              color="textSecondary"
                              variant="caption"
                              gutterBottom
                            >
                              ID: {scooter.id}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${scooter.lat},${scooter.lng}&dirflg=w`,
                                  "_blank"
                                );
                              }}
                            >
                              Navigate here
                            </Button>
                            <Button
                              color="primary"
                              onClick={() => {
                                window.open(`https://bird.co`, "_blank");
                              }}
                            >
                              Open app
                            </Button>
                          </CardActions>
                        </Card>
                      </Popup>
                    </Marker>
                  )
              )}
            {showBikeshares &&
              bikeshares.map(bikeStation => (
                <Marker
                  key={bikeStation.station_id}
                  position={[bikeStation.lat, bikeStation.lon]}
                  icon={BikeshareIcon}
                >
                  <Popup>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <BikeEmoji />
                          Capital Bikeshare
                          <BikeEmoji />
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="caption"
                          gutterBottom
                        >
                          {bikeStation.name}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="body1"
                          gutterBottom
                        >
                          {bikeStation.num_bikes_available > 0
                            ? `bikes: ${"🚲".repeat(
                                bikeStation.num_bikes_available
                              )}`
                            : "bikes: none 😭"}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="body1"
                          gutterBottom
                        >
                          {bikeStation.num_ebikes_available > 0
                            ? `e-bikes: ${"🚲".repeat(
                                bikeStation.num_ebikes_available
                              )}`
                            : "ebikes: none 😭"}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${bikeStation.lat},${bikeStation.lon}&dirflg=w`,
                              "_blank"
                            );
                          }}
                        >
                          Navigate here
                        </Button>
                        <Button
                          color="primary"
                          onClick={() => {
                            window.open(bikeStation.rental_url, "_blank");
                          }}
                        >
                          Reserve in app
                        </Button>
                      </CardActions>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            {showJumpBikes &&
              jumpBikes.map(
                bike =>
                  (!filterByBattery || bike.battery > minBattery) && (
                    <Marker
                      key={bike.id}
                      position={[bike.lat, bike.lng]}
                      icon={JumpIcon}
                    >
                      <Popup>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              <BikeEmoji />
                              Jump ebike
                              <BikeEmoji />
                            </Typography>
                            <Typography>Battery: {bike.battery}</Typography>
                            <Typography
                              color="textSecondary"
                              variant="caption"
                              gutterBottom
                            >
                              ID: {bike.id}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${bike.lat},${bike.lng}&dirflg=w`,
                                  "_blank"
                                );
                              }}
                            >
                              Navigate here
                            </Button>
                            <Button
                              onClick={() => {
                                window.open(`https://m.uber.com`, "_blank");
                              }}
                              color="primary"
                            >
                              Open app
                            </Button>
                          </CardActions>
                        </Card>
                      </Popup>
                    </Marker>
                  )
              )}
            {showLyftScooters &&
              lyftScooters.map(
                scooter =>
                  (!filterByBattery || scooter.battery > minBattery) && (
                    <Marker
                      key={scooter.id}
                      position={[scooter.lat, scooter.lng]}
                      icon={LyftIcon}
                    >
                      <Popup>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              <ScooterEmoji />
                              Lyft scooter
                              <ScooterEmoji />
                            </Typography>
                            <Typography>
                              Battery: {scooter.battery} (Thanks, Lyft!)
                            </Typography>
                            <Typography
                              color="textSecondary"
                              variant="caption"
                              gutterBottom
                            >
                              ID: {scooter.id}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${scooter.lat},${scooter.lng}&dirflg=w`,
                                  "_blank"
                                );
                              }}
                            >
                              Navigate here
                            </Button>
                            <Button
                              onClick={() => {
                                window.open(`https://lyft.com`, "_blank");
                              }}
                              color="primary"
                            >
                              Open app
                            </Button>
                          </CardActions>
                        </Card>
                      </Popup>
                    </Marker>
                  )
              )}
            {showSpinScooters &&
              spinScooters.map(
                scooter =>
                  (!filterByBattery || scooter.battery > minBattery) && (
                    <Marker
                      key={scooter.id}
                      position={[scooter.lat, scooter.lng]}
                      icon={SpinIcon}
                    >
                      <Popup>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              <ScooterEmoji /> Spin scooter <ScooterEmoji />
                            </Typography>
                            <Typography>
                              Battery: {scooter.battery} (Thanks, Spin!)
                            </Typography>
                            <Typography
                              color="textSecondary"
                              variant="caption"
                              gutterBottom
                            >
                              ID: {scooter.id}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${scooter.lat},${scooter.lng}&dirflg=w`,
                                  "_blank"
                                );
                              }}
                            >
                              Navigate here
                            </Button>
                            <Button
                              onClick={() => {
                                window.open(`https://spin.app`, "_blank");
                              }}
                              color="primary"
                            >
                              Open app
                            </Button>
                          </CardActions>
                        </Card>
                      </Popup>
                    </Marker>
                  )
              )}
          </MarkerClusterGroup>
        </Map>
      )}
    </div>
  );
};

export default geolocated({
  positionOptions: {
    enableHighAccuracy: true
  },
  // watchPosition: true
})(MapComponent);
