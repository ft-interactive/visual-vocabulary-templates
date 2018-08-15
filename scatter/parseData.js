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
        const {xVar, yVar, sizeVar} = options;

        console.log('xVar', xVar, 'yVar', yVar, 'sizeVar', sizeVar)

        // let sizeVar = options.sizeVar;
        // let xVar = options.xVar;
        // let yVar = options.yVar;

        // automatically calculate the seriesnames excluding the reserved "name" and "group" fields
        const seriesNames = getSeriesNames(data.columns);

        // determin extents for each scale
        const xValueExtent = extentMulti(data, [xVar]);
        const yValueExtent = extentMulti(data, [yVar]);
        const sizeExtent = extentMulti(data, [sizeVar]);

        console.log(xValueExtent, yValueExtent, sizeExtent)

         // Filter data for annotations
        const annotations = data.filter((d) => {return d.label === 'yes'});
        //checks that annotation have a type, if non defined then defaults to 'curve'
        annotations.forEach((d) => {
            d.type = testType(d)
        })
        function testType(d) {
            if (d.type === '' || d.type === undefined || d.type === null) {
                return 'curve'
            }
            else {return d.type}
        }

        //create an array of listing unique annotations types
        const anoTypes = annotations.map( d => d.type)
            .filter((item, pos, anoTypes) => anoTypes.indexOf(item) === pos);

        //builds annotation dataset as grouped by type
        const annos = anoTypes.map(d => ({
            type: d,
            annotations: getAnnotations(d),
        }));

        function getAnnotations(el) {
            const types = data.filter(d => (d.type === el))
            .map((d) => {
                return {
                    title: d.name,
                    //note: '',
                    targetX: Number(d[xVar]),
                    targetY: Number(d[yVar]),
                    radius: Number(d[sizeVar]),
                    type: d.type,
                }
            })
            return types
        }

        return {
            seriesNames,
            xValueExtent,
            yValueExtent,
            sizeExtent,
            data,
            annos,
        };
    });
}

/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
function getSeriesNames(columns) {
    const exclude = ['name', 'group', 'label', 'type']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Works out the extent of values in an array across multiple properties
 * @param  {[type]} data    [description]
 * @param  {[type]} columns [description]
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
