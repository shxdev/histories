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
var year_size=0.2;

function paint(draw, lanes_class, records){
    var lanes = [];
    for (let i = 0; i < lanes_class.length; i++) {
        var lane_name = lanes_class[i];
        var lane = draw.rect(100, 500).attr({ fill: 'hsl(210, 70%, 70%)' })
        lane.radius(10);
        lane.move(20, 20);
        lanes.push(lane);
        lane.height(1400);
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
        let start_year = records_matched[0]["起始年份"] || 0;
        let max_bottom = 0;
        let max_right = 0;
        let cols = [];
        for (let ii = 0; ii < records_matched.length; ii++) {
            let record = records_matched[ii];
            let start = record["起始年份"];
            let end = record["结束年份"];
            var block = draw.rect(100, (end - start) * year_size).attr({ fill: 'hsl(330, 100%, 100%,0.3)', stroke: 'hsl(330, 100%, 0%)', 'stroke-width': 1 })
            block.record = record;
            block.node.block = block;
            block.on('mouseover', (event) => {
                let block = event.target.block;
                block.fill('hsl(330, 100%, 100%,0.7)');
            }).on('mouseout', (event) => {
                let block = event.target.block;
                block.fill('hsl(330, 100%, 100%,0.3)');
            });
            // block.radius(5);

            block.move(lane.x() + 3, lane.y() + 40 + (start - start_year) * year_size);

            for (let col_index = 0; col_index < cols.length; col_index++) {
                let exists_block = cols[col_index];
                if (exists_block !== undefined && exists_block.y() + exists_block.height() <= block.y()) {
                    cols[col_index] = undefined;
                }
            }
            let available_col = cols.indexOf(undefined);
            if (available_col === -1) {
                available_col = cols.length;
                cols.push(block);
            } else {
                cols[available_col] = block;
            }
            block.x(lane.x() + 3 + (available_col * 100));

            let block_name = record["名称"];
            let text = draw.text(block_name);
            let text_size = Math.min((block.width() - 10) / block_name.length, 15);
            text.size(text_size);
            text.y(block.y() + 2);
            text.cx(block.x() + block.width() / 2);

            max_bottom = Math.max(max_bottom, block.y() + block.height());
            max_right = Math.max(max_right, block.x() + block.width());
        }
        lane.width((max_right - lane.x()) + 3);
        lane.height((max_bottom - lane.y()) + 20);
        let text = draw.text(lane_name);
        let text_size = Math.min((lane.width() - 20) / lane_name.length, 20);
        text.size(text_size);
        text.y(20 + 2);
        text.cx(lane.x() + lane.width() / 2);
        // text.addTo(lane);
        console.log(lane.add);
    }
    var all_c = draw.children();
    var bottom = 0;
    var right = 0;
    for (let i = 0; i < all_c.length; i++) {
        var c = all_c[i];
        bottom = Math.max(bottom, c.y() + c.height());
        right = Math.max(right, c.x() + c.width());
    }
    draw.size(right + 20, bottom + 20);
}
var draw=undefined;
var records = [];
var lanes_class = ['中国'];

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
    (async ()=>{
        records=await dao.getRecords();
        draw = SVG('drawing');
        paint(draw, lanes_class, records);
    })();
});