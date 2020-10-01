import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let rem = 10;
    let mapDim = [210,297];
    let colourScale = d3.scaleLinear();
    let shapeData;
    let valueExtent;
    let viewbox;

    function chart(parent) {
        let allCells = parent.data()
        parent
            .each(function (d) {
                drawMap(d.mapName, d3.select(this));
            })

        function drawMap(mapName, mapHolder) {
					mapHolder
						.append("text")
						.attr("class", "chart-label")
						.attr("dy", rem * 1.5)
                        .text((d) => d.mapName.substr(d.mapName.length - 4));

					//adds the svg
					const electoralColleges = mapHolder
						.append("svg")
						.attr("class", "colleges")
						.attr("width", mapDim[0])
						.attr("height", mapDim[1]);

					electoralColleges.node().append(shapeData.cloneNode(true));
					electoralColleges.attr("viewBox", `0 0 ${mapDim[0]} ${mapDim[1]}`)
					electoralColleges.attr("preserveAspectRatio", "xMidYMid")

					let mapValues = allCells.filter((d) => d.mapName === mapName);

					mapValues[0].mapData.forEach((d) => {
						electoralColleges
							.select(`#${d.cellId}`)
							.attr("fill", colourScale(d.value));
					});
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

    chart.viewbox = (d) => {
        if (!d) return viewbox;
        viewbox = d;
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

