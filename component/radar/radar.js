let width = 750; // canvas的宽
let height = 750; // canvas的高

let angleNum = 7; // 角数，即多少个数据项 【3，10】
let angleAvg = 360 / angleNum; // 分角度平均值
let angleOffset = 13; // 角度偏移量
let layerNum = 7; // 层数，即环层数量
let layerWidth = 0; // 层宽
let bgLineColor = '#ffffff'; // 背景线条颜色
let bgLineWidth = 0; // 背景线条宽度
let centerPoint = [0, 0]; // 中心点坐标
let layerPoints = []; // 各层上的点

let wordColor = '#ffffff'; // 字体颜色
let fontSize = 0; // 字体大小
let wordArr = ['项A', '项B', '项C', '项D', '项E', '项F', '项G']; // 字体数组
let wordOffset = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];
let circleWidth = 0; // 圆点宽度

// 绘制的雷达比例数据
let datas = [{
  // lineColor: 'rgba(0,0,255,1)',
  // fillColor: 'rgba(0,0,255,.2)',
  lineWidth: 2,
  legend: '图一',
  value: [5, 2.5, 6, 2, 6, 4.5, 3]
}, {
  lineWidth: 2,
  fillColor: 'transparent',
  legend: '图二',
  value: [3, 6, 2, 5, 1.5, 2, 6]
}];

let context = null;
let windowWidth = 0;

let radar = {
  init: function(data) {
    centerPoint = [rpx(375), rpx(375)];
    layerWidth = rpx(34);
    bgLineWidth = rpx(1.6);
    fontSize = rpx(26);
    circleWidth = rpx(8);
    wordOffset = [
      [rpx(-30), rpx(40)],
      [rpx(40), rpx(40)],
      [rpx(65), rpx(10)],
      [rpx(90), rpx(0)],
      [rpx(-25), rpx(15)],
      [rpx(15), rpx(-5)],
      [rpx(10), rpx(15)]
    ];
  },
  draw: function(data) {
    let n = 0,
      m = 0,
      k = 0;
    this.init(data);
    //画背景线条
    context = wx.createContext();
    context.setLineWidth(bgLineWidth);
    context.setStrokeStyle(bgLineColor);
    context.setFontSize(fontSize);
    context.setFillStyle(wordColor);

    for (n = 0; n < layerNum; n++) {
      layerPoints[n] = [];
      for (k = 0; k < angleNum; k++) {
        context.moveTo(centerPoint[0], centerPoint[1]);
        let offsetX = layerWidth * (n + 1) * getXParam(angleAvg * (k + 1) + angleOffset);
        let offsetY = layerWidth * (n + 1) * getYParam(angleAvg * (k + 1) + angleOffset);
        let distX = centerPoint[0] + offsetX;
        let distY = centerPoint[1] + offsetY;
        if (n == layerNum - 1) {
          context.lineTo(distX, distY);
          if (wordArr[k]) {
            let wordOffsetX = offsetX >= 0 ? 1 : -1;
            wordOffsetX = distX + wordOffsetX * wordOffset[k][0];
            let wordOffsetY = offsetY >= 0 ? 1 : -1;
            wordOffsetY = distY + wordOffsetY * wordOffset[k][1];
            context.fillText(wordArr[k], wordOffsetX, wordOffsetY);
          }
        }
        layerPoints[n][k] = [distX, distY];
      }
    }
    context.beginPath();
    for (m = 0; m < layerPoints.length; m++) {
      for (n = 0; n < layerPoints[m].length; n++) {
        context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
        if (n < layerPoints[m].length - 1) {
          context.lineTo(layerPoints[m][n + 1][0], layerPoints[m][n + 1][1]);
        } else {
          context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
          context.lineTo(layerPoints[m][0][0], layerPoints[m][0][1]);
        }
      }
    }
    context.closePath();
    context.stroke();
    for (let i = 0; i < datas.length; i++) {
      const cfg = datas[i];
      const randA = randRgba();
      const lineColor = cfg.lineColor ? cfg.lineColor : randA(1);
      const fillColor = cfg.fillColor ? cfg.fillColor : randA(.5);
      const lineWidth = typeof cfg.lineWidth === 'number' ? cfg.lineWidth : 1;
      let isFirstPoint = true;
      let tmpPoints = [];
      let circles = [];

      context.setLineWidth(lineWidth);
      context.setStrokeStyle(lineColor);
      context.setFillStyle(fillColor);
      context.beginPath();
      // 绘制比例
      for (m = 0; m < angleNum; m++) {
        const val = cfg.value[m];

        tmpPoints = centerPoint;
        if (val > 0) {
          for (n = 0; n < layerNum; n++) {
            const p1 = layerPoints[n][m];
            if (val === n + 1) {
              tmpPoints = p1;
              break;
            } else if ((val > (n + 1)) && val < (n + 2)) {
              const p2 = layerPoints[n + 1][m];
              const dx = (p2[0] - p1[0]) * (val - n - 1);
              const dy = (p2[1] - p1[1]) * (val - n - 1);
              tmpPoints = [p1[0] + dx, p1[1] + dy];
              break;
            }
          }
        }
        circles.push(tmpPoints.slice());
        if (isFirstPoint) {
          context.moveTo(tmpPoints[0], tmpPoints[1]);
          isFirstPoint = false;
        } else {
          context.lineTo(tmpPoints[0], tmpPoints[1]);
        }
      }
      context.closePath();
      context.stroke();
      context.fill();
      // 绘制圆点
      context.setFillStyle(lineColor);
      circles.forEach(function (circle) {
        context.beginPath();
        context.arc(circle[0], circle[1], circleWidth, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
      });
      // 绘制图例
      if (cfg.legend) {
        const fontWidth = fontSize * cfg.legend.length;
        const start = centerPoint[0] - (fontWidth + 20) / 2;
        const y = centerPoint[1] + (layerPoints[1][0][1] - layerPoints[0][0][1]) * layerNum + fontSize * (3 + i * 1.5);

        context.beginPath();
        context.moveTo(start, y);
        context.lineTo(start + 20, y);
        context.closePath();
        context.stroke();
        context.fillText(cfg.legend, start + 24, y + fontSize / 3);
      }
    }

    wx.drawCanvas({
      canvasId: 'radarCanvas',
      actions: context.getActions()
    });
  }
};

let rpx = (param) => {
  if (windowWidth == 0) {
    wx.getSystemInfo({
      success: function(res) {
        windowWidth = res.windowWidth;
      }
    });
  }
  return Number((windowWidth / 750 * param).toFixed(2));
};

let randRgba = (_r=255, _g=255, _b=255) => {
  const r = Math.round(Math.random() * _r);
  const g = Math.round(Math.random() * _g);
  const b = Math.round(Math.random() * _b);

  return (alpha) => {
    const a = typeof alpha === 'number' ? alpha : Math.random();
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };
};

let getXParam = (angle) => {
  let param = 1;
  if (angle >= 0 && angle < 90) {
    param = 1;
  } else if (angle >= 90 && angle < 180) {
    param = -1;
    angle = 180 - angle;
  } else if (angle >= 180 && angle < 270) {
    param = -1;
    angle = angle - 180;
  } else if (angle >= 270 && angle <= 360) {
    param = 1;
    angle = 360 - angle;
  }

  let angleCos = Math.cos(Math.PI / 180 * angle);
  if (angleCos < 0) {
    angleCos = angleCos * -1;
  }
  return angleCos * param;
};

let getYParam = (angle) => {
  let param = 1;
  if (angle >= 0 && angle < 90) {
    param = 1;
  } else if (angle >= 90 && angle < 180) {
    param = 1;
    angle = 180 - angle;
  } else if (angle >= 180 && angle < 270) {
    param = -1;
    angle = angle - 180;
  } else if (angle >= 270 && angle <= 360) {
    param = -1;
    angle = 360 - angle;
  }

  let angleSin = Math.sin(Math.PI / 180 * angle);
  if (angleSin < 0) {
    angleSin = angleSin * -1;
  }
  return angleSin * param;
};

module.exports = {
  radar
};