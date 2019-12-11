import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let mapDim = [210,297];
    let colourScale = d3.scaleOrdinal()
        .domain(['UUIP', 'UKIP', 'SNP', 'Sin Fein', 'SDLP', 'Plaid Cymru', 'Liberal Democrats', 'Labour', 'Independent', 'Green', 'DUP', 'Conservative', 'Brexit', 'Change', 'Alliance'])
        .range(['#195EF7', '#7F00D9', '#FFF8AB', '#50BN77', '#007D51', '#B30000', '#FFAD36', '#FF634D', '#E0D9D5', '#80FF96', '#4228B0', '#0095E8', '#00BFBC', '#FCBDC7', '#FACD5D']);

    let shapeData;
    let regionData;
    let valueExtent;

    function chart(parent) {
        let allCells = parent.data()
        parent.append('g')
            .each(function(d) {
                drawMap(d.mapName, d3.select(this));
            });

        //create geo.path object, set the projection to merator bring it to the svg-viewport

        function drawMap(mapName, mapHolder) {
            
            let cells = allCells.find((d) => {return d.mapName === mapName});

            const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([mapDim[0], mapDim[1]], shapeData);

            const path = d3.geoPath(projection);

            //draw svg lines of the boundries
            const cellsPaths = mapHolder
                .selectAll('.statePolygons')
                .data(shapeData.features)
                .enter()
                .append('path')
                .attr('class','statePolygons')
                .attr('id', (d) => {
                    return d.properties.id + ' ' +d.properties.name})
                .attr('d', path)
                .attr('fill', d => lookup(cells.mapData, d.properties.CODE))
                .attr('stroke', '#e6d9ce')
                .attr('stroke-width', 0.4);

            function lookup(row, idName) {
                const uniqueCell = row.find((d) => {return d.cellId === idName});
                if(!uniqueCell || uniqueCell.value === '') {
                    return '#f6e9d8'
                }
                
                return colourScale.domain().includes(uniqueCell.value) ? colourScale(uniqueCell.value) : '#00ff00'
            }

        }

    }

    chart.mapDim = (d) => {
        if (!d) return mapDim;
        mapDim = d;
        return chart;
    };

    chart.shapeData = (d) => {
        shapeData = d;
        return chart;
    };

    chart.regionData = (d) => {
        regionData = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.valueExtent = (d) => {
        if (!d) return valueExtent;
        valueExtent = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}

