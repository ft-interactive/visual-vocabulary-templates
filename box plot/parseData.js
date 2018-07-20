/**
 * General data munging functionality
 */

import * as d3 from 'd3';
import loadData from '@financial-times/load-data';
import * as simpleStats from 'simple-statistics';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) { // eslint-disable-line
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;

        // automatically calculate the groupNames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        const groupNames = data.map( d => d.group)
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);

        // Use the groupNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);

        // Buid the dataset for plotting
        const plotData = groupNames.map((d,i) => {
            let groupValues = data.filter((el) => {return el.group === d})
            let qValues = groupValues.map(d => Number(d.value))
            qValues.sort((a, b) => parseFloat(a) - parseFloat(b));
            return {
                group: d,
                values: groupValues,
                q1: d3.quantile(qValues, .25),
                q2: d3.quantile(qValues, .5),
                q3: d3.quantile(qValues, .75),
                quantiles: getQuantiles(qValues, d),
                min: d3.min(qValues),
                max: d3.max(qValues),
                mean: d3.mean(qValues),
            }
            console.log(plotData)
          
            function getQuantiles(vals, groupName) {
                const quantiles = [];
                    for (let i = 1; i < 4; i += 1) {
                        const qData = {};
                        qData.name = `q${i}`;
                        qData.value = d3.quantile(vals, (i / 4));
                        qData.group = groupName;
                        quantiles.push(qData);
                    }
                return quantiles
            }
        });

        console.log('plotData', plotData)

        return {
            valueExtent,
            groupNames,
            seriesNames,
            plotData,
            data,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name', 'group', 'label'];
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
