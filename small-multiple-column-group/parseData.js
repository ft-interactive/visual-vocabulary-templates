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
export function load(url, options) {
    const { dateFormat, yMin, dataDivisor } = options;

    return loadData(url).then((result) => {
        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        const columnNames = data.map(d => d.name); // create an array of the column names

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames, yMin);

        // format the dataset that is used to draw the lines
        const plotData = seriesNames.map(d => ({
            name: d,
            columnData: getColumns(data, d, dataDivisor),
        }));

        return {
            columnNames,
            seriesNames,
            plotData,
            data,
            valueExtent,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['name', 'annotate', 'highlight'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
export function extentMulti(d, columns, yMin) {
    const ext = d.reduce((acc, row) => {
        const values = columns.map(key => row[key])
            .map((item) => {
                if (!item || item === '*') {
                    return yMin;
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
            name: el.name,
            // date: el.date,
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
