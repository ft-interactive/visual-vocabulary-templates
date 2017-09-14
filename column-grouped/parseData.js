/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, options) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                const { sort, sortOn } = options;
                const seriesNames = getSeriesNames(data.columns);

                const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames);

                // Buid the dataset for plotting
                const plotData = data.map(d => ({
                    name: d.name,
                    groups: getGroups(seriesNames, d),
                }));

                if (sort === 'descending') {
                    plotData.sort((a, b) =>
                        b.groups[sortOn].value - a.groups[sortOn].value);// Sorts biggest rects to the left
                } else if (sort === 'ascending') {
                    plotData.sort((a, b) => a.groups[sortOn].value - b.groups[sortOn].value);
                } // Sorts biggest rects to the left
                else if (sort === 'alphabetical') {
                    plotData.sort((a, b) => a.name.localeCompare(b.name))
                } // Sorts alphabetically

                resolve({
                    valueExtent,
                    seriesNames,
                    plotData,
                    data,
                });
            }
        });
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
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

function getGroups(seriesNames, el) {
    return seriesNames.map(name => ({
        name,
        value: +el[name],
    }));
}
