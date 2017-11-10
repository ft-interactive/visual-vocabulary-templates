/**
 * General data munging functionality
 */

import loadData from '@financial-times/load-data';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) { // eslint-disable-line
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        return {
            seriesNames,
            data,
        };
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

// // a function to work out the extent of values in an array accross multiple properties...
// export function extentMulti(data, columns) {
//     const ext = data.reduce((acc, row) => {
//         const values = columns.map(key => +row[key]);
//         const rowExtent = d3.extent(values);
//         if (!acc.max) {
//             acc.max = rowExtent[1];
//             acc.min = rowExtent[0];
//         } else {
//             acc.max = Math.max(acc.max, rowExtent[1]);
//             acc.min = Math.min(acc.min, rowExtent[0]);
//         }
//         return acc;
//     }, {});
//     return [ext.min, ext.max];
// }
