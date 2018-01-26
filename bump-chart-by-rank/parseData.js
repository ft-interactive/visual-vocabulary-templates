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
        const { highlightNames, dateFormat } = options; // eslint-disable-line no-unused-vars
        // Automatically calculate the seriesnames excluding the "pos" column
        const seriesNames = getSeriesNames(data.columns);
        // Calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        const names = data.map(d => d.name);

        const plotData = names.map((d) => {
            return {
                group: d,
                lineData: getRow(d, data, getHighlight(d)),
                start: getTerminus(d, data, seriesNames[0]),
                end: getTerminus(d, data, seriesNames[seriesNames.length-1]),
                highlight: getHighlight(d),
            };
        });

        function getHighlight(name) {
                if(highlightNames.includes(name)) {
                    return true;
                }
                return false;
            }

        function getTerminus(key, dataset, pos) {
             const row = dataset.filter(d => d.name === key);
             if (row[0][pos] === '') {
                return names.length +1
             }
             return row[0][pos];
        }

        function getRow(key, dataset, status) {
            const row = dataset.filter(d => d.name === key);
            const lines = seriesNames.map((el, i) => {
                return {
                    name: el,
                    value: getValue(row[0][el]),
                    terminal: getTerminal(row[0][el], row[0][seriesNames[i - 1]], i),
                    highlight: status,
                };
            });

            function getValue(value) {
                if (value === '' || value === NaN || value === 'undefinde') {
                    return null;
                }
                return Number(value);
            }

            function getTerminal(value, previous, i) {
                if (i === 0 && value || i === valueExtent[1]) {
                    return true;
                }
                if (value && previous || value ==  false) {
                    return false;
                }
                return true;
            }
            return lines;
        }

        const highlightLines = plotData.filter(d => d.highlight === true);
        // Get terminus labels
        const terminusLabels = {
            startLabel: getEndLabels('start'),
            endLabel: getEndLabels('end'),
        };

        function getEndLabels(sort) {
            plotData.sort((a, b) => a[sort] - b[sort]);
            const labels = plotData.map(d => d.group);
            return labels;
        }

        return {
            seriesNames,
            data,
            plotData,
            valueExtent,
            terminusLabels,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['name', 'group'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}
// a function to work out the extent of values in an array accross multiple properties...
export function extentMulti(data, columns) {
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
    return [Math.max(ext.min,1), ext.max];
}

/**
 * For a group (e.g. a year) get the positions for each of the items in that  year
 */
function getGroups(group, index, data, seriesNames) {
    const rankings = [];
    data.forEach((el) => {
        const column = {};
        column.pos = +el.pos;
        column.group = group;
        column.prevGroup = seriesNames[index - 1];
        column.nextGroup = seriesNames[index + 1];
        column.item = el[group];
        column.prev = relPositions('prev', el[group], index - 1, data, seriesNames);
        column.next = relPositions('next', el[group], index + 1, data, seriesNames);
        column.status = column.prev - column.pos;
        rankings.push(column);
    });
    return rankings;
}

function relPositions(trace, item, i, data, seriesNames) {
    const lookup = seriesNames[i];
    const prev = data.find(d => d[lookup] === item);
    // Checks to see if undefined Nan etc
    if (!prev) return prev;
    return +prev.pos;
}

function getPaths(item, indexStart, indexEnd, plotData) {
    const plotArray = [];
    for (let i = indexStart; i < indexEnd; i += 1) {
        const points = plotData[i].rankings.filter(d => d.item === item);
        plotArray.push(...points);
    }
    return (plotArray);
}

function endIndex(item, start, plotData) {
    let end = 0;
    for (let i = start; i < plotData.length; i += 1) {
        const lookup = plotData[i];
        end = i;
        const test = lookup.rankings.every(el => isNotEqualToItemAndNotLastElement(el, item));
        if (!test) { break; }
    }
    return end;
}

// Helper for endIndex
function isNotEqualToItemAndNotLastElement(el, item) {
    return !(el.item === item && el.next === undefined);
}

function isLineHighlighted(line, highlightNames) {
    return highlightNames.some(d => d === line);
}
