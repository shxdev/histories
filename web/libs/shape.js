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
      this[name] = definition();
    }
  })('Shape', function () {
    const Tools={
        isNumber:function(n){
            return 
                (typeof(n)==="number" && !isNaN(n)) 
                || (typeof(n)==="string" && /^\d+(\.\d+)?$/.test(n))
            ;
        }
    };

    const BaseShape=function(){
        this.components=[];
        this.keyComponents={};
        this.bgColor="hsl(222, 70%, 70%, 0.2)";
        this.lineColor="hsl(222, 100%, 0%)";
        this.lineWidth=1;
    };
    BaseShape.prototype.init = function ({svg}) {
        this.svg = svg;
        this.root = svg.group();
        return this;
    }
    BaseShape.prototype.box=function(){
    }

    const InteractiveShape=function(){
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

    };
    InteractiveShape.prototype=new BaseShape();
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
                console.log(shape.md_x , shape.draw_x , x , shape.m_x , scroll_x , shape.s_x);
                console.log(shape.md_x - shape.draw_x + x - shape.m_x + scroll_x - shape.s_x);
                target.move(
                    shape.md_x - shape.draw_x + x - shape.m_x + scroll_x - shape.s_x
                    , shape.md_y - shape.draw_y + y - shape.m_y + scroll_y - shape.s_y
                );
            }
        },
    }
    InteractiveShape.prototype.init=function({svg}){
        BaseShape.prototype.init.call(this,{svg});
        this.root.node.shape=this;
        this.root.on("pointerdown",this.eventHandler.pointerdown);
        this.root.on("pointerup", this.eventHandler.pointerup);
        this.root.on("pointermove", this.eventHandler.pointermove);
        return this;
    };
    InteractiveShape.prototype.cancelMoving = function(){
        if(this.md){
            this.md = false;
            console.log(this.md_x - this.draw_x, this.md_y - this.draw_y);
            this.root.move(this.md_x - this.draw_x, this.md_y - this.draw_y);
        }
    };


    const DefaltTemplate={};

    DefaltTemplate.Rectangle=function(){
        this.w = 400;
        this.h = 200;
        this.offset={x:1,y:1};
    };
    DefaltTemplate.Rectangle.prototype=new InteractiveShape();
    DefaltTemplate.Rectangle.prototype.draw = function ({ x, y, w, h }) {
        this.x = Tools.isNumber(x) ? x : this.x;
        this.y = Tools.isNumber(y) ? y : this.y;
        this.w = Tools.isNumber(w) ? w : this.w;
        this.h = Tools.isNumber(h) ? h : this.h;
        const path = this.svg.path(`M0,0 l${this.w},0 l0,${this.h} l-${this.w},0 Z`).attr({ fill: this.bgColor, stroke: this.lineColor, 'stroke-width': this.lineWidth }).addTo(this.root);
        path.move(this.offset.x,this.offset.y);
        this.components.push(path);
        this.keyComponents["main"] = path;
        return this;
    };
    return {BaseShape,InteractiveShape,DefaltTemplate};
});
