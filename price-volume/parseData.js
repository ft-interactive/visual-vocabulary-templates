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
    // return loadData(url).then((result) => {

        const data = result.data ? result.data : result;
        const { dateFormat, joinPoints } = options; // eslint-disable-line no-unused-vars

        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
        })

        const seriesNames = getSeriesNames(data.columns);
        const lineSeries = seriesNames.slice(0,1);
        const barSeries = seriesNames.slice(1,2);

        // Use the seriesNamesL array to calculate the minimum and max values in the dataset
        const valueExtentPrice = d3.extent(data, d => d[seriesNames[0]]);
        const valueExtentVolume = d3.extent(data, d => d[seriesNames[1]]);
        const dateExtent = d3.extent(data, d => d.date);

        // Buid the dataset for plotting
        const barData = data.map(d => ({
            date: d.date,
            groups: getGroups(barSeries, d),
        }));
        
        const lineData = lineSeries.map(d => ({
            name: d,
            linedata: getlines(data, d),
        }));

        // Filter data for annotations
        const annotations = data.filter((d) => {return d.annotate != ''});
        //checks that annotation have a type, if non defined then defaults to 'threshold'
        annotations.forEach((d) => {
            d.type = testType(d)
        })
        function testType(d) {
            if (d.type === '' || d.type === undefined || d.type === null) {
                return 'threshold'
            }
            else {return d.type}
        }

        //create an array of listing unique annotations types
        const anoTypes = annotations.map( d => d.type)
            .filter((item, pos, anoTypes) => anoTypes.indexOf(item) === pos);

        //builds annotation dataset as grouped by type
        const annos = anoTypes.map(d => ({
            type: d,
            annotations: getAnnotations(d),
        }));

        function getAnnotations(el) {
            const types = data.filter(d => (d.type === el))
            .map((d) => {
                return {
                    title: d.annotate,
                    //note: '',
                    targetX: d.date,
                    targetY: Number(d[lineData[0].name]),
                    radius: 0,
                    type: d.type,
                }
            })
            return types
        }
        return {
            data,
            barSeries,
            lineSeries,
            valueExtentPrice,
            valueExtentVolume,
            barData,
            lineData,
            annos,

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

function getGroups(barSeries, el) {
    return barSeries.map(name => ({
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
