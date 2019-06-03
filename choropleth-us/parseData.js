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
export function load(urls, options) { // eslint-disable-line
    return Promise.all(urls.map(loadData))
        .then(([result, result2]) => {
            // return loadData([url, url2,]).then(([result1, result2]) => {
                const data = result.data ? result.data : result;
                const geoData = result2.data ? result2.data : result2;
                const {level} = options;
                
                // console.log('data', data);
                // console.log('geoData', geoData);

                // Use the 'value' array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, ['value']);
                // console.log('valueExtent', valueExtent);
                
                geoData.objects[level].geometries = geoData.objects[level].geometries.map((d) => {
                    return {
                        type: d.type,
                        arcs: d.arcs,
                        id: d.id,
                        properties: getProperties(d.id,d.properties),
                    }
                })
                const plotData = geoData
                //console.log('plotData', plotData);

                function getProperties(id, properties) {
                    let newProperties;
                    if (level === 'counties') {
                        newProperties = [properties].map((el) => {
                            return {
                                AFFGEOID: el.AFFGEOID,
                                ALAND: el.ALAND,
                                AWATER: el.AWATER,
                                COUNTYFP: el.COUNTYFP,
                                COUNTYNS: el.COUNTYNS,
                                GEOID: el.GEOID,
                                LSAD: el.LSAD,
                                NAME: el.NAME,
                                STATEFP: el.STATEFP,
                                value: getValue(id),
                            }
                        })
                    }

                    if (level === 'states') {
                        newProperties = [properties].map((el) => {
                            return {
                                LSAD: el.LSAD,
                                STATEFP: el.STATEFP,
                                value: getValue(id),
                            }
                        })
                    }
                    
                    function getValue(id){
                        try {
                        const test = data.find(item => id === item.FIPS)
                        return Number(test.value)
                        }
                        catch (err) {
                            return 'none'
                        }

                    }
                    return newProperties
                }

                return [data, geoData,valueExtent, plotData];
        });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['date']; // adjust column headings to match your dataset
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

// a function to work out the extent of values in an array accross multiple properties...
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
