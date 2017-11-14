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
        const { total } = options;
        const seriesNames = getSeriesNames(data.columns);

        const groupNamesToDedupe = data.map(d => d.group).filter(d => d); // create an array of the group names
        const groupNames = Array.from(new Set(groupNamesToDedupe)); // returns a deduped array

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);

        let cumulative = 0;

        function extents(last, value) {
            if (last === 0){
                return [0, value];
            } else {
                if (value > 0){
                    return [last, cumulative + value];
                } else {
                    return [(last + value), (last + value + Math.abs(value))];
                }    
            }
        }

        function group(value, group) {
            if(!group) {
                return value < 0 ? 'negative' : 'positive';
            } else {
                return group;
            }
        }

        const plotData = data.map(function(d,i) {
            let xMin = Math.min(cumulative, xMin);
            let xMax = Math.max(cumulative, xMax);

            let extent = extents(cumulative, +d.value);
            cumulative = extent[1];

            if(d.value < 0) {
                cumulative = extent[0];
            } else {
                cumulative = extent[1];
            }
            if(i === 0 && d.value < 0) {
                cumulative = extent[1];
                extent[0] = d.value;
                extent[1] = 0;
            }
            return {
                name: d.name,
                value: +d.value,
                start: extent[0],
                end: extent[1],
                group: group(d.value, d.group)
            }
        });

        if(total === true) {
            plotData.push({
                name: 'Total',
                value: d3.format('.1f')(cumulative),
                start: 0,
                end: d3.sum(data, function(d){
                    return d3.format('.2f')(d.value);
                }),
                group: null
            });
            groupNames.push('Total')
        }
        // // Buid the dataset for plotting
        // const plotData = data.map(d => ({
        //     name: d.name,
        //     groups: getGroups(seriesNames, d),
        // }));
        return {
            valueExtent,
            seriesNames,
            plotData,
            data,
            groupNames,
        };
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name', 'group']; // adjust column headings to match your dataset
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
