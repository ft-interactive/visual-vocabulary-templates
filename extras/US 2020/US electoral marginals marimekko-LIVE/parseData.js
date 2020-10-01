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
export function load(url, options) {
    const { dateFormat } = options;

    return loadData(url).then((result) => {
        const data = result.data ? result.data : result;
        const { columnNames, xMin, dataDivisor } = options;
        console.log(data)
        const filteredData = data.filter((d) => {
            return d.racecode != "overall"
        })
        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        //const seriesNames = getSeriesNames(data.columns);
        const seriesNames = columnNames;

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(filteredData, seriesNames, xMin);

        // format the dataset that is used to draw the lines
        const plotData = seriesNames.map((d) => ({
					category: d,
					demData: getColumns(filteredData, d, "Democrat"),
					repData: getColumns(filteredData, d, "Republican"),
					demLabel: getCanmdidate(filteredData, d, "Democrat"),
					repLabel: getCanmdidate(filteredData, d, "Republican"),
				}));
        
        function getCanmdidate(funcData, group, party,) {
            const lookup = "racewinnerparty" + group;
            const candidateLookup = "racewinnercandidate" + group;
            let partyData = funcData.filter((d) => {
                return d[lookup] === party;
            });
            const candidate = partyData[0][candidateLookup] + " " + group;
            return candidate;


        }

        function getColumns(funcData, group, party) {
            let cumulative = 0;
            let barHeight = 0;
            const sortName = "racemargin" + group;
            const lookup = "racewinnerparty" + group;
            const barWidth = "racemargin" + group;
            let partyData = funcData
                .filter((d) => {
                    return d[lookup] === party;
                })
                .sort((a, b) => Number(b[sortName]) - Number(a[sortName]));
            const stack = partyData.map((d, i) => {
                barHeight = Number(d.racedelegates);
                let state = {
                    name: d.racename,
                    abbreviation: d.racenameabbrev,
                    x: 0,
                    y0: cumulative,
                    y1: cumulative + barHeight,
                    width: Number(d[barWidth]),
                    party: d[lookup],
                };
                cumulative = cumulative + barHeight ;
                return state
            })
            return stack;
        }
        console.log(plotData)

        return {
            seriesNames,
            plotData,
            data,
            valueExtent,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['name','colleges'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
export function extentMulti(d, columns, xMin) {
    const ext = d.reduce((acc, row) => {
        const values = columns.map(key => row[key])
        .map((item) => {
            if (item !== 0 && (!item || item === '*')) {
                return xMin;
            }
            return Number(item);
        });
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

