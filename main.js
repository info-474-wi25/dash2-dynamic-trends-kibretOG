// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("final_form_data.csv").then(data => {
    data.forEach(d => {
        d.Event_Year = new Date(d.Event_Date).getFullYear();
    });

    const seasons = [...new Set(data.map(d => d.Season))];

    const dropdown = d3.select("#seasonDropdown");
    dropdown.selectAll("option")
        .data(seasons)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    function updateChart(selectedSeason) {
        const filteredData = data.filter(d => d.Season === selectedSeason);
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

            svg1_RENAME.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .text("Year");  

        svg1_RENAME.append("text")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 30)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text("Incident Count");  
    }

    updateChart(seasons[0]);

    dropdown.on("change", function () {
        updateChart(this.value);
    });

});
