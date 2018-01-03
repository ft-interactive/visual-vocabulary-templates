import * as d3 from 'd3';
// import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleBand();
    let yAxisAlign = 'left';
    let rem = 16;
    let fiscal = false;
    const colourScale = d3.scaleOrdinal();

    function chart(parent) {
        const cellSize = window.plotDim.width / 54;

        parent
            .attr('id', d => `calendar-${d.key}`)
            .attr('transform', (d, i) => {
                const calendarOffset = (i * ((cellSize * 7) + (rem * 2)));
                return `translate(0, ${calendarOffset})`;
            });

        parent
            .append('g')
            .attr('transform', `translate(0,${rem * 1.5})`)
            .attr('id', 'alldays')
            .selectAll('.day')
            .data(d => d.values)
            .enter()
            .append('rect')
            // Need to do something with date
            // .attr('id', d => d.date)
            .attr('class', 'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', (d) => {
                const getWeekOfYear = d3.timeFormat('%U');
                if (fiscal) {
                    return d.fweek * cellSize;
                }
                return getWeekOfYear(d.date) * cellSize;
            })
            .attr('y', (d) => {
                const getDayOfWeek = d3.timeFormat('%u');
                return getDayOfWeek(d.date) * cellSize;
            })
            .style('fill', d => colourScale(d.value));
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

    chart.fiscal = (d) => {
        if (d === undefined) return fiscal;
        fiscal = d;
        return fiscal;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        colourScale.range(d);
        return chart;
    };

    return chart;
}
