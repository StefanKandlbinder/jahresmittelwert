export interface Station {
  code: string;
  kurzname: string;
  langname: string;
  geoLaenge: number;
  geoBreite: number;
  geoRechtswert: number;
  geoHochwert: number;
  komponentenCodes: string[];
}
