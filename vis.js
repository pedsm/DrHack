const width = window.innerWidth - 20
const height = window.innerHeight - 20

const MIN_ZOOM = 0.1
const MAX_ZOOM = 7
const zoomed = (...a) => { svg.attr('transform', d3.event.transform) }
const zoom = d3.zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on('zoom', zoomed)
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zoom)
    .append('g')

d3.json('data.json')
    .then(draw)
    .catch(err => console.error(err))

function draw(data) {
    const nodeData = data.nodes
    const links = data.links

    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody()
            .strength(-50))
        .force("link", d3.forceLink()
            //.strength(d => d.frequency)
            // .distance(1200)
            .id(d => d.id))
        .force('x', d3.forceX(width/2))
        .force('y', d3.forceY(height/2))

    let edges = svg
        .append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.1)
        .attr('stroke', 'black')

    let nodes = svg
        .append('g')
        .selectAll('circle')
        .data(nodeData)
        .enter()
        .append('circle')
        .attr('r', d => d.type === 'DIVISION' ? 15 : 5)
        .attr('x', width/2)
        .attr('y', height/2)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10])


    nodes
        .append('title')
        .text(d => d.name)

    simulation
        .nodes(nodeData)
        .on('tick', ticked)

    simulation.force("link")
        .links(links)

    function ticked() {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        edges
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
    }
}