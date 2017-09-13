/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = d3.extent(data, d => d.seats);
                // const plotData = data.map(d => d3.range(d.seats).map(() => d));
                const plotData = data.map(d => (d.seats = Number(d.seats), d)); // eslint-disable-line

                resolve({
                    valueExtent,
                    plotData,
                    data,
                });
            }
        });
    });
}

// Adapted from https://github.com/geoffreybr/d3-parliament/blob/master/d3-parliament.js#L28-L189
export function computeSeats(data, width, height, innerRadiusCoef) {
    const outerParliamentRadius = Math.min(width / 2, height);
    const innerParliementRadius = outerParliamentRadius * innerRadiusCoef;

    /**
     * compute number of seats and rows of the parliament
     */
    let nSeats = 0;
    data.forEach((p) => { nSeats += (typeof p.seats === 'number') ? Math.floor(p.seats) : p.seats.length; });

    let nRows = 0;
    let maxSeatNumber = 0;
    let b = 0.5; // what is

    (function firstIIFE() { // @TODO I have no idea why this is an IIFE.
        const a = innerRadiusCoef / (1 - innerRadiusCoef);
        const calcFloor = i => Math.floor(Math.PI * (b + i));
        while (maxSeatNumber < nSeats) {
            nRows += 1;
            b += a;
            /* NOTE: the number of seats available in each row depends on the total number
            of rows and floor() is needed because a row can only contain entire seats. So,
            it is not possible to increment the total number of seats adding a row. */
            maxSeatNumber = series(calcFloor, nRows - 1);
        }
    }());


    /** *
     * create the seats list */
    /* compute the cartesian and polar coordinates for each seat */
    const rowWidth = (outerParliamentRadius - innerParliementRadius) / nRows;
    const seats = [];
    (function secondIIFE() { // @TODO Also, again, why an IIFE?
        const seatsToRemove = maxSeatNumber - nSeats;
        for (let i = 0; i < nRows; i += 1) {
            const rowRadius = innerParliementRadius + (rowWidth * (i + 0.5));
            const rowSeats = Math.floor(Math.PI * (b + i)) - Math.floor(seatsToRemove / nRows) - (seatsToRemove % nRows > i ? 1 : 0);
            const anglePerSeat = Math.PI / rowSeats;
            for (let j = 0; j < rowSeats; j += 1) {
                const s = {};
                s.polar = {
                    r: rowRadius,
                    teta: -Math.PI + (anglePerSeat * (j + 0.5)),
                };
                s.cartesian = {
                    x: s.polar.r * Math.cos(s.polar.teta),
                    y: s.polar.r * Math.sin(s.polar.teta),
                };
                seats.push(s);
            }
        }
    }());

    /* sort the seats by angle */
    seats.sort((a, b2) => a.polar.teta - b2.polar.teta || b2.polar.r - a.polar.r);

    /* fill the seat objects with data of its party and of itself if existing */
    (function thirdIIFE() { // @TODO WHY SO MANY IIFES?!!?
        let partyIndex = 0;
        let seatIndex = 0;
        seats.forEach((s) => {
            /* get current party and go to the next one if it has all its seats filled */
            let party = data[partyIndex];
            const nSeatsInParty = typeof party.seats === 'number' ? party.seats : party.seats.length;
            if (seatIndex >= nSeatsInParty) {
                partyIndex += 1;
                seatIndex = 0;
                party = data[partyIndex];
            }

            /* set party data */
            s.party = party;
            s.data = typeof party.seats === 'number' ? null : party.seats[seatIndex];

            seatIndex += 1;
        });
    }());

    return {
        seats,
        rowWidth,
    };
}

function series(s, n) {
    let r = 0;
    for (let i = 0; i <= n; i += 1) { r += s(i); } return r;
}
