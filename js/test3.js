// init
gStockId = 0;
FL=[];
SP=[];
PC=[];
gIdx = 0;
gArr=[];
gName = "";
gSecondName = "";
enable = 1;
var seriesOptions = [];
gLabel = ['', '內部持股比例', '內部持股變化'];

// load
$("#fname").focus();

// step1. click trigger stock price
function startGet(id){
	if (enable == 0)
	{
		return;
	}
	FL=[];
	SP=[];
	PC=[];
	enable = 0;
	$("#fname").val("");
	$("#search").css("cursor","not-allowed");
	$("#search").css("background-color","gray");
	$("#search").text("Loading...");
	seriesCounter = 0;
	gIdx = 0;
	gStockId = id;
	Highcharts.getJSON(
		'https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000085?symbol_id=' + id,
		success
	);
}

// step2. stock price ajax callback trigger get stock info
function success(data) {
	data2 = JSON.parse(data.contents);
	//console.log(data2);
	PC = data2.data.content.rawContent.day;
	z=new Array();
	for(var i=0; i < data2.data.content.rawContent.day.length; i++) {
	   dt = new Date(data2.data.content.rawContent.day[i].date);
	   z.push([dt.addDays(1), data2.data.content.rawContent.day[i].open, data2.data.content.rawContent.day[i].high, data2.data.content.rawContent.day[i].low, data2.data.content.rawContent.day[i].close])
	}
	//console.log(z);
	seriesOptions[0] = {
		type: 'candlestick',
		data: z,
	};
	getIDName(gStockId);
}

// step3. stock info ajax callback trigger get F operation
function getIDName(id){
	$.ajax(
	  {
		url:"https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000001?symbol_id=" + id,
		success: function(res){
		  res2 = JSON.parse(res.contents);
		  gName = res2.data.content.rawContent.shortName;
		  gLabel[0] = gname;
		  gSecondName = res2.data.content.rawContent.endlishShortName;
		  getF(id);
		}
	  }
	)
}

// step4. F operation ajax callback trigger get spread
function getF(id){
	$.ajax(
	  {
		url:"https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000005?symbol_id=" + id,
		success: function(res){
		  //console.log("F");
		  //console.log(res.data.content.rawContent);
		  res2 = JSON.parse(res.contents);
		  FL = res2.data.content.rawContent;
		  getSpread(id);
		}
	  }
	)
}

// step5. get spread ajax callback trigger computer result
function getSpread(id){
	$.ajax(
	  {
		url:"https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000022?symbol_id=" + id,
		success: function(res){
		  //console.log("S");
		  //console.log(res);
		  res2 = JSON.parse(res.contents);
		  SP = res2.data.content.rawContent;
		  //console.log(res.data.content.rawContent)
		  comp();
		}
	  }
	)
	
}

// step6. computer result
function comp(){
	ClearTmp();
	day_arr = [-1, -2, -3, -4, -7];
	sum = 0;
	for (var i = SP.length -2; i >= 0 ; i--)
	{
		
		tmp = 0;
		day = new Date(SP[i].date);
		for (var j = 0; j < 5; j++)
		{
			day_get = new Date(day);
			
			day_get.addDays(day_arr[j]);
			var v = getIdx(FL, day_get, 2);
			if (v != -1)
			{
				tmp += v;
			}
		}
		
		day = new Date(SP[i].date);
		for (var j = 0; j < 5; j++)
		{
			day_get = new Date(day);
			//console.log(day);
			day_get.addDays(day_arr[j]);
			//console.log(day_get);
			var v = getIdx(FL, day_get, 1);
			//console.log(v);
			if (v != -1)
			{
				//console.log(FL[v].date);
				//console.log(tmp);
				//console.log(v);
				price = getPrice(PC, day_get);
				
				if (price != -1)
				{
					var this_week = 0;
					var this_week_all = 0;
					var last_week = 0;
					var last_week_all = 0;
					var z_value = 0;
					
					if (price >= 50)
					{
						this_week = SP[i].data[11].shares + SP[i].data[12].shares + SP[i].data[13].shares + SP[i].data[14].shares;
					}
					else
					{
						this_week = SP[i].data[14].shares;
					}
					this_week_all = SP[i].data[16].shares;
					
					if (price >= 50)
					{
						last_week = SP[i+1].data[11].shares + SP[i+1].data[12].shares + SP[i+1].data[13].shares + SP[i+1].data[14].shares;
					}
					else
					{
						last_week = SP[i+1].data[14].shares;
					}
					last_week_all = SP[i+1].data[16].shares;
					
					z = 75 + SP[i].data[16].shares / 10000000 - 3 * price / 50;
					if (z > 100) z = 100;
					if (z < 0) z = 0;
					z = z / 100;
					
					ils = formatFloat(((this_week/this_week_all - last_week/last_week_all)*this_week_all - tmp * z)/this_week_all * 100, 2)
					
					if (j == 0)
					{
						
						sum += ils;
						//console.log(sum);
					}
					
					FL[v].FISell = ils;
					FL[v].FIBuy = sum;
				}
			}
		}
	}
	//console.log("done");
	var name = gArr[gIdx];
	z=new Array();
	ils_volume = new Array();
	for(var i=0; i < FL.length; i++) {
		if (FL[i].FIBuy != -1)
		{
		   dt = new Date(FL[i].date).getTime() + 24*60*60*1000;
		   //console.log(new Date(dt))
		   z.push([dt, formatFloat(FL[i].FIBuy,2)]);
		   ils_volume.push([dt, formatFloat(FL[i].FISell,2)]);
		}
	}

    seriesOptions[1] = {
		yAxis: 1,
        name: "內部持股比例",
        data: z,
		color: "#A34573",
    };
	
	seriesOptions[2] = {
		yAxis: 1,
		type: 'column',
        name: "內部持股變化",
        data: ils_volume,
		color: "#5C5C61",
    };

    createChart();
	gIdx += 1;
	//console.log("Pdone");
    enable = 1;
    $("#search").css("cursor","pointer");
    $("#search").css("background-color","white");
    $("#search").text("Search");
}


// module or function

function getPrice(Arr, symb){
	
	for (var i = 0; i < Arr.length; i++)
	{
		if( (new Date(Arr[i].date).getTime() == new Date(symb).getTime()))
		{
			return Arr[i].close;
		}
	}
	return -1;
}

function getIdx(Arr, symb, type){
	
	for (var i = 0; i < Arr.length; i++)
	{
		if( (new Date(Arr[i].date).getTime() == new Date(symb).getTime()))
		{
			if (type == 1) {
				return i;
			}
			return Arr[i].total;
		}
	}
	return -1;
}

Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days);
  return this;
}

function ClearTmp(){
	for (var i = 0; i < FL.length; i++){
		FL[i].FIBuy = -1;
	}
}

function formatFloat(num, pos)
{
  var size = Math.pow(10, pos);
  return Math.round(num * size) / size;
}

// highcharts
function createChart() {

    Highcharts.stockChart('container', {

		title: {
			text: gName + " (" + gStockId + ")"
		},
		
		subtitle: {
			text: gSecondName + " (" + gStockId + ")"
		},

        rangeSelector: {
            selected: 4
        },
		
		 xAxis: {
		  type: 'datetime',
		  labels: {
			format: '{value:%Y/%m/%d}',
		  }
		},
		
        yAxis: [{
				labels: {
					align: 'right',
					x: -3
				},
				title: {
					text: '股價'
				},
				height: '60%',
				lineWidth: 2
			},{
				labels: {
					align: 'right',
					x: -3
				},
				title: {
					text: '內部持股'
				},
				top: '65%',
				height: '35%',
				offset: 0,
				lineWidth: 2
			}],

        plotOptions: {
            series: {
                compare: 'value',
                showInNavigator: true
			},
			candlestick: {
				color: '#6c9c46',
				upColor: '#f3746d'
			}
        },

        tooltip: {
            //pointFormat: '<span style="color:{series.color}"><b>{series.name}</b>: <b>{point.y}</b></span><br/>',
            valueDecimals: 2,
            split: true,
			formatter: function() {
			  var points = this.points,
				tooltipArray = ['<b>' + Highcharts.dateFormat('%Y/%m/%d', this.x) + '</b>']

			  points.forEach(function(point, index) {
				  if (index == 0) {
					  tooltipArray.push('<br><b>開盤: </b>' + point.point.open +
					'<br><b>最高: </b>' + point.point.high +
					'<br><b>最低: </b>' + point.point.low +
					'<br><b>收盤: </b>' + point.point.close +
					'<br><b>漲跌: </b>' + formatFloat((point.point.close - point.point.open),2) + '<b> (' + formatFloat((point.point.close - point.point.open)*100/point.point.open,2) +'%)</b>');
				  }
				 else
				 {
					 tooltipArray.push('<b>' + gLabel[index] + ': </b>' + point.y + '%');
				 }
			  });

			  return tooltipArray;
			}
        },

        series: seriesOptions
    });
}



// ------------------
// listener
$("#fname").keypress(function(e){
	code = (e.keyCode ? e.keyCode : e.which);
	if (code == 13)
	{
		$( "#search" ).trigger( "click" );
	}
});

$("#fname").click(function(){
	$("#fname").val("");
  });

$("#search").mouseenter(function(){
  if (enable == 1)
  {
    $("#search").css("background-color","#A7C9E7");
  }
});

$("#search").mouseleave(function(){
  if (enable == 1)
  {
    $("#search").css("background-color","white");
  }
});

$("#search").click(function(){
	startGet($("#fname").val());
})
