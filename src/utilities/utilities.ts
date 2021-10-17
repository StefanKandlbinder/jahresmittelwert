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

export function createUrls(days: number, station:string, component:string) {
    let urls = [];
    getDates(days).map((date) => {
        urls.push(
            `https://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json?datvon=${date.dateFrom}&datbis=${date.dateTo}&stationcode=${station}&komponentencode=${component}`
        );
        return true;
    });

    return urls;
};
