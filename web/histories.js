var DAO=function(base_url){
    this.base_url=base_url;
};
DAO.prototype.remote = function (url,data) {
    return new Promise((resolve,reject)=>{
        $.ajax({
            url:url,
            data:data,
            error: (jqXHR, textStatus, errorThrown)=>{
                reject(`${textStatus}:${errorThrown}`);
            },
            success: (data,  textStatus,  jqXHR)=>{
                resolve(data);
            },
        })
    });
};
DAO.prototype.getRecords=function(){
    var url=this.base_url+'/历史事件.json';
    return this.remote(url);
};

var dao=new DAO('.')
var year_size=1;

function genRecordDict(records){
    let records_dict={};
    for(let record_index in records){
        let record=records[record_index];
        let record_name=record["名称"];
        if(records_dict[record_name]!==undefined){
            console.log("发现重复名称",records_dict[record_name],record);
        }else{
            records_dict[record_name]=record;
        }
    }
    return records_dict;
}
function paint_timeRule(draw,records){
    let year_range=records.reduce((a,b)=>{
        let min=a["min"]|a["起始年份"];
        let max=a["max"]|a["结束年份"];
        return {
            min:(b["起始年份"]===undefined||b["起始年份"]==="")?min:Math.min(min,b["起始年份"]),
            max:(b["结束年份"]===undefined||b["结束年份"]===""||b["结束年份"]==="今")?max:Math.max(max,b["起始年份"],b["结束年份"]),
        };
    });
    year_range["max"]+=10;
    let year_step=100;
    let text_size=Math.min(year_size*year_step,12);
    let g_time_rule=draw.group().id("时间标尺");
    let g_line=draw.group().addTo(g_time_rule).id("时间标尺-刻度线");;
    let line_offsetX=text_size*6;
    g_line.transform({x:line_offsetX});
    let g_text=draw.group().addTo(g_time_rule).id("时间标尺-年份");;
    let main_line_y=(year_range["max"]-year_range["min"])*year_size;
    let line_path=`M0,0 L0,${main_line_y}`;
    for(let year=year_range["min"];year<=year_range["max"];year+=year_step){
        let y=(year-year_range["min"]) *year_size;
        line_path=`${line_path} M0,${y} l10,0`
        let text=draw.text(`${year<0?"前":""}${Math.abs(year)}年`).addTo(g_text).size(text_size).move(0,y-(text_size/2));
        text.x(line_offsetX-5-text.bbox().w);
        let detail_year_step=year_step*year_size/10;
        for(let detail_year=1;detail_year<10;detail_year++){
            let yy=y+detail_year_step*detail_year;
            if(yy>main_line_y)break;
            line_path=`${line_path} M0,${yy} l5,0`
        }
    }
    draw.path(line_path).stroke({ width: 1 }).addTo(g_line);
    return {g:g_time_rule,year_range:year_range};
}

function paint_lane(draw, lanes_class, records,year_range){
    var lanes = [];
    let g_lanes=draw.group().id("泳道");
    for (let i = 0; i < lanes_class.length; i++) {
        var lane_name = lanes_class[i];
        let g_lane=draw.group().addTo(g_lanes).id(`泳道-${lane_name}`);
        var lane = draw.rect(100, 500).attr({ fill: 'hsl(210, 70%, 70%,0)' }).addTo(g_lane);
        lane.radius(10);
        lanes.push(lane);
        var records_matched = records.filter((record) => {
            if (typeof (record["结束年份"]) === "number" || (typeof (record["结束年份"]) === "string" && record["结束年份"].trim().length > 0)) {
                var classes = record["分类"].split(/[\|,; ]/);
                return classes.indexOf(lane_name) >= 0;
            } else {
                return false;
            }
        }).sort((recordA, recordB) => {
            return recordA["起始年份"] - recordB["起始年份"];
        });
        var records_dict=genRecordDict(records_matched);
        let start_year = records_matched[0]["起始年份"] || 0;
        let records_chaodai=records_matched.filter((record) => {
                var classes = record["分类"].split(/[\|,; ]/);
                return classes.indexOf("朝代") >= 0;
        });
        let max_bottom = 0;
        let max_right = 0;
        let cols = [];
        let chaodai_width=50;
        for (let ii = 0; ii < records_chaodai.length; ii++) {
            let record = records_chaodai[ii];
            let start = record["起始年份"];
            let end = record["结束年份"]==="今"?(year_range&&year_range["max"]||2018):record["结束年份"];
            let g_block=draw.group().addTo(g_lane);
            g_block.id(`朝代-${record["名称"]}`);
            // var block = draw.rect(chaodai_width, (end - start+1) * year_size).attr({ fill: 'hsl(330, 100%, 100%,0.3)', stroke: 'hsl(330, 100%, 0%)', 'stroke-width': 1 }).addTo(g_block);
            let block = draw.path(`M0,0 l${chaodai_width},0 l0,${(end - start + 1) * year_size} l-${chaodai_width},0 z`).attr({ fill:'hsl(222, 70%, 70%,0.2)',stroke: 'hsl(222, 100%, 0%)', 'stroke-width': 1 }).addTo(g_block);
            block.record = record;
            block.node.block = block;
            // block.on('mouseover', (event) => {
            //     let block = event.target.block;
            //     block.fill('hsl(330, 100%, 100%,0.7)');
            // }).on('mouseout', (event) => {
            //     let block = event.target.block;
            //     block.fill('hsl(330, 100%, 100%,0.3)');
            // });

            g_block.transform({x:lane.x() + 3,y:lane.y() + 40 + (start - start_year) * year_size});

            for (let col_index = 0; col_index < cols.length; col_index++) {
                let exists_g_block = cols[col_index];
                if (exists_g_block !== undefined && exists_g_block.rbox().y2-1 <= g_block.rbox().y) {
                    cols[col_index] = undefined;
                }
            }
            let available_col = cols.indexOf(undefined);
            if (available_col === -1) {
                available_col = cols.length;
                cols.push(g_block);
            } else {
                cols[available_col] = g_block;
            }
            g_block.x(lane.x() + 3 + (available_col * chaodai_width));

            let block_name = record["名称"];
            let text = draw.text(block_name).addTo(g_block);;
            let text_size = Math.min((block.width() - 10) / block_name.length, block.bbox().h-2, 15);
            text.size(text_size);
            text.y(2);
            text.cx(block.bbox().w / 2);
            max_bottom = Math.max(max_bottom, g_block.rbox().y2);
            max_right = Math.max(max_right, g_block.rbox().x2);
        }
        lane.width((max_right - lane.x()) + 3);
        lane.height((max_bottom - lane.y()) + 20);
        let text = draw.text(lane_name).addTo(g_lane);
        let text_size = Math.min((lane.width() - 20) / lane_name.length, 20);
        text.size(text_size);
        text.y(2);
        text.cx(lane.x() + lane.width() / 2);
    }
    let right=0;
    let it=g_lanes.children();
    for(let i=0;i<it.length;i++){
        let g_lane=it[i];
        g_lane.transform({x:right});
        right+=g_lane.bbox().w;
    }
    return g_lanes;
}

function paint(draw, lanes_class, records){
    let {g,year_range}=paint_timeRule(draw,records);
    let g_time_rule=g;
    let g_lanes=paint_lane(draw, lanes_class, records,year_range);
    let up_space=40;
    g_time_rule.transform({y:up_space});
    g_lanes.transform({x:g_time_rule.rbox().x2+10,y:up_space-40});

    var all_c = draw.children();
    var bottom = 0;
    var right = 0;
    for (let i = 0; i < all_c.length; i++) {
        var c = all_c[i];
        let rbox=c.rbox();
        bottom = Math.max(bottom, rbox.y2);
        right = Math.max(right, rbox.x2);
    }
    draw.size(right + 20, bottom + 20);
}
var draw=undefined;
var shapeContainer=undefined;
var records = [];
var lanes_class = ['中国','西方'];

document.addEventListener('DOMContentLoaded',(event)=>{
    document.querySelector(".clear").addEventListener("click", (event) => {
        if (draw !== undefined && typeof (draw.clear) === "function") {
            draw.clear();
        }
    });
    document.querySelector(".repaint").addEventListener("click", (event) => {
        draw.clear();
        paint(draw, lanes_class, records);
    });

    document.addEventListener("keydown",(event)=>{
        const {key,keyCode,shiftKey,ctrlKey,altKey,metaKey}=event;
        if(key==='r' && metaKey){
            // 页面刷新
        }else{
            // event.preventDefault();
            shortcutKey({key,keyCode,shiftKey,ctrlKey,altKey,metaKey});
        }
    });

    (async ()=>{
        records=await dao.getRecords();
        draw = SVG('drawing').id('历史');
        shapeContainer=new Shape.Container({svg:draw});
        draw.size(10000,10000);
        // paint(draw, lanes_class, records);
    })();
});
let g=undefined;
function shortcutKey({key,keyCode,shiftKey,ctrlKey,altKey,metaKey}){
    // console.log({key,keyCode,shiftKey,ctrlKey,altKey,metaKey});
    if(key==='s'){
        g=shapeContainer.create(Shape.DefaltTemplate.Star).draw({ });
        g.move(200,50);
    } else if (key === 'r') {
        g = shapeContainer.create(Shape.DefaltTemplate.Rectangle).draw({ });
        g.move(200, 50);
    }else if(key==='Escape'){
        g.cancelMoving();
    }else  if(key==="d"){
        g.zMoveDown();
    } else if (key === "u") {
        g.zMoveUp();
    } else if (key === "t") {
        g.zMoveToTop();
    } else if (key === "b") {
        g.zMoveToBottom();
    }
}