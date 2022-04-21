
var cubes = [];
var rotX = 0, rotY = 0, rotZ = 0;

function CreateCube(rx, ry, rz, sx, sy, sz, x, y, z)
{
    var rxm = RotateXMatrix(rx);
    var rym = RotateYMatrix(ry);
    var rzm = RotateZMatrix(rz);
    var scalem = ScaleMatrix(sx, sy, sz);

    var trm = TranslationMatrix(x, y, z);
    var resm = MultMat(rym, rzm);
    resm = MultMat(rxm, resm);
    resm = MultMat(scalem, resm);
    resm = MultMat(trm, resm);

    var mesh = MultMatOnVecArray(cubeMesh, MultMat(trm, resm));
    return mesh;
}

function RotateMesh(mesh, rx, ry, rz)
{
    var rxm = RotateXMatrix(rx);
    var rym = RotateYMatrix(ry);
    var rzm = RotateZMatrix(rz);
    var resm = MultMat(rym, rxm);
    resm = MultMat(rzm, resm);
    var nm = MultMatOnVecArray(mesh, resm);
    return nm;
}
function TranslateMesh(mesh, x, y, z)
{
    var resm = TranslationMatrix(x, y, z);
    var nm = MultMatOnVecArray(mesh, resm);
    return nm;
}
function Draw()
{
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var size = 400;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    
    var scale = window.devicePixelRatio;
    canvas.width = Math.floor(size * scale);
    canvas.height = Math.floor(size * scale);
    
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled= false

    var imgData = ctx.createImageData(600, 600);

    for (var i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i + 0] = 255;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 255;
      imgData.data[i + 3] = 255;
    }
    //isometric matrix
    var isometricMatrix = MultMat(RotateXMatrix(Math.asin(Math.tan(Math.PI/6))), RotateYMatrix(Math.PI/4));
    //axes
    var axesPoints = [
        [-1000, 0, 0],
        [1000, 0, 0],
        [0, 1000, 0],
        [0, -1000, 0],
        [0, 0, -1000],
        [0, 0, 1000]
    ];
    //cube
    var mesh1 = CreateCube(0, 0, 0, 100, 50, 80, 0, 0, 0);
    mesh1 = RotateMesh(mesh1, rotX, rotY, rotZ);

    //projection
    mesh1 = MultMatOnVecArray(mesh1, isometricMatrix);
    axesPoints = MultMatOnVecArray(axesPoints, isometricMatrix);

    //transformation
    mesh1 = TranslateMesh(mesh1, 300, 300, 0);
    axesPoints = TranslateMesh(axesPoints, 300, 300, 0);

    RasterizeLine(imgData, 600, 600, axesPoints[0], axesPoints[1]);
    RasterizeLine(imgData, 600, 600, axesPoints[2], axesPoints[3]);
    RasterizeLine(imgData, 600, 600, axesPoints[4], axesPoints[5]);
    RasterizeLineTriangleMesh(imgData, 600, 600, mesh1);

    ctx.putImageData(imgData, 0, 0); 
}

function Setup()
{
    var xt = document.getElementById('rotationxtext');
    var yt = document.getElementById('rotationytext');
    var zt = document.getElementById('rotationztext');
    document.getElementById('rotationx').oninput = function() {
        rotX = this.value / 360 * Math.PI * 2;
        xt.value = this.value;
        Draw();
    } 
    document.getElementById('rotationy').oninput = function() {
        rotY = this.value / 360 * Math.PI * 2;
        yt.value = this.value;
        Draw();
    } 
    document.getElementById('rotationz').oninput = function() {
        rotZ = this.value / 360 * Math.PI * 2;
        zt.value = this.value;
        Draw();
    } 

    Draw();
}
