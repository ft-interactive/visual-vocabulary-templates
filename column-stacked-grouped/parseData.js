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
        const categoryNames = data.map( d => d.category)
            .filter((item, pos, categoryNames) => categoryNames.indexOf(item) === pos);
        const seriesNames = getSeriesNames(data.columns);
        const groupNames = data.map( d => d.name)
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        // Buid the dataset for plotting
        const plotData = data.map((d) => {
            return {
                category: d.category,
                name: d.name,
                stacks: getStacks(d),
                total: d3.sum(getStacks(d), stack => stack.value),
            }
        })

        console.log('plotData', plotData)

        function getStacks(el) {
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

        if (sort === 'descending') {
            plotData.sort((a, b) =>
                b.groups[sortOn].value - a.groups[sortOn].value);// Sorts biggest rects to the left
        } else if (sort === 'ascending') {
            plotData.sort((a, b) => a.groups[sortOn].value - b.groups[sortOn].value);
        } // Sorts biggest rects to the left

        return {
            categoryNames,
            seriesNames,
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
    const exclude = ['name', 'category'];
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

function getGroups(seriesNames, el) {
    return seriesNames.map(name => ({
        name,
        value: +el[name],
    }));
}
