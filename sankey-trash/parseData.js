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
    // eslint-disable-line
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;
        const {
            highlightNames,
            dateFormat,
            sourceKey,
            targetKey,
            valueKey,
        } = options;

        // make sure all the dates in the date column are a date object
        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // This complex bit of code calculates accumulative link value
        const reduced = Object.entries(data.reduce((acc, row) => {
            if (!acc[row[targetKey]]) {
                acc[row[targetKey]] = {
                    [row[sourceKey]]: +row[valueKey],
                };
            } else if (!acc[row[targetKey]][row[sourceKey]]) {
                acc[row[targetKey]][row[sourceKey]] = +row[valueKey];
            } else {
                acc[row[targetKey]][row[sourceKey]] += +row[valueKey];
            }

            return acc;
        }, {}))
        .reduce((acc, [target, sources]) => [
            ...acc,
            ...Object.entries(sources).map(([source, value]) => ({
                [targetKey]: target,
                [sourceKey]: source,
                [valueKey]: value,
            })),
        ], []);

        const plotData = generateGraph({
            data: reduced,
            sourceKey,
            targetKey,
            valueKey,
        });

        // Sort the data so that the labeled items are drawn on top
        const dataSorter = function dataSorter(a, b) {
            if (
                highlightNames.indexOf(a.name) > highlightNames.indexOf(b.name)
            ) {
                return 1;
            } else if (
                highlightNames.indexOf(a.name) ===
                highlightNames.indexOf(b.name)
            ) {
                return 0;
            }
            return -1;
        };
        if (highlightNames.length > 0) {
            plotData.sort(dataSorter);
        }

        // Filter data for annotations
        const annos = data.filter(
            d => d.annotate !== '' && d.annotate !== undefined,
        );

        // Format the data that is used to draw highlight tonal bands
        const boundaries = data.filter(
            d => d.highlight === 'begin' || d.highlight === 'end',
        );
        const highlights = [];

        boundaries.forEach((d, i) => {
            if (d.highlight === 'begin') {
                highlights.push({ begin: d.date, end: boundaries[i + 1].date });
            }
        });

        return {
            plotData,
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
    return columns.filter(d => exclude.indexOf(d) === -1);
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
    // return d.map((el) => {
    //     if (el[group]) {
    //         return {
    //             name: group,
    //             date: el.date,
    //             value: +el[group],
    //             highlight: el.highlight,
    //             annotate: el.annotate,
    //         };
    //     }

    //     return null;
    // }).filter(i => i);
}

/**
 * Generates a graph structure relevant to sankey diagrams, force directeds, etc.
 * @param  {array} data       Source data array
 * @param  {string} sourceKey Key to be used for specifying source
 * @param  {string} targetKey Key to be used for specifying target
 * @param  {string} valueKey  Key to be used for specifying value
 * @return {object}           Graph structure comprised of nodes and links
 */
function generateGraph({ data, sourceKey, targetKey, valueKey }) {
    return {
        // This just gets every value in both the source/target cols; dedupes
        nodes: [
            ...new Set(
                data.reduce(
                    (acc, node) => [...acc, node[sourceKey], node[targetKey]],
                    [],
                ),
            ),
        ].map(name => ({ name })),
        links: data.map(row => ({
            source: row[sourceKey],
            target: row[targetKey],
            value: row[valueKey],
        })),
    };
}
