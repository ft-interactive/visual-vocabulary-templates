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
                const plotData = data.map(d => d3.range(d.seats).map(() => d));

                resolve({
                    valueExtent,
                    plotData,
                    data,
                });
            }
        });
    });
}

export function computeSeats(data) {

}

function series(s, n) {
    let r = 0;
    for (let i = 0; i <= n; i += 1) { r += s(i); } return r;
}
