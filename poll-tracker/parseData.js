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
        const { dateFormat, maxAverage } = options;
    // return loadData(url).then((result) => {

        const parseDate = d3.timeParse(dateFormat);    
        
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);
        const dateExtent = d3.extent(data, d => d.date);

        let pollsters = data.map(d => d.pollster)
            pollsters = pollsters.filter((el, i) => pollsters.indexOf(el) === i);
        console.log('pollsters', pollsters)

        // Format the dataset that is used to draw the lines
        const plotData = seriesNames.map( (d) => {
            return {
                party: d,
                dots: getDots(data,d),
                lines: averageData(dateExtent, maxAverage, getDots(data, d)),
            }
        })

        function getDots(d, group) {
            const dotsData = [];
            d.forEach((el) => {
                // console.log(el,i)
                const column = {};
                column.name = group;
                column.date = el.date;
                column.value = Number(el[group]);
                column.highlight = el.highlight;
                column.annotate = el.annotate;
                column.pollster = el.pollster
                if (el[group]) {
                    dotsData.push(column);
                }
            });
            return dotsData;
        }

        const lineData = seriesNames.map(d => ({
            name: d,
            linedata: getlines(data, d),
        }));

        console.log('plotData', plotData);
        
         // Filter data for annotations
        const annos = data.filter(d => (d.annotate !== '' && d.annotate !== undefined));

        // Format the data that is used to draw highlight tonal bands
        const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
        const highlights = [];

        boundaries.forEach((d, i) => {
            if (d.highlight === 'begin') {
                highlights.push({ begin: d.date, end: boundaries[i + 1].date });
            }
        });

        return {
            plotData,
            dateExtent,
            valueExtent,
            data,
            pollsters

        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['date','pollster', 'annotate', 'highlight'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
function extentMulti(data, columns) {
    const ext = data.reduce((acc, row) => {
        const values = columns.map(key => +row[key]);
        const rowExtent = d3.extent(values);
        if (!acc.max) {
            acc.max = rowExtent[1];
            acc.min = rowExtent[0];
        } else {
            acc.max = Math.max(acc.max, rowExtent[1]);
            acc.min = Math.min(acc.min, rowExtent[0]);
        }
        return acc;
    }, {});
    return [ext.min, ext.max];
}

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
export function getlines(d, group, joinPoints) {
    const lineData = [];
    d.forEach((el) => {
        // console.log(el,i)
        const column = {};
        column.name = group;
        column.date = el.date;
        column.value = +el[group];
        column.highlight = el.highlight;
        column.annotate = el.annotate;
        if (el[group]) {
            lineData.push(column);
        }

        // if(el[group] == false) {
        //     lineData.push(null)
        // }
        if (el[group] === false && joinPoints === false) {
            lineData.push(null);
        }
    });
    return lineData;
}

function averageData(dateExtent, maxAverage, allData) {
    //console.log('allData', allData)
    const lineData = d3.timeDays(dateExtent[0],dateExtent[1])
        .map((d) => {
            return {
                date: d,
                rollingAverage: getAverage(d, maxAverage),
            }
        })
    return lineData

    function getAverage(rollinfDate, maxAverage) {
        let poll = allData.filter((d) =>{
            return d.date <= rollinfDate
        })
        poll = poll.slice(-maxAverage);
        const pollValues =  poll.map(d => d.value)
        const average = d3.mean(pollValues)
        return average
    }


  // const parties = Object.keys(allData[0]['parties']);
  // const parties = Object.keys(allData[0]['parties']);

  // const uniqueDates = [ ...new Set(allData.map(d => d.surveyPublished))];

  // let weightedAverage = [];

  // uniqueDates.forEach(date => {
  //   let pastPolls = allData
  //     .filter(d => {
  //       return ((new Date(d.surveyPublished).getTime() <= new Date(date).getTime()));
  //     })
  //     .filter(d=>(d != undefined))
  //     .filter(d => {
  //       let cduResult = d['parties']['CDU/CSU'];
  //       return typeof cduResult === 'number' && !Number.isNaN(cduResult);
  //     });  //remove dud results at this stage by checking CDU result

  //   let sevenPollsters = [];
  //   let sevenPolls = [];
  //   let averages = {};
  //   let i = 0;

  //   for(let i=0; sevenPollsters.length<=6 && i<pastPolls.length; i++){
  //     if(sevenPollsters.indexOf(pastPolls[i]['pollster']) < 0){
  //       sevenPollsters.push(pastPolls[i]['pollster']);
  //       sevenPolls.push(pastPolls[i])
  //     }
  //   }

  //   sevenPolls.forEach(s => {
  //     s.daysSince = (new Date(date) - new Date(s.surveyPublished))/(1000*60*60*24);
  //     s.weight = Math.max(0,100-Math.pow(s.daysSince,1.354));
  //   });

  //   parties.forEach(p => {

  //     const weightedPartyTotal = sevenPolls
  //       .filter(s => typeof s['parties'][p] === 'number' && !Number.isNaN(s['parties'][p]))
  //       .map(s => {
  //         return s['parties'][p] * s.weight})
  //       .reduce((acc,curr) => (acc + curr), 0);

  //     const totalWeight = sevenPolls
  //       .map(s => s.weight)
  //       .reduce((acc,curr) => (acc+curr), 0);

  //       averages[p] = weightedPartyTotal / totalWeight;
  //   });

  //   weightedAverage.push({
  //     date: date,
  //     averages: averages
  //   });

  //   return weightedAverage;
  // });

  // return weightedAverage;
}
