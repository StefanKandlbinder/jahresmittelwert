export function getDates(days: number) {
    let dates = [];
    const date = new Date();

    for (let i = 0; i < days; i++) {
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

export function createUrls(days: number, station:string, component:string, proxy: boolean) {
    const proxyUrl = "https://53d58500-4f48-4fde-b935-b53483b6fe66.mock.pstmn.io/"
    const proxyDatVon ="2021-10-20%2000:00";
    const proxyDatBis ="2021-10-21%2000:00";

    let urls = [];
    
    if (days > 0) {
        getDates(days).map((date) => {
            urls.push(
                `${proxy ? proxyUrl : "https://www2.land-oberoesterreich.gv.at/"}imm/jaxrs/messwerte/json?datvon=${proxy ? proxyDatVon: date.dateFrom}&datbis=${proxy ? proxyDatBis : date.dateTo}&stationcode=${station}&komponentencode=${component}`
            );
            return true;
        });        
    }
    else {
        urls.push(`${proxy ? proxyUrl : "https://www2.land-oberoesterreich.gv.at/"}imm/jaxrs/messwerte/json?&stationcode=${station}&komponentencode=${component}`);
    }

    return urls;
};
