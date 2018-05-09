/**
 * General data munging functionality
 */

import loadData from '@financial-times/load-data';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) {
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;
        const { yMin } = options; // eslint-disable-line no-unused-vars

        // get name of column with rate categories
        const rateCategoryName = data.columns[1];

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        // also exclude the rateCategoryName
        const seriesNames = getSeriesNames(data.columns).filter(
            name => name !== rateCategoryName,
        );

        // get unique projection dates
        const projectionDates = data
            .map(d => d.date)
            .filter((v, i, a) => a.indexOf(v) === i);

        // Format the dataset that is used to draw the lines
        const plotData = seriesNames.map(d => ({
            name: d,
            beeswarmData: getBeeswarm(data, d, rateCategoryName),
        }));

        return {
            seriesNames,
            plotData,
            projectionDates,
        };
    });
}

/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['date', 'annotate', 'highlight'];
    return columns.filter(d => exclude.indexOf(d) === -1);
}

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
export function getBeeswarm(d, group, rateCategoryName) {
    const beeswarmData = [];
    d.forEach((el) => {
        // console.log(el,i)
        const column = {};
        column.name = group;
        column.date = el.date;
        column.numDots = +el[group];
        column.value = +el[rateCategoryName];
        if (el[group]) {
            beeswarmData.push(column);
        }
    });
    return beeswarmData;
}
