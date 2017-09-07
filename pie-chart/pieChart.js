import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let rem = 10;
    const colourScale = d3.scaleOrdinal()
        .range('gChartcolour.categorical_bar');
        // .domain(['group']);
    let colourProperty = 'group';
    let setPalette = false;
    let includeLabel = true;
    let seriesNames = [];
    let radius;


    function chart(parent) {

        const path = d3.arc()
                    .outerRadius(radius)
                    .innerRadius(0);

        const valueLabel = d3.arc()
            .outerRadius(radius -rem)
            .innerRadius(radius - rem);

        const nameLabel = d3.arc()
            .outerRadius(radius + rem)
            .innerRadius(radius + rem);

        parent.append('path')
            .on('mouseover', pointer)
            .on('click',function(d){
                    let pieClass = d3.select(this)
                    if (pieClass.attr('class') === '') {
                        d3.select(this).attr('class','highlight');
                        d3.select(this).style('fill',colourScale.range()[1]);
                    }
                    else{
                        let el = d3.select(this)
                        el.attr('class', '');
                        d3.select(this).style('fill',colourScale.range()[0]);
                    }
                })
            .attr('d', path)
            .attr('fill', d => colourScale());

        parent.append('text')
              .attr('transform', function(d) { return 'translate(' + valueLabel.centroid(d) + ')'; })
              .attr('dy', '0.35em')
              .attr('class', 'pie-value')
              .text(d => d.data.value);
        
        parent.append('text')
              .attr('transform', function(d) { return 'translate(' + nameLabel.centroid(d) + ')'; })
              .attr('dy', '0.35em')
              .attr('class', 'pie-name')
              .text(d => d.data.name);
    }

     function pointer() {
        this.style.cursor='pointer'
    }

    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };

    chart.radius = (d) => {
        radius = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };
    console.log(chart.colourPalette('webS'));

    chart.colourRange = (x) => {
        colourScale.range(x);
        return chart;
    };

    chart.colourDomain = (x) => {
        colourScale.domain(x);
        return chart;
    };

    chart.colourProperty = (x) => {
        colourProperty = x;
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

    return chart;
}
