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
        const ranges = 0;

        const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names

        // Buid the dataset for plotting
        const plotData = seriesNames.map(d => ({
            name: d,
            gridCats: getGridCats(d, data, ranges),
        }));

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

function getGridCats(seriesNames, data, ranges) {
    const stackIndex = [0];
    const gridCat = [];
    const gridSize = d3.range(100);

    data.forEach((d) => {
        ranges += Number(d[seriesNames]);
        stackIndex.push(ranges);
    });

    gridSize.forEach((obj, key) => {
        data.forEach((d, i) => {
            if (key >= stackIndex[i] && key < stackIndex[i + 1]) {
                gridCat.push(d.name);
            }
        });
        if (key >= stackIndex[stackIndex.length - 1]) {
            gridCat.push('empty');
        }
    });
    return gridCat.map(name => ({
        name,
    }));
}
