import * as stationen from "./stationen.json";

export function getStationByCode(code: string) {
  return stationen.stationen.filter((station) => station.code === code)[0];
}

export function getStationsAir() {
  let stations = [];
  stationen.stationen.map((station) => {
    if (station.komponentenCodes.includes("NO2" || "PM10kont" || "PM25kont"))
      stations.push(station);
    return true;
  });
  return stations;
}
