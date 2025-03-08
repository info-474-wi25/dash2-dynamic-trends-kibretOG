// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2.a: LOAD DATA
let allData;
d3.csv("final_form_data.csv").then(data => {
    data.forEach(d => {
        d.Event_Year = new Date(d.Event_Date).getFullYear();
    });
    allData = data;
    updateChart(getSelectedSeasons()); // Default to all seasons on load
});

function getSelectedSeasons() {
    return Array.from(document.querySelectorAll(".season-checkbox:checked"))
        .map(checkbox => checkbox.value);
}

function updateChart(selectedSeasons) {
    const filteredData = allData.filter(d => selectedSeasons.includes(d.Season));
    const yearCounts = d3.rollup(filteredData, v => v.length, d => d.Event_Year);
    const dataset = Array.from(yearCounts, ([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.count)])
        .range([height, 0]);

    svg1_RENAME.selectAll("*").remove();

    svg1_RENAME.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count));

    svg1_RENAME.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
}

d3.selectAll(".season-checkbox").on("change", function () {
    updateChart(getSelectedSeasons());
});
