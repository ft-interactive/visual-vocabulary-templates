import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export function draw() {
  const colorScale = d3.scaleOrdinal();
  let frameName;
  let plotDim;
  let rem = 10;
  const idify = name => name.replace(' ', '_').toLowerCase();

  function chart(parent) {
    const data = parent.datum();
    const generator = sankey()
      .nodeId(d => d.name)
      .nodeWidth(rem)
      .nodePadding(rem / 2)
      .extent([[1, 1], [plotDim.width, plotDim.height]])
      .iterations(0);
    const { nodes, links } = generator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d })),
    });
    const color = (name) => {
      colorScale.domain(data.nodes.map(node => node.name));

      return colorScale(name);
    };
    // Need different blending modes for light and dark backgrounds
    const blendingMode =
      frameName === 'social' || frameName === 'video' ? 'normal' : 'multiply';

    parent
      .append('g')
      .attr('stroke', '#000')
      .selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => color(d.name))
      .attr('stroke', d => color(d.name))
      .append('title')
      .text(d => `${d.name}\n${d.value}`);

    const link = parent
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.8)
      .selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .style('mix-blend-mode', blendingMode);

    const gradient = link
      .append('linearGradient')
      .attr('id', (d) => {
        const sourceName = idify(d.source.name);
        const targetName = idify(d.target.name);

        return `${sourceName}-link-${targetName}-${frameName.toLowerCase()}`;
      })
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => color(d.source.name));

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => color(d.target.name));

    link
      .append('path')
      .attr(
        'd',
        // Shorten the links so they don't meet the nodes
        sankeyLinkHorizontal()
          .source(d => [d.source.x1 + (rem / 4), d.y0])
          .target(d => [d.target.x0 - (rem / 4), d.y1]),
      )
      .attr('stroke', (d) => {
        const sourceName = idify(d.source.name);
        const targetName = idify(d.target.name);

        return `url(#${sourceName}-link-${targetName}-${frameName.toLowerCase()})`;
      })
      .attr('stroke-width', d => Math.max(1, d.width));

    link
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);
  }

  chart.colourPalette = (d) => {
    if (!d) return colorScale;
    if (d === 'social' || d === 'video') {
      colorScale.range(gChartcolour.lineSocial);
    } else if (
      d === 'webS' ||
      d === 'webM' ||
      d === 'webMDefault' ||
      d === 'webL'
    ) {
      colorScale.range(gChartcolour.lineWeb);
    } else if (d === 'print') {
      colorScale.range(gChartcolour.linePrint);
    }
    return chart;
  };

  chart.frameName = (d) => {
    if (!d) return frameName;
    frameName = d;
    return chart;
  };

  chart.plotDim = (d) => {
    if (!d) return plotDim;
    plotDim = d;
    return chart;
  };

  chart.rem = (d) => {
    if (!d) return rem;
    rem = d;
    return chart;
  };

  return chart;
}
