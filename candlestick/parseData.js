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
        const { yMin, dateFormat } = options;
        // make sure all the dates in the date column are a date object
        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames, yMin);

        // Format the dataset that is used to draw the lines
        const plotData = data.map(d => ({
            date: d.date,
            open: +d.open,
            close: +d.close,
            high: +d.high,
            low: +d.low,
            y: +Math.max(d.open, d.close),
            height: +Math.max(d.open, d.close) - Math.min(d.open, d.close),
        }));

        // Adds extra date to plotData so there is space at the end of the chart
        // const last = data[(Number(plotData.length) - 1)].date;
        // console.log("last",last)
        // let newLast = new Date();
        // console.log('newLast', newLast)
        // newLast.setDate(last.getDate() + 1);
        // console.log('newLast', newLast)
        // plotData.push({date: newLast});


        // Format the data that is used to draw highlight tonal bands
        const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
        const highlights = [];

        boundaries.forEach((d, i) => {
            if (d.highlight === 'begin') {
                highlights.push({ begin: d.date, end: boundaries[i + 1].date });
            }
        });

        //create an array of annotations
        const annotations = data.filter(d =>
                d.annotate != '' && d.annotate !== undefined)
            .map((el) => {
                return {
                    title: el.annotate,
                    //note: '',
                    targetX: el.date,
                    targetY: ((Number(el.high) - Number(el.low)) / 2) + Number(el.low),
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
            seriesNames,
            plotData,
            data,
            valueExtent,
            highlights,
            annotations,
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
export function extentMulti(d, columns, yMin) {
    const ext = d.reduce((acc, row) => {
        const values = columns.map(key => +row[key])
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
