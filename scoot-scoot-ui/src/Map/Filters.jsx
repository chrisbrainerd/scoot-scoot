import React, { useState } from "react";
import Fab from "@material-ui/core/Fab";
import FilterList from "@material-ui/icons/FilterList";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";

import BirdLogo from "./Bird2.png";
import BikeshareLogo from "./Bikeshare.png";
import JumpLogo from "./Jump.jpg";
import LyftLogo from "./lyft.png";
import SpinLogo from "./spin.png";

const Filters = ({ updateFilters }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const [birdScooters, setBirdScooters] = useState(true);
  const [bikeshares, setBikeshares] = useState(true);
  const [jumpBikes, setJumpBikes] = useState(true);
  const [lyftScooters, setLyftScooters] = useState(true);
  const [spinScooters, setSpinScooters] = useState(true);

  const [filterByBattery, setFilterByBattery] = useState(false);
  const [minBattery, setMinBattery] = useState(0);

  const closeAndUpdateHost = () => {
    updateFilters({
      showBirdScooters: birdScooters,
      showBikeshares: bikeshares,
      showJumpBikes: jumpBikes,
      showLyftScooters: lyftScooters,
      showSpinScooters: spinScooters,
      filterByBattery: filterByBattery,
      minBattery: minBattery
    });
    setDrawerIsOpen(false);
  };

  const activeFilterCount = // lol production code
    6 -
    +birdScooters -
    +bikeshares -
    +jumpBikes -
    +lyftScooters -
    +spinScooters -
    +!filterByBattery;

  return (
    <div id="fab">
      <Fab
        onClick={() => {
          setDrawerIsOpen(true);
        }}
        color="primary"
        aria-label="Add"
      >
        <FilterList />
        {!!activeFilterCount && <span id="fab-number" />}
      </Fab>
      <Drawer anchor="right" open={drawerIsOpen} onClose={closeAndUpdateHost}>
        <List
          className="filter-drawer"
          subheader={<ListSubheader>Filters</ListSubheader>}
        >
          <ListItem onClick={() => setBirdScooters(!birdScooters)}>
            <ListItemText id="switch-list-label-bird" className="filter-item">
              <img
                className="filter-logo"
                src={BirdLogo}
                alt="Bird Scooters Logo"
              />
              Bird
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setBirdScooters(!birdScooters)}
                checked={birdScooters}
                inputProps={{ "aria-labelledby": "switch-list-label-bird" }}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem onClick={() => setBikeshares(!bikeshares)}>
            <ListItemText
              id="switch-list-label-bikeshares"
              className="filter-item"
            >
              <img
                className="filter-logo"
                src={BikeshareLogo}
                alt="Capital Bikeshare Logo"
              />
              Capital Bikeshare
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setBikeshares(!bikeshares)}
                checked={bikeshares}
                inputProps={{
                  "aria-labelledby": "switch-list-label-bikeshares"
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem onClick={() => setJumpBikes(!jumpBikes)}>
            <ListItemText id="switch-list-label-jump" className="filter-item">
              <img className="filter-logo" src={JumpLogo} alt="Jump Logo" />
              JUMP e-bikes
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setJumpBikes(!jumpBikes)}
                checked={jumpBikes}
                inputProps={{
                  "aria-labelledby": "switch-list-label-jump"
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem onClick={() => setLyftScooters(!lyftScooters)}>
            <ListItemText id="switch-list-label-lyft" className="filter-item">
              <img className="filter-logo" src={LyftLogo} alt="Lyft Logo" />
              Lyft scooters
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setLyftScooters(!lyftScooters)}
                checked={lyftScooters}
                inputProps={{
                  "aria-labelledby": "switch-list-label-lyft"
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem onClick={() => setSpinScooters(!spinScooters)}>
            <ListItemText id="switch-list-label-spin" className="filter-item">
              <img className="filter-logo" src={SpinLogo} alt="Spin Logo" />
              Spin scooters
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setSpinScooters(!spinScooters)}
                checked={spinScooters}
                inputProps={{
                  "aria-labelledby": "switch-list-label-spin"
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />

          <ListItem onClick={() => setFilterByBattery(!filterByBattery)}>
            <ListItemText
              id="switch-list-label-filterByBattery"
              className="filter-item"
            >
              Filter by battery charge
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => setFilterByBattery(!filterByBattery)}
                checked={filterByBattery}
                inputProps={{
                  "aria-labelledby": "switch-list-label-filterByBattery"
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {filterByBattery && (
            <ListItem>
              <Input
                id="charge-percent"
                value={minBattery}
                onChange={e => setMinBattery(+e.target.value)}
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                type="number"
                inputProps={{
                  "aria-label": "minimum charge percentage",
                  min: "0",
                  max: "100",
                  step: "1"
                }}
              />
            </ListItem>
          )}
        </List>
        <div className="drawer-buttons">
          <Divider />
          <Button
            variant="contained"
            onClick={() => {
              setBirdScooters(true);
              setBikeshares(true);
              setJumpBikes(true);
              setLyftScooters(true);
              setSpinScooters(true);
              setFilterByBattery(false);
            }}
          >
            Reset all
          </Button>
          <Button variant="contained" onClick={closeAndUpdateHost}>
            Apply filters
          </Button>
        </div>
      </Drawer>
    </div>
  );
};
export default Filters;
