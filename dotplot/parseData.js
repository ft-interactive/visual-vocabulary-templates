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
        const { sort, sortOn } = options;

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);
        const allGroups = data.map(d => d.group);
        // create an array of the group names
        const groupNames = allGroups.filter((el, i) => allGroups.indexOf(el) === i);
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        // Buid the dataset for plotting
        const plotData = groupNames.map((d) => {
            const values = data.filter(el => el.group === d);
            // Create an array of just the values to extract min, max and quartiles
            const dotValues = values.map(item => Number(item.value));
            dotValues.sort((a, b) => parseFloat(a) - parseFloat(b));
            const quantiles = [];
            for (let i = 1; i < 4; i += 1) {
                const qData = {};
                qData.name = `q${i}`;
                qData.value = d3.quantile(dotValues, (i / 4));
                qData.group = d;
                quantiles.push(qData);
            }
            return {
                group: d,
                values,
                quantiles,
                min: d3.min(dotValues),
                max: d3.max(dotValues),
            };
        });

        if (sort === 'descending') {
            plotData.sort((a, b) =>
            // console.log("sortON=",sortOn)
            // console.log("SortOn",a.groups[sortOn],a.groups[sortOn].value,b.groups[sortOn],b.groups[sortOn].value)
                b.groups[sortOn].value - a.groups[sortOn].value);// Sorts biggest rects to the left
        } else if (sort === 'ascending') {
            plotData.sort((a, b) => a.groups[sortOn].value - b.groups[sortOn].value);
        } // Sorts biggest rects to the left

        return {
            groupNames,
            valueExtent,
            seriesNames,
            plotData,
            data,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name', 'size', 'group', 'highlight'];
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
