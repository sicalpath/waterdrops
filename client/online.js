
(function (window, $) {
	//定义玩家细胞类
	var Cell = function( name , r , color , pos ){

		this.radius = r || 10;
		this.nickname = name ;
		this.color = color || "#FF0000";
		this.position = pos || {x:0,y:0};

		this.draw = function(camera){
			if( camera.viewPort.x + this.position.x < 0 || camera.viewPort.y + this.position.y < 0 || camera.viewPort.y + this.position.y > canvas.height / camera.zoom || camera.viewPort.x + this.position.x > canvas.width / camera.zoom)	return;
			//console.log(this.position);
			//console.log(this.nickname);
			if(this.nickname == ""){
				context.fillStyle = this.color;
				context.fillRect(camera.viewPort.x + this.position.x - this.radius,camera.viewPort.y + this.position.y - this.radius,this.radius,this.radius);
			}else{
				fontsize = ( 12 + Math.floor( this.radius-15 ) * 0.3 ) * camera.zoom;	//昵称大小
				//console.log(this.position.x +":"+ camera.cameraX);
				//console.log(camera.cameraX - camera.mine[0].position.x)
				//cell壁
				context.beginPath();
				context.strokeStyle = "#666666";
				context.lineWidth = 5;
				context.arc( camera.viewPort.x + this.position.x , camera.viewPort.y + this.position.y , this.radius * camera.zoom  ,0,Math.PI*2,false);
				context.stroke();
				context.closePath();
				//cell核
				context.fillStyle = this.color;
				context.beginPath();
				context.arc( camera.viewPort.x + this.position.x , camera.viewPort.y + this.position.y , this.radius * camera.zoom ,0,Math.PI*2,true);
				context.closePath();
				context.fill();
				//console.log(camera.zoom)
				//名字
				context.fillStyle="#FFFFFF";
				context.font = "normal bold " + fontsize + "px serif"	
				context.fillText( this.nickname.toString() , camera.viewPort.x + this.position.x - strlen(this.nickname.toString()) * fontsize / 4   , camera.viewPort.y + this.position.y  + fontsize / 2 );
			}
		}
		function strlen(str){  
		    var len = 0;  
		    for (var i=0; i<str.length; i++) {   
			    var c = str.charCodeAt(i);   
			    //单字节加1   
			    if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {   
			       len++;   
			    }   
			    else {   
			      len+=2;   
			    }   
		    }   
		    return len;  
		}
	}

	var Camera = function( me , others , size ,zoom){
		this.mine = me;
		this.oths = others;
		this.mapX = size.x || 1000;
		this.mapY = size.y || 700;			
		this.cameraX = canvas.width / 2/ zoom ;
		this.cameraY = canvas.height / 2/ zoom ;
		this.viewPort = { x : canvas.width / 2 / zoom , y : canvas.height / 2 / zoom };
		this.zoom = zoom ;


		this.draw = function(){
			cells = [];
			cells = this.mine.concat(this.oths);
			for (var i = 0; i < cells.length; i++) {
				cells[i].draw(this);
				//console.log(cells[i]);
			};
			//console.log(this);
		}
		this.Zoom = function(z){
			this.zoom = z ;
			this.cameraX = canvas.width / 2/ z ;
			this.cameraY = canvas.height / 2/ z ;
		}
		this.updateMe = function(me){
			this.mine = me;
			if( me.length > 1 ){
				me.sort(function(a,b){
					return a.radius - b.radius ;
				});
			}
			var mtotal = 0;
			var mass = 0;
			var mvX = 0;
			var mvY = 0;
			//me.length != 0 && ( this.zoom = 1 )//, this.cameraX = this.maxX / 2 + this.mine[0].position.x , this.cameraY = this.maxY / 2 + this.mine[0].position.y );
			for (var i = 0; i < me.length; i++) {
				mass = me[i].radius * me[i].radius
				mvX += mass * me[i].position.x;
				mvY += mass * me[i].position.y;
				mtotal += mass
			};
			mvX = mvX / mtotal ;
			mvY = mvY / mtotal ;
			this.viewPort = { x : ( this.cameraX - mvX ) , y : ( this.cameraY - mvY )  };
			//console.log("viewPort : "+ me[0].position.x);
		}
		this.updateOth = function(others){
			this.oths = others;
		}
		this.spos2gpos = function(X,Y){
			return [ X - this.viewPort.x, Y - this.viewPort.y ];
		}
		this.gpos2spos = function(pos){
			//console.log(pos.x + ":" + this.viewPort.x);
			return { x : pos.x + this.viewPort.x , y : pos.y + this.viewPort.y };
		}
	}

	$(function(){

		//调整画布大小
		$(window).resize(resizeCanvas);  
		   
		 function resizeCanvas() {  
		 		$('#canvas').attr("width", $(window).get(0).innerWidth);  	   
		        $('#canvas').attr("height", $(window).get(0).innerHeight);  	   
		 };  
	   
	 	resizeCanvas(); 
	 	$('#myModal').on('shown.bs.modal', function () {
		  $('#myInput').focus()
		})

		$(".enterG").click(function(){
			gameApp($("#nickname").val());
			$(".fade").hide();
		})


	})


	function gameApp(nickname){

	nickname == undefined && (nickname = "noname");
	//连接服务器
	var sWidth = $(window).get(0).innerWidth;
	var sHeight = $(window).get(0).innerHeight;
	var ws = new WebSocket("ws://127.0.0.1:8880/");
	ws.binaryType = "arraybuffer";
	var mouseX = 100;
	var mouseY = 100;
	var players = [];
	var rank = [];
	var myCells = [];
	var pconfig = {};
	var timer = [];
	var latestX = 0;
	var latestY = 0;
	var cells = [];
	var zoom = 1 ;
	var camera = new Camera(myCells , players , {x:10000,y:7000} , zoom);
	pconfig.nickname = nickname ;

	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	context.fillStyle = '#000000';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
	context.fillRect(0,0,canvas.width,canvas.height);
	//context.fillStyle = '#000000';  
	//context.fillRect(0,0,1000,700);
	//context.translate( 100 , 100);
	context.scale(zoom,zoom);
	//操作 0: 是初始化 1:是移动数据 2:是按键数据
	ws.onopen = function() {    
		   console.log('connected');  
		   updateNick();
		   timer.push(setTimeout(sendPos,100));
		   $('#canvas').mousemove(function(e){
		   		//console.log(e)
		   		mouseX = e.pageX / zoom;
		   		mouseY = e.pageY / zoom;
			}); 
		   $('body').keydown(function(a){
				sendSingle(0x11);
			});
		    drawScreen();
		   	function sendPos(){
				timer.push(setTimeout(sendPos.bind(this),100));
				//console.log(position);
				if( latestX == mouseX  && latestY == mouseY) return;
				latestX = mouseX ;
				latestY = mouseY ;
				realPos = camera.spos2gpos(mouseX , mouseY);


				var buf = new ArrayBuffer(1 + 8 + 8 + 4);
			    var view = new DataView(buf);
			    view.setUint8(0, 0x10);
			    view.setFloat64(1, realPos[0], true);
			    view.setFloat64(9, realPos[1], true);
			    view.setUint32(17, 0, true);
			    ws.send(buf);
				//( latestPos.x != position.x || latestPos.y != position.y )	&& ( latestPos.x = position.x , latestPos.y = position.y , ws.send("1:"+position.x+"-"+position.y)  ) ;
			}
			function updateNick(){
				if (ws == null || ws.readyState != ws.OPEN) return;
				var buf = new ArrayBuffer(1 + pconfig.nickname.length * 2);
			    var view = new DataView(buf);
			    view.setUint8(0, 0x00);
			    for (var i = 0; i < pconfig.nickname.length; ++i) {
			    	view.setUint16(1 + i * 2, pconfig.nickname.charCodeAt(i), true);
			    }
			    ws.send(buf);
			}
			function sendSingle(b){
				if (ws == null || ws.readyState != ws.OPEN) return;
				var buf = new ArrayBuffer(1);
			    var view = new DataView(buf);
			    view.setUint8(0, b);
			    ws.send(buf);
			}
		};    
	ws.onerror = function(err) {    
		   console.log("Error: " + err);    
		   reEnter();
		};
	ws.onclose = function() {    
			for (var i = timer.length - 1; i >= 0; i--) {
                    clearTimeout(timer[i]);
            };
		    console.log("Closed");    
		};  
	ws.onmessage = function (evt) {   
		var view = new DataView(evt.data);  
		switch(view.getUint8(0)){
			case 0x00 :
				reEnter();
				break;
			case 0x10 :
				myCells = [];
				updateMycells();
				setZoom(clcZoom());
				break;
			case 0x12:
				updateCells();
				break;
			case 0x18:
				cells = [];
				break;
			case 0x19:
				//myCells = [];
				break;
			case 0x20:
				setRank(evt);
				break;
			case 0xFF:
				reEnter();
				break;
			default:
				break;
		}
		
		/*if(evt.data === "died")	reEnter();
		players = JSON.parse(evt.data);
		//console.log(players);
		switch(players[0]){
			case 0x10 :
				players.splice(0,1);
				updateMycells();
				setZoom(clcZoom());
				break;
			case 0x11 :
				players.splice(0,1);
				updateCells();
				break;
			case 0x12:
				players.splice(0,1);
				setRank();
				break;
			default:
				break;

		}		
		drawScreen();   */
		//var view = new DataView(evt.data);
		function updateMycells(){	
			for (var i = 0 ; i < ( evt.data.byteLength - 1 ) / 44; i++) {
				nickname = "";
				offset = 1 + 44 * i;
				for (;;) {
			        var v = view.getUint16(offset, true);
			        offset += 2;
			        if (v == 0) break;
			        nickname += String.fromCharCode(v);
			        //console.log(offset);
		      	}
		      	offset = 17 + 44 * i;
				ballX = view.getFloat64(offset, true);
				offset += 8;
				ballY = view.getFloat64(offset, true);
				offset += 8;
				radius = view.getFloat64(offset ,true);
				offset += 8
				color = "#"+view.getUint32(offset ,true).toString(16).substr(2);
				var cell = new Cell ( nickname , radius / zoom, color , {x:ballX,y:ballY} );
				myCells.push(cell);
			};
		}
		function updateCells(){
			for (var i = 0 ; i < ( evt.data.byteLength - 1 ) / 44; i++) {
				nickname = "";
				offset = 1 + 44 * i;
				for (;;) {
			        var v = view.getUint16(offset, true);
			        offset += 2;
			        if (v == 0) break;
			        nickname += String.fromCharCode(v);
		      	}
		      	offset = 17 + 44 * i;
				ballX = view.getFloat64(offset, true);
				offset += 8;
				ballY = view.getFloat64(offset, true);
				offset += 8;
				radius = view.getFloat64(offset ,true);
				offset += 8
				color = "#"+  view.getUint32(offset ,true).toString(16).substr(2);

				var cell = new Cell ( nickname , radius / zoom, color , {x:ballX,y:ballY} );
				cells.push(cell);
			}
		}
	}; 
	function clcZoom(){
		z = 1;
		for (var i = 0; i < players.length; i++) {
			z *= 1 + players[i].radius / 500;
		};
		return z;
	}
	function setZoom(z){
		if(zoom == 1/z)	return;
		context.scale(1/zoom,1/zoom);
		zoom = 1/z;
		context.scale(zoom,zoom);
		camera.Zoom(zoom);
	}
	function setRank(evt){
		rank = [];
		var view = new DataView(evt.data);  
		//console.log("set");
		for (var i = 0 ; i < ( evt.data.byteLength - 1 ) / 16; i++) {
				nickname = "";
				offset = 1 + 16 * i;
				for (;;) {
			        var v = view.getUint16(offset, true);
			        offset += 2;
			        if (v == 0) break;
			        nickname += String.fromCharCode(v);
			        //console.log(offset);
		      	}
		      	rank.push({nickname:nickname});
		}
	}
	function drawRank(){
		context.fillStyle = '#000000';   
		context.globalAlpha = 0.2;
		context.fillRect( ( canvas.width  - 260 ) / zoom , 60 / zoom ,200 / zoom,250 / zoom);
		txt = "";
		context.globalAlpha = 1.0;
		context.fillStyle = '#FFFFFF';
		context.font = "normal bold "+20/zoom+"px serif"	
		for (var i = 0; i < rank.length; i++) {
			txt = (i+1) + "." +rank[i].nickname.toString();
			context.fillText(txt, ( canvas.width  - 235 ) / zoom , ( 100 + i*34 ) / zoom );
		};
		//context.fillText(txt, canvas.width / zoom - 225 , 90 );
	}
	function drawScreen(){
		//window.requestAnimationFrame(drawScreen);
		setTimeout(drawScreen,30)
		context.globalAlpha = 1;
		ul = camera.gpos2spos({x:0 , y:0});
		dr = camera.gpos2spos({x:camera.mapX , y:camera.mapY});
		context.clearRect(0,0,canvas.width/zoom,canvas.height/zoom);
		//画地图
		context.fillStyle = '#E0FFFF';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		context.fillRect(0,0,canvas.width/zoom,canvas.height/zoom);//(ul.x,ul.y,dr.x,dr.y);//(0,0,canvas.width,canvas.height);
		context.fillStyle = '#FFFFFF'; 
		context.strokeRect(ul.x,ul.y,camera.mapX,camera.mapY);
		drawGrid();
		camera.updateMe(myCells);
		camera.updateOth(cells);
		camera.draw();
		drawRank();
		/*for (var i = 0; i < myCells.length; i++) {
			myCells[i].draw();
		};
		for (var i = cells.length - 1; i >= 0; i--) {

			cells[i].draw();
		};*/

		function drawGrid(){
			stepx = 70 ; 
			stepy = 70 ;
			context.strokeStyle = "#87CEEB";
			context.lineWidth = 0.7;
			for (var i = stepx + ul.x; i < dr.x ; i+=stepx) {
				context.beginPath();
				context.moveTo(i,ul.y);
				context.lineTo(i,dr.y);
				context.stroke();
			};
			for (var i = stepy + ul.y; i < dr.y ; i+=stepy) {
				context.beginPath();
				context.moveTo(ul.x,i);
				context.lineTo(dr.x,i);
				context.stroke();
			};
		}
	}
	function reEnter(){
		ws.close();
		$(".modal-title").html("你被吃辣");
		$(".fade").show();
		context.scale(1/zoom,1/zoom);
	}

}
})(window, jQuery);

