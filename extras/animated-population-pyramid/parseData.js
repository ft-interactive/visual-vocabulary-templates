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
export function load(url, options = {}) {
    const { dateFormat, groupByYear } = options;
    return loadData(url).then((data) => {
        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);
        const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names
        // Use the seriesNames array to calculate the minimum and max values in the dataset

        let plotData = data;
        let byGeneration;

        // Buid the dataset for plotting
        if (groupByYear) {
            plotData = d3.nest()
                .key(d => d.year)
                .entries(data);

            const generations = d3.nest()
                .key(d => d.year)
                .key(d => d.generation)
                .entries(data);

            generations.forEach((year) => {
                year.values.forEach((gen) => {
                    const genSum = gen.values.reduce((a, b) => a + (+b.Male + +b.Female), 0);
                    gen.sum = genSum;
                });
                const total = year.values.reduce((a, b) => a + b.sum, 0);
                year.total = total;
                year.values.forEach((gen) => {
                    gen.percent = gen.sum / total * 100;
                });
            });

            const generationNames = generations[generations.length - 1].values.map(d => d.key);
            byGeneration = generationNames.map((gen) => {
                let genArr = generations.map(g => g.values.find(v => v.key === gen));
                genArr = genArr.filter(d => d !== undefined);
                return {
                    generation: gen,
                    values: genArr,
                };
            });
        }

        console.log(byGeneration);

        const valueExtent = extentMulti(plotData[plotData.length - 1].values, seriesNames);

        return {
            groupNames,
            valueExtent,
            seriesNames,
            plotData,
            byGeneration,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name', 'year', 'generation', 'born'];
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
