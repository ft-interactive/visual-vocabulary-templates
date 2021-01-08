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
        const {dateFormat, countries, dateRange} = options;
        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
            d.area = d.area === 'United States' ?'US'
            : d.area === 'United Kingdom' ?'UK'
            : d.area
        });
        const tickRange = dateRange.map((d) => {
            return parseDate(d);
        });
        console.log('tickRange', tickRange)
        console.log('tickRange', tickRange[0])
        console.log('tickRange', tickRange.length)

        const filteredDates = tickRange.length > 1
        ? data.filter( d => d.date >= tickRange[0] && d.date <= tickRange[1])
        : data.filter( d => d.date.getTime() === tickRange[0].getTime()
)

        console.log('filteredDates', filteredDates)

        function getFrames(allData) {
            return allData.filter( d => d.date >= tickRange[0] && d.date <= tickRange[1])
        }

        const frameTimes = tickRange.length > 1 ? getTicks(tickRange)
        : tickRange
        function getTicks(dates) {
            let newRange = d3.timeDay.every(1).range(dates[0], dates[1])
            newRange.push(dates[1]) 
            return newRange  
        }
        console.log(frameTimes)
        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = countries[0] === 'All' ?  getSeriesNames(data) : countries
        console.log('seriesNames', seriesNames)
        // identify total size - used for y axis

        const plotData = seriesNames.map(d => ({
            code: d,
            chartData: getPieData(data, d)
        }));

        console.log('plotData', plotData)
        
        function getPieData(data, key) {
            let filteredData = data.filter(d => d.code === key)
            .sort((a, b) => b.date - a.date)
            .map((el) => ({
                area: el.area,
                code: el.code,
                region: el.region,
                continent: el.continent,
                population: el.population,
                date: el.date,
                vaccinations: el.vaccinations,
                vaccinated_percent: el.vaccinated_percent,
                vaccinations_new: el.vaccinations_new,
                vaccinations_new_7ma: el.vaccinations_new_7ma,
                vaccinations_new_7ma_perM: el.vaccinations_new_7ma_perM,
                source: el.source,
                last_updated: el.last_updated,
                values: [
                    {name: 'Vacinated', value: Number(el.vaccinated_percent)},
                    {name: 'Not vcinated', value: Number(100 - el.vaccinated_percent)},
                ]
        
            }));
            return filteredData

        }
        

        return {
            seriesNames,
            data,
            plotData,
            frameTimes,
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(data) {
    const series = data.map( d => d.code)
        .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);
    return series
}

// // a function to work out the extent of values in an array accross multiple properties...
// export function extentMulti(data, columns) {
//     const ext = data.reduce((acc, row) => {
//         const values = columns.map(key => +row[key]);
//         const rowExtent = d3.extent(values);
//         if (!acc.max) {
//             acc.max = rowExtent[1];
//             acc.min = rowExtent[0];
//         } else {
//             acc.max = Math.max(acc.max, rowExtent[1]);
//             acc.min = Math.min(acc.min, rowExtent[0]);
//         }
//         return acc;
//     }, {});
//     return [ext.min, ext.max];
// }
