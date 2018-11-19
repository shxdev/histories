"use strict"
;(function (name, definition) {
    // 检测上下文环境是否为AMD或CMD
    var hasDefine = typeof define === 'function',
      // 检查上下文环境是否为Node
      hasExports = typeof module !== 'undefined' && module.exports;
   
    if (hasDefine) {
      // AMD环境或CMD环境
      define(definition);
    } else if (hasExports) {
      // 定义为普通Node模块
      module.exports = definition();
    } else {
      // 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
      (this||window)[name] = definition();
    }
  })('Shape', function () {
    const Tools={
        isNumber:function(n){
            const ret=
                (typeof(n)==="number" && !isNaN(n)) 
                || (typeof(n)==="string" && /^\d+(\.\d+)?$/.test(n))
            ;
            return ret;
        }
    };

    // 基本形状
    const BaseShape=function({svg}){
        this.components=[];
        this.keyComponents={};
        this.bgColor="hsl(222, 70%, 70%, 0.2)";
        this.lineColor="hsl(222, 100%, 0%)";
        this.lineWidth=1;

        this.svg = svg;
        this.root = svg.group();
    };
    BaseShape.prototype.move=function(x,y){
        this.root.move(x,y);
        return this;
    }
    BaseShape.prototype.size = function (width, height) {
        this.root.size(width, height);
        return this;
    }
    BaseShape.prototype.transform = function (o, relative) {
        this.root.transform(o, relative);
        return this;
    }
    BaseShape.prototype.zMove = function (n) {
        console.log(this.root.node);
        if(n===Infinity){
        }else if(n===-Infinity){

        }else{
            const n_int=parseInt(n);
            if(n_int!==undefined){

            }
        }
        return this;
    }
    BaseShape.prototype.zMoveDown = function () {
        this.zMove(-1);
        return this;
    }
    BaseShape.prototype.zMoveUp = function () {
        this.zMove(1);
        return this;
    }
    BaseShape.prototype.zMoveToTop = function () {
        this.zMove(Infinity);
        return this;
    }
    BaseShape.prototype.zMoveToBottom = function () {
        this.zMove(-Infinity);
        return this;
    }
    // 基本形状 - 结束


    // 可交互形状
    const InteractiveShape = function ({ svg }){
        BaseShape.prototype.constructor.call(this,{svg});
        this.md_x = 0; 
        this.md_y = 0; 
        this.draw_x = 0; 
        this.draw_y = 0; 
        this.md = false; 
        this.m_x = 0; 
        this.m_y = 0;
        this.s_x = 0; 
        this.s_y = 0; 
        this.moving_g = undefined;

        this.root.node.shape = this;
        this.root.on("pointerdown", this.eventHandler.pointerdown);
        this.root.on("pointerup", this.eventHandler.pointerup);
        this.root.on("pointermove", this.eventHandler.pointermove);

    };
    InteractiveShape.prototype = Object.create(BaseShape.prototype);
    InteractiveShape.prototype.constructor = InteractiveShape;

    InteractiveShape.prototype.eventHandler={
        "pointerdown":function(event){
            const target=this;
            const shape = target.node.shape;
            target.node.setPointerCapture(event.pointerId);
            const rbox = target.rbox();
            const svg_rbox = shape.svg.rbox();
            shape.draw_x = svg_rbox.x;
            shape.draw_y = svg_rbox.y;
            shape.md_x = rbox.x;
            shape.md_y = rbox.y;
            shape.m_x = event.clientX;
            shape.m_y = event.clientY;
            shape.md = true;
            shape.s_x = document.scrollingElement.scrollLeft;
            shape.s_y = document.scrollingElement.scrollTop;
        },
        "pointerup":function(event){
            const target = this;
            const shape = target.node.shape;
            shape.md = false;
        },
        "pointermove":function(event){
            const target = this;
            const shape = target.node.shape;
            if (shape.md) {
                let x = event.clientX;
                let y = event.clientY;
                let scroll_x = document.scrollingElement.scrollLeft;
                let scroll_y = document.scrollingElement.scrollTop;
                target.move(
                    shape.md_x - shape.draw_x + x - shape.m_x + scroll_x - shape.s_x
                    , shape.md_y - shape.draw_y + y - shape.m_y + scroll_y - shape.s_y
                );
            }
        },
    }
    InteractiveShape.prototype.cancelMoving = function(){
        if(this.md){
            this.md = false;
            this.root.move(this.md_x - this.draw_x, this.md_y - this.draw_y);
        }
    };
    // 可交互形状 - 结束


    // 缺省模板
    const DefaltTemplate={};

    // 缺省模板 - 矩形
    DefaltTemplate.Rectangle=function({svg}){
        InteractiveShape.prototype.constructor.call(this, { svg });
        this.w = 400;
        this.h = 200;
        this.offset={x:1,y:1};
    };
    DefaltTemplate.Rectangle.prototype = Object.create(InteractiveShape.prototype);
    DefaltTemplate.Rectangle.prototype.constructor = DefaltTemplate.Rectangle;

    DefaltTemplate.Rectangle.prototype.draw = function ({ x, y, w, h }) {
        this.x = Tools.isNumber(x) ? x : this.x;
        this.y = Tools.isNumber(y) ? y : this.y;
        this.w = Tools.isNumber(w) ? w : this.w;
        this.h = Tools.isNumber(h) ? h : this.h;
        const path = this.svg.path(`M0,0 l${this.w},0 l0,${this.h} l-${this.w},0 Z`).attr({ fill: this.bgColor, stroke: this.lineColor, 'stroke-width': this.lineWidth }).addTo(this.root);
        this.root.move(this.offset.x,this.offset.y);
        this.components.push(path);
        this.keyComponents["main"] = path;
        return this;
    };
    // 缺省模板 - 矩形 - 结束

    // 缺省模板 - 五角星
    DefaltTemplate.Star = function ({ svg }) {
        InteractiveShape.prototype.constructor.call(this, { svg });
        this.w = 400;
        this.angle = 36;
        this.offset = { x: 1, y: 1 };
    };
    DefaltTemplate.Star.prototype = Object.create(InteractiveShape.prototype);
    DefaltTemplate.Star.prototype.constructor = DefaltTemplate.Star;

    DefaltTemplate.Star.prototype.draw = function ({ w, angle}) {

        this.w = Tools.isNumber(w) ? w : this.w;
        this.angle = Tools.isNumber(angle) ? angle : this.angle;
        const a_r=180-this.angle/2-36;
        const r=this.w/2;
        const r2=r / Math.sin(a_r / 180 * Math.PI) * Math.sin(this.angle / 2 / 180 * Math.PI);
        const point_set=[];
        for(let angle_index=0;angle_index<5;angle_index++){
            let angle=-90+angle_index*72;
            let radians = angle / 180 * Math.PI;
            let x = Math.cos(radians)*r+r;
            let y = Math.sin(radians) * r+r;
            point_set.push({x,y});
            
            angle = -54 + angle_index * 72;
            radians = angle / 180 * Math.PI;
            x = Math.cos(radians) * r2 + r;
            y = Math.sin(radians) * r2 + r;
            point_set.push({ x, y });
        }
        let polygon="";
        for (let i = 0; i < point_set.length;i++){
            const point = point_set[i];
            polygon = `${polygon} ${point.x},${point.y}`;
        }
        const p = this.svg.polygon(polygon).attr({ width:"100%",height:"100%",fill: this.bgColor, stroke: this.lineColor, 'stroke-width': this.lineWidth }).addTo(this.root);
        this.root.move(this.offset.x, this.offset.y);
        this.root.size(this.w,this.w);
        this.components.push(p);
        this.keyComponents["main"] = p;
        return this;
    };
    // 缺省模板 - 五角星 - 结束
    // 缺省模板 - 结束

    return {BaseShape,InteractiveShape,DefaltTemplate};
});
