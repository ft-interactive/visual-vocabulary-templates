import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let mapDim = [210,297];
    let colourScale = d3.scaleLinear();
    let shapeData;
    let valueExtent;

    function chart(parent) {
        let allCells = parent.data()
        parent.append('g')
            .each(function(d) {
                drawMap(d.mapName, d3.select(this));
            });

        //create geo.path object, set the projection to merator bring it to the svg-viewport

        function drawMap(mapName, mapHolder) {
            mapHolder.append('text')
            .attr('class', 'chart-label')
            .attr('dy', rem *1.5)
            .text(d => d.mapName);
            
            let cells = allCells.find((d) => {return d.mapName === mapName});

            const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([mapDim[0], mapDim[1]], shapeData);

            const path = d3.geoPath(projection);

            //draw svg lines of the boundries
            const colleges = mapHolder
                .selectAll('.colleges')
                .data(shapeData.objects.colleges.features)
                .enter()
                .append('path')
                .attr('class','colleges')
                .attr('id', (d) => {
                    return d.properties.fips + ' ' + d.properties.stateNameS})
                .attr('d', path)
                .attr('fill', d => lookup(cells.mapData, d.properties.fips))
                .attr('stroke-width', 0.4);
            
            const states = mapHolder
                .selectAll('.states')
                .data(shapeData.objects.states.features)
                .enter()
                .append('path')
                .attr('id', (d) => {
                    return d.properties.fips + ' ' + d.properties.stateNameL
                })
                .attr('class', 'states')
                .attr('d', path)  

            function lookup(row, idName) {
                console.log(row, idName)
                const uniqueCell = row.find((d) => { return d.cellId === idName});
                if(!uniqueCell || uniqueCell.value === '') {
                    return 'none'
                }
                return colourScale(uniqueCell.value)
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

