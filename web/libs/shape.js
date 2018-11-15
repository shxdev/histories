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

    const BaseShape=function({svg}){
        this.svg=svg;
        this.components=[];
        this.keyComponents={};
        this.root=svg.group();
        this.bgColor="hsl(222, 70%, 70%, 0.2)";
        this.lineColor="hsl(222, 100%, 0%)";
        this.lineWidth="hsl(222, 100%, 0%)";
    };
    BaseShape.prototype.box=function(){

    }

    const InteractiveShape=function(){};
    InteractiveShape.prototype=new BaseShape();

    const DefaltTemplate={};

    DefaltTemplate.Rectangle=function({x,y,w,h}){
        this.x=Tools.isNumber(x)?x:0;
        this.y=Tools.isNumber(y)?y:0;
        this.w=Tools.isNumber(w)?w:400;
        this.h=Tools.isNumber(h)?h:200;
        this.components.push(this.svg.path(`M0,0 l${this.w},0 l0,${this.h} l-${this.w},0 Z`).attr({ fill:this.bgColor,stroke: this.lineColor, 'stroke-width': this.lineWidth }).addTo(this.root));
    };
    DefaltTemplate.Rectangle.prototype=new InteractiveShape();
    return {BaseShape,InteractiveShape,DefaltTemplate};
});
