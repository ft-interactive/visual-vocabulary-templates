/**
 * General data munging functionality
 */

import * as d3 from "d3";
import loadData from "@financial-times/load-data";

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) {
    const { displayHierarchy, rootName, attrToShow, filterGroups, showAllLabels } = options;
    // eslint-disable-line
    return loadData(url).then(result => {
        const data = result.data ? result.data : result;
        const filteredData = data.filter(d => filterGroups.includes(d.group));
        if (showAllLabels) {
          filteredData.forEach(d => d.label = 'yes')
        }

        const groupNames = filteredData
            .map(d => d.group)
            .filter((el, i, ar) => ar.indexOf(el) === i);

        // Should check that no root exists first
        filteredData.push({
            name: rootName,
            group: ""
        });

        // Add all nodes with no parent as chilren of root object
        filteredData.forEach(d => {
            if (d.name !== rootName && d.group === "") {
                d.group = rootName;
            }
        });

        let root;

        if (displayHierarchy) {
            // Add group objects
            groupNames.forEach(g => {
                if (g !== "") {
                    data.push({
                        name: g,
                        group: rootName
                    });
                }
            });

            root = d3
                .stratify()
                .id(d => d.name)
                .parentId(d => d.group)(filteredData)
                .sum(d => d[attrToShow])
                .sort((a, b) => a[attrToShow] - a[attrToShow]);
        } else {
          root = d3
              .stratify()
              .id(d => d.name)
              .parentId((d) => d.group !== "" ? rootName : "")(filteredData)
              .sum(d => d[attrToShow])
              .sort((a, b) => a[attrToShow] - a[attrToShow]);
        }

        const plotData = root;

        groupNames.push(rootName);

        return {
            data,
            plotData,
            groupNames
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ["name", "group"]; // adjust column headings to match your dataset
    return columns.filter(d => exclude.indexOf(d) === -1);
}
