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
        const { sort, sortOn, colorproperty, } = options;
        // automatically calculate the seriesnames excluding the reserved "name" and "group" fields
        const groupNames = data.map( d => d.group)
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);
        const seriesNames = data.map( d => d.name)
            .filter((item, pos, seriesNames) => seriesNames.indexOf(item) === pos);
        const colorDomain = data.map( d => d[colorproperty])
            .filter((item, pos, colorDomain) => colorDomain.indexOf(item) === pos);
                // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, ['value']);
        const circleExtent = extentMulti(data, ['radius']);
        
        const plotData = seriesNames.map(d => ({
            name: d,
            groups: data.filter(el => el.name === d)
        }));
        // if (sort === 'descending') {
        //     plotData.sort((a, b) =>
        //         b.group[sortOn].value - a.group[sortOn].value);// Sorts biggest rects to the left
        // } else if (sort === 'ascending') {
        //     plotData.sort((a, b) => a.group[sortOn].value - b.group[sortOn].value);
        // } // Sorts biggest rects to the left

        return {
            groupNames,
            seriesNames,
            valueExtent,
            circleExtent,
            colorDomain,
            plotData,
            data,
        };
    });
}

/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
function getSeriesNames(columns) {
    const exclude = ['name', 'group', [colour]]; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Works out the extent of values in an array across multiple properties
 * @param  {[type]} data    [description]
 * @param  {[type]} columns [description]
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
