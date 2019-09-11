import 'regenerator-runtime/runtime';
import 'github-markdown-css';
import 'highlight.js/scss/default.scss';
import './styles.scss';

import * as d3 from 'd3';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);

const timelinePosition = d3.scaleLinear()
  .range([-470, 470]);

const bubbleSize = d3.scaleLinear()
  .range([3, 15]);

function clamp(input, min, max) { return Math.min(Math.max(input, min), max); }

function showSlide(slideData) {
  const slide = d3.select('main')
    .classed('title', slideData.isTitleSlide)
    .selectAll('div.slide')
    .data([slideData], (d) => d.pageNumber);

  slide
    .enter()
    .append('div')
    .attr('class', 'slide')
    .classed('main', (d) => d.isTitleSlide)
    .append('div')
    .style('transform', 'scaleX(0.1)rotate(-10deg)')
    .html((d) => d.html)
    .call((el) => {
      el.selectAll('*')
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .style('opacity', 1);

      el.selectAll('code')
        .call((codeSelection) => {
          console.log(codeSelection);
          codeSelection.each(function () {
            hljs.highlightBlock(this);
          });
        });
    })
    .transition()
    .duration(800)
    .style('transform', null);

  slide
    .exit()
    .transition()
    .duration(500)
    .style('transform', 'scale(0.3)rotate(10deg)')
    .style('opacity', 0)
    .remove();

  const index = d3.selectAll('circle').data().indexOf(slideData);

  d3.select('nav')
    .transition()
    .style('opacity', 1)
    .transition()
    .delay(3000)
    .style('opacity', 0);

  d3.select('#cursor')
    .transition()
    .duration(1000)
    .ease(d3.easeBounceOut)
    .attr('transform', `translate(${timelinePosition(index)}, 0)`);
}

function initPresentationHtml(html) {
  const slides = html.split('<hr>').map((innerHtml, i) => ({
    pageNumber: i,
    isTitleSlide: innerHtml.includes('<h1'),
    html: innerHtml.trim(),
  }));

  timelinePosition
    .domain([0, slides.length]);

  bubbleSize
    .domain(d3.extent(slides, (d) => d.html.length));

  // nav
  d3.select('body')
    .on('mousemove', () => {
      d3.select('nav')
        .transition()
        .style('opacity', 1)
        .transition()
        .delay(3000)
        .style('opacity', 0);
    });

  const bubbles = d3.select('#slides').selectAll('circle')
    .data(slides);

  bubbles.enter()
    .append('circle')
    .attr('r', (d) => bubbleSize(d.html.length))
    .attr('cx', (d, i) => timelinePosition(i))
    .attr('fill', '#ccf')
    .attr('stroke-width', 3)
    .attr('stroke', (d) => (d.html.includes('<h1') ? '#f55' : '#55f'))
    .on('click', (d) => showSlide(d));


  showSlide(slides[0]);

  window.onkeydown = (ev) => {
    const index = d3.selectAll('circle').data().indexOf(d3.select('div.slide').datum());
    switch (ev.code) {
      case 'ArrowRight':
      case 'Space':
      case 'PageDown':
        ev.preventDefault();
        showSlide(slides[clamp(index + 1, 0, slides.length - 1)]);
        break;
      case 'PageUp':
      case 'ArrowLeft':
        showSlide(slides[clamp(index - 1, 0, slides.length - 1)]);
        break;
      default:
    }
  };
}


initPresentationHtml(require('../PRESENTATION.md'));
