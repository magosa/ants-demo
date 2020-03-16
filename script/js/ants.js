/**
Application : dashboard
Description : ダッシュボードを描画するClassです。
Version : 1.1.0
Dependencies : jQuery + d3.js
Auther : Magosa
**/

class Dashboard {
  constructor(id, target) {
    this.width = $(target).width();
    this.height = $(target).height();
    this.id = id;
    this.svg = d3.select(target)
      .append('svg')
      .attr('id', this.id)
      .attr('width', this.width)
      .attr('height', this.height);
  }
}

class Trajectory extends Dashboard {
  initMap(data) {
    this.domain = data.domain_conf;
    this.margin = data.margin_conf;
    this.line_obj = data.line;
    this.area_obj = data.area;
    this.time_range = data.ranges;
    this.day_range = data.days;

    this.xscale = d3.scaleLinear()
      .domain([this.domain.min_x, this.domain.max_x])
      .range([this.margin.left, this.width - this.margin.right]);

    this.yscale = d3.scaleLinear()
      .domain([this.domain.min_y, this.domain.max_y])
      .range([this.height - this.margin.bottom, this.margin.top]);
  }

  set setLine(color) {
    this.linecolor = color;
    if (this.line_obj) {
      this.lines = Object.keys(this.line_obj).map(item => {
        this.line_obj[item].line_name = item;
        return this.line_obj[item];
      });

      this.line_g = this.svg.selectAll('.line-group')
        .data(this.lines)
        .enter()
        .append('g')
        .attr('class', 'line-group')
        .append('line')
        .attr('id', d => d.line_name)
        .attr('x1', d => this.xscale(d.sx))
        .attr('y1', d => this.yscale(d.sy))
        .attr('x2', d => this.xscale(d.ex))
        .attr('y2', d => this.yscale(d.ey))
        .attr('stroke', (d, i) => this.linecolor(i))
        .attr('stroke-width', 5)
        .on('mouseover', d => {
          tooltip
            .style('visibility', 'visible')
            .html('<span>' + d.line_name + '</span>');
        })
        .on('mousemove', d => {
          tooltip
            .style('top', (d3.event.pageY - 20) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
        })
        .on('mouseout', d => {
          tooltip.style('visibility', 'hidden');
        });
    } else {
      console.log('Undifined Line Config');
    }
  }

  set setArea(color) {
    this.areacolor = color;
    if (this.area_obj) {
      this.areas = Object.keys(this.area_obj).map(item => {
        this.area_obj[item].area_name = item;
        return this.area_obj[item];
      });

      this.rectangles = this.areas
        .filter(item => item.type == 'rectangle');

      this.rect_g = this.svg.selectAll('.rect-group')
        .data(this.rectangles)
        .enter()
        .append('g')
        .attr('class', 'rect-group')
        .attr('transform', d => 'translate(' + this.xscale(d.cx) + ', ' + this.yscale(d.cy) + ') rotate(' + d.angle + ')');

      this.rect_g.append('rect')
        .style('visibility', 'visible')
        .attr('id', d => 'svg_' + d.area_name)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', d => this.xscale(d.width))
        .attr('height', d => this.yscale(d.height))
        .attr('stroke', (d, i) => this.areacolor(i))
        .attr('stroke-width', 1.0)
        .attr('fill', (d, i) => this.areacolor(i))
        .attr('fill-opacity', 0.25)
        .on('mouseover', d => {
          tooltip
            .style('visibility', 'visible')
            .html('<span>' + d.area_name + '</span>');
        })
        .on('mousemove', d => {
          tooltip
            .style('top', (d3.event.pageY - 20) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
        })
        .on('mouseout', d => {
          tooltip.style('visibility', 'hidden');
        });

      this.polygons = this.areas
        .filter(item => item.type == 'polygon')
        .map(item => {
          let str = '';
          for (var i = 1; i <= item.vertex; i++) {
            str = str + this.xscale(item['x' + i]) + ',' + this.yscale(item['y' + i]) + ' ';
          }
          item.path = str.slice(0, -1);
          return item;
        });

      this.polygon_g = this.svg.selectAll('.polygon-group')
        .data(this.polygons)
        .enter()
        .append('g')
        .attr('class', 'polygon-group')
        .append('polygon')
        .attr('id', d => 'svg_' + d.area_name)
        .attr('points', d => d.path) // xy座標を複数指定
        .attr('stroke', (d, i) => this.areacolor(i))
        .attr('stroke-width', 1.0)
        .attr('fill', (d, i) => this.areacolor(i))
        .attr('fill-opacity', 0.25)
        .on('mouseover', d => {
          tooltip
            .style('visibility', 'visible')
            .html('<span>' + d.area_name + '</span>');
        })
        .on('mousemove', d => {
          tooltip
            .style('top', (d3.event.pageY - 20) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
        })
        .on('mouseout', d => {
          tooltip.style('visibility', 'hidden');
        });
    } else {
      console.log('Undifined Area Config');
    }
  }

  drawFlow(data) {
    this.svg.selectAll('circle').remove();
    this.svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('id', d => d.id)
      .attr('cx', d => this.xscale(d.x))
      .attr('cy', d => this.yscale(d.y))
      .attr('stroke', 'blue')
      .attr('fill', 'blue')
      .attr('fill-opacity', 0.25)
      .attr('r', 5);
  }

  drawFootprint(data) {
    this.footprints = d3.nest()
      .key(d => d.id)
      .sortKeys(d3.ascending)
      .entries(data);

    this.svg.selectAll('.footprints').remove();
    this.svg.selectAll('.footprints')
      .data(this.footprints)
      .enter()
      .append('path')
      .attr('id', d => 'path-' + d.key)
      .datum(d => d.values)
      .attr('d', d3.line()
        .x(d => this.xscale(d.x))
        .y(d => this.yscale(d.y)))
      .on('mouseover', d => {
        tooltip
          .style('visibility', 'visible')
          .html('<span>id : ' + d.id + '</span>');
      })
      .on('mousemove', d => {
        tooltip
          .style('top', (d3.event.pageY - 20) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px');
      })
      .on('mouseout', d => {
        tooltip.style('visibility', 'hidden');
      });
  }

  drawHeatmap(data) {
    let contour_density = d3.contourDensity()
      .x(d => this.xscale(d.x))
      .y(d => this.yscale(d.y))
      .size([this.width, this.height])
      .bandwidth(50);
    let contour_density_values = contour_density(data);
    let color = d3.scaleSequential(t => d3.hsl(t * 230, 1, 0.5) + '')
      .domain([d3.max(contour_density_values, d => d.value), 0.00]);

    this.svg.selectAll('.heat').remove();
    this.svg.insert('g')
      .attr('class', 'heat')
      .selectAll('path')
      .data(contour_density_values)
      .enter()
      .append('path')
      // .attr('stroke', d => color(d.value))
      // .attr('stroke-width', 0.75)
      .attr('fill', d => color(d.value))
      .attr('fill-opacity', 0.1)
      .attr('d', d3.geoPath());
  }
}

class Graph extends Dashboard {
  set setColor(color) {
    this.color = color;
  }

  initPiechart(radius = 3) {
    this.radius = Math.min(this.width, this.height) / radius;
    this.g = this.svg
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
      .attr('id', this.id + '-pie');

    this.pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    this.arc = d3.arc()
      .outerRadius(this.radius * 7 / 6)
      .innerRadius(this.radius * 2 / 3);
  }

  drawPieChart(data) {
    this.g.selectAll('.pie')
      .remove();

    let pie_group = this.g.selectAll('.pie')
      .data(this.pie(data))
      .enter()
      .append('g')
      .attr('class', 'pie');

    pie_group.append('path')
      .attr('d', this.arc)
      .attr('fill', d => this.color(d.index))
      .attr('fill-opacity', 0.9)
      .attr('stroke', d => this.color(d.index))
      .attr('stroke-width', 1.5)
      .on('mouseover', d => {
        tooltip
          .style('visibility', 'visible')
          .html('<span>area : ' + d.data.id + '<br>value : ' + d.value + '人</span>');
      })
      .on('mousemove', d => {
        tooltip
          .style('top', (d3.event.pageY - 20) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px');
      })
      .on('mouseout', d => {
        tooltip.style('visibility', 'hidden');
      });
  }


  initBarchart(data, margin = {
    'top': 30,
    'bottom': 40,
    'right': 30,
    'left': 50
  }) {
    this.time_range = data.ranges.map(d => d.split('-')[0].slice(0, -3));
    this.day_range = data.days;
    this.margin = margin;
    this.max_value = 0;
    this.xscale = d3.scaleBand()
      .rangeRound([this.margin.left, this.width - this.margin.right])
      .padding(0.3)
      .domain(this.time_range.map(d => d));

    this.svg.append('g')
      .attr('transform', 'translate(' + 0 + ',' + (this.height - this.margin.bottom) + ')')
      .attr('id', 'xaxis')
      .attr('class', 'axis')
      .call(d3.axisBottom(this.xscale));

    this.yscale = d3.scaleLinear()
      .domain([0, 100])
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.svg.append('g')
      .attr('id', 'yaxis')
      .attr('class', 'axis')
      .call(d3.axisLeft(this.yscale))
      .attr('transform', 'translate(' + this.margin.left + ',' + 0 + ')');
  }

  arrangeTimestamp(data) {
    let temp = {};
    let ans = [];
    data.forEach(item => {
      let day = new Date(item.range);
      let hour = ('0' + day.getHours()).slice(-2);
      let minute = ('0' + day.getMinutes()).slice(-2);
      item.range = hour + ':' + minute;
      let box = temp[item.id] || (temp[item.id] = []);
      if (box.push(item.value) == 2) ans.push(item.id);
    });
    return ans;
  }

  drawHourlycount(data) {
    let val = d3.max(data, d => d.value)
    if (val > this.max_value) {
      this.max_value = val;
      d3.select('#yaxis').remove();
      this.yscale = d3.scaleLinear()
        .domain([0, this.max_value])
        .range([this.height - this.margin.bottom, this.margin.top]);
      this.svg.append('g')
        .attr('id', 'yaxis')
        .attr('class', 'axis')
        .call(d3.axisLeft(this.yscale))
        .attr('transform', 'translate(' + this.margin.left + ',' + 0 + ')');
    }
    let ans = this.arrangeTimestamp(data);
    let count = 0;
    let bar_width = this.xscale.bandwidth() / ans.length;

    this.svg.selectAll('.barchart').remove();
    ans.forEach(function(item) {
      this.svg.append('g')
        .attr('class', 'barchart')
        .selectAll('rect')
        .data(data.filter(d => d.day === item))
        .enter()
        .append('rect')
        .attr('x', d => this.xscale(d.range) + bar_width * count)
        .attr('y', d => this.yscale(d.value))
        .attr('width', bar_width)
        .attr('height', d => this.height - this.margin.bottom - this.yscale(d.value))
        .attr('fill', this.color(count))
        .attr('class', 'bar')
        .on('mouseover', d => {
          tooltip
            .style('visibility', 'visible')
            .html('<span>day : ' + d.day + '<br>range : ' + d.range + '<br>value : ' + d.value + '</span>');
        })
        .on('mousemove', d => {
          tooltip
            .style('top', (d3.event.pageY - 20) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
        })
        .on('mouseout', d => {
          tooltip.style('visibility', 'hidden');
        });
      // .attr('fill', 'white')
      count++;
    });
  }

  drawIntersectcount(data) {
    let val = d3.max(data, d => d.value)
    if (val > this.max_value) {
      this.max_value = val;
      d3.select('#yaxis').remove();
      this.yscale = d3.scaleLinear()
        .domain([0, this.max_value])
        .range([this.height - this.margin.bottom, this.margin.top]);
      this.svg.append('g')
        .attr('id', 'yaxis')
        .attr('class', 'axis')
        .call(d3.axisLeft(this.yscale))
        .attr('transform', 'translate(' + this.margin.left + ',' + 0 + ')');
    }
    let ans = this.arrangeTimestamp(data);
    let count = 0;
    let bar_width = this.xscale.bandwidth() / (2 * ans.length);

    this.svg.selectAll('.barchart').remove();
    ans.forEach((item, count) => {
      this.svg.append('g')
        .attr('class', 'barchart')
        .selectAll('rect')
        .data(data.filter(d => d.id === item && typeof this.xscale(d.range) != 'undefined'))
        .enter()
        .append('rect')
        .attr('x', d => this.xscale(d.range) + bar_width * count * 2.5)
        .attr('y', d => this.yscale(d.value))
        .attr('width', bar_width)
        .attr('height', d => this.height - this.margin.bottom - this.yscale(d.value))
        .attr('stroke', this.color(count))
        .attr('stroke-width', 1.5)
        .attr('fill', this.color(count))
        .attr('fill-opacity', 0.9)
        .on('mouseover', d => {
          tooltip
            .style('visibility', 'visible')
            .html('<span>line : ' + d.id + '<br>range : ' + d.range + '<br>value : ' + d.value + '人</span>');
        })
        .on('mousemove', d => {
          tooltip
            .style('top', (d3.event.pageY - 20) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
        })
        .on('mouseout', d => {
          tooltip.style('visibility', 'hidden');
        });
    });
  }
}

class Text extends Dashboard {
  set setColor(color) {
    this.color = color;
  }

  isObject(value) {
    return value !== null && typeof value !== 'undefined' && Object(value) === value;
  }

  drawText(data) {
    this.svg.selectAll("text").remove();
    if (this.isObject(data)) {
      this.svg.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .style('font-family', "Impact")
        .style('font-size', this.height * 0.6 + "px")
        .style('stroke', d => this.color(d.value))
        .style('stroke-width', 2.5)
        .style('fill', d => this.color(d.value))
        .style('fill-opacity', 0.25)
        .attr('x', this.width / 2)
        .attr('y', this.height / 2)
        .attr('dy', ".45em")
        .attr('text-anchor', "middle")
        .text(d => d.value);
    } else {
      this.svg.append('text')
        .style('font-family', "Impact")
        .style('font-size', this.height * 0.8 + "px")
        .style('stroke', this.color(data))
        .style('stroke-width', 2.5)
        .style('fill', this.color(data))
        .style('fill-opacity', 0.25)
        .attr('x', this.width / 2)
        .attr('y', this.height / 2)
        .attr('dy', ".45em")
        .attr('text-anchor', "middle")
        .text(data);
    };
  };

  drawMultitext(data) {
    let text_pos = this.width / (data.length * 2);
    this.svg.selectAll("text").remove();
    this.svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .style('font-family', "Impact")
      .style('font-size', this.height * 0.5 + "px")
      .style('stroke', (d, i) => this.color(i))
      .style('stroke-width', 2.5)
      .style('fill', (d, i) => this.color(i))
      .style('fill-opacity', 0.25)
      .attr('x', (d, i) => (i * 2 + 1) * text_pos)
      .attr('y', this.height / 2)
      .attr('dy', ".45em")
      .attr('text-anchor', "middle")
      .text(d => d.value);
  };
}
