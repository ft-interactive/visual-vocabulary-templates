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
export function load([url, url2], options) { // eslint-disable-line
    return loadData([url, url2]).then(([result1]) => {
        
        const data1 = result1.data ? result1.data : result1;
        console.log(data1)
        const {columnNames} = options; // eslint-disable-line no-unused-vars
        // make sure all the dates in the date column are a date object


        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = columnNames; 
        console.log(seriesNames)

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data1, seriesNames);
        // Format the dataset that is used to draw the lines
        const plotData = seriesNames.map(d => ({
            mapName: d,
            mapData: getMapData(d),
        }));

        function getMapData(group) {
            let mapData = data1.map((d) =>{            
                return {
                        mapName: group,
                    cellId: d.racenameabbrev,
                    cellName: d.racename,
                        value: d[group],
								};
            })
            return mapData
        }
        console.log(plotData)

        return {
            plotData,
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
