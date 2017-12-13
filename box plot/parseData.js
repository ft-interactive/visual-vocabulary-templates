/**
 * General data munging functionality
 */

import * as d3 from 'd3';
import loadData from '@financial-times/load-data';
import * as simpleStats from 'simple-statistics';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) { // eslint-disable-line
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);

        // Buid the dataset for plotting
        const plotData = seriesNames.map((d,i) => {
            const values = data.map((el) => {return el[d]})
                .filter((d) => {return d !==""})
                .map((d) => {return Number(d)});
            // Create an array of just the values to extract min, max and quartiles
            values.sort((a, b) => parseFloat(a) - parseFloat(b));
            const quantiles = [];
            for (let i = 1; i < 4; i += 1) {
                const qData = {};
                qData.name = `q${i}`;
                qData.value = d3.quantile(values, (i / 4));
                qData.group = d;
                quantiles.push(qData);
            }

            console.log(seriesNames[i])
            console.log("Min: "+ Number(d3.min(values)))
            console.log("Max: "+ Number(d3.max(values)))
            console.log("Q25: "+ d3.quantile(values, .25))
            console.log("Q50MED: "+ d3.quantile(values, .5))
            console.log("Q75: "+ d3.quantile(values, .75))
            console.log("Mean: "+ d3.mean(values))

            return {
                group: d,
                values,
                q1: d3.quantile(values, .25),
                q2: d3.quantile(values, .5),
                q3: d3.quantile(values, .75),
                min: Number(d3.min(values)),
                max: Number(d3.max(values)),
                mean: d3.mean(values),
                quartiles: quantiles
            };
        });

        return {
            valueExtent,
            seriesNames,
            plotData,
            data,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = [];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

// a function to work out the extent of values in an array accross multiple properties...
function extentMulti(data, columns) {
    const ext = data.reduce((acc, row) => {
        const values = columns.map(key => +row[key]);
        const rowExtent = d3.extent(values);
        if (!acc.max) {
            acc.max = rowExtent[1];
            acc.min = rowExtent[0];
        } else {
            acc.max = Math.max(acc.max, rowExtent[1]);
            acc.min = Math.min(acc.min, rowExtent[0]);
        }
        return acc;
    }, {});
    return [ext.min, ext.max];
}
