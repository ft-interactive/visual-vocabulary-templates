/**
 * General data munging functionality
 */

import loadData from '@financial-times/load-data';

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) { // eslint-disable-line
    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;
        const seriesNames = getSeriesNames(data.columns);
        const { scaleBreaks } = options;

        const groupNames = data.map(d => d.name).filter(d => d); // create an array of the group names


        // Buid the dataset for plotting
        const plotData = data.map(d => ({
            name: d.name,
            groups: getGroups(seriesNames, d, scaleBreaks),
        }));

        return {
            seriesNames,
            plotData,
            data,
            groupNames,
        };
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

function getGroups(seriesNames, el, scaleBreaks) {
    return seriesNames.map(name => ({
        name,
        value: +el[name],
        scaleCat: getScaleCats(Number(el[name]), scaleBreaks),
    }));
}

function getScaleCats(el, scaleBreaks) {
    for (let j = 0; j < scaleBreaks.length + 1; j++) {

        if(el === 0) {console.log('msg');
        return j;
        }

        if (el <= scaleBreaks[j])  {
            console.log(scaleBreaks[j], j, el)
            return j;
        }

        if (el > scaleBreaks[j] && el <= scaleBreaks[j + 1]) {
            return j + 1;
        }
    }
}
