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
        const { sort, sortOn, divisor } = options;

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);
        const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        // Buid the dataset for plotting
        const plotData = data.map(d => ({
            name: d.name,
            total: d.total,
            // range: getRanges(seriesNames, d),
            groups: getGroups(seriesNames, d),
            circleCats: getCircles(seriesNames, d, divisor)
        }));

        if (sort === 'descending') {
            plotData.sort((a, b) =>
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
    const exclude = ['name', 'total'];
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

function getRanges(seriesNames, el) {
    let ranges = [];
    seriesNames.forEach((d, i) =>{
        ranges.push(+el[seriesNames[i]]);
    });
    return ranges;
}

function getCircles(seriesNames, el, divisor) {
    let ranges = [];
    let rangeTotal = 0; 
    seriesNames.forEach((d, i) =>{
        rangeTotal = ((+el[seriesNames[i]]) / divisor)
        ranges.push(rangeTotal);
    });
    
    let numCircles = d3.range(el.total / divisor);

    let circleCat = [];
    let index = 0;
    let stackIndex = [0];

    seriesNames.forEach(function(obj, k){
        if(k > 0) {
            index = index + ranges[k-1];
            stackIndex.push(index);        
        }
    });
    
    for (let k = 0; k < seriesNames.length; k++) {
        for (let i = 0; i < numCircles.length; i++) {
            if (k < seriesNames.length - 1) {
                if (i >= stackIndex[k] && i < stackIndex[k + 1]) {
                    circleCat.push(seriesNames[k]);
                } 
            } else {
                if (i >= stackIndex[k]) {
                    circleCat.push(seriesNames[k]);
                }
            }
        }
    };

    return circleCat.map(name => ({
        name
    }));
}
function getGroups(seriesNames, el) {
    return seriesNames.map(name => ({
        name,
        value: +el[name],
    }));
}
