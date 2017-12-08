# boiler-frame
A basic d3 boiler plate using gChartFrame and gChartColour. Designed to get you up and coding with FT chart styles quickly.

### usage
Create a copy of the folder and run it using Browser-Sync or similar. Add your own .csv file, change the file reference to it in index.html and off you go. The template creates 2 SVG group elements for content; plot for drawing the geometry/chart and anno for the annotation layer. Some pre-configured variables to help you:

- w gives you the width of the chart area (ie inside the margins)
- h gives you the height of the chart area
- rem gives you the line height for the chosen frame/type style
- lineColors gives you an array of categorical colours for the chosen frame type suitable for lines
- barColors the same, but for bars/fills
- seqColors an array of colours for a sequential colour scheme (from gChartcolour's sequentialMulti scheme)
- divColors an array of colours for a diverging colour scheme (from gChartcolour's diverging scheme)

Styles.css contains default styling information for each frame type. Use an appropriate css selector (e.g. "lines") to pick up the appropriate stroke-width for the frame.

### local assets
This currently uses local versions of dependencies, for offline coding.

### further tweaks to be added at some stage
- Add support for Bob Haslett's g-chartAxis so axes can be added quickly
- Add png/svg export

