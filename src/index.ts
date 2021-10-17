// https://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json?datvon=2021-10-06 00:00&datbis=2021-10-07 00:00&stationcode=S108&komponentencode=BOE

import { getDayOfYear, getDate, getDay } from "date-fns";
import { from, fromEvent } from "rxjs";
import { concatMap, map, reduce, take, takeLast } from "rxjs/operators";
import { writeStationsData, writeMeanData, init } from "./firebase";

import { Messwert } from "./messwert/messwert";
import { Station } from "./stationen/station";
import { getStationByCode, getStationsAir } from "./stationen/utilities";
import { createUrls } from "./utilities/utilities";

// A simple request Observable we can reuse to clean up our examples
const request = (url: string) => from(fetch(url).then((res) => res.json()));

init();
// console.log(getStationByCode("S415"));
// console.log(getStationsAir());

const header = document.getElementById("header");
const daily = "TMW";
const date = new Date(Date.now());
let days = 1;
let component = "NO2";
let station = "S431"; // Römerberg
let urls: string[] = [];

urls = createUrls(days, station, component);

const loading = document.getElementById("loading");
const showLoader = () => {
  loading.classList.remove("hidden");
};

const hideLoader = () => {
  loading.classList.add("hidden");
};

const setDaily = (event) => {
  days = 1;
  header.innerHTML = "Tagesdurchschnitt";
  urls = createUrls(days, station, component);
  handleFilterButtons(event);
  doIt();
}

const setWeekly = (event) => {
  days = getDay(date);
  days === 0 ? days = 7 : days;
  header.innerHTML = "Wochendurchschnitt";
  urls = createUrls(days, station, component);
  handleFilterButtons(event);
  doIt();
}

const setMonthly = (event) => {
  days = getDate(date);
  header.innerHTML = "Monatsdurchschnitt";
  urls = createUrls(days, station, component);
  handleFilterButtons(event);
  doIt();
}

const setYearly = (event) => {
  days = getDayOfYear(date);
  header.innerHTML = "Jahresdurchschnitt";
  urls = createUrls(days, station, component);
  handleFilterButtons(event);
}

const meanView = document.getElementById("mean");
const doIt = () => {
  let count = 1;
  let sum = 0;
  let mittelwert = 0;
  let tmpMesswerte = [];

  showLoader();

  from(urls)
    .pipe(
      concatMap((url: string) => {
        return request(url);
      }),
      reduce((acc, res) => [...acc, ...res.messwerte], [] as Messwert[]),
      map((messwerte: Messwert[]) =>
        messwerte.filter((messwert) => {
          return messwert.mittelwert === daily;
        })
      )
    )
    .subscribe({
      next: (messwerte) => {
        messwerte.map((messwert) => {
          let tmp = parseFloat(messwert.messwert.replace(",", ".")) * 1000;
          sum += tmp;
          mittelwert = sum / count;

          //if (count > 0) {
          /* console.log(`
            Tage: ${count}
            Station: ${messwert.station} / ${getStationByCode(messwert.station).kurzname
            }
            Komponente: ${messwert.komponente}
            Datum: ${new Intl.DateTimeFormat("de-AT").format(
              new Date(messwert.zeitpunkt)
            )}
            Messwert: ${tmp}
            Summe: ${sum}
            Mittelwert: ${mittelwert.toFixed(2)}
          `);*/
          //}

          count++;

          meanView.innerHTML = `
            <div class="text-center shadow-xl rounded-b-lg">
              <div class="bg-white text-indigo-800 px-6 pb-4 pt-6 relative rounded-t-lg">
                <div class="absolute top-0 left-1/2 transfrom -translate-x-1/2 text-xs bg-indigo-600 text-white px-6 rounded-b-sm">
                  ${messwert.station}
                </div>  
                <div>
                  ${getStationByCode(messwert.station).kurzname}
                </div>
              </div>
              <div class="text-2xl tracking-wider px-6 pt-4 pb-10 font-bold relative">
                <div>${messwert.komponente}</div>
                <div>
                  ${mittelwert.toFixed(2).toString()} <div class="text-xs font-light">µg/m³</div>
                </div>
                <div class="absolute left-0 bottom-0 text-white font-light text-xs pb-2 w-full rounded-b-lg">
                    ${new Intl.DateTimeFormat("de-AT").format(
            new Date(messwert.zeitpunkt)
          )}
                  </div>
              </div>
            </div>
          `;

          tmpMesswerte.push(messwerte);

          // writeStationsData(messwert.station, messwert.komponente, messwerte);

          return false;
        });
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        hideLoader();
        writeStationsData(station, component, tmpMesswerte[0]);
        writeMeanData(station, component, mittelwert);
        console.log("COMPLETED");
      }
    });
};

const stationSelect = document.getElementById("stationSelect");

const createStations = () => {
  const stations: Station[] = getStationsAir();
  let stationsHtml = "";

  stations.map((station) => {
    stationsHtml += `<option value="${station.code}">${station.kurzname}</option>`;
    return true;
  });

  return stationsHtml;
};

const componentSelect = document.getElementById("componentSelect");

const createComponents = () => {
  const components = ["NO2", "PM10kont", "PM25kont"];
  let componentsHtml = "";

  components.map((component) => {
    componentsHtml += `<option value="${component}">${component}</option>`;
    return true;
  });

  return componentsHtml;
};

stationSelect.innerHTML += createStations();

const stations$ = fromEvent(stationSelect, "change");
stations$
  .pipe(
    map((event: InputEvent) => {
      station = event.target.value;
      urls = createUrls(days, station, component);
      doIt();
    })
  )
  .subscribe();

Array.from(stationSelect.options).forEach((item) => {
  if (item.value === station) {
    item.selected = true;
  }
});

componentSelect.innerHTML += createComponents();

const components$ = fromEvent(componentSelect, "change");
components$
  .pipe(
    map((event: InputEvent) => {
      component = event.target.value;
      urls = createUrls(days, station, component);
      doIt();
    })
  )
  .subscribe();

Array.from(componentSelect.options).forEach((item) => {
  if (item.value === component) {
    item.selected = true;
  }
});

const dailyButton = document.getElementById("dailyButton");
const dailyButton$ = fromEvent(dailyButton, "click");
dailyButton$
  .subscribe({
    next: (event) => {
      setDaily(event);
    }
  })

const weeklyButton = document.getElementById("weeklyButton");
const weeklyButton$ = fromEvent(weeklyButton, "click");
weeklyButton$
  .subscribe({
    next: (event) => {
      setWeekly(event);
    }
  })

const monthlyButton = document.getElementById("monthlyButton");
const monthlyButton$ = fromEvent(monthlyButton, "click");
monthlyButton$
  .subscribe({
    next: (event) => {
      setMonthly(event)
    }
  })

const yearlyButton = document.getElementById("yearlyButton");
const yearlyButton$ = fromEvent(yearlyButton, "click");
yearlyButton$
  .subscribe({
    next: (event) => {
      setYearly(event);
    }
  })

function handleFilterButtons(event) {
  let matches = document.querySelectorAll("[data-filter-button]");
  matches.forEach(button => {
    if (button.id === event.target.id) {
      event.target.classList.remove("text-indigo-800", "bg-white");
      event.target.classList.add("bg-indigo-800", "text-white")
    }
    else {
      button.classList.remove("bg-indigo-800", "text-white");
      button.classList.add("text-indigo-800", "bg-white");
    }
  })
}

doIt();
