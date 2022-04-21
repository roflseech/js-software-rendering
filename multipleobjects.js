
var cubes = [];
var rotX = 0, rotY = 0, rotZ = 0;
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  var count = 10;
function GenerateRandomCubes()
{
    cubes = [];
    for(var i = 0; i < count; i++)
    {
        cubes[i] = [];
        cubes[i].w = randomInRange(20, 100);
        cubes[i].h = randomInRange(20, 100);
        cubes[i].d = randomInRange(20, 100);

        cubes[i].x = randomInRange(-200, 200);
        cubes[i].y = randomInRange(-100, 100);
        cubes[i].z = randomInRange(-200, 200);

        cubes[i].rx = 0;
        cubes[i].ry = 0;
        cubes[i].rz = 0;
    }
    Draw();
}
function RotateXButton()
{
    rotX += 0.1;
    Draw();
}
function RotateYButton()
{
    rotY += 0.1;
    Draw();
}
function RotateZButton()
{
    rotZ += 0.1;
    Draw();
}

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

    var i;
    for (i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i + 0] = 255;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 255;
      imgData.data[i + 3] = 255;
    }

    var colors1 = [
        [255, 0 , 0],
        [255, 120, 0],
        [230, 80, 0],
        [217, 0, 0],
        [170, 30, 40],
        [160, 20, 60],
        [190, 160, 20],
        [190, 20, 160],
        [140, 30, 30],
        [120, 20, 20],
        [110, 70, 70],
        [120, 70, 0]
    ]

    var colors2 = [
        [30, 190 , 0],
        [70, 120, 0],
        [30, 80, 0],
        [30, 230, 0],
        [70, 190, 40],
        [30, 230, 60],
        [70, 190, 20],
        [30, 20, 160],
        [70, 230, 30],
        [30, 230, 20],
        [70, 217, 70],
        [30, 217, 0]
    ]
    var zBuffer = Array(600);
    for(var i = 0; i < 600; i++)
    {
        zBuffer[i] = Array(600);
        zBuffer[i].fill(10000.0);
    }

    for(var i = 0; i < cubes.length; i++)
    {
        var mesh1 = CreateCube(cubes[i].rx, cubes[i].ry, cubes[i].rz, cubes[i].w, cubes[i].h, cubes[i].d, cubes[i].x, cubes[i].y, cubes[i].z);
        mesh1 = RotateMesh(mesh1, -rotX, -rotY, -rotZ);
        mesh1 = TranslateMesh(mesh1, 300, 300, 1000);
        var c = colors1;
        if(i%2 == 0) c = colors2;
        RasterizeTrianglesZBuffered(imgData, 600, 600, mesh1, c, zBuffer);
    }

    ctx.putImageData(imgData, 0, 0); 
}

function Setup()
{
    var xt = document.getElementById('rotationxtext');
    var yt = document.getElementById('rotationytext');
    var zt = document.getElementById('rotationztext');
    GenerateRandomCubes(5);
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
