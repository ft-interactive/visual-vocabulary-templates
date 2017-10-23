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
                const { xMin, dataDivisor } = options;
                // make sure all the dates in the date column are a date object
                const parseDate = d3.timeParse(dateStructure);
                data.forEach((d) => {
                    d.date = parseDate(d.date);
                });

                // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
                const seriesNames = getSeriesNames(data.columns);

                const columnNames = data.map(d => d.date); // create an array of the column names

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames, xMin);

                 // Filter data for annotations
                const annos = data.filter(d => (d.annotate !== '' && d.annotate !== undefined));

                // Format the data that is used to draw highlight tonal bands
                const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
                const highlights = [];

                boundaries.forEach((d, i) => {
                    if (d.highlight === 'begin') {
                        highlights.push({ begin: d.date, end: boundaries[i + 1].date });
                    }
                });

                // format the dataset that is used to draw the lines
                const plotData = seriesNames.map(d => ({
                    name: d,
                    columnData: getColumns(data, d, dataDivisor),
                }));

                resolve({
                    columnNames,
                    seriesNames,
                    plotData,
                    data,
                    valueExtent,
                    highlights,
                    annos,
                });
            }
        });
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['name'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
export function extentMulti(d, columns, xMin) {
    const ext = d.reduce((acc, row) => {
        const values = columns.map(key => row[key])
        .map((item) => {
            if (!item || item === '*') {
                return xMin;
            }
            return Number(item);
        });
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

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
function getColumns(data, group, dataDivisor) {
    const columnData = [];
    data.forEach((el) => {
        // console.log(el,i)
        const column = {
            name: group,
            date: el.date,
            value: +(el[group] / dataDivisor),
            highlight: el.highlight,
            annotate: el.annotate,
        };

        if (el[group]) {
            columnData.push(column);
        }
    });
    return columnData;
}
