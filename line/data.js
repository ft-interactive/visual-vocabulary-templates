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
