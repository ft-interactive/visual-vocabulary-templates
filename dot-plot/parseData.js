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
        const { sort, sortOn } = options;

        const seriesNames = getSeriesNames(data.columns);
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        // Buid the dataset for plotting
        const plotData = data.map((d) => {
            let dotValues = seriesNames.map(name => ({
                cat: name,
                value: d[name],
            }));
            // Filter out missing values
            dotValues = dotValues.filter(a => a.value !== '');
            dotValues.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
            return {
                group: d.name,
                values: dotValues,
                min: d3.min(dotValues, dot => +dot.value),
                max: d3.max(dotValues, dot => +dot.value),
            };
        });

        if (sort === 'descending') {
            plotData.sort((a, b) =>
                b.values.find(e => e.cat === sortOn).value - a.values.find(e => e.cat === sortOn).value);
        } else if (sort === 'ascending') {
            plotData.sort((a, b) =>
                a.values.find(e => e.cat === sortOn).value - b.values.find(e => e.cat === sortOn).value);
        }

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
    const exclude = ['name', 'size', 'group', 'highlight'];
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
