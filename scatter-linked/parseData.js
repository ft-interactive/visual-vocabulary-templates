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
        const {dateFormat, xVar, yVar, sizeVar} = options;
        const parseDate = d3.timeParse(dateFormat);
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        // automatically calculate the seriesnames excluding the reserved "name" and "group" fields
        const seriesNames = getSeriesNames(data.columns);
        const groupNames = data.map( d => d.group)
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);
        console.log('groupNames', groupNames)


        // determin extents for each scale
        const xValueExtent = extentMulti(data, [xVar]);
        const yValueExtent = extentMulti(data, [yVar]);
        const sizeExtent = extentMulti(data, [sizeVar]);

        let plotData = groupNames.map(d => ({
            name: d,
            lineData: getlines(data, d),
            dotsData: getDots(data, d),
        }));

        console.log('plotData', plotData)

        function getDots (d, group) {
            const dots = d.filter((el) => {return el.label === 'yes'})
            .map((m) => {
                return {
                    name: m.group,
                    x: Number(m[xVar]),
                    y: Number(m[yVar]),
                    highlight: m.highlight,
                    radius: m[sizeVar]
                }
            })
            return dots;
        }


         // Filter data for annotations
        const annotations = data.filter((d) => {return d.label === 'yes'})
            .map((el) => {
                return {
                    title: el.annotation,
                    //note: '',
                    targetX: Number(el[xVar]),
                    targetY: Number(el[yVar]),
                    radius: Number(el[sizeVar]),
                    type: getType(el.type),
                }
            });

        function getType(type) {
            if (type !== '') {
                return type
            }
            return 'vertical'
        }

        function getAnnotations(el) {
            const types = data.filter(d => (d.type === el))
            .map((d) => {
                return {
                    title: d.annotation,
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
            plotData,
            annotations,
        };

        function getlines(d, group) {
            const lines = d.filter((el) => {return el.group === group})
            .map((m) => {
                return {
                    name: m.group,
                    x: Number(m[xVar]),
                    y: Number(m[yVar]),
                    date: m.date
                }
            })
            //ensures that te lines data is in the correct chronolicle order
            lines.sort((a, b) => a.date - b.date);
            return lines;
        }
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
