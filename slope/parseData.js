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

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        const groupNames = data.map(d => d.group).filter(d => d); // create an array of the group names

        const dataSorter = (a, b) => {    // Sort the data so that the labeled items are drawn on top
            if (groupNames.indexOf(a.group) > groupNames.indexOf(b.group)) {
                return 1;
            } else if (groupNames.indexOf(a.group) === groupNames.indexOf(b.group)) {
                return 0;
            }
            return -1;
        };

        function hasGroupName(element) {
            return element !== '';
        }

        const setColourPalette = data.map(d => d.group).every(hasGroupName);

        return {
            seriesNames,
            setColourPalette,
            groupNames,
            dataSorter,
            data,
        };
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name', 'group', 'label']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

// a function to work out the extent of values in an array accross multiple properties...
export function extentMulti(data, columns) {
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
