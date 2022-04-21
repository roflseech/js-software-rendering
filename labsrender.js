function DrawTriangles(ctx, points, fillColor, lineColor)
{
    for(var i = 0; i < points.length - 2; i+=3)
    {
        ctx.beginPath();
        if(lineColor != undefined) ctx.strokeStyle = lineColor[i/3];
        else ctx.strokeStyle = "#000000";
        if(fillColor != undefined) ctx.fillStyle = fillColor[i/3];
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[i+1][0], points[i+1][1]);
        ctx.lineTo(points[i+2][0], points[i+2][1]);
        ctx.lineTo(points[i][0], points[i][1]);
        ctx.stroke();
        if(fillColor != undefined)ctx.fill();
        ctx.closePath();
    }
}
function SetPixel(imageData, w, h, x, y, color)
{
    if(x < w && y < h && x>=0 && y>= 0)
    {

        for(var i = 0; i < 3; i++)
        {
            imageData.data[w*y*4 + x*4+i] = color[i];
        }
        imageData.data[w*y + x*4+3] = 255;
    }
}
function SetPixelZBuffered(imageData, w, h, x, y, color, planeCoefs, zBuffer)
{
    if(x < w && y < h && x>=0 && y>= 0)
    {
        var depth = (-planeCoefs[0]*x-planeCoefs[1]*y-planeCoefs[3])/planeCoefs[2];
        if(depth < zBuffer[x][y] && depth > 0)
        {
            zBuffer[x][y] = depth;
            for(var i = 0; i < 3; i++)
            {
                imageData.data[w*y*4 + x*4+i] = color[i];
            }
            imageData.data[w*y + x*4+3] = 255;
        }
    }
}
function RasterizeTriangle(imageData, width, height, points, fillColor)
{
    var p1 = points[0];
    var p2 = points[1];
    var p3 = points[2];
    if(p1[1] > p2[1])
    {
        var tmp = p1;
        p1 = p2;
        p2 = tmp;
    }
    if(p1[1] > p3[1])
    {
        var tmp = p1;
        p1 = p3;
        p3 = tmp;
    }
    if(p2[1] > p3[1])
    {
        var tmp = p2;
        p2 = p3;
        p3 = tmp;
    }
    var h = p3[1] - p1[1];

    var xminBound = p1[0];
    if(p2[0] < xminBound) xminBound = p2[0];
    if(p3[0] < xminBound) xminBound = p3[0];

    var xmaxBound = p1[0];
    if(p2[0] > xmaxBound) xmaxBound = p2[0];
    if(p3[0] > xmaxBound) xmaxBound = p3[0];


    for(var i = 0; i <= Math.ceil(h); i++)
    {
        var x1 = Math.ceil(p3[0] - p1[0])*i/h + p1[0];

        var x2;
        if(i + Math.floor(p1[1]) <= Math.ceil(p2[1]))
        {
            x2 = (p2[0] - p1[0]) * i / (p2[1]-p1[1]) + p1[0];
        }
        else
        {
            x2 = (p3[0] - p2[0]) * (i-(p2[1]-p1[1])) / (p3[1]-p2[1]) + p2[0];
        }

        if(x1 > x2)
        {
            var tmp = x1;
            x1 = x2;
            x2 = tmp;
        }

        var xmin = Math.floor(x1);
        if(xmin < xminBound || xmin == NaN || xmin == Infinity) xmin = Math.floor(xminBound);
        var xmax = Math.ceil(x2);
        if(xmax > xmaxBound || xmax == NaN || xmax == Infinity) xmax = Math.ceil(xmaxBound);

        for(var j = xmin; j <= xmax; j++)
        {
            SetPixel(imageData, width, height, j, Math.floor(p1[1]) + i, fillColor);
        }
    }
}
function RasterizeTriangles(imageData, w, h, points, fillColors)
{
    for(var i = 0; i < points.length - 2; i +=3)
    {
        RasterizeTriangle(imageData, w, h, points.slice(i, i+3), fillColors[i/3]);
    }
}
function RasterizeTriangleZBuffered(imageData, width, height, points, fillColor, zBuffer)
{
    var p1 = points[0];
    var p2 = points[1];
    var p3 = points[2];
    if(p1[1] > p2[1])
    {
        var tmp = p1;
        p1 = p2;
        p2 = tmp;
    }
    if(p1[1] > p3[1])
    {
        var tmp = p1;
        p1 = p3;
        p3 = tmp;
    }
    if(p2[1] > p3[1])
    {
        var tmp = p2;
        p2 = p3;
        p3 = tmp;
    }
    var am = [
        [1, p1[1], p1[2]],
        [1, p2[1], p2[2]],
        [1, p3[1], p3[2]],
    ];
    var bm = [
        [p1[0], 1, p1[2]],
        [p2[0], 1, p2[2]],
        [p3[0], 1, p3[2]],
    ];
    var cm = [
        [p1[0], p1[1], 1],
        [p2[0], p2[1], 1],
        [p3[0], p3[1], 1],
    ];
    var dm = [
        [p1[0], p1[1], p1[2]],
        [p2[0], p2[1], p2[2]],
        [p3[0], p3[1], p3[2]],
    ];
    var planeCoefs = [0, 0, 0, 0];
    planeCoefs[0] = Mat3x3Determinant(am);
    planeCoefs[1] = Mat3x3Determinant(bm);
    planeCoefs[2] = Mat3x3Determinant(cm);
    planeCoefs[3] = -Mat3x3Determinant(dm);
    var h = p3[1] - p1[1];

    var xminBound = p1[0];
    if(p2[0] < xminBound) xminBound = p2[0];
    if(p3[0] < xminBound) xminBound = p3[0];

    var xmaxBound = p1[0];
    if(p2[0] > xmaxBound) xmaxBound = p2[0];
    if(p3[0] > xmaxBound) xmaxBound = p3[0];

    for(var i = 0; i <= Math.floor(h); i++)
    {
        var x1 = Math.ceil(p3[0] - p1[0])*i/h + p1[0];

        var x2;
        if(i + Math.floor(p1[1]) <= Math.floor(p2[1]))
        {
            x2 = (p2[0] - p1[0]) * i / (p2[1]-p1[1]) + p1[0];
        }
        else
        {
            x2 = (p3[0] - p2[0]) * (i-(p2[1]-p1[1])) / (p3[1]-p2[1]) + p2[0];
        }

        if(x1 > x2)
        {
            var tmp = x1;
            x1 = x2;
            x2 = tmp;
        }

        var xmin = Math.floor(x1);
        if(xmin < xminBound || xmin == NaN || xmin == Infinity) xmin = Math.floor(xminBound);
        var xmax = Math.ceil(x2);
        if(xmax > xmaxBound || xmax == NaN || xmax == Infinity) xmax = Math.ceil(xmaxBound);

        for(var j = xmin; j <= xmax; j++)
        {
            SetPixelZBuffered(imageData, width, height, j, Math.floor(p1[1]) + i, fillColor, planeCoefs, zBuffer);
        }
    }
}
function RasterizeTrianglesZBuffered(imageData, w, h, points, fillColors, zBuffer)
{
    for(var i = 0; i < points.length - 2; i +=3)
    {
        RasterizeTriangleZBuffered(imageData, w, h, points.slice(i, i+3), fillColors[i/3], zBuffer);
    }
}
function RasterizeLine(imageData, w, h, p0, p1)
{
    var x0 = Math.floor(p0[0]);
    var x1 = Math.floor(p1[0]);
    var y0 = Math.floor(p0[1]);
    var y1 = Math.floor(p1[1]);

    var dx = Math.abs(x1-x0);
    var sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1-y0);
    var sy = y0 < y1 ? 1 : -1;
    var err = dx+dy;
    while (true)
    {
        SetPixel(imageData, w, h, x0, y0, [0, 0, 0]);
        if(x0 == x1 && y0 == y1) break;
        var e2 = 2*err;
        if (e2 >= dy)
        {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx)
        {
            err += dx;
            y0 += sy;
        }
    }
}

function RasterizeLineTriangleMesh(imageData, w, h, points)
{
    for(var i = 0; i < points.length - 2; i+=3)
    {
        RasterizeLine(imageData, w, h, points[i], points[i+1]);
        RasterizeLine(imageData, w, h, points[i+1], points[i+2]);
        RasterizeLine(imageData, w, h, points[i+2], points[i]);
    }
}

