var HIDE = false;

$(function(){
  // Sets up routing logic for left content panel
  ContentView.init();

  // Gets data from API and plots graph
  ChartView.init();

  // Sets up routing logic for right content panel
  RightPanel.init();

  if(HIDE){
  	$('#frequency').remove();
  	$('#rsi-icon').remove();
  	$('.link-stockpicker-view').remove();
  	$('.link-news-view').remove();
  }
});
