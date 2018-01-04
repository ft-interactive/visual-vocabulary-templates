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

        // make sure all the dates in the seriesnames are a date object? convert to another format?
        // const parseDate = d3.timeParse(dateFormat);
        // const seriesDates = seriesNames.map(d => parseDate(d));
        // console.log(seriesDates);

        // Calculate the minimum and max values in the dataset
        const min = d3.min(data, d => +d.pos);
        const max = d3.max(data, d => +d.pos);
        const valueExtent = [min, max];

        // Get terminus labels
        const terminusLabels = data.map((d) => {
            const last = seriesNames.length - 1;
            return {
                pos: d.pos,
                startLabel: `${d.pos}: ${d[seriesNames[0]]}`,
                endLabel: `${d.pos}: ${d[seriesNames[last]]}`,
            };
        });

        const plotData = seriesNames.map((d, i) => ({
            group: d,
            index: i + 1,
            rankings: getGroups(d, i, data, seriesNames),
        }));

        let terminus = [];
        const items = [];
        plotData.forEach((d) => {
            const start = d.rankings.filter((el) => {
                items.push(el.item);
                return (el.prev === undefined);
            });
            terminus.push(...start);
        });
        terminus = terminus.filter(d => d.next !== undefined);

        // Create array of paths
        const paths = terminus.map(d => ({
            item: d.item,
            indexStart: seriesNames.indexOf(d.group),
            indexEnd: endIndex(d.item, seriesNames.indexOf(d.group) + 1, plotData),
            pathData: getPaths(d.item, seriesNames.indexOf(d.group), endIndex(d.item, seriesNames.indexOf(d.group), plotData) + 1, plotData),
            pos: d.pos,
            posEnd: '',
            highlightLine: isLineHighlighted(d.item, highlightNames),
        }));
        paths.forEach((d) => {
            const last = +d.pathData.length - 1;
            d.posEnd = d.pathData[last].pos;
        });

        const highlightPaths = paths.filter(d => d.highlightLine === true);

        // Sort the data so that the labeled items are drawn on top
        const dataSorter = function dataSorter(a, b) {
            if (highlightNames.indexOf(a.item) > highlightNames.indexOf(b.item)) {
                return 1;
            } else if (highlightNames.indexOf(a.item) === highlightNames.indexOf(b.item)) {
                return 0;
            }
            return -1;
        };
        if (highlightNames.length > 0) { plotData.sort(dataSorter); }

        return {
            seriesNames,
            data,
            plotData,
            valueExtent,
            terminusLabels,
            paths,
            highlightPaths,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['pos'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
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
