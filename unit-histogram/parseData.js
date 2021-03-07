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
        const { yMin, binWidth, highlightText } = options; // eslint-disable-line no-unused-vars
        // make sure all the dates in the date column are a date object
       
        data.forEach((d) => {
            d.value = +d.value
            d.bin = Math.floor(d.value/binWidth) * binWidth;
        });

        console.log(highlightText)

        const bins = d3.range( d3.min(data, d=> d.bin),(d3.max(data, d=> d.bin) + binWidth  ), binWidth);

        const names = arrayUnique(data.map(d => d.name));
        const selectedNames = names.filter( d => d.search(highlightText) > -1);

        const dataArray = [];

        bins.forEach(( bin, bindex ) => {
            const dataInBin = data.filter(( d ) => {
                return d.bin === bin
            });

            dataInBin.forEach( (e, j) => {

                let highlight = 'no';

                if ( selectedNames.indexOf(e.name) > -1 || e.highlight == 'yes') {
                    highlight = 'yes'
                }

                const binObj = {
                    name: e['name'],
                    bin: e['bin'],
                    value: e.value,
                    y: j,
                    highlight,
                };

                dataArray.push(binObj);


            })
        });

        const maxInBin = d3.max(dataArray, d => d.y);

       const plotData = d3.nest(dataArray)
        .key(d => d.bin)
        .entries(dataArray)




        // Format the dataset that is used to draw the lines
        

        // Sort the data so that the labeled items are drawn on top

         // Filter data for annotations
        const annos = [];

        Object.keys(plotData).forEach(key => {
            let vals = plotData[key].values;

            vals.forEach(v => {

                if(v.highlight == 'yes'){
                annos.push(v)
            }

            })
        });

        const plotAnnos = d3.nest(annos)
                .key(d => d.bin)
                .entries(annos);
        // Format the data that is used to draw highlight tonal bands

        return {
            bins,
            selectedNames,
            plotAnnos,
            plotData
        };
    });
}

 function arrayUnique(array) {
    return array.reduce(function(acc, cur) {
        if (acc.indexOf(cur) < 0) acc.push(cur);
        return acc;
    }, []);
        };





