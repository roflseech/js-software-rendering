function VectorMinus(a, b)
{
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function VectorPlus(a, b)
{
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function DotProduct(a, b)
{
    return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}
function CrossProduct(a, b)
{
    return [a[1]*b[2] - a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]- a[1]*b[0]];
}
function VectorMulOnScalar(a, s)
{
    return [a[0]*s, a[1]*s, a[2]*s];
}
function VectorNormalize(a)
{
    var s = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    return [a[0]/s, a[1]/s, a[2]/s];
}
function VectorMagnitude(a)
{
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}
function VectorMultiply(a, b)
{
    return [a[0] * b[0],  a[1] * b[1],  a[2] * b[2]];
}
function VectorInvert(a)
{
    return [-a[0], -a[1], -a[2]];
}
function RayTriangleIntersection(origin, dir, v0, v1, v2)
{
    var e1 = VectorMinus(v1, v0);
    var e2 = VectorMinus(v2, v0);

    var pvec = CrossProduct(dir, e2);
    var det = DotProduct(e1, pvec);

    if (det < 0.000001 && det > -0.000001)
    {
        return 0;
    }

    var inv_det = 1 / det;
    var tvec = VectorMinus(origin, v0);

    var u = DotProduct(tvec, pvec) * inv_det;

    if (u < 0 || u > 1) {
        return 0;
    }

    var qvec = CrossProduct(tvec, e1);
    var v = DotProduct(dir, qvec) * inv_det;
    if (v < 0 || u + v > 1) {
        return 0;
    }
    return DotProduct(e2, qvec) * inv_det;
}
/*
function Intersects(origin, dir, center, radius)
{
    var difference = VectorMinus(center - origin);
    var differenceLengthSquared = DotProduct(difference);
    var sphereRadiusSquared = sphere.Radius * sphere.Radius;
    var distanceAlongRay;
    if(differenceLengthSquared < sphereRadiusSquared)
    {
        return null;
    }

    distanceAlongRay = DotProduct(direction, difference);
    if(distanceAlongRay < 0)
    {
        return null;
    }
    var dist = sphereRadiusSquared + distanceAlongRay * distanceAlongRay - differenceLengthSquared;
    return (dist < 0) ? null : distanceAlongRay - ( float? )Math.Sqrt( dist );
}*/
/*
function RaySphereIntersection(origin, dir, center, radius)
{
    var dx = center[0] - origin[0];
    var dy = center[1] - origin[1];

    var dist = Math.sqrt(dx*dx + dy*dy);

    if(dist > radius) return null;
    else 
    {
        var d = center[2] - Math.sqrt(radius*radius - dist*dist);
        var intPoint = [origin[0], origin[1], d];
        var norm = VectorMinus(intPoint, center);
        norm = VectorNormalize(norm);
        return {distance: d, normal:norm};
    }
}*/

function RaySphereIntersection(origin, direction, center, radius)
{
    var oc = VectorMinus(origin, center);
    var a = DotProduct(direction, direction);
    var b = 2.0 * DotProduct(oc, direction);
    var c = DotProduct(oc, oc) - radius*radius;
    var discriminant = b*b - 4*a*c;
    if(discriminant < 0)
    {
        return null;
    }
    else
    {
        var dist = ((-b - Math.sqrt(discriminant)) / (2.0*a));
        var norm = [origin[0], origin[1], dist];
        norm = VectorMinus(norm, center);
        norm = VectorNormalize(norm);
        //norm = VectorInvert(norm);
        return {distance: dist, normal: norm};
    }    
}

function SetPixelZBufferedNormalBuffered(x, y, color, depth, normal, zBuffer, normalBuffer, colorBuffer)
{
    if(depth < zBuffer[x][y] && depth > 0)
    {
        zBuffer[x][y] = depth;
        normalBuffer[x][y] = normal;
        colorBuffer[x][y] = color;
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
function Raytracing(width, height, spheres, points, trianglesColors, lightSources, imgData, enableShadows, ambientLight, lowPerformance)
{
    var zBuffer = Array(width);
    for(var i = 0; i < width; i++)
    {
        zBuffer[i] = Array(height);
        zBuffer[i].fill(10000.0);
    }

    var normalBuffer = Array(width);
    for(var i = 0; i < width; i++)
    {
        normalBuffer[i] = Array(height);
        normalBuffer[i].fill([0, 0, 0]);
    }

    var colorBuffer = Array(width);
    for(var i = 0; i < width; i++)
    {
        colorBuffer[i] = Array(height);
        colorBuffer[i].fill([0, 0, 0]);
    }

    var lightingBuffer = Array(width);
    for(var i = 0; i < width; i++)
    {
        lightingBuffer[i] = Array(height);
        lightingBuffer[i].fill(0.0);
    }

    for(var x = 0; x < width; x++)
    {
        for(var y = 0; y < height; y++)
        {
            for(var i = 0; i < points.length - 2; i+=3)
            {
                var dist = RayTriangleIntersection([x, y, 0], [0, 0, 1], points[i], points[i+1], points[i+2]);
                var vec1 = VectorMinus(points[i], points[i+1]);
                var vec2 = VectorMinus(points[i], points[i+2]);
                var normal = CrossProduct(vec1, vec2);
                normal = VectorNormalize(normal);
                if(dist > 0)
                {
                    SetPixelZBufferedNormalBuffered(x, y, trianglesColors[i/3], dist, normal, zBuffer, normalBuffer, colorBuffer);
                }
            }
            for(var i = 0; i < spheres.length; i++)
            {
                var intersection = RaySphereIntersection([x, y, 0], [0, 0, 1], spheres[i].center, spheres[i].radius);
                if(intersection != null)
                {
                    //intersection.normal[2] = -intersection.normal[2];
                    SetPixelZBufferedNormalBuffered(x, y, spheres[i].color, intersection.distance, intersection.normal, zBuffer, normalBuffer, colorBuffer);
                }
            }
            if(lowPerformance) y+=3;
            if(y >= height) break;
        }
        if(lowPerformance) x+=3;
        if(x >= width) break;
    }

    for(var x = 0; x < width; x++)
    {
        for(var y = 0; y < height; y++)
        {
            lightingBuffer[x][y] += ambientLight;
            for(var i = 0; i < lightSources.length; i++)
            {
                var point = [x, y, zBuffer[x][y]];
                point = VectorPlus(point, VectorMulOnScalar(normalBuffer[x][y], 2.5));

                var pointLightVector = VectorMinus(lightSources[i].center, point);
                var magnitude = VectorMagnitude(pointLightVector);
                pointLightVector = VectorNormalize(pointLightVector);
                //pointLightVector = VectorInvert(pointLightVector);
                var lightPixel = true;
                if(enableShadows)
                {
                    for(var k = 0; (k < points.length - 2) && lightPixel; k+=3)
                    {
                        var dist = RayTriangleIntersection(point, pointLightVector, points[k], points[k+1], points[k+2]);
                        if(dist > 0) lightPixel = false;
                    }
                    for(var k = 0; (k < spheres.length) && lightPixel; k++)
                    {
                        var intersection = RaySphereIntersection(point, pointLightVector, spheres[k].center, spheres[k].radius);
                        if(intersection != null && intersection.distance > 0) lightPixel = false;
                    }
                }
                //pointLightVector = VectorInvert(pointLightVector);
                if(lightPixel) lightingBuffer[x][y] += DotProduct(normalBuffer[x][y], pointLightVector)* lightSources[i].intensity/magnitude;
            }
            if(lowPerformance) y+=3;
            if(y >= height) break;
        }
        if(lowPerformance) x+=3;
        if(x >= width) break;
    }

    for(var x = 0; x < width; x++)
    {
        for(var y = 0; y < height; y++)
        {
            colorBuffer[x][y] = VectorMulOnScalar(colorBuffer[x][y], lightingBuffer[x][y]);
            //colorBuffer[x][y] = VectorMulOnScalar([normalBuffer[x][y][0]+1.0, normalBuffer[x][y][1]+1.0, normalBuffer[x][y][2]+1.0], 100);
            SetPixel(imgData, width, height, x, y, colorBuffer[x][y]);
            if(lowPerformance) y+=3;
            if(y >= height) break;
        }
        if(lowPerformance) x+=3;
        if(x >= width) break;
    }
    if(lowPerformance)
    {
        for(var x = 0; x < width; x++)
        {
            for(var y = 0; y < height; y++)
            {
                colorBuffer[x][y] = colorBuffer[Math.floor(x/4)*4][Math.floor(y/4)*4];
                SetPixel(imgData, width, height, x, y, colorBuffer[x][y]);
            }
        }
    }
}
function RasterizeLine(imageData, w, h, p0, p1, color)
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
        SetPixel(imageData, w, h, x0, y0, color);
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