gStockId = 0;
FL=[];
SP=[];
PC=[];
gIdx = 0;
gArr=[];

function startGet(id){
	seriesCounter = 0;
	gArr=[id,'ILS'];
	gIdx = 0;
	gStockId = id;
	Highcharts.getJSON(
		'https://www.fugle.tw/api/v2/data/contents/FCNT000039?symbol_id=' + gStockId,
		success2
	);
	FL=[];
	SP=[];
	PC=[];
	getF(gStockId);
	
}


function getF(id){
	$.ajax(
	  {
		url:"https://www.fugle.tw/api/v2/data/contents/FCNT000005?symbol_id=" + id,
		success: function(res){
		  //console.log("F");
		  //console.log(res.data.content.rawContent);
		  FL = res.data.content.rawContent;
		  getSpread(gStockId);
		}
	  }
	)
}

function getSpread(id){
	$.ajax(
	  {
		url:"https://www.fugle.tw/api/v2/data/contents/FCNT000022?symbol_id=" + id,
		success: function(res){
		  //console.log("S");
		  SP = res.data.content.rawContent;
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
        data: z
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter == 2) {
        createChart();
    }
	gIdx += 1;
	//console.log("Pdone");
}

var seriesOptions = [],
    seriesCounter = 0;

function createChart() {

    Highcharts.stockChart('container', {

		title: {
			text: gStockId
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
	PC = data.data.content.rawContent;
	var name = gArr[gIdx];
	z=new Array();
	for(var i=0; i < data.data.content.rawContent.length; i++) {
	   dt = new Date(data.data.content.rawContent[i].date)
	   z.push([dt, data.data.content.rawContent[i].close])
	}
	//console.log(z);
    seriesOptions[gIdx] = {
        name: name,
        data: z,
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