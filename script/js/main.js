/**
Application : dashboard
Debugescription : ダッシュボードの描画呼び出しをするメインのJavascriptです。
Version : 1.0.0
Dependencies : node.js + Express + iosocket.js + jQuery + d3.js
Auther : Magosa
**/

let socketio = io();

$(function main() {

  let margin = {
    "top": 30,
    "bottom": 40,
    "right": 30,
    "left": 50
  };

  //インスタンスの生成
  let flow = new Trajectory('trajectory-svg', '#trajectory-view > .card-body');

  //色の設定
  const LINE_COLORS = d3.scaleOrdinal()
  .range(["#DC3912", "#ffc200", "#5be400", "#008f09", "#00ffd4", "#0016ff", "#a034ff", "#fe20d7"]);
  const AREA_COLORS = d3.scaleOrdinal()
  .range(["#DC3912", "#ffc200", "#5be400", "#008f09", "#00ffd4", "#0016ff", "#a034ff", "#fe20d7"]);

  //初期化処理
  InitTooltip();

  d3.json("/data/config.json").then(data => {
    flow.initMap(data);
    flow.setLine = LINE_COLORS;
    flow.setArea = AREA_COLORS;
  });

  //描画処理
  socketio.on('sensor_data', data => {
    flow.drawFlow(data);
  });

});
