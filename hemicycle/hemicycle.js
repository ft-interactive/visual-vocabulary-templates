import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';
import { computeSeats } from './parseData.js';

export function draw() {
    let distanceScale = d3.scaleLinear();
    let angleScale = d3.scaleLinear();
    let rem = 16;
    let interpolation = false;
    let rows = 10;
    let arc = 180;
    let datasize;
    // let data;
    let partyOrder;
    let innerRadiusCoefficient = 0.4;

    const colourScale = d3.scaleOrdinal()
        .unknown(undefined);

    function chart(parent) {
        const { data, width, height } = parent.datum();
        const { seats, rowWidth } = computeSeats(data, width, height, innerRadiusCoefficient);
        const seatRadius = (d) => {
            let r = 0.4 * rowWidth;
            if (d.data && typeof d.data.size === 'number') {
                r *= d.data.size;
            }
            return r;
        };

        parent.selectAll('.seat')
            .data(seats)
            .enter()
            .append('circle')
            .attr('class', d => `hemicycle__seat hemicycle__seat--${d.party.party.toLowerCase()}`)
            .attr('cx', d => d.cartesian.x)
            .attr('cy', d => d.cartesian.y)
            .attr('fill', d => colourScale(d.party.party))
            .attr('r', seatRadius);
    }

    chart.distanceScale = (d) => {
        if (!d) return distanceScale;
        distanceScale = d;
        return chart;
    };
    chart.distanceScaleDomain = (d) => {
        distanceScale.domain(d);
        return chart;
    };

    chart.distanceScaleRange = (d) => {
        distanceScale.range(d);
        return chart;
    };

    chart.angleScale = (d) => {
        if (!d) return angleScale;
        angleScale = d;
        return chart;
    };
    chart.angleScaleDomain = (d) => {
        angleScale.domain(d);
        return chart;
    };
    chart.angleScaleRange = (d) => {
        angleScale.range(d);
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
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (!d) {
            return colourScale;
        } else if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else {
            colourScale.range(Object.values(d));
            colourScale.domain(Object.keys(d));
        }
        return chart;
    };

    chart.rows = (d) => {
        if (!d) return rows;
        rows = d;
        return chart;
    };

    chart.arc = (d) => {
        if (!d) return arc;
        arc = d;
        return chart;
    };

    chart.datasize = (d) => {
        if (!d) return datasize;
        datasize = d;
        return chart;
    };

    chart.partyOrder = (d) => {
        if (!d) return partyOrder;
        partyOrder = d;
        return chart;
    };

    chart.innerRadiusCoefficient = (d) => {
        if (!d) return innerRadiusCoefficient;
        innerRadiusCoefficient = d;
        return chart;
    };

    return chart;
}
