import React, { useRef, useState, useEffect } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster';
import io from 'socket.io-client';

import { geolocated } from "react-geolocated";
import L from 'leaflet';
import useRect from './useRect';
import useLocation from './useLocation';
import BirdLogo from './Bird2.png';
import BikeshareLogo from './Bikeshare.png';
import JumpLogo from './Jump.jpg';
import LyftLogo from './lyft.png';
import SpinLogo from './spin.png';

import Filters from './Filters';

require('./Map.less');

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
`

let myIconUrl = encodeURI("data:image/svg+xml," + mySvgString).replace('#','%23');

const YouIcon = new L.icon({
  iconUrl: myIconUrl,
  iconSize: 20,
  className: 'pulse-me'
});
const BirdIcon = new L.Icon({
  iconUrl: BirdLogo,
  iconSize: 30
})
const BikeshareIcon = new L.Icon({
  iconUrl: BikeshareLogo,
  iconSize: 30
})
const JumpIcon = new L.Icon({
  iconUrl: JumpLogo,
  iconSize: 30
})
const LyftIcon = new L.Icon({
  iconUrl: LyftLogo,
  iconSize: 30
})
const SpinIcon = new L.Icon({
  iconUrl: SpinLogo,
  iconSize: 30
})

// const protocol = document.location.protocol === "https:" ? "wss:" : "ws:"

const endpoint = 'http//' + document.domain + ':3003';

const MapComponent = ({
  coords
}) => {
  const wrapperRef = useRef(null);
  const rect = useRect(wrapperRef);
  const location = useLocation(coords);

  const [birdScooters, setBirdScooters] = useState([])
  const [bikeshares, setBikeshares] = useState([]);
  const [jumpBikes, setJumpBikes] = useState([]);
  const [lyftScooters, setLyftScooters] = useState([]);
  const [spinScooters, setSpinScooters] = useState([]);

  useEffect(() => {
    const socket = io(endpoint);
    socket.on("data-update", corpus => {
      console.log('received data update!', corpus);
        setBirdScooters(corpus.birdScooters);
        setBikeshares(corpus.bikeshares);
        setJumpBikes(corpus.jumpBikes);
        setLyftScooters(corpus.lyftScooters);
        setSpinScooters(corpus.spinScooters);
    })

    return function cleanup() {
      socket.close();
    }
  }, [])

  return (
    <div className="map-wrapper" ref={wrapperRef}>
      <Filters />
      {rect.height && 
        <Map 
          center={location} 
          zoom={13} 
          style={{height: `${rect.height}px`, width: `${rect.width}px`}}
          maxZoom={18}
        >
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          />
          <Marker position={location} icon={YouIcon}>
            <Popup>It you</Popup>
          </Marker>
          <MarkerClusterGroup>
            {birdScooters.map(scooter => (
              <Marker key={scooter.id} position={[scooter.lat, scooter.lng]} icon={BirdIcon}>
                <Popup>Battery: {scooter.battery}</Popup>
              </Marker>
            ))}
            {bikeshares.map(bikeStation => (
              <Marker key={bikeStation.station_id} position={[bikeStation.lat, bikeStation.lon]} icon={BikeshareIcon}>
                <Popup>
                  <p>{bikeStation.name}</p>
                  <p>{bikeStation.num_bikes_available} bikes available{bikeStation.num_bikes_available === 0 && " 😭"}</p>
                  <p>{bikeStation.num_ebikes_available} e-bikes available{bikeStation.num_bikes_available === 0 && " 😭"}</p>
                  <p><a href={bikeStation.rental_url}>Rent now</a></p>
                </Popup>
              </Marker>
            ))}
            {jumpBikes.map(bike => (
              <Marker key={bike.id} position={[bike.lat, bike.lng]} icon={JumpIcon}>
                <Popup>Battery: {bike.battery}</Popup>
              </Marker>
            ))}
            {lyftScooters.map(scooter => (
              <Marker key={scooter.id} position={[scooter.lat, scooter.lng]} icon={LyftIcon}>
                <Popup>Battery: {scooter.battery}</Popup>
              </Marker>
            ))}
            {spinScooters.map(scooter => (
              <Marker key={scooter.id} position={[scooter.lat, scooter.lng]} icon={SpinIcon}>
                <Popup>Battery: {scooter.battery}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </Map>
      }
    </div>
  )
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: true
  },
  // watchPosition: true
})(MapComponent);