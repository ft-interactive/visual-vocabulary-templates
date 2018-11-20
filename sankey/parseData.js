/**
 * General data munging functionality
 */

import * as d3 from 'd3'; // eslint-disable-line
import loadData from '@financial-times/load-data';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) {
  return loadData(url).then((result) => {
    const data = result.data ? result.data : result;
    const { sourceKey, targetKey, valueKey } = options; // eslint-disable-line no-unused-vars
    // Format the dataset that is used to draw the lines
    const plotData = generateGraph({
      data,
      sourceKey,
      targetKey,
      valueKey,
    });

    return { plotData };
  });
}

/**
 * Generates a graph structure relevant to sankey diagrams, force directeds, etc.
 * @param  {array} data       Source data array
 * @param  {string} sourceKey Key to be used for specifying source
 * @param  {string} targetKey Key to be used for specifying target
 * @param  {string} valueKey  Key to be used for specifying value
 * @return {object}           Graph structure comprised of nodes and links
 */
function generateGraph({ data, sourceKey, targetKey, valueKey }) {
  return {
    // This just gets every value in both the source/target cols; dedupes
    nodes: [
      ...new Set(
        data.reduce(
          (acc, node) => [...acc, node[sourceKey], node[targetKey]],
          [],
        ),
      ),
    ].map(name => ({ name })),
    links: data.map(row => ({
      source: row[sourceKey],
      target: row[targetKey],
      value: row[valueKey],
    })),
  };
}
