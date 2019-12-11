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
export function load([url, url2, ], options) { // eslint-disable-line
    return loadData([url, url2, ]).then(([result1, result2]) => {
        
        const data1 = result1.data ? result1.data : result1;
        const data2 = result2.data ? result2.data : result2;
        const { dateFormat, columnNames, numOfBars} = options; // eslint-disable-line no-unused-vars
        // make sure all the dates in the date column are a date object

        const parseDate = d3.timeParse(dateFormat);

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        //const seriesNames = getSeriesNames(data1.columns);
        const seriesNames = columnNames
        const partyNames = data1.map(d => d[seriesNames[0]])
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos && item !== '');
        let totalCount = 0;

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        // Format the dataset that is used to draw the lines
        const plotData = seriesNames.map(d => ({
            mapName: d,
            mapData: getMapData(d),
        }));
        const allWiners = data1.map(d => d[seriesNames[0]]).filter(d => d)
        
        const allBars = partyNames.map(d => ({
            partyName: nameTest(d),
            numSeats: getNumberOfSeats(d),
        }))
        
        allBars.sort((a, b) =>
            b.numSeats - a.numSeats);
        
        let barsData = allBars.slice(0, numOfBars);

        let barsLength = barsData.length
        if (barsLength < 5) {
            let noVotes = [
                { partyName: "Con", numSeats: 0 },
                { partyName: "Lab", numSeats: 0 },
                { partyName: "Lib Dems", numSeats: 0 },
                { partyName: "SNP", numSeats: 0 },
                { partyName: "DUP", numSeats: 0 },
                { partyName: "Sinn Féin", numSeats: 0 },
                { partyName: "PC", numSeats: 0 },
                { partyName: "SDLP", numSeats: 0 },
                { partyName: "Green", numSeats: 0 },
                { partyName: "Independent/Other", numSeats: 0 },
                { partyName: "Alliance", numSeats: 0 },
                { partyName: "UUP", numSeats: 0 },
                { partyName: "UKIP", numSeats: 0 },
                { partyName: "SDLP", numSeats: 0 },
                { partyName: "Brexit", numSeats: 0 },
                { partyName: "The Speaker", numSeats: 0 },
            ]
            const cutoff = numOfBars - barsLength
            let lookup = noVotes.filter(f => !barsData.some(g => f.partyName === g.partyName));
            let likely = lookup.slice(0, cutoff);
            barsData = barsData.concat(likely);
        }

        const barsSeriesName = barsData.map((d) =>{
            return nameTest(d.partyName)
        })
        const barsValues = barsData.map((d) => {
            return d.numSeats
        })

        const valueExtent = d3.extent(barsValues);
   
        function getNumberOfSeats(party) {
            let count = allWiners.filter((v) => (v === party)).length;
            totalCount = totalCount + count
            if (totalCount === 0) {
                return '–'
            } else {
                return count
            }
        }

        function getMapData(group) {
            let mapData = data1.map((d) =>{

                return {
                    mapName: group,
                    cellId: d.constituencyCode,
                    cellName: d.constituencyName,
                    ft_name: d.ft_name,
                    value: nameTest(d[group])
                }
            })
            return mapData
        }

        function nameTest (name) {
            if (name ==='Liberal Democrats') {
                return 'Lib Dems'
            }
            if (name ==='Conservative') {
                return 'Con'
            }
            if (name ==='Labour') {
                return 'Lab'
            }
            if (name ==='Plaid Cymru') {
                return 'PC'
            }
            return name
        }
        
        const shapeData = data2

        //console.log('plotDatap',plotData);
        //console.log('valueExtent',valueExtent)
        return {
            barsSeriesName,
            valueExtent,
            plotData,
            shapeData,
            barsData,
            totalCount,
        };
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['id', 'constituency', 'county', 'region', 'country'];
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
