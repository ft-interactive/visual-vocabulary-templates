/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, dateStructure, options) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                const { sort, sortOn } = options;
                // make sure all the dates in the date column are a date object
                const parseDate = d3.timeParse(dateStructure);
                data.forEach((d) => {
                    d.date = parseDate(d.date);
                });
                // automatically calculate the seriesnames excluding the "marker" and "annotate column"
                const seriesNames = getSeriesNames(data.columns);
                const groupNames = [...new Set(data.map(d => d.group))].filter(d => d); // create an array of the group names
                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames);
                // Buid the dataset for plotting
                const plotData = data.map(d => ({
                    name: d.group,
                    groups: getGroups(d),
                }));


                if (sort === 'descending') {
                    plotData.sort((a, b) =>
                    // console.log("sortON=",sortOn)
                    // console.log("SortOn",a.groups[sortOn],a.groups[sortOn].value,b.groups[sortOn],b.groups[sortOn].value)
                         b.groups[sortOn].value - a.groups[sortOn].value);// Sorts biggest rects to the left
                } else { plotData.sort((a, b) => a.groups[sortOn].value - b.groups[sortOn].value); } // Sorts biggest rects to the left

                resolve({
                    groupNames,
                    valueExtent,
                    seriesNames,
                    data,
                });
            }
        });
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['group'];
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
