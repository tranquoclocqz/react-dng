/**
 * Created by Administrator on 2017/2/10.
 * canvasÃ§Â²â€™Ã¥Â­ÂÃ§Â±Â»Ã¥Å Â¨Ã§â€Â»Ã§Â»â€žÃ¤Â»Â¶
 * 17.2.20Ã¦â€ºÂ´Ã¦â€“Â°:Ã¥â€¦Â¼Ã¥Â®Â¹Ã¦â‚¬Â§Ã¦â€ºÂ´Ã¦â€“Â°,Ã¥â€¦Â¼Ã¥Â®Â¹Ã¥Ë†Â°ie9.
 */

(function() {
    /*Ã§â€šÂ¹Ã§Â±Â»*/
    var point = function(param, canvas) {
        /***Ã¥Ââ€¢Ã¤Â¸ÂªÃ§â€šÂ¹Ã¦Å¾â€žÃ©â‚¬ Ã¥â€¡Â½Ã¦â€¢Â°***/
        var tempPoint, tempReIn, tempposition, tempRota;
        //Ã§â€šÂ¹Ã¥Å½Å¸Ã¥Â½Â¢
        var tempPoint = {
                type: param.type,
                reIn: param.reIn,
                cacheImage: null, //Ã§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­Ëœ,Ã¥â€¡ÂÃ¥Â°â€˜APIÃ¦Â¶Ë†Ã¨â‚¬â€”.
                color: param.color,
                x: null,
                y: null,
                reInX: null,
                reInY: null,
                rota: {},
                zoom: param.zoom.min + (param.zoom.max - param.zoom.min) * Math.random(),
                speed: param.speed.min + (param.speed.max - param.speed.min) * Math.random() >> 0,
                size: null,
                flowAngle: param.flowAngle,
                mouseAngle: null,
                opc: param.op.min + (param.op.max - param.op.min) * Math.random(),
                angle: param.angle.value + (param.angle.float * Math.random() - param.angle.float / 2),
                img: null //Ã¤Â¸ÂºÃ¤Âºâ€ Ã¥â€¦Â¼Ã¥Â®Â¹IE8Ã¤Â»Â¥Ã¤Â¸â€¹,Ã¥Â¼â€¢Ã¥â€¦Â¥Ã§Å¡â€žexcanvasÃ¤Â¸ÂÃ¦â€Â¯Ã¦Å’ÂÃ§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­Ëœ,Ã¦Â¯ÂÃ¦Â¬Â¡Ã©Æ’Â½Ã¨Â¦ÂÃ¥Â®Å¾Ã¤Â¾â€¹Ã¤Â¸â‚¬Ã¤Â¸ÂªimgÃ¥Â¯Â¹Ã¨Â±Â¡.Ã¦â€°â‚¬Ã¤Â»Â¥Ã¨Â¿â„¢Ã©â€¡Å’Ã¥Â­ËœÃ¦â€Â¾Ã¤Â¸â‚¬Ã¤Â¸ÂªÃ¥Â®Å¾Ã¤Â¾â€¹,Ã¥ÂÂªÃ¥Â®Å¾Ã¤Â¾â€¹Ã¤Â¸â‚¬Ã¦Â¬Â¡,Ã¤Â¹Å¸Ã©ÂÂ¿Ã¥â€¦ÂÃ¤Âºâ€ Ã©â€”ÂªÃ§Æ’Â.
            }
            //Ã¥Ë†ÂÃ¥Â§â€¹Ã¥Å’â€“size
        tempPoint.size = this.dealSize(param.type, param.size);

        //Ã¥Ë†ÂÃ¥Â§â€¹Ã¥Å’â€“Ã¦â€”â€¹Ã¨Â½Â¬Ã¥Â±Å¾Ã¦â‚¬Â§
        if (param.rota.value !== 0) {
            tempRota = this.dealRota(param.rota);
            tempPoint.rota['value'] = tempRota.value;
            tempPoint.rota['speed'] = tempRota.speed;
        }
        //Ã§â€Å¸Ã¦Ë†ÂÃ¥Ë†ÂÃ¥Â§â€¹Ã¥ÂÂÃ¦ â€¡
        tempposition = this.createPosition(param.area);
        tempPoint.x = tempposition.x;
        tempPoint.y = tempposition.y;

        //Ã¨Â®Â¡Ã§Â®â€”Ã©â€¡ÂÃ¦â€“Â°Ã¨Â¿â€ºÃ¥â€¦Â¥Ã§â€Â»Ã¥Â¸Æ’Ã§Å¡â€žÃ¥ÂÂÃ¦ â€¡
        tempReIn = this.reIn(canvas, tempPoint.reIn, tempPoint.angle, tempPoint.x, tempPoint.y, tempPoint.size, tempPoint.speed);
        tempPoint.reInX = tempReIn.x;
        tempPoint.reInY = tempReIn.y;

        /*Ã§â€Å¸Ã¦Ë†ÂÃ§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­Ëœ*/
        tempPoint.cacheImage = this.drawPoint(tempPoint.type, tempPoint.size, tempPoint.opc, tempPoint.color, tempPoint.zoom);
        //Ã§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­ËœÃ¤Â¼Å¡Ã¦â€Â¹Ã¥ÂËœsizeÃ¥Â¤Â§Ã¥Â°Â,Ã©â€¡ÂÃ¦â€“Â°Ã¨Å½Â·Ã¥Ââ€“Ã¤Â¸â‚¬Ã¦Â¬Â¡
        tempPoint.size = tempPoint.cacheImage.width;
        return tempPoint;
    };
    point.prototype = {
        /*Ã§Â»ËœÃ¥Ë†Â¶Ã¥Ââ€¢Ã§â€šÂ¹Ã§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­ËœÃ¥â€ºÂ¾Ã¥Æ’Â*/
        drawPoint: function(type, size, opc, color, zoom) {
            var cacheCanvas, cacheCtx;
            //Ã¥Ë†â€ºÃ¥Â»ÂºÃ§Â¦Â»Ã¥Â±Â
            cacheCanvas = document.createElement('canvas');
            //Ã¤Â¸ÂºÃ¤Âºâ€ Ã¥â€¦Â¼Ã¥Â®Â¹ie8,Ã¥Â¼â€¢Ã¥â€¦Â¥Ã¤Âºâ€ excanvas.js,Ã¤Â½â€ Ã¦ËœÂ¯Ã¥Å Â¨Ã¦â‚¬ÂÃ¥Ë†â€ºÃ¥Â»ÂºcanvasÃ©Å“â‚¬Ã¨Â¦ÂÃ¦â€°â€¹Ã¥Å Â¨Ã¥Â®Å¾Ã¤Â¾â€¹Ã¥Å’â€“
            if (window.G_vmlCanvasManager !== undefined) {
                cacheCanvas = window.G_vmlCanvasManager.initElement(cacheCanvas);
            }
            cacheCtx = cacheCanvas.getContext('2d');
            switch (type.typeName) {
                case 'circle':
                    {
                        //Ã¨Â®Â¾Ã§Â½Â®Ã§Â¦Â»Ã¥Â±ÂÃ§Â¼â€œÃ¥Â­ËœÃ¥Â¤Â§Ã¥Â°Â
                        cacheCanvas.width = size * 2;
                        cacheCanvas.height = size * 2;
                        //Ã¨Â®Â¾Ã§Â½Â®Ã©â‚¬ÂÃ¦ËœÅ½Ã¥ÂºÂ¦,Ã¥â€º Ã¤Â¸ÂºÃ¥ÂÂªÃ¦â€œÂÃ¤Â½Å“Ã¨Â¿â„¢Ã¤Â¸â‚¬Ã¤Â¸Âª,Ã¤Â¸ÂÃ§â€Â¨Ã¤Â¿ÂÃ¥Â­ËœÃ¥â€™Å’Ã¦ÂÂ¢Ã¥Â¤ÂÃ§â€Â»Ã¥Â¸Æ’
                        cacheCtx.globalAlpha = opc;
                        //Ã¨Â®Â¾Ã§Â½Â®Ã©Â¢Å“Ã¨â€°Â²
                        cacheCtx.fillStyle = color;
                        //Ã¥Â¼â‚¬Ã¥Â§â€¹Ã§Â»ËœÃ¥Ë†Â¶
                        cacheCtx.beginPath();
                        cacheCtx.arc(size, size, size, 0, Math.PI * 2, true);
                        cacheCtx.closePath();
                        cacheCtx.fill();
                        break;
                    }
                case 'image':
                    {
                        cacheCanvas.width = size;
                        cacheCanvas.height = size;
                        var img = new Image();
                        img.src = type.url;
                        if (img.complete) {
                            cacheCtx.drawImage(img, 0, 0, size, size);
                        } else {
                            img.onload = function() {
                                cacheCtx.drawImage(img, 0, 0, size, size);
                            };
                            img.onerror = function() {
                                console.log(type.url + 'Ã¥Å  Ã¨Â½Â½Ã¥Â¤Â±Ã¨Â´Â¥Ã¯Â¼Å’Ã¨Â¯Â·Ã©â€¡ÂÃ¨Â¯â€¢');
                            };
                        }
                        break;
                    }
                case 'shape':
                    {
                        size = size * zoom;
                        cacheCanvas.width = size;
                        cacheCanvas.height = size;

                        cacheCtx.globalAlpha = opc;
                        cacheCtx.fillStyle = color;
                        cacheCtx.strokeStyle = color;
                        cacheCtx.lineWidth = type.lineWidth;

                        var tempVertexData;
                        tempVertexData = type.vertexData;
                        cacheCtx.scale(zoom, zoom);
                        cacheCtx.beginPath();
                        cacheCtx.moveTo(tempVertexData[0][0], tempVertexData[0][1]);
                        for (var j = tempVertexData.length, i = 1; i < j; ++i) {
                            cacheCtx.lineTo(tempVertexData[i][0], tempVertexData[i][1]);
                        }
                        cacheCtx.lineTo(tempVertexData[0][0], tempVertexData[0][1]);
                        cacheCtx.stroke();
                        cacheCtx.fill();
                        cacheCtx.closePath();

                    }
                default:
                    {
                        break;
                    }
            }
            //Ã§Â»ËœÃ¥Ë†Â¶Ã¥Â®Å’Ã¦Ë†ÂÃ¨Â¿â€Ã¥â€ºÅ¾
            return cacheCanvas;
        },
        /*Ã¨Â®Â¡Ã§Â®â€”Ã©â€¡ÂÃ¦â€“Â°Ã¨Â¿â€ºÃ¥â€¦Â¥Ã§â€Â»Ã¥Â¸Æ’Ã§Å¡â€žÃ¤Â½ÂÃ§Â½Â®*/
        reIn: function(canvas, way, angle, initX, initY, size, speed) {
            var rX, rY, tempX, tempY, radian, opAngle;
            switch (way) {
                /*Ã¦ Â¹Ã¦ÂÂ®Ã¨Â§â€™Ã¥ÂºÂ¦Ã¥Å½Â»Ã¦â€°Â¾Ã§â€šÂ¹Ã§Â§Â»Ã¥â€¡ÂºÃ¥Â±ÂÃ¥Â¹â€¢Ã¤Â¹â€¹Ã¥ÂÅ½,Ã©â€¡ÂÃ¦â€“Â°Ã¨Â¿â€ºÃ¥â€¦Â¥Ã¥Â±ÂÃ¥Â¹â€¢Ã§Å¡â€žÃ§â€šÂ¹.*/
                case 'reverseDirection':
                    { //Ã¦â€°Â¾Ã¥Ë†Â°Ã§â€ºÂ¸Ã¥ÂÂÃ§Å¡â€žÃ¦â€“Â¹Ã¥Ââ€˜
                        if (angle > 180) {
                            opAngle = angle - 180;
                        } else {
                            opAngle = angle - 180;
                        }
                        //Ã§â€ºÂ¸Ã¥ÂÂÃ¦â€“Â¹Ã¥Ââ€˜Ã¥Â¯Â¹Ã¥Âºâ€Ã§Å¡â€žÃ¥Â¼Â§Ã¥ÂºÂ¦
                        radian = opAngle / 180 * Math.PI;
                        //Ã¦ Â¹Ã¦ÂÂ®Ã§â€ºÂ¸Ã¥ÂÂÃ§Å¡â€žÃ¦â€“Â¹Ã¥Ââ€˜Ã¥Â¼Â§Ã¥ÂºÂ¦Ã¥Å½Â»Ã¨Â®Â¡Ã§Â®â€”Ã©â€¡ÂÃ¦â€“Â°Ã¨Â¿â€ºÃ¥â€¦Â¥Ã¥Â±ÂÃ¥Â¹â€¢Ã¦â€”Â¶Ã§Å¡â€žÃ¥ÂÂÃ¦ â€¡
                        for (var j = 1; j <= canvas.width; j += speed) {
                            tempX = initX + Math.cos(radian) * j;
                            tempY = initY + Math.sin(radian) * j;
                            if (angle > 270 && angle <= 360) {
                                if (tempX <= 0 || tempY >= canvas.height) {
                                    tempX -= size;
                                    tempY += size;
                                    break;
                                }
                            } else if (angle > 180 && angle <= 270) {
                                if (tempX >= canvas.width || tempY >= canvas.height) {
                                    tempX += size;
                                    tempY += size;
                                    break;
                                }
                            } else if (angle > 90 && angle <= 180) {
                                if (tempX >= canvas.width || tempY <= 0) {
                                    tempX += size;
                                    tempY -= size;
                                    break;
                                }
                            } else {
                                if (tempX <= 0 || tempY <= 0) {
                                    tempX -= size;
                                    tempY -= size;
                                    break;
                                }
                            }
                        }
                        rX = tempX;
                        rY = tempY;
                        break;
                    }
                default:
                    {
                        rX = initX;
                        rY = initY;
                        break;
                    }
            }
            return { x: rX, y: rY };
        },
        /*Ã©Å¡ÂÃ¦Å“ÂºÃ§â€Å¸Ã¦Ë†ÂÃ¥Ë†ÂÃ¥Â§â€¹Ã§â€šÂ¹*/
        createPosition: function(area) {
            var x, y;
            x = Math.random() * (area.rightBottom[0] - area.leftTop[0]) + area.leftTop[0] >> 0;
            y = Math.random() * (area.rightBottom[1] - area.leftTop[1]) + area.leftTop[1] >> 0;
            return { x: x, y: y };
        },
        /*Ã¥Â¤â€žÃ§Ââ€ Ã¦â€”â€¹Ã¨Â½Â¬Ã¤Â¿Â¡Ã¦ÂÂ¯*/
        dealRota: function(rota) {
            var value, speed;
            if (rota.floatValue)
                value = Math.random() * rota.floatValue - rota.floatValue / 2 + rota.value;
            if (rota.floatSpeed)
                speed = Math.random() * rota.floatSpeed - rota.floatSpeed / 2 + rota.speed;
            return { 'value': value, 'speed': speed };
        },
        /*Ã¥Ë†ÂÃ¥Â§â€¹Ã¥Å’â€“size*/
        dealSize: function(tpye, size) {
            var tempSize;
            switch (tpye.typeName) {
                case 'shape':
                    {
                        var temp, maxX, maxY;

                        temp = tpye.vertexData;
                        maxX = temp[0][0];
                        maxY = temp[0][1];

                        for (var i = temp.length - 1; i >= 0; --i) {
                            //Ã¦â€°Â¾Ã¥â€¡ÂºÃ¦Å“â‚¬Ã¥Â¤Â§X
                            if (temp[i][0] > maxX) {
                                maxX = temp[i][0];
                            }
                            //Ã¦â€°Â¾Ã¥â€¡ÂºÃ¦Å“â‚¬Ã¥Â¤Â§Y
                            if (temp[i][0] > maxY) {
                                maxY = temp[i][1];
                            }
                        }
                        //Ã§Å½Â°Ã¥Å“Â¨Ã¦â€°Â¾Ã¥â€¡ÂºÃ§Å¡â€žÃ¦Å“â‚¬Ã¥Â¤Â§Ã§Å¡â€žÃ¥â‚¬Â¼Ã¤Â½Å“Ã¤Â¸ÂºÃ¦Â­Â£Ã¦â€“Â¹Ã¥Â½Â¢Ã§Å¡â€žÃ©Â«ËœÃ¥Â®Â½,Ã¨Â¿ËœÃ¤Â¸ÂÃ¨Æ’Â½Ã¦â€Â¯Ã¦Å’ÂÃ§Å¸Â©Ã¥Â½Â¢,Ã¥â€¡ÂÃ¥Â°â€˜Ã¦â‚¬Â§Ã¨Æ’Â½Ã¦Â¶Ë†Ã¨â‚¬â€”,Ã¥ÂÅ½Ã¦Å“Å¸Ã¦â€Â¹Ã¨Â¿â€º
                        if (maxX > maxY) {
                            tempSize = maxX;
                        } else {
                            tempSize = maxY;
                        }
                        break;
                    }
                default:
                    {
                        tempSize = size.min + (size.max - size.min) * Math.random();
                        break;
                    }
            }
            return tempSize;
        }
    };
    /*Ã§Â»â€žÃ¤Â»Â¶Ã§Â±Â»*/
    var particleCanvas = function(canvasId, paramArray) {
        /***Ã§Â»â€žÃ¤Â»Â¶Ã¦Å¾â€žÃ©â‚¬ Ã¥â€¡Â½Ã¦â€¢Â°***/
        /*Ã¨Å½Â·Ã¥Ââ€“canvasÃ§â€Â»Ã¥Â¸Æ’*/
        this.canvasE = document.getElementById(canvasId);
        this.ctx = this.canvasE.getContext('2d');
        //Ã¨Å½Â·Ã¥Ââ€“Ã§â€Â»Ã¥Â¸Æ’Ã¥Â®Â½Ã©Â«Ëœ
        this.canvasWidth = this.canvasE.width;
        this.canvasHeight = this.canvasE.height;
        particleCanvas.defaultParameter.area.rightBottom[0] = this.canvasWidth;
        particleCanvas.defaultParameter.area.rightBottom[1] = this.canvasHeight;

        /*Ã¦ Â¼Ã¥Â¼ÂÃ¥Å’â€“Ã¥Ââ€šÃ¦â€¢Â°*/
        if (paramArray.length !== 0) { //Ã¨Å½Â·Ã¥Ââ€“Ã¥Ë†â€”Ã¨Â¡Â¨Ã¥Ââ€šÃ¦â€¢Â°
            var temp;
            //Ã¨Å½Â·Ã¥Ââ€“canvasÃ§Å¡â€žid
            this.canvasId = canvasId;
            //Ã¨Å½Â·Ã¥Ââ€“Ã¥Â®Å¡Ã¤Â¹â€°Ã§Å¡â€žÃ§â€šÂ¹Ã¦â€¢Â°Ã§Â»â€žÃ¥Ââ€šÃ¦â€¢Â°
            temp = [];
            for (var i = 0, j = paramArray.length; i < j; ++i) {
                temp.push(paramArray[i]);
            }
            //Ã¦Å Å Ã¤Â¼ Ã¥â€¦Â¥Ã§Å¡â€žÃ§â€šÂ¹Ã§â€ºÂ¸Ã¥â€¦Â³Ã¥Ââ€šÃ¦â€¢Â°Ã¥â€™Å’Ã©Â»ËœÃ¨Â®Â¤Ã¥Ââ€šÃ¦â€¢Â°Ã¥ÂË†Ã¥Â¹Â¶Ã¥Ë†Â°Ã¦Å“â‚¬Ã§Â»Ë†Ã¤Â½Â¿Ã§â€Â¨Ã§Å¡â€ž"Ã¤Â½Â¿Ã§â€Â¨Ã¥Ââ€šÃ¦â€¢Â°"
            this.useParameter = this.formatParameter(temp);
        } else { //Ã¦Â²Â¡Ã¦Å“â€°Ã¥Ââ€šÃ¦â€¢Â°Ã¥Ë†â€”Ã¨Â¡Â¨,Ã¦Å Â¥Ã©â€â„¢Ã¨Â·Â³Ã¥â€¡Âº.
            console.log("Ã¦Â²Â¡Ã¦Å“â€°Ã¦â€°Â¾Ã¥Ë†Â°Ã§Â»â€žÃ¤Â»Â¶Ã¥Â®Å¾Ã¤Â¾â€¹Ã¥Å’â€“Ã¥Ââ€šÃ¦â€¢Â°");
            return;
        }

        /*Ã§â€Å¸Ã¦Ë†ÂÃ§â€šÂ¹Ã¦â€¢Â°Ã§Â»â€ž*/
        this.pointGroup = this.createpointGroup();

        //Ã¨Å½Â·Ã¥Ââ€“Ã¥Â¼â‚¬Ã¥ÂÂ¯Ã¤Âºâ€ Ã©Â¼ Ã¦ â€¡Ã¥â€œÂÃ¥Âºâ€Ã§Å¡â€žÃ§â€šÂ¹Ã¦â€¢Â°Ã§Â»â€žÃ¤Â¸â€¹Ã¦ â€¡
        this.mouseArrayIndex = this.onMouse();
        /*Ã§Â»ËœÃ¥Ë†Â¶*/
        if (this.pointGroup.length > 0) {
            //Ã©â‚¬Å¡Ã§Å¸Â¥Ã§Â»ËœÃ¥Ë†Â¶Ã¥â€¡Â½Ã¦â€¢Â°Ã§Â»ËœÃ¥Ë†Â¶
            this.draw(this);
        } else {
            console.log("Ã¦Â²Â¡Ã¦Å“â€°Ã¥ÂÂ¯Ã§Â»ËœÃ¥Ë†Â¶Ã§Å¡â€žÃ¥â€ºÂ¾Ã¥Æ’Â,Ã¦Â£â‚¬Ã¦Âµâ€¹numberÃ¥Ââ€šÃ¦â€¢Â°Ã¦ËœÂ¯Ã¥ÂÂ¦Ã¥Â¤Â§Ã¤ÂºÅ½0");
        }
    };
    particleCanvas.prototype = {
        /*Ã¦ Â¼Ã¥Â¼ÂÃ¥Å’â€“Ã¥Ââ€šÃ¦â€¢Â°*/
        formatParameter: function(data) {
            var temp, tempUseParameter, data;
            tempUseParameter = [];
            data = data || {};
            //Ã¦Å Å Ã¥Ââ€šÃ¦â€¢Â°Ã¥ÂË†Ã¥Â¹Â¶,Ã¦Â²Â¡Ã¦Å“â€°Ã¥Â¡Â«Ã§Å¡â€žÃ¥Ââ€šÃ¦â€¢Â°Ã¤Â½Â¿Ã§â€Â¨Ã©Â»ËœÃ¨Â®Â¤Ã¥Ââ€šÃ¦â€¢Â°
            for (var index in data) {
                temp = {};
                for (var key in particleCanvas.defaultParameter) {
                    temp[key] = (data[index][key]) ? data[index][key] : particleCanvas.defaultParameter[key];
                }
                tempUseParameter.push(temp);
            }
            return tempUseParameter;
        },
        /*Ã¥Ë†â€ºÃ¥Â»ÂºÃ§â€šÂ¹Ã¦â€¢Â°Ã§Â»â€ž*/
        createpointGroup: function() {
            var temp, tempArray, tempPoints;
            tempArray = []; //Ã¥â€¦Â¨Ã©Æ’Â¨Ã§â€šÂ¹Ã¦â€¢Â°Ã§Â»â€žÃ§Å¡â€žÃ©â€ºâ€ Ã¥ÂË†
            for (var index in this.useParameter) {
                tempPoints = []; //Ã¦Å¸ÂÃ¤Â¸â‚¬Ã§Â»â€žÃ§Å¡â€žÃ§â€šÂ¹Ã©â€ºâ€ Ã¥ÂË†
                temp = this.useParameter[index];
                //Ã¦ Â¹Ã¦ÂÂ®Ã¨Â¿â„¢Ã¤Â¸â‚¬Ã§Â»â€žÃ¥Â¯Â¹Ã¥Âºâ€Ã§Å¡â€žnumberÃ§â€Å¸Ã¦Ë†ÂÃ§â€šÂ¹
                for (var i = temp.number; i > 0; --i) {
                    tempPoints.push(new point(temp, this.canvasE));
                }
                tempArray.push(tempPoints);
            }
            return tempArray;
        },
        /*Ã¦â€ºÂ´Ã¦â€“Â°Ã¥â€ºÂ¾Ã¥Æ’ÂÃ§â€šÂ¹Ã¦â€¢Â°Ã¦ÂÂ®*/
        update: function() {
            var tempArray, tempPoint;
            if (this.mouseArrayIndex !== null) {
                for (var i = this.mouseArrayIndex.length - 1; i >= 0; --i) {
                    var tempPointGroup = this.pointGroup[this.mouseArrayIndex[i]];
                    for (var j = tempPointGroup.length - 1; j >= 0; --j) {
                        if (window.particleCanvasMouseAngle !== undefined) {
                            tempPointGroup[j].mouseAngle = window.particleCanvasMouseAngle;
                        }
                    }
                }
            }
            for (var index in this.pointGroup) {
                tempArray = this.pointGroup[index];
                for (var i = tempArray.length - 1; i >= 0; --i) {
                    tempPoint = tempArray[i];
                    //Ã¦â€ºÂ´Ã¦â€“Â°Ã¤Â½ÂÃ§Â½Â®Ã¤Â¿Â¡Ã¦ÂÂ¯
                    if (tempPoint.x < -tempPoint.size - tempPoint.speed - 10 ||
                        tempPoint.y < -tempPoint.size - tempPoint.speed - 10 ||
                        tempPoint.x > this.canvasWidth + tempPoint.size + tempPoint.speed + 10 ||
                        tempPoint.y > this.canvasHeight + tempPoint.size + tempPoint.speed + 10) {
                        //Ã¥Â¦â€šÃ¦Å¾Å“Ã¨Â¶â€¦Ã¥â€¡ÂºÃ¥Â±ÂÃ¥Â¹â€¢Ã¤Âºâ€ ,Ã¥â€ºÅ¾Ã¥Ë†Â°Ã©â€¡ÂÃ¨Â¿â€ºÃ§â€Â»Ã¥Â¸Æ’Ã§Å¡â€žÃ¤Â½ÂÃ§Â½Â®
                        tempPoint.x = tempPoint.reInX;
                        tempPoint.y = tempPoint.reInY;
                    } else {
                        //Ã¦Â²Â¡Ã¦Å“â€°Ã¨Â¶â€¦Ã¥â€¡ÂºÃ¥Â±ÂÃ¥Â¹â€¢,Ã§Â»Â§Ã§Â»Â­Ã§Â§Â»Ã¥Å Â¨
                        tempPoint.x += Math.cos(tempPoint.angle / 180 * Math.PI) * tempPoint.speed;
                        tempPoint.y += Math.sin(tempPoint.angle / 180 * Math.PI) * tempPoint.speed;
                    }
                    //Ã¦â€ºÂ´Ã¦â€“Â°Ã¦â€”â€¹Ã¨Â½Â¬Ã¤Â¿Â¡Ã¦ÂÂ¯
                    if (tempPoint.rota.value !== 0) {
                        tempPoint.rota.value += tempPoint.rota.speed;
                    } else if (tempPoint.flowAngle === 'on') {}
                }
            }

        },
        /*Ã§Â»ËœÃ¥Ë†Â¶Ã¥â€¡Â½Ã¦â€¢Â°*/
        draw: function(data) {
            //Ã¥Â¦â€šÃ¦Å¾Å“Ã¥ÂÂ¯Ã§â€Â¨Ã¤Âºâ€ excanvasÃ¥Â°Â±Ã¤Â½Â¿Ã§â€Â¨Ã¤Â½Å½Ã§â€°Ë†Ã¦Å“Â¬Ã¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨Ã§Â»ËœÃ¥Ë†Â¶Ã¥â€¡Â½Ã¦â€¢Â°
            if (window.G_vmlCanvasManager !== undefined) {
                this.draw = this.drawLow;
            } else {
                this.draw = this.drawHigh;
            }
            this.draw(data);
        },
        /*Ã©Â«ËœÃ§â€°Ë†Ã¦Å“Â¬Ã¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨Ã§Â»ËœÃ¥Ë†Â¶Ã¥â€¡Â½Ã¦â€¢Â°*/
        drawHigh: function(data) {
            //Ã¨Â¿â„¢Ã©â€¡Å’Ã¦Å Å Ã¥Å½Å¸Ã¥Â¯Â¹Ã¨Â±Â¡Ã¤Â½Å“Ã¤Â¸ÂºdataÃ¤Â¼ Ã©â‚¬â€™Ã¨Â¿â€ºÃ¦ÂÂ¥,Ã¨Â§Â£Ã¥â€ Â³requestAnimationFrameÃ¦â€°Â§Ã¨Â¡Å’Ã¥â€¡Â½Ã¦â€¢Â°Ã¦â€”Â¶,thisÃ¦Å’â€¡Ã¥Ââ€˜Ã¤Âºâ€ window
            var temp, tempArray, tempSize;
            //Ã¦Â¸â€¦Ã§Ââ€ Ã§â€Â»Ã¥Â¸Æ’
            this.canvasE.width = this.canvasE.width;
            //Ã¥Â¾ÂªÃ§Å½Â¯Ã§Â»ËœÃ¥Ë†Â¶
            for (var index in this.pointGroup) {
                tempArray = this.pointGroup[index];
                for (var i = tempArray.length - 1; i >= 0; --i) {
                    temp = tempArray[i];
                    //Ã¥Â¦â€šÃ¦Å¾Å“Ã¥Â¼â‚¬Ã¥ÂÂ¯Ã¤Âºâ€ Ã©Â¼ Ã¦ â€¡Ã¥â€œÂÃ¥Âºâ€,Ã¦Å Å Ã©Â¼ Ã¦ â€¡Ã§Å¡â€žÃ¨Â§â€™Ã¥ÂºÂ¦Ã¤Â¼ Ã©â‚¬â€™Ã§Â»â„¢Ã§Å½Â°Ã¥Å“Â¨Ã§Å¡â€žÃ¨Â§â€™Ã¥ÂºÂ¦
                    if (temp.mouseAngle !== null) {
                        temp.angle = temp.mouseAngle;
                    }
                    //Ã¥Â¦â€šÃ¦Å¾Å“Ã¦Â²Â¡Ã¦Å“â€°Ã¦â€”â€¹Ã¨Â½Â¬
                    if (temp.rota.speed === 0) {
                        this.ctx.drawImage(temp.cacheImage, temp.x - temp.size, temp.y - temp.size);
                    }
                    //Ã¥Â¦â€šÃ¦Å¾Å“Ã¦Å“â€°Ã¨Â§â€™Ã¥ÂºÂ¦Ã¨Â·Å¸Ã©Å¡Â
                    else if (temp.flowAngle == 'on') {
                        this.ctx.save();
                        tempSize = temp.size / 2;
                        this.ctx.translate(temp.x + tempSize, temp.y + tempSize);
                        this.ctx.rotate(temp.angle * Math.PI / 180);
                        this.ctx.translate(-temp.x - tempSize, -temp.y - tempSize);
                        this.ctx.drawImage(temp.cacheImage, temp.x, temp.y);
                        this.ctx.restore();
                    } else {
                        this.ctx.save();
                        tempSize = temp.size / 2;
                        this.ctx.translate(temp.x + tempSize, temp.y + tempSize);
                        this.ctx.rotate(temp.rota.value * Math.PI / 180);
                        this.ctx.translate(-temp.x - tempSize, -temp.y - tempSize);
                        this.ctx.drawImage(temp.cacheImage, temp.x, temp.y);
                        this.ctx.restore();
                    }
                }
            }
            //Ã§Â»ËœÃ¥Ë†Â¶Ã¥Â®Å’Ã¦Ë†Â,Ã¦â€ºÂ´Ã¦â€“Â°Ã¦â€¢Â°Ã¦ÂÂ®
            this.update();
            //Ã¨Â®Â¾Ã§Â½Â®Ã¤Â¸â€¹Ã¤Â¸â‚¬Ã¦Â¬Â¡Ã§Â»ËœÃ¥Ë†Â¶
            rAF(function() {
                data.draw(data);
            });
        },
        /*ie8Ã¥ÂÅ Ã¤Â»Â¥Ã¤Â¸â€¹Ã§â€°Ë†Ã¦Å“Â¬Ã§Â»ËœÃ¥Ë†Â¶Ã¥â€¡Â½Ã¦â€¢Â°*/
        drawLow: function(data) {
            var ctx, temp, size;
            ctx = this.ctx;
            this.canvasE.width = this.canvasE.width;
            for (var index in this.pointGroup) {
                for (var j = this.pointGroup[index].length, i = 0; i < j; ++i) {
                    temp = this.pointGroup[index][i];
                    switch (temp.type.typeName) {
                        case 'circle':
                            {
                                //Ã¨Â®Â¾Ã§Â½Â®Ã©â‚¬ÂÃ¦ËœÅ½Ã¥ÂºÂ¦,Ã¥â€º Ã¤Â¸ÂºÃ¥ÂÂªÃ¦â€œÂÃ¤Â½Å“Ã¨Â¿â„¢Ã¤Â¸â‚¬Ã¤Â¸Âª,Ã¤Â¸ÂÃ§â€Â¨Ã¤Â¿ÂÃ¥Â­ËœÃ¥â€™Å’Ã¦ÂÂ¢Ã¥Â¤ÂÃ§â€Â»Ã¥Â¸Æ’
                                ctx.globalAlpha = temp.opc;
                                //Ã¨Â®Â¾Ã§Â½Â®Ã©Â¢Å“Ã¨â€°Â²
                                ctx.fillStyle = temp.color;
                                //Ã¥Â¼â‚¬Ã¥Â§â€¹Ã§Â»ËœÃ¥Ë†Â¶
                                ctx.beginPath();
                                ctx.arc(temp.x, temp.y, temp.size, 0, Math.PI * 2, true);
                                ctx.closePath();
                                ctx.fill();
                                break;
                            }
                        case 'image':
                            {
                                //Ã¥Â¦â€šÃ¦Å¾Å“Ã¥Â·Â²Ã§Â»ÂÃ¥Â­ËœÃ¥Å“Â¨imgÃ¥Â¯Â¹Ã¨Â±Â¡,Ã¤Â¸ÂÃ§â€Â¨Ã¥â€ ÂÃ¥Â®Å¾Ã¤Â¾â€¹
                                if (temp.img === null) {
                                    var img = new Image();
                                    img.src = temp.type.url;
                                }
                                ctx.drawImage(img, temp.x, temp.y, temp.size, temp.size);
                                break;
                            }
                        case 'shape':
                            {
                                size = temp.size * temp.zoom;

                                ctx.globalAlpha = temp.opc;
                                ctx.fillStyle = temp.color;
                                ctx.strokeStyle = temp.color;
                                ctx.lineWidth = temp.type.lineWidth;

                                var tempVertexData;
                                tempVertexData = temp.type.vertexData;
                                ctx.save();
                                ctx.scale(temp.zoom, temp.zoom);
                                ctx.beginPath();
                                ctx.moveTo(temp.x + tempVertexData[0][0], temp.y + tempVertexData[0][1]);
                                for (var j = tempVertexData.length, i = 1; i < j; ++i) {
                                    ctx.lineTo(temp.x + tempVertexData[i][0], temp.y + tempVertexData[i][1]);
                                }
                                ctx.lineTo(temp.x + tempVertexData[0][0], temp.y + tempVertexData[0][1]);
                                ctx.stroke();
                                ctx.fill();
                                ctx.closePath();
                                ctx.restore();
                            }
                        default:
                            {
                                break;
                            }
                    }
                }
            }
            this.update();
            //Ã¨Â®Â¾Ã§Â½Â®Ã¤Â¸â€¹Ã¤Â¸â‚¬Ã¦Â¬Â¡Ã§Â»ËœÃ¥Ë†Â¶
            rAF(function() {
                data.draw(data);
            });
        },
        onMouse: function() {
            var temp = []; //Ã¥Â¼â‚¬Ã¥ÂÂ¯Ã¨Â§â€™Ã¥ÂºÂ¦Ã§Â§Â»Ã¥Å Â¨Ã§Å¡â€žÃ§Â»â€ž
            for (var i = this.useParameter.length - 1; i >= 0; --i) {
                if (this.useParameter[i].respondMouse === 'on') {
                    temp.push(i);
                }
            }
            //Ã¦Â²Â¡Ã¦Å“â€°Ã§Â»â€žÃ¥Â¼â‚¬Ã¥ÂÂ¯Ã©Â¼ Ã¦ â€¡Ã¥â€œÂÃ¥Âºâ€,Ã©â‚¬â‚¬Ã¥â€¡Âº
            if (temp.length == 0) {
                return null;
            } else { //Ã¥Â¦â€šÃ¦Å¾Å“Ã¦Å“â€°,Ã¦Â·Â»Ã¥Å  Ã©Â¼ Ã¦ â€¡Ã§Â§Â»Ã¥Å Â¨Ã¤Âºâ€¹Ã¤Â»Â¶
                document.getElementById(this.canvasId).onmousemove = function() {
                    deal_mouse(event, 1000, 600);
                }
                return temp;
            }
        }
    };
    var deal_mouse = function(event, width, height) {
            var event = event || window.event;
            //Ã©ËœÂ»Ã¦Â­Â¢Ã¥â€¦Â¶Ã¤Â»â€“Ã§â€ºÂ¸Ã¥ÂÅ’Ã¤Âºâ€¹Ã¤Â»Â¶,IE10Ã¤Â»Â¥Ã¤Â¸â€¹Ã¤Â¸ÂÃ¦â€Â¯Ã¦Å’ÂÃ¥Ë†â„¢Ã¤Â¸ÂÃ©ËœÂ»Ã¦Â­Â¢
            event.preventDefault ? event.preventDefault() : (event.returnValue = false);
            //Ã¨Å½Â·Ã¥Ââ€“Ã©Â¼ Ã¦ â€¡Ã¥Å¾Â«,Ã¥â€¦Â¼Ã¥Â®Â¹IE10Ã¤Â»Â¥Ã¤Â¸â€¹Ã¤Â¸ÂÃ¦â€Â¯Ã¦Å’ÂpageX/Y
            var touches = event.touches ? event.touches[0] : event;
            var x = (touches.pageX) ? touches.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            var y = (touches.pageY) ? touches.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

            //Ã¨Â®Â¡Ã§Â®â€”Ã©Â¼ Ã¦ â€¡Ã§â€šÂ¹Ã¤Â¸Å½canvasÃ¤Â¸Â­Ã¥Â¿Æ’Ã§â€šÂ¹Ã§Å¡â€žÃ¨Â§â€™Ã¥ÂºÂ¦
            var dx = x - width / 2,
                dy = y - height / 2,
                dd = Math.sqrt(dx * dx + dy * dy),
                acos = Math.acos(dx / dd);
            //Ã¥â€º Ã¤Â¸ÂºacosÃ¦Å½Â¥Ã¦â€Â¶Ã§Å¡â€žÃ¥Ââ€šÃ¦â€¢Â°Ã¦ËœÂ¯-1~1.Ã¦â€°â‚¬Ã¤Â»Â¥Ã¦Â±â€šÃ¥â€¡ÂºÃ¦ÂÂ¥Ã§Å¡â€žÃ¥Â¼Â§Ã¥ÂºÂ¦Ã¤Â¹Å¸Ã¦ËœÂ¯Ã¥Å“Â¨0-PI,Ã¤Â¸ÂÃ©â‚¬â€šÃ¥ÂË†Ã¥Â½â€œÃ¥â€°Â0-2PI(360Ã¥ÂºÂ¦)Ã§Å¡â€žÃ¨Â®Â¾Ã¥Â®Å¡.Ã¦â€°â‚¬Ã¤Â»Â¥Ã©Å“â‚¬Ã¨Â¦ÂÃ¦â€”Â©Ã¥ÂºÂ¦Ã¦â€¢Â°Ã¨Â¶â€¦Ã¨Â¿â€¡180Ã§Å¡â€žÃ¦â€”Â¶Ã¥â‚¬â„¢,Ã¤Â¹Å¸Ã¥Â°Â±Ã¦ËœÂ¯dy<0Ã§Å¡â€žÃ¦â€”Â¶Ã¥â‚¬â„¢,Ã¥Ââ€“180Ã¥ÂºÂ¦Ã§Å¡â€žÃ¥Â¯Â¹Ã¨Â§â€™.
            if (dy >= 0) {
                window.particleCanvasMouseAngle = acos * 180 / Math.PI >> 0;
            } else {
                window.particleCanvasMouseAngle = 180 - (acos * 180 / Math.PI) + 180 >> 0;
            }
        }
        /*Ã©Â»ËœÃ¨Â®Â¤Ã¥Ââ€šÃ¦â€¢Â°*/
    particleCanvas.defaultParameter = {
        area: {
            leftTop: [0, 0],
            rightBottom: [null, null]
        },
        number: 50, //Ã§â€šÂ¹Ã¦â€¢Â°Ã©â€¡Â
        type: {
            typeName: 'circle'
        },
        rota: {
            value: 0,
            speed: 0,
            floatValue: 100,
            floatSpeed: .1
        },
        zoom: {
            min: 1,
            max: 1
        },
        reIn: 'reverseDirection',
        color: "#FF4040", //Ã§â€šÂ¹Ã©Â¢Å“Ã¨â€°Â²,Ã¦â€Â¯Ã¦Å’Â16Ã¨Â¿â€ºÃ¥Ë†Â¶/RGB/RGBA
        size: { //Ã§â€šÂ¹Ã¥Â¤Â§Ã¥Â°Â
            min: 2,
            max: 2
        },
        speed: { //Ã§Â§Â»Ã¥Å Â¨Ã©â‚¬Å¸Ã¥ÂºÂ¦
            min: 4,
            max: 4
        },
        angle: { //Ã§Â§Â»Ã¥Å Â¨Ã¨Â§â€™Ã¥ÂºÂ¦
            value: 30,
            float: 0
        },
        op: {
            min: 1,
            max: 1
        },
        respondMouse: 'off',
        flowAngle: 'off' //on
    };
    /*Ã¥Â¯Â¹Ã¥Â¤â€“Ã¦Å½Â¥Ã¥ÂÂ£*/
    window.particleCanvas = particleCanvas;
    /*Ã¨Â®Â¾Ã§Â½Â®requestAnimationFrameÃ¥â€¦Â¼Ã¥Â®Â¹Ã¦â‚¬Â§*/
    window.rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    /*Ã¥â€¦Â¼Ã¥Â®Â¹ie8Ã¤Â»Â¥Ã¤Â¸â€¹Ã¦â€Â¯Ã¦Å’Âcanvas*/
    (function() {
        if (!document.createElement('canvas').getContext) {
            //Ã¥Ë†â€ºÃ¥Â»ÂºcanvasÃ¦ â€¡Ã§Â­Â¾,Ã¤Â»Â¥Ã¤Â¾Â¿IE8Ã¥ÂÅ Ã¤Â¸â€¹Ã¦ÂµÂÃ¨Â§Ë†Ã¥â„¢Â¨Ã¨Â¯â€ Ã¥Ë†Â«
            document.createElement('canvas');
            //Ã¦Å Å excanvasÃ¥Å  Ã¥â€¦Â¥Ã¥Ë†Â°headÃ¥Å’ÂºÃ¥Å¸Å¸
            var sci_excanvas = document.createElement('script');
            sci_excanvas.src = '//ossweb-img.qq.com/images/chanpin/tgclub/public/a20170227gettxvideovipfree/excanvas.js';
            document.getElementsByTagName('head')[0].appendChild(sci_excanvas);
        }
    })();
})(window); /*  |xGv00|b7c49041d6f1292775c3019da74c7ac4 */