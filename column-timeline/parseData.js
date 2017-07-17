/**
 * General data munging functionality
 */

import * as d3 from 'd3';

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
                console.dir(columnNames);
                // format the data that is used to draw highlight tonal bands
                const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
                const highlights = [];

                boundaries.forEach((d, i) => {
                    if (d.highlight === 'begin') {
                        highlights.push({ begin: d.date, end: boundaries[i + 1].date });
                    }
                });

                // format the dataset that is used to draw the lines
                const plotData = seriesNames.map(d => ({
                    name: d,
                    columnData: getColumns(data, d),
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

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['date', 'highlight']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

// a function to work out the extent of values in an array accross multiple properties...
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

function getColumns(data, group) {
    const columnData = [];
    data.forEach((el) => {
        // console.log(el,i)
        const column = {
            name: group,
            date: el.date,
            value: +el[group],
            highlight: el.highlight,
            annotate: el.annotate,
        };

        if (el[group]) {
            columnData.push(column);
        }
    });
    return columnData;
}
