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
        const { yMin, yMax, highlightNames, dateFormat } = options; // eslint-disable-line no-unused-vars

        // Automatically calculate the seriesnames excluding the "pos" column
        const seriesNames = getSeriesNames(data.columns);

        // make sure all the dates in the seriesnames are a date object? convert to another format?
        // const parseDate = d3.timeParse(dateFormat);
        // const seriesDates = seriesNames.map(d => parseDate(d));
        // console.log(seriesDates);

        // Calculate the minimum and max values in the dataset
        const min = Math.min(yMin, d3.min(data, d => +d.pos));
        const max = Math.max(yMax, d3.max(data, d => +d.pos));
        const valueExtent = [min, max];

        // Get terminus labels
        const terminusLabels = data.map(d => {
            let last = seriesNames.length - 1;
            return {
                pos: d.pos,
                startLabel: d.pos + ": " + d[seriesNames[0]],
                endlabel: d.pos + ": " + d[seriesNames[last]]
            }
        });

        let plotData = seriesNames.map((d,i) => ({
            group: d,
            index: i + 1,
            rankings: getGroups(d, i, data, seriesNames)
        }));

        let terminus = [];
        let items = []; 
        plotData.forEach(d => {
            let start = d.rankings.filter(el => {
                items.push(el.item);
                return (el.prev==undefined);
            });
            terminus.push.apply(terminus, start);
        });
        terminus = terminus.filter(d => d.next != undefined);

        console.log(plotData);

        // Create array of paths
        let paths = terminus.map(d => ({
            item: d.item,
            indexStart: seriesNames.indexOf(d.group),
            indexEnd: endIndex(d.item, seriesNames.indexOf(d.group) + 1, plotData),
            pathData: getPaths(d.item, seriesNames.indexOf(d.group), endIndex(d.item, seriesNames.indexOf(d.group), plotData) + 1, plotData),
            pos: d.pos,
            posEnd: ""
        }));
        paths.forEach(d => {
            let last = +d.pathData.length - 1;
            d.posEnd = d.pathData[last].pos;
        });

        // Sort the data so that the labeled items are drawn on top
        // const dataSorter = function dataSorter(a, b) {
        //     if (highlightNames.indexOf(a.name) > highlightNames.indexOf(b.name)) {
        //         return 1;
        //     } else if (highlightNames.indexOf(a.name) === highlightNames.indexOf(b.name)) {
        //         return 0;
        //     }
        //     return -1;
        // };
        // if (highlightNames.length > 0) { plotData.sort(dataSorter); }

        return {
            seriesNames,
            data,
            plotData,
            valueExtent,
            terminusLabels,
            paths
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
    let rankings = [];
    data.forEach((el,i) => {
        let column = new Object();
        column.pos = +el.pos;
        column.group = group;
        column.prevGroup = seriesNames[index - 1];
        column.nextGroup = seriesNames[index + 1];
        column.item = el[group];
        column.prev = relPositions("prev", el[group], index - 1, data, seriesNames);
        column.next = relPositions("next", el[group], index + 1, data, seriesNames);
        column.status = column.prev - column.pos;
        rankings.push(column);
    }); 
    return rankings;
}

function relPositions(trace, item, i, data, seriesNames) {
    let lookup = seriesNames[i];
    const prev = data.find(d => d[lookup] == item);
    // Checks to see if undefined Nan etc
    if (!prev) return prev;
    return +prev.pos;
}

function getPaths(item, indexStart, indexEnd, plotData) {
    let plotArray = [];
    for (var i = indexStart; i < indexEnd; i++) {
        let points = plotData[i].rankings.filter(d => d.item == item);
        plotArray.push.apply(plotArray, points);
    }
    return (plotArray);
}

function endIndex(item, start, plotData) {
    var end = 0;
    for (var i = start; i < plotData.length; i++) {
        let lookup = plotData[i];
        let test = lookup.rankings.every(el => {
            end = i;
            return (el.item == item && el.next == undefined);
        });
        if(!test) { break };
    }
    return end;
}
