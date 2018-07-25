/**
 * General data munging functionality
 */

import * as d3 from "d3";
import loadData from "@financial-times/load-data";
import * as simpleStats from "simple-statistics";

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) {
    const { samplePoints, bandwidthParameter } = options;
    // eslint-disable-line
    return loadData(url).then(result => {
        const data = result.data ? result.data : result;
        data.forEach(d => (d.value = +d.value));

        // Get group names
        const groupNames = data.map(d => d.group);

        // Find the min and max values in the data set
        const valueExtent = d3.extent(data, d => d.value);

        const plotData = [];

        return {
            valueExtent,
            groupNames,
            plotData,
            data
        };
    });
}
