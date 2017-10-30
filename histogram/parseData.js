
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
        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = d3.extent(data, d => Number(d.value));

        return {
            valueExtent,
            data: data.map(d => Number(d.value)),
        };
    });
}
