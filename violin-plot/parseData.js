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
        data.forEach(d => (d.value = Number(d.value)));

        // Get group names
        const groupNames = data
            .map(d => d.group)
            .filter(
                (item, pos, groupNames) => groupNames.indexOf(item) === pos
            );

        // Find the min and max values in the data set
        const valueExtent = d3.extent(data, d => d.value);

        const plotData = groupNames.map((d, i) => {
            let groupValues = data.filter(el => {
                return el.group === d;
            });
            let qValues = groupValues.map(d => d.value);
            qValues = qValues.sort((a, b) => a - b);
            return {
                group: d,
                values: qValues,
                q1: d3.quantile(qValues, 0.25),
                q2: d3.quantile(qValues, 0.5),
                q3: d3.quantile(qValues, 0.75)
            };
        });

        return {
            valueExtent,
            groupNames,
            plotData,
            data
        };
    });
}
