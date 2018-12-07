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

        const { dateFormat, joinPoints } = options; // eslint-disable-line no-unused-vars

        const parseDate = d3.timeParse(dateFormat);
        data1.forEach((d) => {
            d.date = parseDate(d.date);
        });
        data2.forEach((d) => {
            d.date = parseDate(d.date);
        });

        const seriesNamesL = getSeriesNames(data1.columns);
        const seriesNamesR = getSeriesNames(data2.columns);

        // Use the seriesNamesL array to calculate the minimum and max values in the dataset
        const valueExtentL = extentMulti(data1, seriesNamesL);
        const valueExtentR = extentMulti(data2, seriesNamesR);

        // Buid the dataset for plotting
        const barData = data1.map(d => ({
            date: d.date,
            groups: getGroups(seriesNamesL, d),
        }));

        const lineData = seriesNamesR.map(d => ({
            name: d,
            linedata: getlines(data2, d),
        }));
        const dateExtent1 = d3.extent(data1, d => d.date);
        const dateExtent2 = d3.extent(data2, d => d.date);
        const dateExtent = [Math.min(dateExtent1[0], dateExtent2[0]), Math.max(dateExtent1[1], dateExtent2[1])];

        //create an array of annotations
        const annotations = data2.filter(d =>
                d.annotate != '' && d.annotate !== undefined)
            .map((el) => {
                return {
                    title: el.annotate,
                    //note: '',
                    targetX: el.date,
                    targetY: Number(el[lineData[0].name]),
                    radius: 0,
                    type: getType(el.type),
                }
            });

        function getType(type) {
            if (type !== '') {
                return type
            }
            return 'vertical'
        }

        
        return {
            seriesNamesL,
            seriesNamesR,
            valueExtentL,
            valueExtentR,
            barData,
            lineData,
            dateExtent,
            data1,
            data2,
            annotations,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['date', 'annotate', 'highlight', 'type']; // adjust column headings to match your dataset
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

export function getlines(d, group, joinPoints) {
    const lineData = [];
    d.forEach((el) => {
        const column = {};
        column.name = group;
        column.date = el.date;
        column.value = +el[group];
        column.highlight = el.highlight;
        column.annotate = el.annotate;
        if (el[group]) {
            lineData.push(column);
        }
        if (el[group] === false && joinPoints === false) {
            lineData.push(null);
        }
    });
    return lineData;
}
