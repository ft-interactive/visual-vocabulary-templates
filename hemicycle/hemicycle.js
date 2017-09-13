import * as d3 from 'd3';
import * as gChartcolour from 'g-chartcolour';
import 'd3-selection-multi';

export function draw() {
    let distanceScale = d3.scaleLinear();
    let angleScale = d3.scaleLinear();
    let rem = 16;
    let interpolation = false;
    let rows = 10;
    let arc = 180;
    const dotsize = 5;
    let datasize;
    const rainbow = false; // lay the parties out like bands of a rainbow or not
    let data;
    let partyOrder;
    let innerRadiusCoefficient = 0.4;

    const colourScale = d3.scaleOrdinal()
        .unknown(undefined);

    function chart(parent, frameName) {
        if (['webS', 'print'].indexOf(frameName) > -1) {
            if (parent.data()) {
                data = parent.data().map(d => d[0]);
            }
            const wedge = d3.arc()
                .outerRadius(distanceScale.range()[1] / 2)
                .innerRadius(0); // @TODO

            const pie = d3.pie()
                .value(d => d.seats);
                // .startAngle(Math.PI * -0.5)
                // .endAngle(Math.PI * 0.5);

            parent.selectAll('path.seats')
                .data(pie(data))
                .enter()
                .append('path')
                .attr('d', wedge)
                .attrs({
                    class(d) {
                        const partyNames = colourScale.domain();
                        return `hemicycle__seat hemicycle__seats--${partyNames.indexOf(d.party) > -1 ? d.party : 'empty'}`;
                    },
                    fill(d) {
                        return colourScale(d.party);
                    },
                });
        } else {
            if (parent.data()) {
                data = parent.data().reduce((col, cur) => col.concat(cur), []);
            }

            datasize = data.length;
            data.sort((a, b) => partyOrder[a.party] - partyOrder[b.party]);
            const join = parent.selectAll('circle.seat').data(data);

            join.enter()
                .append('circle')
                .attrs({
                    class(d) {
                        const partyNames = colourScale.domain();
                        return `hemicycle__seat hemicycle__seat--${partyNames.indexOf(d.party) > -1 ? d.party : 'empty'}`;
                    },
                    fill(d) {
                        return colourScale(d.party);
                    },
                    r: dotsize,
                    transform(d, i) {
                        const { column, row } = getLayoutPos(i, rainbow);
                        return `rotate(${angleScale(column)}) translate(${distanceScale(row)},0)`;
                    },
                });
        }
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
        if (d === 'social' || d === 'video') {
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

    function getLayoutPos(i, newRows) {
        const maxColumns = Math.ceil(datasize / rows);
        let row;
        let column;

        if (newRows) {
            row = Math.floor(i / maxColumns);
            column = i % maxColumns;
        } else {
            row = i % rows;
            column = Math.floor(i / rows);
        }
        // console.log(row, column)
        return {
            row,
            column,
        };
    }

    return chart;
}
