import * as d3 from 'd3';
import * as gAxis from 'g-axis';
import gChartframe from 'g-chartframe';
import germanyTopojson from 'germany-wahlkreise'; // Custom added to d3-bootloader; see index.html.
import gChartcolour from 'g-chartcolour';
import * as choropleth from './choropleth.js';
import * as parseData from './parseData.js';
import * as ss from 'simple-statistics';
import * as gLegend from './legend-threshold.js';


const dataFile = 'dataCounty.csv';
const geometryFile = 'https://unpkg.com/@financial-times/annotated-atlas@1.1.3/us/10m.json'

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};

const level = 'counties'; //states or counties,
const scaleType = 'jenks' //linear, jenks or manual sets the type of colour scale
const ftColorScale = 'sequentialSingle'
let colorScale = d3.scaleThreshold()
                .domain([3.6, 4.9, 6.6, 9.8, 14.8])
                .range(Object.values(gChartcolour[ftColorScale]));

ss.jenksMatrices = function(data, n_classes) {

        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;

        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }

        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }

        for (var l = 2; l < data.length + 1; l++) {

            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0, 
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of 
                w = 0,
                // `IV` originally
                i4 = 0;

            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {

                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];

                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;

                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;

                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;

                i4 = lower_class_limit - 1;

                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }

            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }

        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    };

    ss.jenks = function(data, n_classes) {

        // sort data in numerical order
        data = data.slice().sort(function (a, b) { return a - b; });

        // get our basic matrices
        var matrices = ss.jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits,
            k = data.length - 1,
            kclass = [],
            countNum = n_classes;

        // the calculation of classes will never include the upper and
        // lower bounds, so we need to explicitly set them
        kclass[n_classes] = data[data.length - 1];
        kclass[0] = data[0];

        // the lower_class_limits matrix is used as indexes into itself
        // here: the `k` variable is reused in each iteration.
        while (countNum > 1) {
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }

        return kclass;
    };




// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
        // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67),

    webS: gChartframe.webFrameS(sharedConfig)
        .margin({ top: 100, left: 15, bottom: 82, right: 5 })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(350)
        .extend('scale', 0.28),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 86, right: 5 })
    // .title("Put headline here")
        .height(580)
        .extend('scale', 0.67),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({ top: 100, left: 20, bottom: 104, right: 5 })
    // .title("Put headline here")
        .height(950)
        .fullYear(true)
        .extend('scale', 1.2),

    print: gChartframe.printFrame(sharedConfig)
        .margin({ top: 40, left: 7, bottom: 35, right: 7 })
    // .title("Put headline here")
        .height(90) //(Use 58.21mm for markets charts that matter)
        .width(112.25) 
        .extend('scale', .32),

    social: gChartframe.socialFrame(sharedConfig)
        .margin({ top: 140, left: 50, bottom: 138, right: 40 })
    // .title("Put headline here")
        .height(750) // 700 is ideal height for Instagram
        .extend('scale', .55),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({ left: 207, right: 207, bottom: 210, top: 233 })
        .extend('scale', 1.0),
    // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });
//parseData.load(geometryFile,{}).then((data) => {
parseData.load([dataFile, geometryFile], {level}).then(([data, geoData, valueExtent, plotData]) => {
    // define chart

    Object.keys(frame).forEach((frameName) => {

        const myChart = choropleth.draw();
        const currentFrame = frame[frameName];
        const projection = d3.geoIdentity()
                .scale(currentFrame.scale())
        const numberofBreaks = Object.values(gChartcolour[ftColorScale]).length
        const myLegend = gLegend.drawLegend();
        // console.log('numberofBreaks',numberofBreaks)
        // console.log('valueExtent', valueExtent)

        let jenksValues = ss.jenks(data.map(function(d) { return +d.value; }), (numberofBreaks))
        jenksValues.shift();
        jenksValues.pop();

        if(scaleType === 'linear') {
            colorScale = d3.scaleLinear()
            .domain(valueExtent)
            .range(Object.values(gChartcolour.basicLinePrint))
            .interpolate(d3.interpolateHcl);
        }

        if(scaleType === 'jenks') {
            colorScale = d3.scaleThreshold()
                .domain(jenksValues)
                .range(Object.values(gChartcolour[ftColorScale]));
        }

        if(scaleType === 'ploitical') {
            colorScale = d3.scaleOrdinal()
                .domain(Object.keys(gChartcolour.usPoliticalPartiesSmallArea))
                .range(Object.values(gChartcolour.usPoliticalPartiesSmallArea));
        }

        // console.log('domain', colorScale.domain())
        // console.log('range', colorScale.range())

        myChart
            .level(level)
            .projection(projection)
            .colourPalette(colorScale)

        currentFrame.plot()
            .selectAll('.choropleth')
            .data([plotData])
            .enter()
            .append('g')
            .attr('class', 'choropleth')
            .call(myChart);

        myLegend
            .colourScale(colorScale)
            .valueExtent(valueExtent)
            .linearRange([0,currentFrame.dimension().width/2.6])

         currentFrame.plot()
          .append('g')
          .attr('id', 'legend')
          .call(myLegend)

    });
    // addSVGSavers('figure.saveable');
});
