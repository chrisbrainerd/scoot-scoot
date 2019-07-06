const fetch = require('node-fetch');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bikeshareStationsById = require('./bikeshare_stations');
const PORT = 3003;
const CHECK_INTERVAL = 30000;

const PROVIDERS = {
  LIME: "lime",
  BIKESHARE: "bikeshare",
  JUMP: "jump",
  LYFT: "lyft",
  SPIN: "spin"
}

const checkBird = () => {
  return new Promise((res, rej) => {
    fetch('https://gbfs.bird.co/dc')
    .then(res => res.json())
    .then(json => {
      const { bikes } = json.data;
      const goodScoots = bikes
        .filter(bike => !bike.reserved && !bike.disabled)
        .map(scoot => ({
          id: scoot.bike_id,
          provider: PROVIDERS.LIME,
          lat: scoot.lat,
          lng: scoot.lon,
          battery: scoot.battery_level
        }));
      console.log(new Date().toISOString(), `Got info on ${goodScoots.length} scooters from Bird!`);
      res(goodScoots);
    })
    .catch(e => {
      console.error("Error fetching and munging Lime bikes:", error);
      rej(null);
    });
  })
}

const checkBikeshare = () => {
  return new Promise((res, rej) => {
    fetch('https://gbfs.capitalbikeshare.com/gbfs/en/station_status.json')
    .then(res => res.json())
    .then(json => {
      const { data: { stations } } = json;
      // TODO: pull station list also here, compare last_updated and update as necessary

      const stationStatusesById = Object.values(stations.reduce((bigObj, station) => (
        {
          [station.station_id]: {
            provider: PROVIDERS.BIKESHARE,
            ...bikeshareStationsById[station.station_id],
            ...station,
          },
          ...bigObj
        }
      ), {}));

      console.log(new Date().toISOString(), `Got info on ${stationStatusesById.length} scooters from Capital Bikeshare!`);
      res(stationStatusesById);
    })
    .catch(e => {
      console.error("Error fetching and munging Capital Bikeshare:", e);
      rej(null);
    });
  })
}

const checkJumpBikes = () => {
  return new Promise((res, rej) => {
    fetch('https://dc.jumpmobility.com/opendata/free_bike_status.json')
    .then(res => res.json())
    .then(json => {
      const { bikes } = json.data;
      const goodBikes = bikes
        .filter(bike => !bike.is_reserved && !bike.is_disabled && bike.jump_vehicle_type === "bike")
        .map(bike => ({
          id: bike.bike_id,
          provider: PROVIDERS.JUMP,
          lat: bike.lat,
          lng: bike.lon,
          battery: bike.jump_ebike_battery_level
        }));
      console.log(new Date().toISOString(), `Got info on ${goodBikes.length} scooters from Jump!`);
      res(goodBikes);
    })
    .catch(e => {
      console.error("Error fetching and munging Jump e-bikes:", error);
      rej(null);
    });
  })
}

const checkLyftScooters = () => {
  return new Promise((res, rej) => {
    fetch('https://s3.amazonaws.com/lyft-lastmile-production-iad/lbs/dca/free_bike_status.json')
    .then(res => res.json())
    .then(json => {
      const { bikes } = json.data;
      const goodBikes = bikes
        .filter(bike => !bike.is_reserved && !bike.is_disabled && bike.type === "electric_scooter")
        .map(bike => ({
          id: bike.bike_id,
          provider: PROVIDERS.LYFT,
          lat: bike.lat,
          lng: bike.lon,
          battery: `¯\\_(ツ)_/¯`
        }));
      console.log(new Date().toISOString(), `Got info on ${goodBikes.length} scooters from Lyft!`);
      res(goodBikes);
    })
    .catch(e => {
      console.error("Error fetching and munging Lyft scooters:", error);
      rej(null);
    });
  })
}

const checkSpinScooters = () => {
  return new Promise((res, rej) => {
    fetch('https://web.spin.pm/api/gbfs/v1/washington_dc/free_bike_status')
    .then(res => res.json())
    .then(json => {
      const { bikes } = json.data;
      const goodScoots = bikes
        .filter(scoot => !scoot.is_reserved && !scoot.is_disabled && scoot.vehicle_type === "scooter" && scoot.lat && scoot.lon)
        .map(scoot => ({
          id: scoot.bike_id,
          provider: PROVIDERS.SPIN,
          lat: scoot.lat,
          lng: scoot.lon,
          battery: `¯\\_(ツ)_/¯`
        }));
      console.log(new Date().toISOString(), `Got info on ${goodScoots.length} scooters from Spin!`);
      res(goodScoots);
    })
    .catch(e => {
      console.error("Error fetching and munging Spin scooters:", error);
      rej(null);
    });
  })
}

const corpus = {
  birdScooters: [],
  bikeshares: [],
  jumpBikes: [],
  lyftScooters: [],
  spinScooters: []
}

// BIRD
setInterval(async () => {
  corpus.birdScooters = await checkBird();
}, CHECK_INTERVAL);

// CAPITAL BIKESHARE
setInterval(async () => {
  corpus.bikeshares = await checkBikeshare();
}, CHECK_INTERVAL);

// JUMP BIKES
setInterval(async () => {
  corpus.jumpBikes = await checkJumpBikes();
}, CHECK_INTERVAL);

// LYFT SCOOTERS
setInterval(async () => {
  corpus.lyftScooters = await checkLyftScooters();
}, CHECK_INTERVAL);

// SPIN SCOOTERS
setInterval(async () => {
  corpus.spinScooters = await checkSpinScooters();
}, CHECK_INTERVAL);

io.on('connection', function(socket){
  console.log("someone connected :D")

  io.emit("data-update", corpus);
  const mainInterval = setInterval(() => {
    io.emit("data-update", corpus);
  }, CHECK_INTERVAL)

  socket.on('disconnect', function(){
    console.log('someone disconnected :(');
    clearInterval(mainInterval);
  });
});


app.use(express.static(path.join(__dirname, "scoot-scoot-ui", 'build')));

app.get('/', function(req, res){
  console.log('trying to req');
  res.sendFile(__dirname + '/scoot-scoot-ui/build/index.html');
});

http.listen(process.env.PORT || 5000, () => console.log(`Example app listening on port ${process.env.PORT || 5000}!`));