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
        const { fiscal, dateFormat } = options;

        const parseDate = d3.timeParse(dateFormat);

        const fiscalPlot = data.map((d) => {
            const parsedDate = parseDate(d.date);
            return {
                date: parsedDate,
                value: +d.value,
                fyear: getFiscalYear(parsedDate, parseDate),
                fweek: getFiscalWeek(parsedDate, parseDate),
            };
        });

        let plotData;
        if (fiscal) {
            plotData = d3.nest()
                .key(d => d.fyear)
                .entries(fiscalPlot);
        } else {
            const parsedData = data.map(d => ({
                date: parseDate(d.date),
                value: +d.value,
            }));
            plotData = d3.nest()
                .key(d => getFullYear(d.date))
                .entries(parsedData);
        }

        return {
            plotData,
            data,
        };
    });
}

function getFullYear(e) {
    return d3.timeFormat('%Y')(e);
}

function getFiscalYear(e, parseDate) {
    const startDate = `06/04/${getFullYear(e)}`;

    if (e >= parseDate(startDate)) {
        return +getFullYear(e) + 1;
    }
    return +getFullYear(e);
}

function getFiscalWeek(e, parseDate) {
    const getWeekOfYear = d3.timeFormat('%U');

    const startDate = `06/04/${getFullYear(e)}`;
    const week = getWeekOfYear(e);
    const startWeek = getWeekOfYear(parseDate(startDate));

    let fweek;
    if (e >= parseDate(startDate)) {
        fweek = week - startWeek;
    } else {
        fweek = 52 - (startWeek - week);
    }
    return fweek;
}
