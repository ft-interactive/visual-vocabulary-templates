import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let rem = 10;
    const colourScale = d3.scaleOrdinal();
        // .domain(['group']);
    let colourProperty = 'group'; // eslint-disable-line no-unused-vars
    const setPalette = false; // eslint-disable-line no-unused-vars
    const includeLabel = true; // eslint-disable-line no-unused-vars
    let seriesNames = []; // eslint-disable-line no-unused-vars
    let radius;
    let frameName;
    let setHighlight;


    function chart(parent) {
        const currentFame = frameName;

        const path = d3.arc()
                    .outerRadius(radius)
                    .innerRadius(0);

        const valueLabel = d3.arc()
            .outerRadius(radius - rem)
            .innerRadius(radius - rem);

        const nameLabel = d3.arc()
            .outerRadius(radius + rem)
            .innerRadius(radius + rem);

        parent.append('path')
            .on('click', function sliceClickHandler() {
                chart.colourPalette(currentFame);
                chart.colourPicker(currentFame);
                const pieClass = d3.select(this);
                const segment = d3.select(this.parentNode);

                if (pieClass.attr('class') === '') {
                    pieClass.attr('class', 'highlight')
                        .attr('fill', () => colourScale.range()[setHighlight]);

                    segment.select('.pie-name')
                        .attr('class', 'pie-name highlight');
                } else {
                    const el = d3.select(this);
                    el.attr('class', '')
                        .attr('fill', () => colourScale.range()[0]);

                    segment.select('.pie-name')
                        .attr('class', 'pie-name');
                }
            })
            .attr('d', path)
            .attr('fill', () => colourScale.range()[0]);

        parent.append('text')
              .attr('transform', d => `translate(${valueLabel.centroid(d)})`)
              .attr('dy', '0.35em')
              .attr('class', 'pie-value')
              .text(d => d.data.value);

        parent.append('text')
              .attr('transform', d => `translate(${nameLabel.centroid(d)})`)
              .attr('dy', '0.35em')
              .attr('class', 'pie-name')
              .text(d => d.data.name);
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

    chart.colourPicker = (d) => {
        if (d === 'social' || d === 'video' || d === 'print') {
            setHighlight = 1;
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            setHighlight = 4;
        }
        return chart;
    };

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
    chart.frameName = (d) => {
        if (!d) return frameName;
        frameName = d;
        return chart;
    };

    return chart;
}
