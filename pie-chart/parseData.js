/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
        
                // automatically calculate the seriesnames excluding the "marker" and "annotate column"
                const seriesNames = getSeriesNames(data.columns);

                function hasGroupName(element, index, array) {
                  return element !== '';
                }
                resolve({
                    seriesNames,
                    data,
                });
            }
        });
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
