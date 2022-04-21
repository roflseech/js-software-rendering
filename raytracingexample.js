
var cubes = [];
var rotX = 0, rotY = 0, rotZ = 0;
var tX =0, tY =-500, tZ = 600;
var scaleCoef = 4;
var lightIntensityScale = 500.0;
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  var count = 12;
  var twoSources = false;
function GenerateRandomCubes()
{
    cubes = [];
    cubes[0] = [];
    cubes[0].w = 100;
    cubes[0].h = 140;
    cubes[0].d = 180;

    cubes[0].x = 0;
    cubes[0].y = 0;
    cubes[0].z = 0;

    cubes[0].rx = 0;
    cubes[0].ry = 0;
    cubes[0].rz = 0;

    cubes[1] = [];
    cubes[1].w = 2000;
    cubes[1].h = 10;
    cubes[1].d = 2000;

    cubes[1].x = 0;
    cubes[1].y = 0;
    cubes[1].z = 0;

    cubes[1].rx = 0;
    cubes[1].ry = 0;
    cubes[1].rz = 0;

    for(var i = 2; i < count; i++)
    {
        cubes[i] = [];
        cubes[i].w = randomInRange(20, 200);
        cubes[i].h = randomInRange(20, 400);
        cubes[i].d = randomInRange(20, 200);

        cubes[i].x = randomInRange(-500, 500);
        cubes[i].y = 0;
        cubes[i].z = randomInRange(-500, 500);

        cubes[i].rx = 0;
        cubes[i].ry = randomInRange(0, Math.PI * 2);
        cubes[i].rz = 0;
    }
    //Draw();
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
    var scalem = ScaleMatrix(sx, sy, sz);
    var trm = TranslationMatrix(x, y, z);

    //var resm = MultMat(scalem, CombinedRotationMatrix(rx, ry, rz));
    var resm = MultMat(trm, scalem);

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

function RenderScene(shadows, lowPerf)
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

    var totalTriangles = [];
    var totalColors = [];
    for(var i = 0; i < cubes.length; i++)
    {
        var mesh1 = CreateCube(cubes[i].rx, cubes[i].ry, cubes[i].rz, cubes[i].w, cubes[i].h, cubes[i].d, cubes[i].x, cubes[i].y, cubes[i].z);
        var c = colors1;
        if(i%2 == 0) c = colors2;
        totalTriangles = totalTriangles.concat(mesh1)
        totalColors = totalColors.concat(c);
    }

    var spheres = [
        //{radius: 250, color: [80, 160, 160], center: [0, -220, 0]},
    ];

    var ambientLight = 0.2;
    var lightSources = [
        {center: [tX, tY, tZ], intensity: lightIntensityScale},
    ];
    if(twoSources)lightSources[1] = {center: [300, -300, 300], intensity: 500};

    var isometricMatrix = MultMat(RotateXMatrix(Math.asin(Math.tan(Math.PI/6))), RotateYMatrix(Math.PI/4));

    var scaleMatrix = ScaleMatrix(1/scaleCoef, 1/scaleCoef, 1/scaleCoef);

    totalTriangles = RotateMesh(totalTriangles, -rotX, -rotY, -rotZ);
    totalTriangles = MultMatOnVecArray(totalTriangles, isometricMatrix);
    totalTriangles = MultMatOnVecArray(totalTriangles, scaleMatrix);
    totalTriangles = MultMatOnVecArray(totalTriangles, TranslationMatrix(300, 300, 1000));


    for(var i = 0; i < spheres.length; i++)
    {
        spheres[i].center = MultMatOnVec(spheres[i].center, CombinedRotationMatrix(-rotX, -rotY, -rotZ));
        spheres[i].center = MultMatOnVec(spheres[i].center, isometricMatrix);
        spheres[i].center = MultMatOnVec(spheres[i].center, scaleMatrix);
        spheres[i].center = MultMatOnVec(spheres[i].center, TranslationMatrix(300, 300, 1000));
        spheres[i].radius = spheres[i].radius /scaleCoef;
    }
    for(var i = 0; i < lightSources.length; i++)
    {
        lightSources[i].center = MultMatOnVec(lightSources[i].center, CombinedRotationMatrix(-rotX, -rotY, -rotZ));
        lightSources[i].center = MultMatOnVec(lightSources[i].center, isometricMatrix);
        lightSources[i].center = MultMatOnVec(lightSources[i].center, scaleMatrix);
        lightSources[i].center = MultMatOnVec(lightSources[i].center, TranslationMatrix(300, 300, 1000));
    }

    Raytracing(600, 600, spheres, totalTriangles, totalColors, lightSources, imgData, shadows, ambientLight, lowPerf);

    for(var i = 0; i < lightSources.length; i++)
    {
        var disp = [
            [10, 10, 0],
            [10, -10, 0],
            [-10, -10, 0],
            [-10, 10, 0],
            [10, 10, 0]
        ];
        var disp2 = [
            [9, 9, 0],
            [9, -9, 0],
            [-9, -9, 0],
            [-9, 9, 0],
            [9, 9, 0]
        ];
        for(var j = 0; j < 4; j++)
        {
            RasterizeLine(imgData, 600, 600, VectorPlus(lightSources[i].center, disp[j]), VectorPlus(lightSources[i].center, disp[j+1]), [255, 255, 255]);
            RasterizeLine(imgData, 600, 600, VectorPlus(lightSources[i].center, disp2[j]), VectorPlus(lightSources[i].center, disp2[j+1]), [0, 0, 0]);
        }
    }
    ctx.putImageData(imgData, 0, 0); 
}
function Draw()
{
    RenderScene(false, true);
}
function DrawWithShadows()
{
    RenderScene(true, false);
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

    var xtt = document.getElementById('translationxtext');
    var ytt = document.getElementById('translationytext');
    var ztt = document.getElementById('translationztext');
    document.getElementById('translationx').oninput = function() {
        tX = this.value;
        xtt.value = this.value;
        Draw();
    } 
    document.getElementById('translationy').oninput = function() {
        tY = this.value;
        ytt.value = this.value;
        Draw();
    } 
    document.getElementById('translationz').oninput = function() {
        tZ = this.value;
        ztt.value = this.value;
        Draw();
    } 

    var st = document.getElementById('scaletext');
    document.getElementById('scale').oninput = function() {
        scaleCoef = this.value;
        st.value = this.value;
        Draw();
    } 

    var lit = document.getElementById('lightintensitytext');
    document.getElementById('lightintensity').oninput = function() {
        lightIntensityScale = this.value;
        lit.value = this.value;
        Draw();
    } 
    Draw();
}

function LightMode()
{
    twoSources = !twoSources;
}