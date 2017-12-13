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
        const seriesNames = getSeriesNames(data.columns);
        const plotData = [];
        let ranges = 0;

        const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names

        // Buid the dataset for plotting
        const newData = data.map(d => ({
            name: d.name,
            value: d[seriesNames],
            gridCats: getGridCats(seriesNames, d, ranges),
        }));

        plotData.push(newData);
        console.log(newData);
        return {
            seriesNames,
            plotData,
            data,
            groupNames,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}
    const stackIndex = [0];

function getGridCats(seriesNames, el, ranges) {
    const circleCat = [];
    const gridSize = d3.range(100);

    ranges += Number(el[seriesNames]);


    // stackIndex.push(ranges);
    // ranges = ranges += ranges;


    console.log(ranges);
    gridSize.forEach((obj, key) => {
        if (el[seriesNames]) {

        }
    });
}
