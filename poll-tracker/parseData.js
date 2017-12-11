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
        const { dateFormat, maxAverage } = options;
    // return loadData(url).then((result) => {

        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        const dateExtent = d3.extent(data, d => d.date);

        let pollsters = data.map(d => d.pollster);
        pollsters = pollsters.filter((el, i) => pollsters.indexOf(el) === i);


        // Format the dataset that is used to draw the lines
        const plotData = seriesNames.map((d) => {
            return {
                party: d,
                dots: getDots(data, d),
                lines: getLines(dateExtent, maxAverage, getDots(data, d)),
            };
        });

        function getDots(d, group) {
            const dotsData = [];
            d.forEach((el) => {
                // console.log(el,i)
                const column = {};
                column.name = group;
                column.date = el.date;
                column.value = Number(el[group]);
                column.highlight = el.highlight;
                column.annotate = el.annotate;
                column.pollster = el.pollster
                if (el[group]) {
                    dotsData.push(column);
                }
            });
            return dotsData;
        }
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

        return {
            plotData,
            dateExtent,
            valueExtent,
            data,
            pollsters,
            highlights,
            annos,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['date','pollster', 'annotate', 'highlight'];
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


export function getLines(dateExtent, maxAverage, allData) {
    const lineData = d3.timeDays(Math.max(dateExtent[0], allData[0].date), dateExtent[1])
        .map((d) => {
            return {
                date: d,
                average: getAverage(d, maxAverage),
            };
        });
    return lineData;

    function getAverage(rollinfDate, max) {
        let poll = allData.filter((d) =>{
            return d.date <= rollinfDate;
        })
        .filter((d) => {
            return d.value !== "" ||d.value !== undefined
        })
        .filter((d) => {
            return d.value !== "" ||d.value !== undefined
        })
        poll = poll.slice(-max);
        poll.forEach(s => {
              let daysSince = (rollinfDate-s.date)/(1000*60*60*24);
              s.weight = Math.min(0,100-Math.pow(daysSince,1.354));
            });
        const pollValues = poll.map(d => d.value);
        const average = d3.mean(pollValues);
        const wieghtedAverage = 0
        return average;
    }
}
