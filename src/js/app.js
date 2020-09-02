import '../scss/app.scss';
import * as d3 from 'd3';
import {
  curveLinear
} from 'd3';

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
        this.createAssistsPath();

        this.flag = 0;
        this.flagA = 0;

        let last_known_scroll_position = 0;
        let ticking = false;

        this.createPointsLabel();
        this.createAssistsLabel();

        const doSomething = (scroll_pos) => {
          if (scroll_pos > this.offset) {
            this.updatePointsLabel();
            // Points interval
            d3.interval(() => {
              this.data = this.dataKeeper;
              this.flag = this.dataKeeper.length < this.flag + 1 ? this.flag : this.flag + 1;

              if (this.flag < this.dataKeeper.length) {
                this.updatePointsPath();
              }
            }, 150);
          }

          if (scroll_pos > this.offset + 250) {
            this.updateAssistsLabel();

            d3.interval(() => {
              this.data = this.dataKeeper;
              this.flagA = this.dataKeeper.length < this.flagA + 1 ? this.flagA : this.flagA + 1;

              if (this.flagA < this.dataKeeper.length) {
                this.updateAssistsPath();
              }
            }, 150);
          }
        }

        window.addEventListener('scroll', function (e) {
          last_known_scroll_position = window.scrollY;

          if (!ticking) {
            window.requestAnimationFrame(function () {
              doSomething(last_known_scroll_position);
              ticking = false;
            });

            ticking = true;
          }
        });
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

    this.offset = this.wrapper.getBoundingClientRect().top + window.scrollY - 200;
  },

  setWidth() {
    this.width = parseInt(window.getComputedStyle(document.querySelector('.container:not(.container--small)')).getPropertyValue('width'), 10) - 64 - this.margin.left - this.margin.right;
  },

  create() {
    this.svg = d3.select('#chart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left} ${this.margin.top})`);
  },

  scales() {
    this.y = d3.scaleLinear()
      .domain([0, 40])
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
      .attr('opacity', 0);

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
      data,
      x,
      y,
      flag,
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
      points: data[flag - 1].points,
      assists: data[flag - 1].assists,
      placeholder: true
    };

    data1.push(placeholder)

    data1[flag].placeholder = true;

    this.g.selectAll('.path-points')
      .attr('d', line(data1))
      .transition(t).duration(100)
      .attr('d', line(data2))
  },

  createAssistsPath() {
    this.lineA = d3.line()
      .x((d, i) => this.x(i))
      .y((d) => this.y(d.assists))
      .curve(curveLinear);

    // Join
    this.g.append('path').attr('class', 'path-assists');

    this.pathsA = this.g.selectAll('path');


    // Exit
    this.pathsA.exit().remove();

    this.svg.select('.path-assists')
      .attr('stroke', this.red)
      .attr('stroke-width', 2)
      .attr('class', 'path-assists')
      .attr('fill', 'none')
      .transition(this.t)
      .attr('d', this.line(this.data[0]))
  },

  updateAssistsPath() {
    const t = d3.transition(100);
    const {
      data,
      x,
      y,
      flagA,
    } = this;

    const line = d3.line()
      .x((d, i) => {
        const xPlace = d.placeholder ? x(i - 1) : x(i);
        return xPlace;
      })
      .y((d) => y(d.assists))
      .curve(curveLinear);

    var data1 = [];
    var data2 = [];

    for (let index = 0; index < flagA; index++) {
      data1.push(data[index]);
      data2.push(data[index]);
    }

    data2.push(data[flagA]);

    const placeholder = {
      points: data[flagA - 1].points,
      assists: data[flagA - 1].assists,
      placeholder: true
    };

    data1.push(placeholder)

    data1[flagA].placeholder = true;

    this.g.selectAll('.path-assists')
      .attr('d', line(data1))
      .transition(t).duration(100)
      .attr('d', line(data2))
  },

  createPointsLabel() {
    this.pggLabel = this.g.append('text')
      .attr('y', this.height + 50)
      .attr('x', 50)
      .attr('font-size', '20px')
      .attr('text-anchor', 'start')
      .attr('class', 'label label-ppg')
      .attr('opacity', 0)
      .text('Points per game');

    this.pggRect = this.g.append('rect')
      .attr('y', this.height + 32)
      .attr('x', 20)
      .attr('width', '20')
      .attr('height', '20')
      .attr('text-anchor', 'start')
      .attr('class', 'label label-ppg label-squere')
      .attr('fill', this.blue)
      .attr('opacity', 0);
  },

  updatePointsLabel() {
    this.pggLabel.transition().attr('opacity', 1);
    this.pggRect.transition().attr('opacity', 1);
  },

  createAssistsLabel() {
    this.asssistsLabel = this.g.append('text')
      .attr('y', this.height + 50)
      .attr('x', 300)
      .attr('font-size', '20px')
      .attr('text-anchor', 'start')
      .attr('class', 'label label-ppg')
      .attr('opacity', 0)
      .text('Assists per game');

    this.asssistsRect = this.g.append('rect')
      .attr('y', this.height + 32)
      .attr('x', 270)
      .attr('width', '20')
      .attr('height', '20')
      .attr('text-anchor', 'start')
      .attr('class', 'label label-ppg label-squere')
      .attr('fill', this.red)
      .attr('opacity', 0);
  },

  updateAssistsLabel() {
    this.asssistsLabel.transition().attr('opacity', 1);
    this.asssistsRect.transition().attr('opacity', 1);
  },
};

Chart.init();