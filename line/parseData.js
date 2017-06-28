import * as d3 from 'd3';

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

        resolve(data);
      }
    });
  });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
  const exclude = ['date', 'annotate', 'highlight'];
  return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of values in an array accross multiple properties
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function extentMulti(d, columns) {
  const ext = d.reduce((acc, row) => {
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
 * @param  {[type]} data  [description]
 * @param  {[type]} group [description]
 * @return {[type]}       [description]
 */
export function getlines(d, group) {
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
  });
  return lineData;
}
