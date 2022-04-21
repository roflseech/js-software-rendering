function MultMatOnVec(point, matrix)
{
    var p = [...point, 1];
    var result = [0, 0, 0];
    var norm = 0;
    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            if(i < 3) result[i] += p[j] * matrix[i][j];
            else norm += p[j] * matrix[i][j];
        }
    }
    result[0] = result[0]/norm;
    result[1] = result[1]/norm;
    result[2] = result[2]/norm;
    return result;
}
function MultMatOnVecArray(points, matrix)
{
    var result = [0, 0, 0];
    for(var i = 0; i < points.length; i++)
    {
        result[i] = MultMatOnVec(points[i], matrix);
    }
    return result;
}
function MultMat(a, b)
{
    var res = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];

    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            for(var k = 0; k < 4; k++)
            {
                res[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return res;
}

function ScaleMatrix(x, y, z)
{
    var result = [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1]
    ];

    return result;
}

function RotateXMatrix(angle)
{
    var result = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0, Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];

    return result;
}

function RotateYMatrix(angle)
{
    var result = [
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];

    return result;
}

function RotateZMatrix(angle)
{
    var result = [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1 , 0],
        [0, 0, 0, 1]
    ];

    return result;
}
function TranslationMatrix(x, y, z)
{
    var result = [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ];

    return result;
}
function CombinedRotationMatrix(rx, ry, rz)
{
    var rxm = RotateXMatrix(rx);
    var rym = RotateYMatrix(ry);
    var rzm = RotateZMatrix(rz);
    var resm = MultMat(rym, rxm);
    resm = MultMat(rzm, resm);
    return resm;
}
function Mat3x3Determinant(a)
{
    return a[0][0]*a[1][1]*a[2][2] +
    a[0][1]*a[1][2]*a[2][0] +
    a[0][2]*a[1][0]*a[2][1] -

    a[0][0]*a[1][2]*a[2][1] -
    a[0][1]*a[1][0]*a[2][2] -
    a[0][2]*a[1][1]*a[2][0];
}
