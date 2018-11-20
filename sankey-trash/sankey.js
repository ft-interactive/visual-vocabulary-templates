import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

function uid() {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    const seriesNames = [];
    let highlightNames = [];
    const includeAnnotations = d =>
        d.annotate !== '' && d.annotate !== undefined; // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = (d) => {
        switch (d) {
        case 'US':
        case 'GB':
        case 'FR':
        case 'DE':
        case 'IT':
        case 'CA':
            return gChartcolour.diverging_3[0];
        default:
            return gChartcolour.diverging_3[2];
        }
    };
    const nodesKey = 'nodes';
    const linksKey = 'links';
    const nodeId = 'name';
    let plotDim;
    let numberOfLinks = 10;

    function chart(parent) {
        const data = parent.datum();

        data.links = data.links.sort((a, b) => b.value - a.value).slice(0, numberOfLinks);
        data.nodes = [
            ...new Set(
                data.links.reduce(
                    (acc, cur) => [...acc, cur.source, cur.target],
                    [],
                ),
            ),
        ].map(name => ({ name }));

        const generator = sankey()
            .nodes(d => d[nodesKey])
            .links(d => d[linksKey])
            .nodeId(d => d[nodeId])
            .extent([[1, 1], [plotDim.width, plotDim.height]]);

        const { nodes, links } = generator({
            nodes: data.nodes.map(d => Object.assign({}, d)),
            links: data.links.map(d => Object.assign({}, d)),
        });

        parent
            .append('g')
            .attr('stroke', '#000')
            .selectAll('rect')
            .data(nodes)
            .enter()
            .append('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', d => colourScale(d.name))
            .append('title')
            .text(d => `${d.name}\n${d.value}`);
        // .attr('fill', d => color(d.name))
        // .append('title')
        // .text(d => `${d.name}\n${format(d.value)}`);

        const link = parent
            .append('g')
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.5)
            .selectAll('g')
            .data(links)
            .enter()
            .append('g')
            .style('mix-blend-mode', 'multiply');

        const gradient = link
            .append('linearGradient')
            .attr('id', (d) => {
                d.uid = uid();
                return d.uid;
            })
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', d => d.source.x1)
            .attr('x2', d => d.target.x0);

        gradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d => colourScale(d.source.name));

        gradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d => colourScale(d.target.name));

        link.append('path')
            .attr('d', sankeyLinkHorizontal())
            .attr('stroke', d => `url(#${d.uid})`)
            .attr('stroke-width', d => Math.max(1, d.width));

        link.append('title').text(
            d => `${d.source.name} → ${d.target.name}\n${d.value}`,
        );

        parent
            .append('g')
            .style('font', '10px sans-serif')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .attr('x', d => (d.x0 < plotDim.width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr('y', d => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('fill', 'black')
            .attr(
                'text-anchor',
                d => (d.x0 < plotDim.width / 2 ? 'start' : 'end'),
            )
            .text(d => d.name);
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.highlightNames = (d) => {
        highlightNames = d;
        return chart;
    };

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = plotDim = d; // eslint-disable-line
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

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (
                d === 'webS' ||
                d === 'webM' ||
                d === 'webMDefault' ||
                d === 'webL'
            ) {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (
            d === 'webS' ||
            d === 'webM' ||
            d === 'webMDefault' ||
            d === 'webL'
        ) {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
