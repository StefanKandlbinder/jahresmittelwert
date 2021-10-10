// https://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json?datvon=2021-10-06 00:00&datbis=2021-10-07 00:00&stationcode=S108&komponentencode=BOE

import { getDayOfYear } from "date-fns";
import { from } from "rxjs";
import { concatMap, map, reduce } from "rxjs/operators";
import { writeStationsData, init } from "./firebase";

import { Messwert } from "./messwert";
import { getStationByCode, getStationsAir } from "./stationen/utilities";

// A simple request Observable we can reuse to clean up our examples
const request = (url: string) => from(fetch(url).then((res) => res.json()));

init();
// console.log(getStationByCode("S415"));
// console.log(getStationsAir());

const meanView = document.getElementById("mean");
const daily = "TMW";
const component = "NO2";
// const station = "S217"; // Enns-Kristein
// const station = "S415"; // 24er-Turm
const station = "S431"; // Römerberg
let urls: string[] = [];

const getDates = () => {
  let dates = [];
  const date = new Date();
  // const daysOfYear = getDayOfYear(date) - 1;
  const daysOfYear = 3;

  for (let i = 0; i < daysOfYear; i++) {
    let dateTo = new Intl.DateTimeFormat("en-GB").format(
      new Date().setDate(date.getDate() - i)
    );
    let dateFrom = new Intl.DateTimeFormat("en-GB").format(
      new Date().setDate(date.getDate() - (i + 1))
    );

    let tmpDateto = dateTo.split("/");
    dateTo = tmpDateto[2] + "-" + tmpDateto[1] + "-" + tmpDateto[0] + " 00:00";
    let tmpDateFrom = dateFrom.split("/");
    dateFrom =
      tmpDateFrom[2] + "-" + tmpDateFrom[1] + "-" + tmpDateFrom[0] + " 00:00";

    dates.push({ dateFrom, dateTo });
  }

  return dates;
};

// console.log(getDates());

const createUrls = () => {
  getDates().map((date) => {
    urls.push(
      `https://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json?datvon=${date.dateFrom}&datbis=${date.dateTo}&stationcode=${station}&komponentencode=${component}`
    );
    return true;
  });

  return urls;
};

createUrls();

const testFrom = () => {
  let count = 1;
  let sum = 0;
  let mittelwert = 0;

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
          console.log(`
            Tage: ${count}
            Station: ${messwert.station} / ${
            getStationByCode(messwert.station).kurzname
          }
            Komponente: ${messwert.komponente}
            Datum: ${new Intl.DateTimeFormat("de-AT").format(
              new Date(messwert.zeitpunkt)
            )}
            Messwert: ${tmp}
            Summe: ${sum}
            Mittelwert: ${mittelwert.toFixed(2)}
          `);
          //}

          count++;

          meanView.innerHTML = `
            <div>
              ${messwert.station}
            </div>
            <div>
              ${getStationByCode(messwert.station).kurzname}
            </div>
            <div>
              NO2: ${mittelwert.toFixed(2).toString()} µg/m2
            </div>
          `;

          writeStationsData(messwert.station, messwert.komponente, messwerte);

          return false;
        });
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log("COMPLETED");
      }
    });
};

document.getElementById("buttonFrom").onclick = testFrom;
