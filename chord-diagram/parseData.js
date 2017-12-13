/**
 * General data munging functionality
 */

import * as d3 from 'd3';
import loadData from '@financial-times/load-data';

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
        const plotData = getDataMatrix(data, seriesNames);
        return {
            seriesNames,
            data,
            plotData,
        };
    });
}


function getDataMatrix(data, seriesNames) {
    const dataMatrix = [];
    data.forEach((d) => {
        const rowArray = [];
        seriesNames.forEach((e) => {
            rowArray.push(Number(d[e]));
        });
        dataMatrix.push(rowArray);
    });
    return dataMatrix;
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

