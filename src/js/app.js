import '../scss/app.scss';
import * as d3 from 'd3';
import { curveLinear } from 'd3';

// Your JS Code goes here

const Chart = {
  init() {
    console.log('init');

    this.wrapper = document.querySelector('#chart');

    if (this.wrapper) {
      d3.json('https://api-nba-v1.p.rapidapi.com/statistics/players/playerId/265?rapidapi-key=5f79ddda6emsh989f2ee1125d0abp175161jsn87c176aa5037').then((data) => {
        this.dataKeeper = data.api.statistics.filter((d) => d.points > 0).map((d) => {
          const newData = {};
          newData.points = +d.points;
          newData.assists = +d.assists;

          return newData;
        });

        this.dataKeeper = this.dataKeeper.slice(350);
        this.data = this.dataKeeper;

        this.setVar();
        this.create();
        this.scales();
        this.axis();
        this.createPointsPath();

        this.flag = 0;

        d3.interval(() => {
          this.data = this.dataKeeper;
          this.flag = this.dataKeeper.length < this.flag + 1 ? this.flag : this.flag + 1;
          
          if (this.flag < this.dataKeeper.length) {
            this.updatePointsPath();
          }
        }, 150);
      });
    }
  },

  setVar() {
    // Colors
    this.red = '#B92B35';
    this.blue = '#254384';

    // Margins
    this.margin = {
      left: 80,
      right: 8,
      top: 8,
      bottom: 80,
    };

    // Sizes
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.setWidth();
  },

  setWidth() {
    this.width = parseInt(window.getComputedStyle(document.querySelector('.container:not(.container--small)')).getPropertyValue('width'), 10) - 64 - this.margin.left - this.margin.right;
  },

  create() {
    this.svg = d3.select('#chart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left} ${this.margin.top})`)
  },

  scales() {
    this.y = d3.scaleLinear()
      .domain([0, 50])
      .range([this.height, 0]);
    
    this.x = d3.scaleLinear()
      .domain([0, this.data.length])
      .range([0, this.width]);
  },

  axis() {
    this.ay = d3.axisLeft(this.y)
      .ticks(5);
    this.ayCall = this.g.append('g').call(this.ay);

    this.ayCall
      .selectAll('text')
      .attr('class', 'y-label');

    this.ayCall
      .selectAll('line')
      .attr('class', 'y-line')
      .attr('x2', this.width);

    this.ayCall
      .selectAll('path')
      .attr('class', 'y-axis');

    this.ax = d3.axisBottom(this.x)
      .ticks(5);
    
    this.axCall = this.g.append('g').call(this.ax)
      .attr('transform', `translate(0, ${this.height})`)
      .attr('opacity', 1);

    this.axCall
      .selectAll('text')
      .attr('class', 'x-label');

    this.axCall
      .selectAll('line')
      .attr('class', 'x-line');

    this.axCall
      .selectAll('path')
      .attr('class', 'x-axis');
  },

  createPointsPath() {
    this.t = d3.transition(50);
    this.line = d3.line()
      .x((d, i) => this.x(i))
      .y((d) => this.y(d.points))
      .curve(curveLinear);

    // Join
    this.g.append('path').attr('class', 'path-points');

    this.paths = this.g.selectAll('path');


    // Exit
    this.paths.exit().remove();

    this.svg.select('.path-points')
      .attr('stroke', this.blue)
      .attr('stroke-width', 2)
      .attr('class', 'path-points')
      .attr('fill', 'none')
      .transition(this.t)
        .attr('d', this.line(this.data[0]))
  },

  updatePointsPath() {
    const t = d3.transition(100);
    const {
      data, x, y, flag,
    } = this;

    const line = d3.line()
      .x((d, i) => {
        const xPlace = d.placeholder ? x(i - 1) : x(i);
        return xPlace;
      })
      .y((d) => y(d.points))
      .curve(curveLinear);

    var data1 = [];
    var data2 = [];

    for (let index = 0; index < flag; index++) {
      data1.push(data[index]);
      data2.push(data[index]);
    }

    data2.push(data[flag])

    const placeholder = {
      points: data[flag - 1].points, assists: data[flag - 1].assists, placeholder: true
    };

    data1.push(placeholder)

    data1[flag].placeholder = true;

    this.g.selectAll('.path-points')
      .attr('d', line(data1))
      .transition(t).duration(100)
      .attr('d', line(data2))
  },
};

Chart.init();