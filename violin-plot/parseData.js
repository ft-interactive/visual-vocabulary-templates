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
    const { bandwidthParameter } = options;
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
            const kernelDensityEstimationFunction = simpleStats.kernelDensityEstimation(
                qValues
            );
            // Take sample points from range
            let samplePoints = d3.range(valueExtent[0], valueExtent[1] + 1, 1);
            let curvePoints = samplePoints.map(d =>
                kernelDensityEstimationFunction(d)
            );

            return {
                group: d,
                values: qValues,
                q1: d3.quantile(qValues, 0.25),
                q2: d3.quantile(qValues, 0.5),
                q3: d3.quantile(qValues, 0.75),
                violinPlot: curvePoints
            };
        });

        const maxProbability = maxValueAcrossArrays(
            plotData.map(d => d.violinPlot)
        );

        return {
            valueExtent,
            groupNames,
            plotData,
            maxProbability,
            data
        };
    });
}

function maxValueAcrossArrays(arrays) {
    const maxArray = arrays.map(data => d3.max(data));
    return d3.max(maxArray);
}
