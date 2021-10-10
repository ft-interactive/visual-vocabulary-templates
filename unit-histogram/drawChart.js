import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    // let dataset = [];
    let rem = 10;
    let yScale0 = d3.scaleLinear();
    let yScale1 = d3.scaleBand();
    let xScale0 = d3.scaleLinear();
    let xScale1 = d3.scaleBand();
    let colourThresholds = [];
    let seriesNames = [];
    let highlightNames = [];
    let selectedNames = [];
    let yAxisAlign = 'right';
    let markers = false;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleThreshold();
    // .range(gChartcolour.lineWeb)
    // .domain(seriesNames);

    function chart(parent) {

     const unitG = parent.append('g');

     colourScale
     .domain(colourThresholds);


     unitG.selectAll('unit')
     .data( d => d.values)
     .enter()
     .append('rect')
     .classed('unit', true)
     .classed('annotations', d => d.highlight == 'yes' ? 'yes' : 'no')
     .attr('x', d => xScale0( d.bin ))
     .attr('y', d => yScale0( d.y ) - yScale1.bandwidth())
     .attr('width', d => xScale1.bandwidth())
     .attr('height', d => yScale1.bandwidth())
     .style('fill', d => colourScale(d.bin))
     .style('stroke', d => d.highlight == 'yes' ? 'black' : 'none')
     .style('stroke-width', .6)
     // .style('opacity', d => d.highlight == 'yes' ? 1 : .7); 

     

    }


    chart.yScale0 = (d) => {
        if (!d) return yScale0;
        yScale0 = d;
        return chart;
    };

    chart.yDomain0 = (d) => {
        if (typeof d === 'undefined') return yScale0.domain();
        yScale0.domain(d);
        return chart;
    };

    chart.yRange0 = (d) => {
        if (typeof d === 'undefined') return yScale0.range();
        yScale0.range(d);
        return chart;
    };

    chart.yScale1 = (d) => {
        if (!d) return yScale1;
        yScale1 = d;
        return chart;
    };

    chart.yDomain1 = (d) => {
        if (typeof d === 'undefined') return yScale1.domain();
        yScale1.domain(d);
        return chart;
    };

    chart.yRange1 = (d) => {
        if (typeof d === 'undefined') return yScale1.range();
        yScale1.range(d);
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return chart;
    };

    chart.xDomain0 = (d) => {
        xScale0.domain(d);
        return chart;
    };

    chart.xRange0 = (d) => {
        xScale0.rangeRound(d);
        return chart;
    };

    chart.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return chart;
    };

    chart.xDomain1 = (d) => {
        xScale1.domain(d);
        return chart;
    };

    chart.xRange1 = (d) => {
        xScale1.rangeRound(d);
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };


    chart.annotate = (d) => {
        annotate = d;
        return chart;
    };

    chart.dataset = (d) => {
        dataset = d;
        return chart;
    };

    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return chart;
    };

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

     chart.colourThresholds = (d) => {
        colourThresholds = d;
        return chart;
    };

      chart.selectedNames = (d) => {
        selectedNames = d;
        return chart;
    };

    

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

  function addLabels(plotData, parent, rem){

         const labelG = parent.append('g');
        
        const labelData = plotData.filter( d => d.highlight == 'yes');

        console.log(plotData[0])
        

        const labels = labelG.selectAll('g')
        .data(labelData)
        .enter()
        .append('g');

        

       

        
        labels.call( p => {

            // console.log(plotData)

            p.append('line')
                .attr('x1', d => xScale0(d.bin) + (xScale1.bandwidth()/2))
                .attr('x2', d => xScale0(d.bin) + (xScale1.bandwidth()/2))
                .attr('y1', d => yScale0(d.y))
                .attr('y2', d => yScale0(d.y) + rem)
                .style('stroke','#000000')
                .style('stroke-width', rem/10)
                // .style('stroke-dasharray',[4,2]);

            p.append('text')
            .attr('x', d => xScale(d.bin) + (xScale1.bandwidth()/2))
            .attr('y', d => d3.max([yScale1(d.ypos) + rem ,0]))
            .style('font-family','metric')
            .style('font-size',16)
            .style('fill','#000')
            .html( d => d.name + ' ' + d.value + '%')

        })
    }

    export function drawAnnotations(){

        let yScale0 = d3.scaleLinear();
        let yScale1 = d3.scaleBand();
        let xScale0 = d3.scaleLinear();
        let xScale1 = d3.scaleBand();
        let rem = 10;

         function annotations(parent) {

    const labelG = parent.append('g')
     .attr('class','highlight');
        
     const labels = labelG.selectAll('g')
        .data(d => d.values)
        .enter()
        .append('g')
        .attr('class','annotations-holder')
        .call( p => {

            p.append('line')
                .attr('x1', d => xScale0(d.bin) + (xScale1.bandwidth()/2))
                .attr('x2', d => xScale0(d.bin) + (xScale1.bandwidth()/2))
                .attr('y1', d => yScale0(d.y) - yScale1.bandwidth())
                .attr('y2', d => yScale0(d.y) - rem*2)
                .style('stroke','#000000')
                // .style('stroke-width', .6)
                // .style('stroke-dasharray',[4,2]);

            p.append('text')
            .attr('x', d => xScale0(d.bin) + (xScale1.bandwidth()/2))
            .attr('y', d => d3.max([yScale0(d.y) - rem*2,0]))
            .attr('class','annotation')
            // .style('font-family','metric')
            // .style('font-size',16)
            // .style('fill','#000')
            .text( d => d.name + ' ' + d.value + '%')

        })    
        

    }

    annotations.yScale0 = (d) => {
        if (!d) return yScale0;
        yScale0 = d;
        return annotations;
    };

    annotations.yDomain0 = (d) => {
        if (typeof d === 'undefined') return yScale0.domain();
        yScale0.domain(d);
        return annotations;
    };

    annotations.yRange0 = (d) => {
        if (typeof d === 'undefined') return yScale0.range();
        yScale0.range(d);
        return annotations;
    };

    annotations.yScale1 = (d) => {
        if (!d) return yScale1;
        yScale1 = d;
        return annotations;
    };

    annotations.yDomain1 = (d) => {
        if (typeof d === 'undefined') return yScale1.domain();
        yScale1.domain(d);
        return annotations;
    };

    annotations.yRange1 = (d) => {
        if (typeof d === 'undefined') return yScale1.range();
        yScale1.range(d);
        return annotations;
    };

    annotations.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return annotations;
    };

    annotations.xDomain0 = (d) => {
        xScale0.domain(d);
        return annotations;
    };

    annotations.xRange0 = (d) => {
        xScale0.rangeRound(d);
        return annotations;
    };

    annotations.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return annotations;
    };

    annotations.xDomain1 = (d) => {
        xScale1.domain(d);
        return annotations;
    };

    annotations.xRange1 = (d) => {
        xScale1.rangeRound(d);
        return annotations;
    };

    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };


    return annotations;
}


