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
        const {dateFormat, countries, dateRange, colourProperty} = options;
        const parseDate = d3.timeParse(dateFormat);
        
        //make sure dates are formated correctly and very basic data cleaning
        data.forEach((d) => {
            if(isNaN(d.vaccinated_percent)) {
                d.vaccinated_percent = 0
            }
            //d.vaccinated_percent = isNaN(d.vaccinated_percent) ? 0;
        })
            
        data.forEach((d) => {
            console.log(d.date)
            d.date = parseDate(d.date);
            // d.region = d.region === 'European Union' ? 'EU';
            d.area = d.area === 'United States' ?'US'
            : d.area === 'United Kingdom' ?'UK'
            : d.area ==='United Arab Emirates' ? 'UAE'
            : d.area
        });

        //make sure dates are formated correctly
        const tickRange = dateRange.map((d) => {
            return parseDate(d);
        });
        console.log(tickRange)
        //Filter data to date range speciufied in indes.js
        const filteredDates = tickRange.length > 1
        ? data.filter( d => d.date.getTime() >= tickRange[0] && d.date.getTime() <= tickRange[1] && typeof d.vaccinated_percent != 'number')
        : data.filter( d => d.date.getTime() === tickRange[0].getTime() && typeof d.vaccinated_percent != 'number')

        console.log(filteredDates)
        //create an aray of frame time stamps for animating
        const frameTimes = tickRange.length > 1
        ? getTicks(tickRange)
        : tickRange

        function getTicks(dates) {
            let newRange = d3.timeDay.every(1).range(dates[0], dates[1])
            newRange.push(dates[1]) 
            return newRange  
        }

        // automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = countries[0] === 'All' ?  getSeriesNames(filteredDates) : countries
        console.log('seriesNames', seriesNames)
        
        const colorSeries = filteredDates.map( d => d[colourProperty])
        .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);

        console.log('colorSeries', colorSeries)
        
        const plotData = seriesNames.map(d => ({
            code: d,
            area: 'not yet aded',
            chartData: getPieData(filteredDates, d)
        }));

        plotData.sort((a, b) =>
                b.chartData[0].vaccinated_percent - a.chartData[0].vaccinated_percent);// Sorts biggest rects to the left
        
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
                    {name: 'Vacinated', value: Number(el.vaccinated_percent), fillColor: el[colourProperty]},
                    {name: 'Not vcinated', value: Number(100 - el.vaccinated_percent), fillColor: el[colourProperty]},
                ]
        
            }));
            return filteredData

        }
        

        return {
            seriesNames,
            data,
            plotData,
            frameTimes,
            colorSeries,
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
