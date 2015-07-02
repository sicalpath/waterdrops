
//定义世界常量
var gravity = 10 ;      //重力加速度
var mec = [];                //自己

//重构数组的函数
Array.prototype.oindexOf = function(val) {
    val = val.split("=");
    for (var i = 0; i < this.length; i++) {
        if (this[i][val[0]] == val[1]) return i;
    }
    return -1;
};
Array.prototype.oremove = function(val) {
    var index = this.oindexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
function calcD(p1,p2){
    return dist = (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y);
}

//定义地图类

var Map = function( x , y ){
    
    this.x = x || 1000 ;
    this.y = y || 700 ;
    
    this.getX = function(){
        return this.x;
    }
    this.getY = function(){
        return this.y;
    }
    this.testX = function(obj , r){
        // -2 -1 0 1 2      0为在地图内
        r = r || 0;
        obj.x = parseFloat(obj.x);
        var res = obj.x - r < 0 ? -2 : ( obj.x - r == 0 ? -1 : ( obj.x + r == this.x ? 1 : ( obj.x + r > this.x ? 2 : 0 ) ) );
        return res;
    }
    this.testY = function(obj , r){
        r = r || 0;
        obj.y = parseFloat(obj.y);
        var res = obj.y - r < 0 ? -2 : ( obj.y - r == 0 ? -1 : ( obj.y + r == this.y ? 1 : ( obj.y + r > this.y ? 2 : 0 ) ) );
        return res;
    }
}
var map = new Map( 10000 , 7000 );
//定义刺球类
var bramble = function(){

    this.mass = 120 ; 
    this.density = 0.02 ;      //面密度


}


//定义玩家类
var p = function(id,mass,pos){

	if(!id)	id = 0;
	if(!mass) mass = 3 ;
	var color = new Array(0xFFFF0000,0xFF00FF00,0xFF0000FF,0xFFFFFF00,0xFF00FFFF,0xFFFF00FF);
    this.id = id;
	this.speed = 0 ;
    this.nickname = "";
    this.density = 0.02 ;      //面密度
    this.radius = parseFloat( Math.sqrt( (( mass / this.density ) / Math.PI ).toFixed(2) ).toFixed(2));
    this.force = 3 ;
    this.mass = mass ;            //质量
    this.friction = 0.5 ;       //摩擦因数 动 静
    this.resistance = 0.01 * this.mass ;      //空气阻力系数
    this.color = color[Math.floor(6*Math.random())];       
    this.ball = pos || {x:map.getX()*Math.random(1),y:map.getY()*Math.random(1)};		//ball为球心所在位置 即重心
    this.rigided = 0;               //是否为刚体 (用于分裂后)
    this.position = this.ball;	    //上次鼠标位置
    this.angle = 0 ;
    this.alive = 1;                 //活着否
    this.dashing = 1;               //射出去时速度倍数
    this.del = 0;



    this.getAngle = function(){
        return this.angle;
    }
    this.getForce = function(){
        return this.force;
    }
    this.getSpeed = function(){
        return this.speed;
    }
    this.getMass = function(){
        return this.mass;
    }
    this.addMass = function(mass){
        this.mass += mass || 0 ; 
        this.resistance = 0.01 * this.mass ;
        return this;
    }
    this.setVx = function(vx){
        vy = this.speed * Math.sin(this.angle);

        angle = Math.atan( vy / vx ) || 0; 
        angle = angle < 0 ?   ( vy > 0 ? angle + Math.PI : angle ) : ( vx > 0 ? angle : angle+Math.PI ) ;
        console.log("vx:"+vx+":"+vy);
        this.speed = Math.sqrt ( vy * vy + vx * vx ) ;
        this.angle = angle;     
        return this;
    }   
    this.setVy = function(vy){
        vx = this.speed * Math.cos(this.angle);

        angle = Math.atan( vy / vx ) || 0; 
        angle = angle < 0 ?   ( vy > 0 ? angle + Math.PI : angle ) : ( vx > 0 ? angle : angle+Math.PI ) ;
        console.log("vy:"+vx+":"+vy);
        this.speed = Math.sqrt ( vy * vy + vx * vx ) ;
        this.angle = angle;  
        return this; 
    }
    this.testMap = function(){
        xt = map.testX(this.ball , this.radius);
        yt = map.testY(this.ball , this.radius);
        if(xt == 0 && yt == 0) return;
        switch(xt){
            case -2 :
                this.setVx(0.1);
                break;
            case -1 :
                this.setVx(0);
                break;
            case 1 :
                this.setVx(0); 
                break;
            case 2 : 
                this.setVx(-0.1);
                break;
            default:
                break;
        }
        switch(yt){
            case -2 :
                this.setVy(0.1);
                break;
            case -1 : 
                this.setVy(0);
                break;
            case 1 :
                this.setVy(0); 
                break;
            case 2 : 
                this.setVy(-0.1);
                break;
            default:
                break;
        }
        return this;
    }
    this.freshSpeed = function(){ 
        //console.log(this);
        //console.log(this.speed * this.dashing);
        a = ( this.force - this.speed * this.resistance ) / this.mass ;             //未启用滑动摩擦力
        //console.log(this.color+" a:"+a +"res:"+this.resistance);
        //console.log( this.resistance +":"+this.mass);
        this.speed += a ;//<= 0 ? 0 : a ; 
        return this;
    }
    this.freshRadius = function(){
        this.radius = parseFloat( Math.sqrt( (( this.mass / this.density ) / Math.PI ).toFixed(2) ) . toFixed(2) );
        return this;
    }
    this.freshAngle = function(angle){
        if(angle){
            this.angle = angle;
            return;
        }
        angle = Math.atan( (this.position.y - this.ball.y) / (this.position.x - this.ball.x )) || 0; 
        angle = angle < 0 ?   ( this.position.y - this.ball.y > 0 ? angle + Math.PI : angle ) : ( this.position.x - this.ball.x > 0 ? angle : angle+Math.PI ) ;
        ( this.angle != angle ) && ( (( Math.abs( angle - this.angle ) > (Math.PI / 1.5) ) && (this.speed = 0) ) ,this.angle = angle);
        //this.speed = 0 ;
    }
    this.setPos = function(x,y){
        if( x == this.position.x && y == this.position.y ) return ;
        pos = {x:x,y:y};
        //pos.x = map.testX(pos) < 0 ? 0 : ( map.testX(pos) > 0 ? map.getX() : pos.x ); 
        //pos.y = map.testY(pos) < 0 ? 0 : ( map.testY(pos) > 0 ? map.getY() : pos.y );
        this.position = pos
        //刷新移动方向角 
        this.freshAngle();
    }
    this.move = function(){
        //console.log(angle);
        //setTimeout(this.freshSpeed.bind(this),300);
        //console.log(this.speed * this.dashing);
        //console.log(this.ball);
        //this.testMap();
        //console.log(this.speed);
        moveX = Math.cos(this.angle) * (this.speed + this.dashing);
        moveY = Math.sin(this.angle) * (this.speed + this.dashing);
        this.ball.x += Math.cos(this.angle) * (this.speed + this.dashing);
        this.ball.y += Math.sin(this.angle) * (this.speed + this.dashing);
        //console.log("angle:"+this.angle);
        //console.log("1:"+this.ball.x)
        //在这里判断地图在角落会卡住
        this.ball.x = map.testX(this.ball) < 0 ? 0 : ( map.testX(this.ball) > 0 ? map.getX() : this.ball.x ); 
        this.ball.y = map.testY(this.ball) < 0 ? 0 : ( map.testY(this.ball) > 0 ? map.getY() : this.ball.y );
        //console.log(this)
        //console.log(speed);

        /*      检测地图
            if( (players[i].ball.x + xunits < 0 || players[i].ball.x + xunits > m.x) || ( players[i].ball.y + yunits <0 || players[i].ball.y + yunits >m.y) ){
                xunits = 0 - xunits ;
                yunits = 0 - yunits ;
                
            }
        */
    }
    //分裂之后的dash
    this.dash = function(){
        this.dashing = 15  ;
        console.log("dashed" + this.dashing);
        //this.rigided = 1;
        setTimeout((function(){
            this.dashing = 1;
            console.log(this.dashing);
        }).bind(this),300);
        setTimeout((function(){
            this.rigid(1);
        }).bind(this),300);
        return this;
    }

    this.rigid = function(s){
        if(!s){
            this.rigided = 0;
        }
        else{
            this.rigided = s;
        }
        setTimeout(this.rigid.bind(this),20000);
        return this;
    }
    this.divide = function(){
        var nmass = this.mass / 2 ;
        var ball = this.ball;
        var np = new p(this.id,nmass ,{x: this.ball.x , y: this.ball.y } );
        this.rigid(1);       
        this.mass = nmass ;
        np.nickname = this.nickname ;    
        np.angle = this.angle ;  
        np.color = this.color ;
        this.resistance = 0.01 * this.mass ;
        this.radius = parseFloat(Math.sqrt( (( this.mass / this.density ) / Math.PI ).toFixed(2) ).toFixed(2) );
        mec.push(np);
        return np ;
    }
    this.applyImpulse = function( impulse , angle ){
        //console.log(angle);
        dv = impulse / this.mass ;
        dvx = Math.cos(dv);
        dvy = Math.sin(dv);
        vx = Math.cos(this.speed) + dvx ;
        vy = Math.sin(this.speed) + dvy ;
        //效果不好
        //angle = Math.atan( vy / vx ); 
        //angle = angle < 0 ?   ( vy > 0 ? angle + Math.PI : angle ) : ( vx > 0 ? angle : angle+Math.PI ) ;
        this.angle = angle ;
        this.speed = dv;//Math.sqrt( vx * vx + vy * vy );
        this.move();
        //this.ball.x += Math.cos(angle - Math.PI) * this.speed * this.dashing;
        //this.ball.y += Math.sin(angle - Math.PI) * this.speed * this.dashing;
        //this.speed += 2 ;   //设每次给的动量为 20m
    }
    this.rigidDeal = function(target){
        if(this.rigided == 0 || this.dashing != 1) return ;
        var count = 0;
        if( compareDist(this,target) && count++ < 100 ){
            var dir = [];
            //console.log("dealing");
            angle = Math.atan( ( target.ball.y - this.ball.y ) / (target.ball.x - this.ball.x) ) || 0; 
            angle = angle < 0 ?   ( target.ball.y - this.ball.y > 0 ? angle + Math.PI : angle ) : ( target.ball.x - this.ball.x > 0 ? angle : angle+Math.PI ) ;
            this.applyImpulse( 0.01 , angle-Math.PI );
            //console.log("angle :"+angle);
            //console.log(this);
            //console.log("collision");
        }
        return this;
    }
    this.monitorEat = function(players,wild){
            //检测其他玩家是否被吃
            for (var j = 0 ; j < players.length ; j++) {
                if( players[j] == undefined || players[j] == this ||( players[j].id == this.id && (players[j].rigided == 1 || this.rigided == 1) ) )  continue;
                var dist = calcD( this.ball , players[j].ball);
                adjust = ( this.radius >= players[j].radius ) ? players[j].radius / 4 : this.radius / 4 ;
                if( dist <= ( (this.radius - players[j].radius + adjust ) * (this.radius - players[j].radius + adjust )  )  ){

                    var s1 =  this.radius * this.radius;
                    var s2 =  players[j].radius * players[j].radius;
                    //console.log("res:"+ (this.radius >=  players[j].radius))
                    if( this.radius >=  players[j].radius ){
                        //删除被吃的
                        this.addMass( players[j].mass ).freshSpeed().freshRadius();                        
                        if(mec.indexOf(players[j]) != -1 ) mec.splice(mec.indexOf(players[j]),1);
                        players.splice(j,1);
                    }
                }
            };
            //检测wild有没被吃
            for (var w = 0; w < wild.length; w++) {
                if(wild[w] == undefined)  continue;
                var dist = calcD( this.ball , wild[w].ball);
                //console.log( dist <= ( (this.radius - wild[w].radius) * (this.radius - wild[w].radius) ));

                if(  dist <= ( (this.radius - wild[w].radius) * (this.radius - wild[w].radius) * 1.4 )  && this.radius >= wild[w].radius ){

                    var s1 =  this.radius * this.radius;
                    var s2 =  wild[w].radius * wild[w].radius;
                    console.log("wild ate");

                    this.addMass( wild[w].mass ).freshSpeed().freshRadius();
                    wild.splice(w,1);
                }
            };
    }
    this.Del = function(){
        this.del = 1 ;
    }
    function calcD(p1,p2){
        return dist = (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y);
    }

    function compareDist(me,target){
        var dist = calcD( me.ball , target.ball ) ;
        var mdist = ( me.radius + target.radius ) * ( me.radius + target.radius );

        return dist < mdist ;
    }
}



//定义服务器类
var server = function(port){

    var webSocket = require('ws').Server;
    //var fs = require('fs'); 
    var server = new webSocket({"port": port});
    var myCells = [];
    var players = [];           //玩家

    var wild = [];              //野生资源
    var ss = new Object;

    setTimeout(move,30);
    //setTimeout(monitorEat,20);
    setInterval(freshCell,10000);			//定期生成小cell

    this.start = function(){
        console.log('running on '+port);
        server.on("connection" , function(ws){
            var timer = [];
            var uid = ws.upgradeReq.socket._idleStart;
            var alive = 1;
            var pl = new p(uid,15);
            var nickname = "";
            timer.push(setTimeout(broadcast,30));
            console.log('connected');           
            //添加新用户
            var index = 0;
            var op = [];

            console.log('added new client id:'+ws.upgradeReq.socket._idleStart); 
            //
            ws.on("message",function(msg){
                //show(msg);
                console.log(msg.readUInt8(0))
                op =[];
                for(var i = 0;i<msg.length;++i){
                    op.push(msg.toString('hex',i,i+1));
                }
                switch(msg.readUInt8(0)){
                    case 0x00:
                    updateNick(msg);
                    break;
                    case 0x10:
                    updateMouse(msg);
                    break;
                    case 0x11:
                    space();
                    break;
                }
                //var view = new DataView(msg);
                ///console.log(view.getUnit8(0))
                /*op = msg.split(":");

                switch(op[0]){
                    case "0":    
                        ( console.log(op[1]) , nickname = op[1] , pl.nickname = op[1] , players.push(pl) ); 
                        break;
                    case "1":
                        pos = op[1].split("-");
                        alive = 0 ;
                        for (var i = 0; i < players.length ; i++) {
                            players[i].id == uid && ( players[i].setPos({x:pos[0],y:pos[1]}) , alive = 1 );
                        };
                        //console.log(players);
                        alive != 1 &&   (ws.send("died")) ; 
                        break;
                    case "2":
                        switch(op[1]){
                            case "32": 
                                space();
                                break;
                            default: break;
                        }

                        break;

                    default: break;

                }*/
                function updateNick(buf){
                    name = "";
                    for(var i = 0;i < buf.length;++i){
                        if(buf[i] == 0x00) continue;
                        name += buf.toString('ascii',i,i+1);
                    }
                    console.log(name); 
                    nickname = name , pl.nickname = name , players.push(pl) , mec.push(pl);                   
                }
                function updateMouse(buf){
                    gameX = buf.readDoubleLE(1);
                    gameY = buf.readDoubleLE(9);
                    alive = 0 ;
                    for (var i = 0; i < mec.length ; i++) {
                        if( mec[i].id != uid ) continue;
                        mec[i].setPos(gameX,gameY);
                        alive = 1;
                    };
                    //console.log(players);
                    if (alive != 1 ){
                        var buf = new Buffer(1);
                        buf.writeUInt8(0xFF,0);
                        ws.readyState === ws.OPEN && ws.send(buf,{ binary: true});
                    }
                }
                        //按了空格分裂
                    function space(){
                        console.log("space")
                        var co = players.length;

                        for (var i = 0; i < co ; i++) {
                                (players[i].id == uid && players[i].getMass() > 50)  && ( divide(i) ,console.log(uid+"divided") ); 
                        };         
                    }
                    function divide(i){
                        players[players.push( players[i].divide() ) - 1].dash();
                        players[i].freshSpeed().freshRadius();        //刷新速度
                        //分成两个大小相等的 一个是原来的 一个在鼠标位置方向上一定距离
                        //players[i].rigid(1); //设置为刚体 暂时不能合
                    }
                });
            ws.on("close",function(){
                //var co = [];
                //清除send定时器
                for (var i = timer.length - 1; i >= 0; i--) {
                    clearTimeout(timer[i]);
                };
                //删除玩家
                /*
                for (var i = 0; i < players.length ; i++) {
		    		players[i].id == uid && (co.push(i) , console.log(uid +"quit"));
		    	};
                for (var i = 0; i < co.length; i++) {
                    players.splice(co[i],1);
                };*/
                while( players.oindexOf("id="+uid) > -1 )  (players.oremove("id="+uid) , console.log(uid+"quit"));
            });
            ws.on("error",function(error){
                console.log(error);
            })


		    function broadcast(){
		    	timer.push(setTimeout(broadcast,30));
                timer.push(setTimeout( getRank , 1000));
                meT = [];
                for (var i = 0; i < mec.length; i++) {
                    if( mec[i].id != uid )  continue;
                    if( mec[i].del ){
                        mec.splice(i,1);
                        i--;
                    }
                    meT.push(mec[i]);
                };
                var mbuf = new Buffer(1+44*meT.length);
                mbuf.writeUInt8(0x10,0);
                for (var i = 0; i < meT.length; i++) {                                        
                    for (var j = 0; j < 8 ; ++j) {
                        if(j>=meT[i].nickname.length){
                            mbuf.writeUInt16LE( 0,1 + j * 2 + i * 44);  
                        }
                        else{
                            mbuf.writeUInt16LE( meT[i].nickname.charCodeAt(j),1 + j * 2 + i * 44);  
                        }                      
                    }

                    mbuf.writeDoubleLE(meT[i].ball.x,17 + i * 44 );
                    mbuf.writeDoubleLE(meT[i].ball.y,25 + i * 44 );
                    mbuf.writeDoubleLE(meT[i].radius,33 + i * 44 );
                    mbuf.writeUInt32LE(meT[i].color,41 + i * 44 );
                    //console.log(buf);
                };
                ws.readyState === ws.OPEN && ws.send(mbuf,{ binary: true});

                var buf = new Buffer(1 );
                buf.writeUInt8(0x18,0);
                ws.readyState === ws.OPEN && ws.send(buf,{ binary: true});

                var playerT = [];
                for (var i = 0; i < players.length; i++) {
                    if(players[i].id == uid) continue;
                    playerT.push(players[i]);
                };

                var pbuf = new Buffer(1 + playerT.length * 44 );
                pbuf.writeUInt8(0x12,0);
                for (var i = 0; i < playerT.length; i++) {
                    
                    for (var j = 0; j < 8 ; ++j) {
                        if(j>=playerT[i].nickname.length){
                            pbuf.writeUInt16LE( 0,1 + j * 2 + i * 44);  
                        }
                        else{
                            pbuf.writeUInt16LE( playerT[i].nickname.charCodeAt(j),1 + j * 2  + i * 44 );
                        }                        
                    }
                    pbuf.writeDoubleLE(playerT[i].ball.x,17 + i * 44 );
                    pbuf.writeDoubleLE(playerT[i].ball.y,25 + i * 44 );
                    pbuf.writeDoubleLE(playerT[i].radius,33 + i * 44 );
                    pbuf.writeUInt32LE(playerT[i].color,41 + i * 44 );
                    //console.log(buf);
                    
                };
                ws.readyState === ws.OPEN && ws.send(pbuf,{ binary: true});

                var wildT = [];
                for (var i = 0; i < wild.length; i++) {
                    if( ! inViewRange( wild[i].ball.x , wild[i].ball.y ) ) continue;
                    wildT.push(wild[i]);
                };
                var wbuf = new Buffer(1 + wildT.length * 44 );
                wbuf.writeUInt8(0x12,0);
                for (var i = 0; i < wildT.length; i++) {
                    for (var j = 0; j < 8 ; ++j) {
                        if(j>=wildT[i].nickname.length){
                            wbuf.writeUInt16LE( 0,1 + j * 2 + i * 44);  
                        }else{
                            wbuf.writeUInt16LE( wildT[i].nickname.charCodeAt(j),1 + j * 2 + i * 44 );  
                        }                      
                    }
                    wbuf.writeDoubleLE(wildT[i].ball.x,17  + i * 44 );
                    wbuf.writeDoubleLE(wildT[i].ball.y,25  + i * 44 );
                    wbuf.writeDoubleLE(wildT[i].radius,33  + i * 44 );
                    wbuf.writeUInt32LE(wildT[i].color,41  + i * 44 );
                    //console.log(buf);
                };
                ws.readyState === ws.OPEN && ws.send(wbuf,{ binary: true});
            
		    	//ws.readyState === ws.OPEN && ( ws.send(JSON.stringify(myCells)) , ws.send(JSON.stringify(datas)) );
                //console.log(JSON.stringify(myCells));
		    }

		    function delP(){
		    	for (var i = players.length - 1; i >= 0; i--) {
		    		players[i].id == uid && (players.splice(i,1) , console.log("删除用户"+uid));
		    	};
		    }
            //0x20 为排行榜数据
            function getRank(){
                pc = players.slice(0);  //复制数组
                pcd = [];
                //下面有问题 同一玩家的会都再循环一次就不对了
                for (var i = 0; i < pc.length; i++) {
                    mass = pc[i].mass;
                    nickname = pc[i].nickname;
                    for (var j = 0; j < pc.length; j++) {
                        if( i == j )continue;
                        ( pc[i].id == pc[j].id ) &&  ( mass += pc[j].mass );
                        pc.splice(j,1);
                    };
                    pcd.push({nickname:nickname , mass : mass });
                };
                pcd.sort(function(a,b){
                    return b.mass - a.mass ;
                });
                pcr = [];
                for (var i = 0; i < ( pcd.length <= 5 ? pcd.length : 5 ) ; i++) {
                    pcr.push(pcd[i]);
                }
                var buf = new Buffer(1 + pcr.length * 16 );
                buf.writeUInt8(0x20,0);
                for (var i = 0; i < ( pcd.length <= 5 ? pcd.length : 5 ) ; i++) {

                    for (var j = 0; j < 8 ; ++j) {
                        if(j>=pcr[i].nickname.length){
                            buf.writeUInt16LE( 0,1 + j * 2 + i * 16);  
                        }
                        else{
                            buf.writeUInt16LE( pcr[i].nickname.charCodeAt(j),1 + j * 2  + i * 16 );
                        }                        
                    }

                };
                ws.readyState === ws.OPEN && ws.send(buf,{ binary: true});
                //ws.readyState === ws.OPEN && ( ws.send(JSON.stringify(myCells)) , ws.send(JSON.stringify(datas)) );
                //console.log(players);
            }
            function inViewRange(x,y){
                var mtotal = 0;
                var mass = 0;
                var mvX = 0;
                var mvY = 0;
                //me.length != 0 && ( this.zoom = 1 )//, this.cameraX = this.maxX / 2 + this.mine[0].position.x , this.cameraY = this.maxY / 2 + this.mine[0].position.y );
                for (var i = 0; i < mec.length; i++) {
                    mass = mec[i].radius * mec[i].radius
                    mvX += mass * mec[i].ball.x;
                    mvY += mass * mec[i].ball.y;
                    mtotal += mass
                };
                mvX = mvX / mtotal ;
                mvY = mvY / mtotal ;

                return ( (x - mvX)*(x - mvX) + (y - mvY)*(y - mvY) ) < 1e+6;

            }

        });
    }
    //无用待删
    this.addPlayer = function(id){

    	    player = new Array();
    	    player['speed'] = 3;
		    player['ball'] = {x:200,y:200};
            player['nickname'] = ws.upgradeReq.socket._idleStart   ;
            player['size'] = 15;
            player['id'] = id;
            player['position'] = {x:20,y:20};
            players.push(player) ;
    }
    //不断移动
    function move(){
    	setTimeout(move,20);
        //monitorEat();
        //console.log("moved");
    	for (var i = 0 ; i < mec.length ; i++) {
    		if( mec[i].id == 0 || mec[i] == undefined) continue;
            //处理碰撞问题
            /*for (var j = 0; j < players.length; j++) {
                (i != j && players[i].id == players[j].id && (players[i].dashing == 1) && (players[j].dashing == 1) ) && ( players[i].rigidDeal(players[j]) ) ;
            };*/
            for (var j = 0; j < mec.length; j++) {
                (i != j && (mec[i].dashing == 1) && (mec[j].dashing == 1) ) && ( mec[i].rigidDeal(mec[j]) ) ;
            };
            mec[i].freshSpeed().move();
            mec[i].monitorEat(players,wild);
            //console.log(mec[i]);
        //console.log(players[i]);
    	};
    }
    //检测是否有被吃的情况
    function monitorEat(){

    	//setTimeout(monitorEat,20);
    	for (var i = 0 ; i < players.length ; i++) {
    		if(players[i] == undefined)  continue;
            //检测其他玩家是否被吃
    		for (var j = 0 ; j < players.length ; j++) {
    			if(i == j || players[j] == undefined || players[i] == undefined || ( players[j].id == players[i].id && (players[j].rigided == 1 || players[i].rigided == 1) ) )  continue;
    			var dist = calcD( players[i].ball , players[j].ball);
                adjust = ( players[i].radius >= players[j].radius ) ? players[j].radius / 4 : players[i].radius / 4 ;
    			if( dist <= ( (players[i].radius - players[j].radius + adjust ) * (players[i].radius - players[j].radius + adjust )  )  ){

    				var s1 =  players[i].radius * players[i].radius;
    				var s2 =  players[j].radius * players[j].radius;

    				if( players[i].radius >=  players[j].radius ){

    					players[i].addMass( players[j].mass ).freshSpeed().freshRadius();
                        players[j].Del();
    					players.splice(j,1);
    				}
    				else{
    					players[j].addMass( players[i].mass ).freshSpeed().freshRadius();
                        players[i].Del();
    					players.splice(i,1);
    				}
    			}
     		};
            //检测wild有没被吃
            for (var w = 0; w < wild.length; w++) {
                if(wild[w] == undefined || players[i] == undefined)  continue;
                var dist = calcD( players[i].ball , wild[w].ball);
                //console.log( dist <= ( (players[i].radius - wild[w].radius) * (players[i].radius - wild[w].radius) ));

                if(  dist <= ( (players[i].radius - wild[w].radius) * (players[i].radius - wild[w].radius) * 1.2 )  && players[i].radius >= wild[w].radius ){

                    var s1 =  players[i].radius * players[i].radius;
                    var s2 =  wild[w].radius * wild[w].radius;
                    console.log("wild ate");

                    players[i].addMass( wild[w].mass ).freshSpeed().freshRadius();
                    wild.splice(w,1);
                }
            };
    	};
    }

    function calcD(p1,p2){
        return dist = (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y);
    }
    //刷新野生
    function freshCell(){
        var count = wild.length; 
        if(count < 1000)
        	for (var i = 0; i < 100; i++) {
        		var lc = new p(0,3);
        		wild.push(lc);
        	};
    }

}

var g = new server(8880);

g.start();

