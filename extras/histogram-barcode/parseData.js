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
        const { binWidth, xMin, xMax } = options;

        const filteredData = data.filter(d => +d.medianPayDiff <= xMax && +d.medianPayDiff >= xMin)

        const valueExtent = d3.extent(data, d => +d.medianPayDiff);

        const nestedData = d3.nest()
            .key(d => d.name)
            .entries(filteredData);

        const companiesToAnnotate = [];
        const plotData = nestedData.map((d) => {
            const sections = d.values.map(s => s.section);
            const value = +d.values[0].medianPayDiff;
            const cleanName = +d.values[0].clean_name;

            const annotateArray = d.values.map(h => h.highlight);
            let annotate = false;
            annotateArray.forEach((h) => {
                if (h) {
                    annotate = true;
                    companiesToAnnotate.push(d.key);
                }
            });

            return {
                name: d.key,
                clean_name: cleanName,
                value,
                sections,
            }
        });

        const sectionData = d3.nest()
            .key(d => d.section)
            .entries(filteredData);

        sectionData.forEach((section) => {
            section.values.forEach((d) => {
                d.medianPayDiff = +d.medianPayDiff;
                if (companiesToAnnotate.includes(d.name)) {
                    d.annotate = true;
                }
            });

            const valueArray = section.values.map(d => d.medianPayDiff);
            const median = calculateMedian(valueArray);
            section.median = median;
        });

        // Histogram data

        const binnedData = filteredData.map(d => ({
            name: d.name,
            cleanName: d.clean_name,
            value: +d.medianPayDiff,
            bin: Math.floor(Math.round(d.medianPayDiff) / binWidth) * binWidth,
        }));

        let groupedData = d3
            .nest()
            .key(d => d.bin)
            .entries(binnedData);

        const lookup = {};

        groupedData.forEach((bin) => {
            const sorted = bin.values.sort((a, b) => b.value - a.value);
            sorted.forEach((d, i) => {
                d.y = i;
                lookup[d.name] = { bin: bin.key, y: i, value: d.value };
            });
            bin.values = sorted;
        });

        groupedData = groupedData.sort((a, b) => +a.key - +b.key);

        const yMax = d3.max(groupedData, d => d.values.length);

        return {
            valueExtent,
            plotData,
            groupedData,
            binnedData,
            yMax,
            lookup,
            sectionData,
            filteredData,
            companiesToAnnotate
        };
    });
}

function calculateMedian(data) {
    let median = 0;
    const length = data.length;
    const sorted = data.sort((a, b) => a - b);

    if (length % 2 === 0) {
        median = (sorted[length / 2 - 1] + sorted[length / 2]) / 2;
    } else {
        median = sorted[(length - 1) / 2];
    }

    return median;
}
