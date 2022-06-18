if (!document.createElement('canvas').getContext) {
    ieOnload();
} else {
    starCanvas();
}

function ieOnload() {
    if (document.getElementById('canvas0').getContext) {
        starCanvas();
    } else {
        setTimeout(ieOnload, 33);
    }
}

function starCanvas() {
    var myParticleCanvas = new particleCanvas(
        "canvas0", [{
            
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 8,
                "op": { "min": 0.7, "max": 1 },
                "size": { "min": 50, "max": 60 },
                "speed": { "min": 2, "max": 4 },
                "angle": { "value": 140, "float": 20 },
                "area": { "leftTop": [0, 0], "rightBottom": [0, 1000] },
                "rota": { "value": 30, "speed": 2, "floatValue": 120, "floatSpeed": 1 },
                "reIn": "reverseDirection"
            },
            {
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 9,
                "op": { "min": 0.7, "max": 1 },
                "size": { "min": 60, "max": 60 },
                "speed": { "min": 2, "max": 4 },
                "angle": { "value": 140, "float": 20 },
                "area": { "leftTop": [0, 800], "rightBottom": [1900, 2000] },
                "rota": { "value": 30, "speed": 1, "floatValue": 120, "floatSpeed": 3 },
                "reIn": "reverseDirection"
            },
            {
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 10,
                "size": { "min": 50, "max": 60 },
                "speed": { "min": 3, "max": 5 },
                "area": { "leftTop": [500, 300], "rightBottom": [1000, 4000] },
                "angle": { "value": 130, "float": 20 },
                "reIn": "reverseDirection"
            },
            {
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 8,
                "size": { "min": 50, "max": 60 },
                "speed": { "min": 3, "max": 5 },
                "area": { "leftTop": [500, 400], "rightBottom": [1000, 4000] },
                "angle": { "value": 140, "float": 30 },
                "reIn": "reverseDirection"
            },
            {
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 7,
                "size": { "min": 50, "max": 60 },
                "speed": { "min": 3, "max": 5 },
                "area": { "leftTop": [500, 600], "rightBottom": [1000, 4000] },
                "angle": { "value": 140, "float": 30 },
                "reIn": "reverseDirection"
            },
            {
                "type": { "typeName": "image", "url": "assets/src/dng_love/hoamai.png" },
                "number": 6,
                "size": { "min": 50, "max": 60 },
                "speed": { "min": 3, "max": 5 },
                "area": { "leftTop": [0, 1400], "rightBottom": [100, 4300] },
                "angle": { "value": 140, "float": 40 },
                "reIn": "reverseDirection"
            }
        ]
    );
}