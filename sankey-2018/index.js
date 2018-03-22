import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as custom from './chartNameHere.js';
import * as sankeyjs from './sankey.js';
import * as parseData from './parseData.js';
import * as gChartcolour from 'g-chartcolour';

// User defined constants similar to version 2
const dateStructure = '%d/%m/%Y';

const dataFile = 'data.csv?b';

const sharedConfig = {
    // title: 'German election 2017: which voters switched parties?',
    title: 'German election 2017: AfD and FDP surge, fuelled by gains|from Merkel&rsquo;s CDU and previously disengaged voters',
    subtitle: 'Percentages refer to the share of valid votes cast*',
    source: '*Flows totalling less than 1 per cent of votes excluded|Source: Infratest dimap|Graphic: John Burn-Murdoch / @jburnmurdoch',
};

var leftLabels = {"CDUCSU":"41.5%", "SPD":"25.7%", "Left":"8.6%", "Green":"8.4%", "AfD":"4.8%", "FDP":"4.7%"};
var rightLabels = {"CDUCSU":"33%", "SPD":"20.5%", "Left":"9.2%", "Green":"8.9%", "AfD":"13%", "FDP":"10.7%"};
// let yMin = 0;//sets the minimum value on the yAxis
// let yMax = 1500;//sets the maximum value on the xAxis
// const yAxisHighlight = 100; //sets which tick to highlight on the yAxis
// const numTicksy = 3;//Number of tick on the uAxis
// const yAxisAlign = "right";//alignment of the axis
// const interval = "years";//date interval on xAxis "decade", "lustrum", "years","months","days"
// let annotate = true; // show annotations, defined in the 'annotate' column
// let markers = false;//show dots on lines
// let legendAlign = "vert";//hori or vert, alignment of the legend
// let legendType = "line";//rect, line or circ, geometry of legend marker
// let interpolation=d3.curveLinear//curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveCatmullRom
// let minorAxis = true//turns on or off the minor axis

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 15, sankey: 45 })
   .title("German election 2017:|which voters switched parties?") //use this if you need to override the defaults
   // .subtitle("Subtitle") //use this if you need to override the defaults
   .height(500),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 20, sankey: 50 })
   // .title("Put headline here")
   .height(700),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 20, sankey: 90 })
   // .title("Put headline here")
   .height(700),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 20, sankey: 75 })
   // .title("Put headline here")
   .height(900)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 7, bottom: 35, right: 7, sankey: 40 })
   .title("German election 2017:|which voters switched parties?")
   .height(68)
   .width(55),

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 140, left: 50, bottom: 138, right: 50, sankey: 60 })
   .title("German election 2017:|which voters switched parties?") //use this if you need to override the defaults
   // .subtitle("Subtitle")
   // .title("Put headline here")
   .height(750), // 700 is ideal height for Instagram

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 207, right: 207, bottom: 210, top: 233, sankey: 50 }),
   // .title("Put headline here")
};

// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataFile, dateStructure).then((data) => {

    // define chart    
    const myChart = custom.draw();

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        let plotMargin = currentFrame.margin(),
          bounds = currentFrame.plot().node().parentNode.getBoundingClientRect(),
          height = bounds.height - (plotMargin.top + plotMargin.bottom),
          width = bounds.width - (plotMargin.left + plotMargin.right),
          plotWidth, plotHeight, plots,
          rows = 1, columns = 1, maxRadius = Math.pow(width*height,0.15)-1;

        plotMargin.gap = 0;

        if(frameName.indexOf("webM") >= 0){
          d3.select(currentFrame.plot().node().parentNode).selectAll(".chart-source, .chart-copyright")
            .attrs({
              transform:`translate(0,${-35})`
            })
        }

        function wordWrap(element){
          let elText = element.html().split("|")
          element.html("").selectAll('tspan')
            .data(elText)
            .enter()
            .append('tspan')
            .html(function(d){ return d; })
            .attr('y',function(d,i){ return ((i-((elText.length-1)/2)) * currentFrame.rem()); })
            .attr('x',0);
        }

        let flatData = data.data
          .filter(d => !(d.source == "Did_not_vote" && d.target == "Did_not_vote"))
          .filter(d => !(d.source == "Newly_eligible" && d.target == "Did_not_vote"))
          .filter(d => !(d.source == "New_arrivals" && d.target == "Did_not_vote"))
          .filter(d => !(d.target == "Deceased"));

        let valSum = d3.sum(flatData, d => d.value);

        flatData.forEach(d => {
          d.value = d.value/valSum*100
        });

        flatData = flatData.filter(d => d.value >= 1);

        console.log(flatData);

        const chartHolder = currentFrame.plot();

        const media = d3.select(chartHolder.node().parentNode).node().className.baseVal;

        if(rows > 1 || columns > 1){
            plotWidth = (width/columns)-(plotMargin.gap/columns),
            plotHeight = (height/rows);

            plots = chartHolder.selectAll("g.plot_")
              .data(flatData)
              .enter()
              .append("g")
              .attrs({
                  class:function(d,i){return 'plot_ ' + i},
                  "transform":function(d,i){
                      let xPos = i % columns;
                      let yPos = Math.floor(i/columns);
                      let gap = (i % columns != 0) ? (i % columns)*(plotMargin.gap/(columns-1)):0;
                      return 'translate(' + ((plotWidth*xPos+gap)) + ',' + (plotHeight*yPos) + ')'
                  }
            });
          }else{
            plotWidth = (width/columns)-(plotMargin.gap/2),
            plotHeight = (height/rows);

            plots = chartHolder.selectAll("g.plot_")
              .data([flatData])
              .enter()
              .append("g")
              .attrs({
                  class:function(d,i){return 'plot_ ' + i},
                  "transform":function(d,i){
                      let xPos = i % columns;
                      let yPos = Math.floor(i/columns);
                      let gap = (i % columns == 1) ? plotMargin.gap:0;
                      return 'translate(' + ((plotWidth*xPos+gap)) + ',' + (plotHeight*yPos) + ')'
                  }
              });
        }

        let xNudge = +d3.select(plots.node().parentNode.parentNode).selectAll(".chart-title tspan").attr("x");

        // And a colour scale
        const colours = d3.scaleOrdinal()
          .domain([""]);

        // const partyColours = {"CDU/CSU":"#33302E",SPD:"#F34D5B",FDP:"#fcc83c",Linke:"#B3325D",AfD:"#1E8FCC",Grune:"#AECC70",Other:"#CEC6B9"};

        const partyColours = d3.scaleOrdinal()
          .range(["#33302E", "#F34D5B", "#fcc83c", "#B3325D", "#1E8FCC", "#AECC70", "#CEC6B9", "#CEC6B9", "#CEC6B9"])
          .domain(["CDU/CSU", "SPD", "FDP", "Left", "AfD", "Green", "Others", "Newly_eligible", "Did_not_vote"]);

        // const partyColours = d3.scaleOrdinal()
          // .range(["#6DA8E1","#E25050","#CA6DBF","#FDBB30","#F2D92D","#65A68C", "#6ABDB6","#CEC6B9", "#aaaaaa", "#3E5585", "#931A69", "#DF64A7", "#B9B081"])
          // .domain(["Con", "Lab", "Ukip", "LD", "SNP", "Green", "PC", "Other", "DK", "Yes", "No", "Leave", "Remain"]);

        if (frameName === 'social' || frameName === 'video') {
            colours.range(gChartcolour.lineSocial);
        } else if (frameName === 'webS' || frameName === 'webM' || frameName === 'webMDefault' || frameName === 'webL') {
            colours.range(gChartcolour.lineWeb);
        } else if (frameName === 'print') {
            colours.range(gChartcolour.linePrint);
        }

        let seriesNames = Object.keys(flatData[0]).filter(function(d){ return d != 'value' && d != 'date'; });

        let defs = plots.append("defs");

        let sankey = sankeyjs.drawSankey(plotWidth-plotMargin.sankey*2)
          .nodeWidth(currentFrame.rem()*0.7)
          .nodePadding(currentFrame.rem()*0.2)
          .size([(plotWidth-plotMargin.sankey*2), plotHeight]);

        let path = sankey.link();

        //set up graph in same style as original example but empty
        let plotData = {"nodes" : [], "links" : []};

        //The column heading from the dataset have been concatonated to the name
        //so that you can have nodes that appear to map to the same name, eg
        //Labour to Labour so you can map vote share over time
        flatData.forEach(function (d) {
          plotData.nodes.push({ "name":d[seriesNames[0]]+seriesNames[0] });
          plotData.nodes.push({ "name": d[seriesNames[1]]+seriesNames[1] });
          plotData.links.push({ "source": d[seriesNames[0]]+seriesNames[0],
                             "target": d[seriesNames[1]]+seriesNames[1],
                             "value": +d.value,
                             "highlight": +d.highlight });
         });

        console.log("plotData", plotData);

        // return only the distinct / unique nodes
        plotData.nodes = d3.nest()
          .key(d => d.name)
          .entries(plotData.nodes)
          .map(d => d.key);

        console.log("nodes", plotData.nodes)
    
        let cat=[];

        // loop through each link replacing the text with its index from node
        plotData.links.forEach(function (d, i) {
          plotData.links[i].source = plotData.nodes.indexOf(plotData.links[i].source);
          plotData.links[i].target = plotData.nodes.indexOf(plotData.links[i].target);
          let sourceString = plotData.nodes[plotData.links[i].source].replace(/source|target|HL_|HR_|RL_/g,"");
          let targetString = plotData.nodes[plotData.links[i].target].replace(/source|target|HL_|HR_|RL_/g,"");
          let gradient = defs.append("linearGradient")
              .attr("id", sourceString.replace(/HL_|HR_|RL_/g,"") + "_to_" + targetString);
          gradient
              .append("stop")
              .attr("offset", "0%")
              .attr("stop-color", partyColours(sourceString));
          gradient
              .append("stop")
              .attr("offset", "100%")
              .attr("stop-color", partyColours(targetString));
        });

        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings and remove serieNames as these are no longer needed
        plotData.nodes.forEach(function (d, i) {
          let check=d.slice(-(seriesNames[0].length));
          if (check==seriesNames[0]){
              cat.push(d.slice(0,-(seriesNames[0].length)))
          }
          if ((i % 2 == 0)){
              console.log("even")
              let chrts=seriesNames[0].length
              d = d.slice(0, -chrts);
          }
          else {
              let chrts=seriesNames[1].length
              d = d.slice(0, -chrts);
          }
          plotData.nodes[i] = { "name": d };
        });

        console.log("cat",cat)

        sankey
          .nodes(plotData.nodes)
          .links(plotData.links)
          .layout(0);

        // add in the links
        let link = plots.append("g").selectAll("."+media+"link")
          .data(plotData.links)
          .enter().append("path")
          .attr("id",function(d) {
            return d.source.name.replace(/HL_|HR_|RL_/g,"") + "_to_" + 
                d.target.name;
            })
          .attr("transform", 
              "translate(" + plotMargin.sankey + "," + 0 + ")")
          .attr("class", media+"link")
          .style("opacity", d => d.highlight == 1 ? 1:0.3)
          .attr("d", path)
          .style("stroke",function(d,i){
            return "url(#" + d.source.name.replace(/HL_|HR_|RL_/g,"") + "_to_" + d.target.name + ")"
            // return partyColours(d.target.name)
          })
          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
          .sort(function(a, b) { return isNaN(b.highlight) - isNaN(a.highlight); });

        // add in the nodes
        let node = plots.append("g").selectAll("."+media+"node")
          .data(plotData.nodes)
          .enter().append("g")
            .attr("class", media+"node")
            .attr("transform", function(d) { 
              return "translate(" + (d.x)+ "," + (d.y) + ")"; })
          .call(d3.drag()
            .on("start", function() { 
                this.parentNode.appendChild(this); })
            .on("drag", function(d){
              d3.select(this)
                .attr("transform", "translate(" + d.x + "," + (
                    d.y = Math.max(0, Math.min((plotHeight) - d.dy, d3.mouse(plots.node())[1]))
                ) + ")");
              sankey.relayout();
              link.attr("d", path);
            }));

        // add the rectangles for the nodes
        node.append("rect")
          .attr("height", function(d) { return d.dy; })
          .attr("width", sankey.nodeWidth())
          .attr("transform", function (d){
              if(d.x>width*0.3) {
                  return "translate(" + (plotMargin.sankey+3) + "," + 0 + ")"
              }
              else {
                  return "translate(" + (plotMargin.sankey-3) + "," + 0 + ")"
              }
          })
          .style("fill",function(d,i){
              return partyColours(d.name.replace(/HL_|HR_|RL_/g,""))
          });

        let numNodes=plotData.nodes.length/2;

        node.append("text")
          .attr("class",media+"subtitle label")
          .attr("y",function(d) { return d.value > 10 & Object.keys(leftLabels).indexOf(d.name) >= 0 ? (d.dy/2-currentFrame.rem()/2):d.dy/2+currentFrame.rem()*0.3; })
          .attr("x",function (d){
            if(d.x>plotWidth*0.3) {
                return sankey.nodeWidth()+8
            }
            else {return -8}
        })
        .styles({
          "font-size": currentFrame.rem()-2
        })
        .attr("transform", 
              "translate(" + plotMargin.sankey + "," + 0 + ")")
        .style("text-anchor", function (d){
            if(d.x<plotWidth*0.3) {
                return "end"
            }
            else {return "start"}
        })
        .text(function (d) {
          let rightLabel = rightLabels[d.name] || "",
          leftLabel = leftLabels[d.name] || "";
          if(d.x>plotWidth*0.3){
            return d.value > 10 ? d.name.replace(/_/g," ").replace(/CDUCSU/g,"CDU/CSU"):d.name.replace(/_/g," ").replace(/CDUCSU/g,"CDU/CSU") + " " + rightLabel;
          }else{
            return d.value > 10 ? d.name.replace(/_/g," ").replace(/CDUCSU/g,"CDU/CSU"):d.name.replace(/_/g," ").replace(/CDUCSU/g,"CDU/CSU") + " " + leftLabel;
          }
        });

        node.append("text")
          .attr("class",media+"subtitle label")
          .attr("y",function(d) { return d.value > 10 ? (d.dy/2+currentFrame.rem()/2):d.dy/2; })
          .attr("x",function (d){
            if(d.x>plotWidth*0.3) {
                return sankey.nodeWidth()+8
            }
            else {return -8}
        })
        .attr("transform", 
              "translate(" + plotMargin.sankey + "," + 0 + ")")
        .style("text-anchor", function (d){
            if(d.x<plotWidth*0.3) {
                return "end"
            }
            else {return "start"}
        })
        .text(function (d) {
          let rightLabel = rightLabels[d.name] || "",
          leftLabel = leftLabels[d.name] || "";
          if(d.x>plotWidth*0.3 & d.value>10) {
            return rightLabel
          }else if(d.x<plotWidth*0.3 & d.value>10) {
            return leftLabel
          }
        });

        //Add column labels
        plots.append("text")
          .attr("class",media+"subtitle label")
          .attr("y",-4)
          .attr("x",plotMargin.sankey-3+sankey.nodeWidth())
          .style("text-anchor", "end")
          .text("2013 vote");

        plots.append("text")
          .attr("class",media+"subtitle label")
          .attr("y",-4)
          .attr("x",plotWidth-sankey.nodeWidth()+3-plotMargin.sankey)
          .text("2017 vote");

        // define other functions to be called
        // const tickSize=currentFrame.dimension().width; //Used when drawing the yAxis ticks

        currentFrame.plot()
          .attr('transform', `translate(${currentFrame.margin().left},${currentFrame.margin().top + (currentFrame.rem() * 0)} )`);

        // d3.select(currentFrame.plot().node().parentNode)
            // .call(currentFrame);
    });

    d3.selectAll("text, tspan").style("font-family", "Metric");
    // addSVGSavers('figure.saveable');
});
