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
        // make sure all the dates in the date column are a date object

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        let seriesNames = data.map(d => d.category);
        seriesNames = seriesNames.filter((el, i) => seriesNames.indexOf(el) === i);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const plotData = [{ name: 'treemap', children: buildTree() }];

        function buildTree() {
            const treeData = seriesNames.map(d => ({
                name: d,
                children: data.filter(el => el.category === d)
            }));
            return treeData;
        }

        return {
            seriesNames,
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
        const values = columns.map(key => row[key])
            .map((item) => {
                if (item !== 0 && (!item || item === '*')) {
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
    

