var ChartView = {
  defaults: {
    width: 900,
  },
  init: function(){
    // set default width
    this.defaults.width = $('#content').width();

    // set up toolbar
    Toolbar.init();

    var self = this;
    ChartModel.get(function(model){
      self.buildIndexChart(model.daily);
      self.buildSentimentChart(model.daily);
      self.buildRSIChart(model.daily);
    });
  },
  buildIndexChart: function(data){
    var width = this.defaults.width,
        height = 400,
        margin = { top: 30, right: 50, bottom: 30, left: 50 },
        volumeHeight = 50,
        interval = 40;

    var chart = d3.select('#chart')
      .append('svg:svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height);

    var y1 = d3.scale.linear()
      .domain([d3.min(data.security.map(function(x) {return +x.low; })), d3.max(data.security.map(function(x){return +x.high; }))])
      .range([height-margin.bottom, margin.top]);
    var y2 = d3.scale.linear()
      .domain([d3.min(data.sentiment.map(function(x) {return +x.price; })), d3.max(data.sentiment.map(function(x){return +x.price; }))])
      .range([height-margin.bottom, margin.top]);
    var x = d3.scale.ordinal()
      .domain(data.security.map(function(x) { return x.date; }))
      .rangeBands([margin.left, width-margin.right]);
    var v = d3.scale.linear()
      .domain([0, d3.max(data.security.map(function(d){ return +d.volume;}))])
      .range([0, volumeHeight]);

    // Returns nearest data index given a mouse x position
    var xInverse = function(xPos){
      var leftEdges = x.range(),
          width = x.rangeBand(),
          j;
      for (j = 0; xPos > (leftEdges[j] + width); j++) {}
      return j;
    }

    chart.append('svg:line')
      .attr('class', 'xaxis')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#464646');
    // chart.append('g')
    //   .attr('class','xlines')
    // .selectAll('line.x')
    //   .data(x.ticks(5))
    //   .enter().append('svg:line')
    //   .attr('class', 'x')
    //   .attr('x1', x)
    //   .attr('x2', x)
    //   .attr('y1', margin.top)
    //   .attr('y2', height - margin.bottom)
    //   .attr('stroke', '#464646');

    //Horizontal guide lines
    chart.append('g')
      .attr('class','ylines')
    .selectAll('line.y1')
      .data(y1.ticks(5))
      .enter().append('svg:line')
      .attr('class', 'y1')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', y1)
      .attr('y2', y1)
      .attr('stroke', '#464646');
      
      //x-axis labels
    chart.append('g')
      .attr('class','xlabels')
    .selectAll('text.xrule')
      .data(data.security)
      .enter().append('svg:text')
      .attr('class', 'xrule')
      .attr('x', function(d,i){ return x(i); })
      .attr('y', height-margin.bottom+20)
      .attr('text-anchor', 'middle')
      .text(function(d,i){ return i%interval===0 ? d.date : ''; });

      // left y-axis labels
    chart.append('g')
      .attr('class','y1labels')
    .selectAll('text.yrule')
      .data(y1.ticks(5))
      .enter().append('svg:text')
      .attr('class', 'yrule')
      .attr('x', 10)
      .attr('y', y1)
      .attr('text-anchor', 'middle')
      .text(String);

      // right y-axis labels
    chart.append('g')
      .attr('class','y2labels')
    .selectAll('text.yrule')
      .data(y2.ticks(5))
      .enter().append('svg:text')
      .attr('class', 'yrule')
      .attr('x', width-margin.right+10)
      .attr('y', y2)
      .attr('text-anchor', 'middle')
      .text(String);

      $('.xlabels > text').click(function(){
        var x = this.getAttribute('x');
        $('#xlabelLine').remove();
        $('#xlabelLineActive').remove();
         chart.append('svg:line')
        .attr('class', 'xlabelLine')
        .attr('id', 'xlabelLine')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', height-margin.bottom) //make it line up with the label
        .attr('y2', margin.top)
        .attr('stroke', '#44b6ea');

        chart.append('g')
        .attr('id','xlabelLineActive')
        .append('svg:rect')
        .attr('x', parseFloat(x) - 50)
        .attr('y', height-margin.top)
        .attr('height', 30)
        .attr('width',  100)
        .attr('fill', '#44b6ea')



      });

      $('.y2labels > text').click(function(){
        $('#y2labelLine').remove();
        $('#y2labelLineActive').remove();
        var y = parseFloat(this.getAttribute('y')) - 5;

        chart.append('g')
        .attr('id','y2labelLineActive')
        .append('svg:rect')
        .attr('x', width-margin.right-5)
        .attr('y', y-5)
        .attr('height', 15)
        .attr('width',  50)
        .attr('fill', '#f65c4e')

        chart.append('svg:line')
        .attr('class', 'y2labelLine')
        .attr('id', 'y2labelLine')
        .attr('x1', margin.left-100)
        .attr('x2', width - margin.right)
        .attr('y1', y) //make it line up with the label
        .attr('y2', y)
        .attr('stroke', '#df5748');
      });

     //sentimetal rect bars 
    chart.append('g')
      .attr('class','volume')
    .selectAll('rect')
      .data(data.security)
      .enter().append('svg:rect')
      .attr('x', function(d,i) { return x(i); })
      .attr('y', function(d) { return height - margin.bottom - v(d.volume); })
      .attr('height', function(d) { return v(d.volume); })
      .attr('width', function(d) { return 0.5 * (width - margin.left - margin.right)/data.security.length; })
      .attr('fill', '#4d4d4d');

    //rectangles of the candlesticks graph
    chart.append('g')
      .attr('class','candlesticks')
    .selectAll('rect')
      .data(data.security)
      .enter().append('svg:rect')
      .attr('x', function(d, i) { return x(i); })
      .attr('y', function(d) { return y1(max(d.open, d.close)); })
      .attr('height', function(d) { return y1(min(d.open, d.close))-y1(max(d.open, d.close)); })
      .attr('width', function(d) { return 0.7 * (width - margin.right)/data.security.length; })
      .attr('fill', function(d) { return d.open > d.close ? '#f65c4e' : '#3bbb57'; });

    //verticle lines of the candlesticks graph
    chart.append('g')
      .attr('class','linestems')
    .selectAll('line.stem')
      .data(data.security)
      .enter().append('svg:line')
      .attr('class', 'stem')
      .attr('x1', function(d, i) { return x(i) + 0.25 * (width - margin.left - margin.right)/data.security.length; })
      .attr('x2', function(d, i) { return x(i) + 0.25 * (width - margin.left - margin.right)/data.security.length; })
      .attr('y1', function(d) { return y1(d.high); })
      .attr('y2', function(d) { return y1(d.low); })
      .attr('stroke', function(d){ return d.open > d.close ? '#f65c4e' : '#3bbb57'; })

      //tooltips
    chart.append('rect')
      .attr('class', 'mouseover-overlay')
      .attr('fill', 'transparent')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width-margin.left-margin.right)
      .attr('height', height-margin.top-margin.bottom)
      .on('mouseover', function(){ return Tooltip.show(); })
      .on('mousemove', function(){
        var xPos = d3.mouse(this)[0],
            j = xInverse(xPos),
            d = data.security[j],
            d2 = data.sentiment[j];

        var model = {
          top: d3.event.layerY-5,
          left: width-d3.event.layerX>150 ? d3.event.layerX+5 : d3.event.layerX-155,
          date: d.date,
          security: d,
          sentiment: {
            price: d2.price,
            change: d2.change
          }
        };
        return Tooltip.render(model);
      })
      .on('mouseout', function(){ return Tooltip.hide(); });

    //sentimentLine
    plotLine('#25bcf1', 'linear', 'sentimentLine')

    //add all MA lines
    plotLine('#fff', ChartModel.movingAvg(5), 'ma5-line');
    plotLine('#d8db74', ChartModel.movingAvg(10), 'ma10-line');
    plotLine('#94599d', ChartModel.movingAvg(20), 'ma20-line');
    plotLine('#36973a', ChartModel.movingAvg(60), 'ma60-line');

    //bind checkbox listeners to each MA line
    toggleMA('#ma5-checkbox', '#ma5-line');
    toggleMA('#ma10-checkbox', '#ma10-line');
    toggleMA('#ma20-checkbox', '#ma20-line');
    toggleMA('#ma60-checkbox', '#ma60-line');

    //bind checkbox listeners to each MA line
    function toggleMA(checkboxID, maLineID){
      $(checkboxID).change(function(){
        /*
         * see http://jsperf.com/boolean-int-conversion/3 for ternary operators speed
         * Chrome benefits greatly using explicit rather than implicit.
         * but on average implicit ternary operator is pretty fast
         */
          d3.select(maLineID).style('opacity', this.checked? 1:0);
      });
    }

    $('#ma60-label').text(' MA60=' + ChartModel.calcMovingAvg(60, 2));
    $('#ma20-label').text(' MA20=' + ChartModel.calcMovingAvg(20, 2));
    $('#ma10-label').text(' MA10=' + ChartModel.calcMovingAvg(10, 2));
    $('#ma5-label').text(' MA5=' + ChartModel.calcMovingAvg(5, 2));

    /*
     * args:
     *  - color: string, in hex.
     *          e.g. '#fff', '#9f34a1'
     *  - interpolate: 'linear', ChartModel.movingAvg(x), etc
     *  - id: what you want to id your line as. Don't put '#'
     */
    function plotLine(color, interpolate, id){
      var line = d3.svg.line()
      .x(function(d, i){ return x(i); })
      .y(function(d){ return y2(d.price); })
      .interpolate(interpolate);

      chart.append('path')
        .datum(data.sentiment)
        .attr('class','line')
        .attr('d', line)
        .attr('stroke', color)
        .attr('fill', 'none')
        .attr('id', id);
    }
  },
  buildSentimentChart: function(data){
    var width = this.defaults.width,
        height = 200,
        margin = { top: 30, right: 50, bottom: 30, left: 50 },
        interval = 40;

    var chart = d3.select('#sentiment-chart')
      .append('svg:svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height);

    var y1 = d3.scale.linear()
      .domain([d3.min(data.security.map(function(x) {return +x.low; })), d3.max(data.security.map(function(x){return +x.high; }))])
      .range([height-margin.bottom, margin.top]);
    var y2 = d3.scale.linear()
      .domain([d3.min(data.sentiment.map(function(x) {return +x.price; })), d3.max(data.sentiment.map(function(x){return +x.price; }))])
      .range([height-margin.bottom, margin.top]);
    var x = d3.scale.ordinal()
      .domain(data.security.map(function(x) { return x.date; }))
      .rangeBands([margin.left, width-margin.right]);

    chart.append('svg:line')
      .attr('class', 'xaxis')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#464646');

    chart.append('g')
      .attr('class','xlabels')
    .selectAll('text.xrule')
      .data(data.security)
      .enter().append('svg:text')
      .attr('class', 'xrule')
      .attr('x', function(d,i){ return x(i); })
      .attr('y', height-margin.bottom+20)
      .attr('text-anchor', 'middle')
      .text(function(d,i){ return i%interval===0 ? d.date : ''; });

    chart.append('g')
      .attr('class','y1labels')
    .selectAll('text.yrule')
      .data(y1.ticks(5))
      .enter().append('svg:text')
      .attr('class', 'yrule')
      .attr('x', 10)
      .attr('y', y1)
      .attr('text-anchor', 'middle')
      .text(String);

    chart.append('g')
      .attr('class','y2labels')
    .selectAll('text.yrule')
      .data(y2.ticks(5))
      .enter().append('svg:text')
      .attr('class', 'yrule')
      .attr('x', width-margin.right + 10)
      .attr('y', y2)
      .attr('text-anchor', 'middle')
      .text(String);

    var sentimentLine = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d) { return y2(d.price); })
      .interpolate('linear');

    chart.append('path')
      .datum(data.sentiment)
      .attr('class','sentiment')
      .attr('d', sentimentLine)
      .attr('stroke', '#25bcf1')
      .attr('fill', 'none');

    var securityLine = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d) { return y1(d.close); })
      .interpolate('basis');

    chart.append('path')
      .datum(data.security)
      .attr('class','security')
      .attr('d', securityLine)
      .attr('stroke', '#fff')
      .attr('fill', 'none');
  },
  buildRSIChart: function(data){
    var width = this.defaults.width,
        height = 200,
        margin = { top: 30, right: 50, bottom: 30, left: 50 },
        interval = 40;

    var chart = d3.select('#rsi-chart')
      .append('svg:svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height);

    var y2 = d3.scale.linear()
      .domain([d3.min(data.sentiment.map(function(x) {return +x.price; })), d3.max(data.sentiment.map(function(x){return +x.price; }))])
      .range([height-margin.top, margin.bottom]);
    var x = d3.scale.ordinal()
      .domain(data.security.map(function(x) { return x.date; }))
      .rangeBands([margin.left, width-margin.right]);

    chart.append('svg:line')
      .attr('class', 'xaxis')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#464646');

    chart.append('g')
      .attr('class','xlabels')
    .selectAll('text.xrule')
      .data(data.security)
      .enter().append('svg:text')
      .attr('class', 'xrule')
      .attr('x', function(d,i){ return x(i); })
      .attr('y', height-margin.bottom+20)
      .attr('text-anchor', 'middle')
      .text(function(d,i){ return i%interval===0 ? d.date : ''; });

    chart.append('g')
      .attr('class','y2labels')
    .selectAll('text.yrule')
      .data(y2.ticks(5))
      .enter().append('svg:text')
      .attr('class', 'yrule')
      .attr('x', 10)
      .attr('y', y2)
      .attr('text-anchor', 'middle')
      .text(String);

    var line = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d) { return y2(d.price); })
      .interpolate('linear');

    chart.append('path')
      .datum(data.sentiment)
      .attr('class','sentiment')
      .attr('d', line)
      .attr('stroke', '#b4433b')
      .attr('fill', 'none');
  },
  buildMAChart: function(){
    // TODO
  }
}