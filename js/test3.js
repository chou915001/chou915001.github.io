gStockId = 0;
FL=[];
SP=[];
PC=[];
gIdx = 0;
gArr=[];
gName = "";
gSecondName = "";
enable = 1;

function startGet(id){
	if (enable == 0)
	{
	  return;
	}
	enable = 0;
	$("#search").css("cursor","not-allowed");
	$("#search").css("background-color","gray");
	$("#search").removeClass("sehover");
	seriesCounter = 0;
	gIdx = 0;
	gStockId = id;
	getIDName(id);
	Highcharts.getJSON(
		'https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000039?symbol_id=' + id,
		success2
	);
	FL=[];
	SP=[];
	PC=[];
	
	
}

function getIDName(id){
	$.ajax(
	  {
		url:"https://api.allorigins.win/get?url=https://www.fugle.tw/api/v2/data/contents/FCNT000001?symbol_id=" + id,
		success: function(res){
		  res2 = JSON.parse(res.contents);
		  gName = res2.data.content.rawContent.shortName;
		  gSecondName = res2.data.content.rawContent.endlishShortName;
		  gArr=[res2.data.content.rawContent.shortName,'ILS'];
		  getF(id);
		}
	  }
	)
}

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

function comp(){
	ClearTmp();
	day_arr = [-1, -2, -3, -4, -7];
	
	for (var i = 0; i < SP.length; i++)
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
			day_get.addDays(day_arr[j]);
			//console.log(day_get);
			var v = getIdx(FL, day_get, 1);
			if (v != -1)
			{
				//console.log(FL[v].date);
				//console.log(tmp);
				//console.log(v);
				price = getPrice(PC, day_get);
				if (price != -1)
				{
					var all = 0;
					var z_value = 0;
					
					if (price >= 50)
					{
						all = SP[i].data[11].shares + SP[i].data[12].shares + SP[i].data[13].shares + SP[i].data[14].shares;
					}
					else
					{
						all = SP[i].data[14].shares;
					}
					
					z = 75 + SP[i].data[16].shares / 100000000 - 3 * price / 50;
					if (z > 100) z = 100;
					if (z < 0) z = 0;
					z /= 100;
					
					FL[v].FIBuy = (all - tmp*z)/1000;
					
				}
			}
		}
	}
	//console.log("done");
	var name = gArr[gIdx];
	z=new Array();
	for(var i=0; i < FL.length; i++) {
		if (FL[i].FIBuy != -1)
		{
		   dt = new Date(FL[i].date).getTime();
		   z.push([dt, FL[i].FIBuy])
		}
	}

    seriesOptions[gIdx] = {
		yAxis: gIdx,
        name: name,
        data: z,
		color: gColor[gIdx],
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter == 2) {
        createChart();
    }
	gIdx += 1;
	//console.log("Pdone");
    enable = 1;
    $("#search").css("cursor","pointer");
    $("#search").css("background-color","white");
    $("#search").addClass("sehover");
}

var gColor = ["#000000", "#ff0000"];

var seriesOptions = [],
    seriesCounter = 0;

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

        yAxis: [{},{}],

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}



function success(data) {
    var name = this.url.match(/(msft|aapl|goog)/)[0].toUpperCase();
    var i = names.indexOf(name);
    seriesOptions[i] = {
        name: name,
        data: data
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter === names.length) {
        createChart();
    }
}



function success2(data) {
	data2 = JSON.parse(data.contents);
	PC = data2.data.content.rawContent;
	var name = gArr[gIdx];
	z=new Array();
	for(var i=0; i < data2.data.content.rawContent.length; i++) {
	   dt = new Date(data2.data.content.rawContent[i].date)
	   z.push([dt, data2.data.content.rawContent[i].close])
	}
	//console.log(z);
    seriesOptions[gIdx] = {
        name: name,
        data: z,
		color: gColor[gIdx],
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter == 3) {
        createChart();
    }
	gIdx += 1;
}

$("#search").click(function(){
	startGet($("#fname").val());
})
