$(document).ready(function() {

  // Using D3JS version 4

  // Set the dimensions and margins of the diagram
  var margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 3500 - margin.left - margin.right,
      height = 535 - margin.top - margin.bottom;

  // Declaring vars for textual information
  var info,
      name,
      version;

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#viz").append("svg")
              .attr("id", "tcl-viz")
              .attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate("
                  + margin.left + "," + margin.top + ")");

  var i = 0,
      duration = 750,
      root;

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([height, width]);

  function count(obj) { return Object.keys(obj).length; }

  // load the external data (enacted only)
  // d3.json("/tcl/assets/json/out_historical.json", function (error, treeData) {
  d3.json("/tcl/assets/json/out_historical_1981.json", function (error, treeData) {
    if (error) throw error;

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d._; });

    root.x0 = height / 4;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Expand/Collapse
    $('.expandAll').bind("click", function() {
      root.children.forEach(expandAll);
    })
    $('.collapseAll').bind("click", function() {
      root.children.forEach(collapseAll);
    })
  });

  // Collapse the node and all it's children
  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }

  function expand(d) {   
    var children = (d.children) ? d.children : d._children;
    if (d._children) {        
        d.children = d._children;
        d._children = null;       
    }
    if(children)
      children.forEach(expand);
  }

  function expandAll() {
      expand(root); 
      update(root);
  }

  function collapseAll() {
      root.children.forEach(collapse);
      // collapse(root);
      update(root);
  }

  function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Dynamically update the container height

    var newHeight = height + (Math.max(treeData.descendants().length * 20));

    d3.select("#viz #tcl-viz")
      .attr("width", width + margin.right + margin.left)
      .attr("height", newHeight + margin.top + margin.bottom);

    treemap = d3.tree().size([newHeight, width]);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180 });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', '10px')
        .style("fill", function(d) {
            if (d.data.n === "commentary") {
              var color = "";
              switch(d.data.type) {
                case "C":
                  type = "C";
                  color = "orange";
                  break;
                case "E":
                  type = "E";
                  color = "#ffdd00";
                  break;
                case "F":
                  type = "F";
                  color = "#06d6a0";
                  break;
                case "I":
                  type = "I";
                  color = "#ff0066";
                  break;
                case "M":
                  type = "M";
                  color = "purple";
                  break;
                case "P":
                  type = "P";
                  color = "#00aaff";
                  break;
                case "X":
                  type = "X";
                  color = "#334477";
                  break;
                default:
                  type = "Unknown";
                  color = "grey";
              }
              return color;
            }
            return d._children ? "lightsteelblue" : "#fff";
        })
        .style("stroke", function(d) {
            if (d.data.n === "commentary") {
              return "transparent";
            }
            return "steelblue";
        });

    // Add count number in the circle
    nodeEnter.append('text')
        .attr("dy", "4px")
        .attr("dx", "0")
        .attr("text-anchor", "middle")
        .style("fill", function(d) {
          if (d.data.cc > 30) {
            return "#fff";
          }
        })
        .text(function(d) {
          if (d.data.cc) {
            return d.data.cc;
          }
        });

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
          // if (d.data.cc) {
          //   return d.children || d._children ? -(d.data.cc + 17) : (d.data.cc + 17);
          // }
          return d.children || d._children ? -17 : 17;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .html(function(d) {
          if (d.data.version) {
            version = d.data.version;
          } else {
            version = "";
          }
          if (d.data.id) {
            name = d.data.id;
          } else {
            name = "";
          }
          if (d.data.content) {
            content = d.data.content;
          } else {
            content = "";
          }

          if (d.data.n) {
            n = d.data.n;
          }
           else {
            n = "Text";
          }

          return n + " " + version + " " + name;
        });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
       });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      // .attr('r', 10)
      // .attr('r', 13)
      // Use dynamic size to display num of changes
      .attr('r', function(d) {
        if (d.data.cc) {
          // return 13 + d.data.cc;
          return 13;
        }
        return 13;
      })
      .style("fill", function(d) {
          if (d.data.n === "commentary") {
              var color = "";
              switch(d.data.type) {
                case "C":
                  type = "C";
                  color = "orange";
                  break;
                case "E":
                  type = "E";
                  color = "#ffdd00";
                  break;
                case "F":
                  type = "F";
                  color = "#06d6a0";
                  break;
                case "I":
                  type = "I";
                  color = "#ff0066";
                  break;
                case "M":
                  type = "M";
                  color = "purple";
                  break;
                case "P":
                  type = "P";
                  color = "#00aaff";
                  break;
                case "X":
                  type = "X";
                  color = "#334477";
                  break;
                default:
                  type = "Unknown";
                  color = "grey";
              }
              return color;
          }
          if (d.data.cc) {
            var color = d3.scaleLinear()
              // .domain([0, 48]) // using max value manually. Should be dynamic.
              .domain([0, 100]) // using max value manually. Should be dynamic.
              .range(["#fff", "#4c061d"]);

            return color(d.data.cc);
          }
          return d._children ? "lightsteelblue" : "#fff";
      })
      .style("stroke", function(d) {
          if (d.data.n === "commentary") {
              var color = "";
              switch(d.data.type) {
                case "C":
                  type = "C";
                  color = "orange";
                  break;
                case "E":
                  type = "E";
                  color = "#ffdd00";
                  break;
                case "F":
                  type = "F";
                  color = "#06d6a0";
                  break;
                case "I":
                  type = "I";
                  color = "#ff0066";
                  break;
                case "M":
                  type = "M";
                  color = "purple";
                  break;
                case "P":
                  type = "P";
                  color = "#00aaff";
                  break;
                case "X":
                  type = "X";
                  color = "#334477";
                  break;
                default:
                  type = "Unknown";
                  color = "grey";
              }
              return color;
          }
          if (d.data.cc) {
            return "#8d606f";
          }
          return "steelblue";
      })
      .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      // .attr('r', 1e-6);
      .attr('r', '13px');

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        // .attr('d', function(d){ return diagonal(d, d.parent) });
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    // Toggle children on mouse over.

    function mouseover(d) {
      if (d.data.content) {
        d3.select("#viz").append("div")
          .attr("class", "tooltip")
          .attr("id", "tooltip")
          .html(d.data.content);

        var tooltip = document.getElementById('tooltip');

        window.onmousemove = function (e) {
            var x = e.clientX,
                y = e.clientY;
            tooltip.style.top = (y + 20) + 'px';
            tooltip.style.left = (x + 20) + 'px';
        };
      }
    }

    function mouseout(d) {
      d3.select("#viz").select("div#tooltip").remove();
    }

    // Toggle children on click.
    function click(d) {
      if (collapse) {
        console.log("collapsing...");
      }

      if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      update(d);
    }
  }
});
