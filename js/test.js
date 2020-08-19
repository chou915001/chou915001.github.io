//新增一個商品清單的物件
var shoplist={};
shoplist.name="MyBuylist 購物清單";
shoplist.time="2016/9/10";
//商品清單的清單裡面是個陣列，塞商品物件們
shoplist.list=[];



//定義元素用的html模板，{{名稱}}代表要套入的地方
var item_html="<li id={{id}} class='buy_item'>{{num}}.{{item}}<div class='price'>{{price}}</div><div id={{del_id}} data-delid={{del_target}} class='del_btn'>X</div></li>";

var total_html="<li class='buy_item total'>總價<div class='price'>{{price}}</div></li>";

function showlist(){
  $("#items_list").html("");
  var total_price=0;
  for (var i=0;i<shoplist.list.data.content.rawContent.length;i++){
	var current_item=shoplist.list.data.content.rawContent[i];
    var html=
        item_html.replace("{{id}}",0)
                 .replace("{{num}}",1)
                 .replace("{{item}}",current_item.date)
                 .replace("{{price}}",current_item.close)
                 .replace("{{del_id}}",0)
                 .replace("{{del_target}}",1);
    $("#items_list").append(html);  
    $("#"+1).click(
      function(){
        remove_item($(this).attr("data-delid"));
      }
    );
  }
  html=total_html.replace("{{price}}",total_price);
    $("#items_list").append(html);
}

$("#addbtnx").click(
  function(){
	console.log(1);
    getPrice(8299);
  }
)

function remove_item(id){
  shoplist.list.splice(id,1);
  showlist();
}

function getPrice(id){
	$.ajax(
	  {
		url:"https://www.fugle.tw/api/v2/data/contents/FCNT000039?symbol_id=" + id,
		success: function(res){
		  shoplist.list=res;
		  showlist();
		}
	  }
	)
}

