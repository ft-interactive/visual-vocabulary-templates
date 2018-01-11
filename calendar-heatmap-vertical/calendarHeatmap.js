import * as d3 from 'd3';
// import gChartcolour from 'g-chartcolour';

export function draw() {
    let rem = 16;
    let fiscal = false;
    let scaleBreaks = [];
    let colourPalette = [];
    let cellSize = 10;
    let clipYear = true;
    const cScale = d3.scaleThreshold()
        .domain(scaleBreaks)
        .range(colourPalette);

    function chart(parent) {
        parent
            .attr('id', d => `calendar_${d.key}`)
            .attr('transform', (d, i) => {
                const calendarOffset = (i * ((cellSize * 7) + (rem * 2))) - (rem * 1.3);
                return `translate(${calendarOffset}, 0)`;
            });

        // Add days
        parent
            .append('g')
            .attr('transform', `translate(0,${rem * 1.5})`)
            .attr('class', 'dayHolder')
            .selectAll('.days')
            .data(d => d.values)
            .enter()
            .append('rect')
            .attr('id', d => `date: ${d.date} value: ${d.value}`)
            .attr('class', 'days')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('y', (d) => {
                if (fiscal) {
                    return d.fweek * cellSize;
                }
                return getWeekOfYear(d.date) * cellSize;
            })
            .attr('x', d => +d.date.getDay() * cellSize)
            .style('fill', d => cScale(d.value));

        parent
            .append('g')
            .attr('class', 'monthOutlines')
            .selectAll('.months')
            .data((d) => {
                if (fiscal) {
                    return d3.timeMonths(
                        new Date(parseInt(d.key, 10) - 1, 3, 1),
                        new Date(parseInt(d.key, 10), 2, 31),
                    );
                }
                return d3.timeMonths(
                    new Date(parseInt(d.key, 10), 0, 1),
                    new Date(parseInt(d.key, 10), 11, 31),
                );
            })
            .enter()
            .append('path')
            .attr('class', 'months')
            .attr('transform', `translate(0, ${rem * 1.5})`)
            .attr('d', d => monthPath(d, fiscal, cellSize, clipYear));
    }

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

    chart.cellSize = (d) => {
        if (!d) return cellSize;
        cellSize = d;
        return chart;
    };

    chart.clipYear = (d) => {
        if (typeof d === 'undefined') return clipYear;
        clipYear = d;
        return chart;
    };

    chart.fiscal = (d) => {
        if (typeof d === 'undefined') return fiscal;
        fiscal = d;
        return chart;
    };

    chart.scaleBreaks = (d) => {
        if (typeof d === 'undefined') return scaleBreaks;
        scaleBreaks = d;
        cScale.domain(d);
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourPalette;
        colourPalette = d;
        cScale.range(d);
        return chart;
    };

    return chart;
}

function monthPath(t0, fiscal, cellSize, clipYear) {
    const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
    let w0;
    let w1;

    if (fiscal) {
        w0 = +getFiscalWeek(t0);
        w1 = +getFiscalWeek(t1);
        if (w0 > w1) { w0 = 0; }
    } else {
        w0 = +getWeekOfYear(t0);
        w1 = +getWeekOfYear(t1);
    }

    let d0 = +t0.getDay();
    const d1 = +t1.getDay();

    if (w0 === 0 && !clipYear) {
        d0 = 0;
    }

    w0 = parseInt(w0, 10);
    w1 = parseInt(w1, 10);

    return `M${d0 * cellSize},${(w0 + 1) * cellSize}`
        + `V${w0 * cellSize}H${7 * cellSize}`
        + `V${w1 * cellSize}H${(d1 + 1) * cellSize}`
        + `V${(w1 + 1) * cellSize}H0`
        + `V${(w0 + 1) * cellSize}Z`;
}

function getWeekOfYear(e) {
    return d3.timeFormat('%U')(e);
}

function getFiscalWeek(e) {
    // will need to refactor this to somewhere cellSize
    const parseDate = d3.timeParse('%d/%m/%Y');

    const startDate = `06/04/${e.getFullYear()}`;
    const week = getWeekOfYear(e);
    const startWeek = getWeekOfYear(parseDate(startDate));

    let fweek;
    if (e >= parseDate(startDate)) {
        fweek = week - startWeek;
    } else {
        fweek = 52 - (startWeek - week);
    }
    return fweek;
}
