/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, dateStructure, options) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                const { sort } = options;
                // make sure all the dates in the date column are a date object
                // const parseDate = d3.timeParse(dateStructure);
                // data.forEach((d) => {
                //     d.date = parseDate(d.date);
                // });

                const seriesNames = getSeriesNames(data.columns);

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames);

                // function that calculates the position of each rectangle in the stack
                const getStacks = function getStacks(el) {
                    let posCumulative = 0;
                    let negCumulative = 0;
                    let baseY = 0;
                    let baseY1 = 0;
                    const stacks = seriesNames.map((name, i) => {
                        if (el[name] > 0) {
                            baseY1 = posCumulative;
                            posCumulative += (+el[name]);
                            baseY = posCumulative;
                        }
                        if (el[name] < 0) {
                            baseY1 = negCumulative;
                            negCumulative += (+el[name]);
                            baseY = negCumulative;
                            if (i < 1) { baseY = 0; baseY1 = negCumulative; }
                        }
                        return {
                            name,
                            y: +baseY,
                            y1: +baseY1,
                            value: +el[name],
                        };
                    });
                    return stacks;
                };

                const plotData = data.map(d => ({
                    name: d.name,
                    bands: getStacks(d),
                    total: d3.sum(getStacks(d), stack => stack.value),
                }));

                switch (sort) {
                case 'descending':
                    plotData.sort((a, b) => b.total - a.total);// Sorts biggest rects to the left
                    break;
                case 'ascending':
                    plotData.sort((a, b) => a.total - b.total);// Sorts biggest rects to the right
                    break;

                case 'alphabetical':
                    plotData.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    break;
                }

                const columnNames = data.map(d => d.name); // create an array of the column names

                resolve({
                    valueExtent,
                    columnNames,
                    seriesNames,
                    plotData,
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

// a function that calculates the cumulative max/min values of the dataset
function getMaxMin(values) {
    const cumulativeMax = d3.sum(values.filter(d => (d > 0)));
    const cumulativeMin = d3.sum(values.filter(d => (d < 0)));
    return [cumulativeMin, cumulativeMax];
}

// a function to work out the extent of values in an array accross multiple properties...
function extentMulti(data, columns) {
    const ext = data.reduce((acc, row) => {
        const values = columns.map(key => +row[key]);
        const maxMin = getMaxMin(values);
        const rowExtent = maxMin;
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
