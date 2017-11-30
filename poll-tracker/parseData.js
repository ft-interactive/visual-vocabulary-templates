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
export function load([url, url2], options) { // eslint-disable-line

    return loadData([ // ... and with multiple files
        url,
        url2,
    ]).then(([result1, result2]) => {
    // return loadData(url).then((result) => {

        const data1 = result1.data ? result1.data : result1;
        const data2 = result2.data ? result2.data : result2;
         const { dateFormat } = options; // eslint-disable-line no-unused-vars
        const parseDate = d3.timeParse(dateFormat);    
        data1.forEach((d) => {
            d.date = parseDate(d.date);
        });
        data2.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames1 = getSeriesNames(data1.columns);
        const seriesNames2 = getSeriesNames(data2.columns);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent1 = extentMulti(data1, seriesNames1);
        const valueExtent2 = extentMulti(data2, seriesNames2);

        console.log('valueExtent1', valueExtent1, 'valueExtent2', valueExtent2)

        // Format the dataset that is used to draw the lines
        const dotData = data1.map(d => ({
            date: d.date,
            name: d.name,
            value: d.value,
        }));

        const lineData = seriesNames2.map(d => ({
            name: d,
            linedata: getlines(data2, d),
        }));

        console.log('dotData', dotData);
        console.log('lineData', lineData)

        const dateExtent1 = d3.extent(data1, d => d.date);
        const dateExtent2 = d3.extent(data2, d => d.date);
        console.log('dateExtent1',dateExtent1,'dateExtent2',dateExtent1)
        let dateExtent = dateExtent1.concat(dateExtent2);
        dateExtent = d3.extent(dateExtent);
        const valueExtent = [Math.min(valueExtent1[0], valueExtent2[0]), Math.max(valueExtent1[1], valueExtent2[1])];
        console.log('dateExtent',dateExtent)

         // Filter data for annotations
        const annos = data2.filter(d => (d.annotate !== '' && d.annotate !== undefined));

        // Format the data that is used to draw highlight tonal bands
        const boundaries = data2.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
        const highlights = [];

        boundaries.forEach((d, i) => {
            if (d.highlight === 'begin') {
                highlights.push({ begin: d.date, end: boundaries[i + 1].date });
            }
        });

        return {
            dotData,
            lineData,
            dateExtent,
            valueExtent,
            data1,
            data2,

        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['date', 'annotate', 'highlight'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
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

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
export function getlines(d, group, joinPoints) {
    const lineData = [];
    d.forEach((el) => {
        // console.log(el,i)
        const column = {};
        column.name = group;
        column.date = el.date;
        column.value = +el[group];
        column.highlight = el.highlight;
        column.annotate = el.annotate;
        if (el[group]) {
            lineData.push(column);
        }

        // if(el[group] == false) {
        //     lineData.push(null)
        // }
        if (el[group] === false && joinPoints === false) {
            lineData.push(null);
        }
    });
    return lineData;
}
