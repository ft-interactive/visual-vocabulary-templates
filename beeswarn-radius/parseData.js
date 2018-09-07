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
        // make sure all the dates in the date column are a date object

        // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
        const seriesNames = getSeriesNames(data.columns);
        const categroies = data.map( d => d.category)
            .filter((item, pos, anoTypes) => anoTypes.indexOf(item) === pos);

        // Use the seriesNames array to calculate the minimum and max values in the dataset
        const valueExtent = extentMulti(data, seriesNames);

        // Format the dataset that is used to draw the lines
        const plotData = categroies.map(d => ({
            name: d,
            dots: getdots(data, d),
        }));

        // Filter data for annotations
                let annosData = data.filter((d) => {return d.label === 'yes'})
                    .map((d) => {
                        return {
                            title: d.name,
                            //note: '',
                            targetX: Number(d.value),
                            targetY: d.category,
                            radius: d.radius,
                            type: d.type,
                        }
                    })
                //checks that annotation have a type, if non defined then defaults to 'curve'  

                annosData.forEach((d) => {
                    d.type = testType(d)
                })

                function testType(d) {
                    if (d.type === '' || d.type === undefined || d.type === null) {
                        return 'curve'
                    }
                    else {return d.type}
                }

        return {
            seriesNames,
            categroies,
            valueExtent,
            plotData,
            annosData,
        };
    });
}

export function getdots(d, group) {
    return d.filter(el => el.category == group)
        .map((d) => {
            return{
                id: d.name,
                value: Number(d.value),
                radius: Number(d.radius),
                colour: d.colour,
                category: group,
                label: d.label,
                type: d.type,
            }
        })
   
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['name','radius', 'label', 'category'];
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
