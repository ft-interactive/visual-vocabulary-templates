/**
 * General data munging functionality
 */

import * as d3 from 'd3';

// /**
//  * Parses CSV file and returns structured data
//  * @param  {String} url Path to CSV file
//  * @return {Object}     Object containing series names, value extent and raw data object
//  */
// export function fromCSV(url, dateStructure) {
//     return new Promise((resolve, reject) => {
//         d3.csv(url, (error, data) => {
//             if (error) reject(error);
//             else {
//                 // make sure all the dates in the date column are a date object
//                 const parseDate = d3.timeParse(dateStructure);
//                 data.forEach((d) => {
//                     d.date = parseDate(d.date);
//                 });
//
//                 resolve(data);
//             }
//         });
//     });
// }


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
export function extentMulti(d, columns, yMin = -Infinity) {
    return d3.extent(columns.reduce((col, column) =>
        col.concat(d.map(item => Math.min(yMin, item[column]))), []),
    );
}

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
export function getGroup(d, group, index) {
    const lineData = [];
    d.forEach((el) => {
        const column = {};
        column.name = group;
        column.index = index;
        column.date = el.date;
        column.value = +el[group];
        column.highlight = el.highlight;
        column.annotate = el.annotate;
        if (el[group]) {
            lineData.push(column);
        }
        if (el[group] === false) {
            lineData.push(null);
        }
    });
    return lineData;
}

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, dateStructure) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                // make sure all the dates in the date column are a date object
                const parseDate = d3.timeParse(dateStructure);
                data.forEach((d) => {
                    d.date = parseDate(d.date);
                });

                // automatically calculate the seriesnames excluding the "name" column
                const seriesNames = getSeriesNames(data.columns);

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames);

                const columnNames = data.map(d => d.date); // create an array of the column names

                // format the data that is used to draw highlight tonal bands
                const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
                const highlights = [];

                boundaries.forEach((d, i) => {
                    if (d.highlight === 'begin') {
                        highlights.push({ begin: d.date, end: boundaries[i + 1].date });
                    }
                });

                // format the dataset that is used to draw the lines
                const plotData = seriesNames.map((d, i) => ({
                    name: d,
                    index: i,
                    groupData: getGroup(data, d, i),
                }));

                resolve({
                    columnNames,
                    seriesNames,
                    valueExtent,
                    plotData,
                    data,
                });
            }
        });
    });
}

// // a function to work out the extent of values in an array accross multiple properties...
// function extentMulti(data, columns) {
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

// function getGroup(data, group) {
//     const columnData = [];
//     data.forEach((el) => {
//         const column = {
//             name: group,
//             date: el.date,
//             value: +el[group],
//             highlight: el.highlight,
//             annotate: el.annotate,
//         };
//
//         if (el[group]) {
//             columnData.push(column);
//         }
//     });
//     return columnData;
// }
