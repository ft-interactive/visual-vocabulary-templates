// @flow
import * as d3 from 'd3';
import catData from './v2-data.js';

d3.csv('chartTypes.csv', (error, chartData) => {
    const plotCategories = catData.categories;

    const container = d3.select('.container');

    window.onresize = redraw;

    let plotWidth = container.node().getBoundingClientRect().width;
    let cellWidth = (plotWidth) / plotCategories.length;

    const menus = container.append('svg')
        .attr('width', plotWidth)
        .attr('height', 100);

    const category = menus.selectAll('.categ')
        .data(plotCategories)
        .enter()
        .append('g')
        .attr('class', 'categ')
        .attr('id', (d, i) => i)
        .on('mouseover', pointer)
        .on('mousedown', addLink);

    category.append('text')
        .attr('class', 'buttonText')
        .attr('x', (d, i) => (cellWidth * i) + (cellWidth / 2))
        .attr('y', 20)
        .attr('height', 20)
        .attr('width', 50)
        .attr('fill', d => d.colour)
        .text(d => d.category);

    category.append('rect')
        .attr('class', 'button')
        .attr('x', (d, i) => cellWidth * i)
        .attr('y', 30)
        .attr('height', 10)
        .attr('width', cellWidth)
        .attr('fill', d => d.colour);

    function addCharts(lookUp) {
        const chartWidth = ((plotWidth - 60) / 6) - 10;
        const chartHolder = d3.select('#charts')
            .append('div');

        const chart = chartHolder.selectAll('.chart')
            .data(() => {
                const filtered = chartData.filter(d => d.category === lookUp);
                return filtered;
            })
            .enter();

        const div = chart.append('div')
            .attr('class', 'chart')
            .style('max-width', chartWidth);

        div.append('div')
            .attr('class', 'chart')
            .style('height', 55)
            .html(d => d.chartName);

        div.append('img')
            .attr('class', 'chart')
            .style('background-color', '#ffffff')
            .style('opacity', (d) => {
                if (d.avail === 'TRUE') {
                    return 0.85;
                } return 0.2;
            })
            .attr('src', d => `icons/${d.img}`)
            .attr('width', chartWidth - 20)
            .attr('height', chartWidth - 20);

        div.append('div')
            .attr('class', 'chartDesc')
            .html(d => d.description);
    }

    function addInfo(el) {
        const lookUp = el.category;
        const infoPanel = container.append('div')
          .attr('class', 'panel')
          .attr('id', 'infoPanel')
          .style('background-color', el.colour);

        infoPanel.append('div')
          .attr('class', 'infoHeading')
          .html(lookUp);

        infoPanel.append('div')
          .attr('class', 'infoText')
          .html(el.description);

        infoPanel.append('div')
          .attr('class', 'infoSubhead')
          .html('Examples of use');

        infoPanel.append('div')
          .attr('class', 'infoText')
          .html(el.example);

        infoPanel.append('div')
          .attr('class', 'infoSubhead')
          .html('Chart types');

        infoPanel.append('div')
          .attr('id', 'charts')
          .attr('class', 'charts');

        addCharts(lookUp);
    }

    function addLink(link) {
        d3.selectAll('.link')
            .remove();
        d3.selectAll('.panel')
            .remove();

        const x1 = (cellWidth * this.id) + (cellWidth / 2);
        const lineData = [
            { x: x1, y: 40 },
            { x: x1, y: 40 },
            { x: x1, y: 40 },
            { x: x1, y: 40 },
        ];

        const lineData2 = [
            { x: x1, y: 40 },
            { x: x1, y: 60 },
            { x: 10, y: 60 },
            { x: 10, y: 100 },
        ];

        const lineFunction = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveLinear);

        d3.selectAll('.link')
            .data(link)
            .enter();

        menus.append('path')
          .attr('class', 'link')
          .attr('stroke', link.colour)
          .attr('d', lineFunction(lineData))
          .transition()
          .duration(300)
          .attr('d', lineFunction(lineData2))
          .on('end', () => addInfo(link));
    }

    function redraw() {
        plotWidth = container.node().getBoundingClientRect().width;
        cellWidth = plotWidth / plotCategories.length;
        menus.attr('width', plotWidth);
        d3.selectAll('.button')
          .attr('x', (d, i) => cellWidth * i)
          .attr('width', cellWidth);
        d3.selectAll('.buttonText')
          .attr('x', (d, i) => (cellWidth * i) + (cellWidth / 2))
          .attr('width', cellWidth);
    }

    function pointer() {
        this.style.cursor = 'pointer';
    }
});// end data load
