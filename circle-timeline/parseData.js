/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, dateStructure) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                // make sure all the dates in the date column are a date object
                const parseDate = d3.timeParse(dateStructure);
                data.forEach((d) => {
                    d.date = parseDate(d.date);
                });

                const seriesNames = getSeriesNames(data.columns);

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames);

                const columnNames = data.map(d => d.name); // create an array of the column names

                //sort data
                const dataSorter = function(a,b){
                    return a-b;
                };

                //parse the data
                const dates = [];
                const values = [];
                data.sort(dataSorter);
                data.forEach( d => {
                    dates.push(d.date);
                    values.push(d.value);
                });


                //establish range of dates
                dates.sort(dataSorter);
                const dateDomain=[dates[0],dates[dates.length-1]];

                //roll up the data by category

                let dataCategories = data.map((dataObj, index) => { return dataObj.category})
                let dataCategoriesDeDuped = dataCategories.filter((category, position) => { return dataCategories.indexOf(category) == position; })
                let dataCategoriesAsObjects = dataCategoriesDeDuped.map((category) => { return {key: category, values: [] } } );
                const plotData = dataCategoriesAsObjects.map((item) => {
                                                            let allCategoryData = data.filter( (d) => {
                                                                return d.category === item.key;
                                                            } );
                                                            item.values = allCategoryData;
                                                            return item;
                                                         });
                resolve({
                    valueExtent,
                    columnNames,
                    seriesNames,
                    plotData,
                    dates
                });
            }
        });
    });
}


// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ['name']; // adjust column headings to match your dataset
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
