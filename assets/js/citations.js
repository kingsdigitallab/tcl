$(document).ready(function() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10)

    const color = item => {
      return scale(item.group)
    }

    const height = 600
    const width = 1280

    const svg = d3
      .select('#graph')
      .append('svg')
      .attr('viewBox', [0, 0, width, height])

    const drag = simulation => {
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    d3.json('/tcl/assets/json/citations.json').then(function(data) {
      const links = data.links.map(d => Object.create(d))

      let nodes = data.nodes.map(d => Object.create(d))
      nodes = nodes.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id)
        if (!x) {
          return acc.concat([current])
        } else {
          acc[acc.findIndex(item => item.id === current.id)].n += 1
          return acc
        }
      }, [])

      const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

      const link = svg
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', 1)

      const node = svg
        .append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => Math.max(5, d.n / 5))
        .attr('fill', color)
        .call(drag(simulation))

      node.append('title').text(d => d.title)

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node.attr('cx', d => d.x).attr('cy', d => d.y)
      })
    })
});