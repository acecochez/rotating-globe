// Globe dimensions
const width = 800;
const height = 800;
const sensitivity = 75;

const svg = d3.select("#globe")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoOrthographic()
    .scale(350)
    .center([0, 0])
    .rotate([0, -30])
    .translate([width / 2, height / 2]);
projection.scale();
const path = d3.geoPath().projection(projection);

const graticule = d3.geoGraticule();

// Add sphere (ocean)
const sphere = svg.append("path")
    .datum({type: "Sphere"})
    .attr("class", "sphere")
    .attr("d", path);

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// Country to continent mapping
const continentMapping = {
    "Africa": ["DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE"],
    "Asia": ["AFG", "ARM", "AZE", "BHR", "BGD", "BTN", "BRN", "KHM", "CHN", "CYP", "GEO", "IND", "IDN", "IRN", "IRQ", "ISR", "JPN", "JOR", "KAZ", "KWT", "KGZ", "LAO", "LBN", "MYS", "MDV", "MNG", "MMR", "NPL", "PRK", "OMN", "PAK", "PSE", "PHL", "QAT", "SAU", "SGP", "KOR", "LKA", "SYR", "TWN", "TJK", "THA", "TLS", "TUR", "TKM", "ARE", "UZB", "VNM", "YEM"],
    "Europe": ["ALB", "AND", "AUT", "BLR", "BEL", "BIH", "BGR", "HRV", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ITA", "XKX", "LVA", "LIE", "LTU", "LUX", "MKD", "MLT", "MDA", "MCO", "MNE", "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK", "SVN", "ESP", "SWE", "CHE", "UKR", "GBR", "VAT"],
    "North America": ["ATG", "BHS", "BRB", "BLZ", "CAN", "CRI", "CUB", "DMA", "DOM", "SLV", "GRD", "GTM", "HTI", "HND", "JAM", "MEX", "NIC", "PAN", "KNA", "LCA", "VCT", "TTO", "USA"],
    "South America": ["ARG", "BOL", "BRA", "CHL", "COL", "ECU", "GUY", "PRY", "PER", "SUR", "URY", "VEN"],
    "Oceania": ["AUS", "FJI", "KIR", "MHL", "FSM", "NRU", "NZL", "PLW", "PNG", "WSM", "SLB", "TON", "TUV", "VUT"]
};

const countryToContinent = {};
for (const [continent, countries] of Object.entries(continentMapping)) {
    countries.forEach(code => {
        countryToContinent[code] = continent;
    });
}

let countriesData = [];
let selectedCountry = null;

// Load and display the world data
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
    const countries = topojson.feature(world, world.objects.countries);
    countriesData = countries.features;

    // Draw countries
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(countriesData)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("click", (event, d) => {
            const countryName = d.properties.name;
            const select = document.getElementById("country-select");
            select.value = countryName;
            rotateToCountry(d);
        });

    svg.append("g")
        .attr("class", "labels");

    const select = document.getElementById("country-select");
    const sortedCountries = countriesData
        .map(d => d.properties.name)
        .sort();

    sortedCountries.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
        const countryName = event.target.value;
        if (countryName) {
            const country = countriesData.find(d => d.properties.name === countryName);
            if (country) {
                rotateToCountry(country);
            }
        } else {
            // Reset view
            resetGlobe();
        }
    });
});

function rotateToCountry(country) {
    selectedCountry = country;
    const countryCode = country.id;
    const continent = countryToContinent[countryCode];

    sphere.classed("active", true);

    const centroid = d3.geoCentroid(country);
    const rotate = [-centroid[0], -centroid[1]];

    d3.transition()
        .duration(1500)
        .tween("rotate", () => {
            const r = d3.interpolate(projection.rotate(), rotate);
            return (t) => {
                projection.rotate(r(t));
                updateGlobe(continent, countryCode);
            };
        });
}

function updateGlobe(highlightContinent, selectedCountryCode) {
    svg.selectAll(".country")
        .attr("d", path)
        .attr("class", d => {
            const code = d.id;
            const countryContinent = countryToContinent[code];

            if (code === selectedCountryCode) {
                return "country highlighted";
            } else if (countryContinent === highlightContinent) {
                return "country same-continent";
            } else {
                return "country";
            }
        });

    svg.select(".graticule").attr("d", path);
    svg.select(".sphere").attr("d", path);

    updateLabels(highlightContinent, selectedCountryCode);
}

function updateLabels(highlightContinent, selectedCountryCode) {
    const labelsGroup = svg.select(".labels");

    // Get countries in the same continent
    const sameContinent = countriesData.filter(d => {
        const code = d.id;
        return countryToContinent[code] === highlightContinent && code !== selectedCountryCode;
    });

    const labels = labelsGroup.selectAll(".country-label")
        .data(sameContinent, d => d.id);

    labels.exit().remove();

    const newLabels = labels.enter()
        .append("text")
        .attr("class", "country-label");

    labels.merge(newLabels)
        .text(d => d.properties.name)
        .attr("x", d => {
            const centroid = path.centroid(d);
            return centroid[0];
        })
        .attr("y", d => {
            const centroid = path.centroid(d);
            return centroid[1];
        })
        .attr("text-anchor", "middle")
        .style("display", d => {
            // Only show labels for countries visible on the front of the globe
            const centroid = d3.geoCentroid(d);
            const rotated = projection.rotate();
            const angle = d3.geoDistance(centroid, [-rotated[0], -rotated[1]]);
            return angle > Math.PI / 2 ? "none" : "block";
        });
}

function resetGlobe() {
    selectedCountry = null;

    sphere.classed("active", false);

    d3.transition()
        .duration(1500)
        .tween("rotate", () => {
            const r = d3.interpolate(projection.rotate(), [0, -30]);
            return (t) => {
                projection.rotate(r(t));
                updateGlobe(null, null);
            };
        });

    svg.select(".labels").selectAll(".country-label").remove();
}

const drag = d3.drag()
    .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();
        projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
        ]);
        updateGlobe(
            selectedCountry ? countryToContinent[selectedCountry.id] : null,
            selectedCountry ? selectedCountry.id : null
        );
    });

svg.call(drag);
