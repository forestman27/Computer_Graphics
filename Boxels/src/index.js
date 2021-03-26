import {VertexArray} from '../../src/VertexArray.js';
import {VertexAttributes} from '../../src/VertexAttribute.js';
import {ShaderProgram} from '../../src/ShaderProgram.js';
import {Matrix4} from '../../src/Matrix5.js';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let transform;
let worldToClip;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('transform', transform);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);
  vertexArray.bind();
  //vertexArray.drawIndexed(gl.TRIANGLE_STRIP);
  vertexArray.drawIndexed(gl.TRIANGLES);
  //vertexArray.drawIndexed(gl.LINE_LOOP);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const aspectRatio = canvas.width / canvas.height;

  let right;
  let top;

  if (aspectRatio < 1) {
    right = 3;
    top = right / aspectRatio;
  } else {
    top = 3;
    right = top * aspectRatio;
  }

  worldToClip = Matrix4.ortho(-right, right, -top, top, -10, 10);

  render();
}

async function initialize(data) {

  const ConstNormals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ];  
  const ConstFaces = [
    0, 1, 2,
    1, 3, 2,
    4, 5, 6,
    5, 7, 6,
    8, 9, 10,
    9, 11, 10,
    12, 13, 14,
    13, 15, 14,
    16, 17, 18,
    17, 19, 18,
    20, 21, 22,
    21, 23, 22,
  ];

  const ConstPositions = [
    -1, -1,  1,
     1, -1,  1,
    -1,  1,  1,
     1,  1,  1,
    -1, -1, -1,
     1, -1, -1,
    -1,  1, -1,
     1,  1, -1,
     1, -1,  1,
     1, -1, -1,
     1,  1,  1,
     1,  1, -1,
    -1,  1,  1,
    -1,  1, -1,
    -1, -1,  1,
    -1, -1, -1,
    -1, 1, -1,
     1, 1, -1,
    -1, 1,  1,
     1, 1,  1,
    -1, -1, -1, 
     1, -1, -1,
    -1, -1,  1,
     1, -1,  1,
  ];

  transform = Matrix4.identity();
  data = data.split('\n')
  var line = []
  for (var i = 0; i < data.length; i++) {
    data[i] = data[i].split(' ');
    line[i] = {};
    line[i].x = parseFloat(data[i][0])
    line[i].y = parseFloat(data[i][1])
    line[i].z = parseFloat(data[i][2])
    line[i].width = parseFloat(data[i][3])
    line[i].height = parseFloat(data[i][4])
    line[i].depth = parseFloat(data[i][5])
    line[i].color = parseFloat(data[i][6])
  }
  console.log(line)
  // initialize each block position
  var positions = [];
  for (var x = 0; x < data.length; x++) {
    for (var i = x * ConstPositions.length; i < x * ConstPositions.length + ConstPositions.length; i++) {
      // x
      if (i % 3 == 0) {
        positions[i] = (ConstPositions[i%ConstPositions.length] + line[x].x) * line[x].width;
        console.log(line[x].width)
      // y
      } else if (i % 3 == 1) {
        positions[i] = (ConstPositions[i%ConstPositions.length] + line[x].y) * line[x].height;   
      } 
      // z
      else {
        positions[i] = (ConstPositions[i%ConstPositions.length] + line[x].z) * line[x].depth;
      }
    }
  }
  var faces = [];
  let normals = ConstNormals;

  for (var x = 0; x < data.length; x++) {
    normals = [...normals, ...ConstNormals]
    for (var i = 0; i < ConstFaces.length; i++) {
      faces[i + x * ConstFaces.length] = ConstFaces[i] + 24 * x;
    }
    
  }
  const colors = [];
  
  console.log(normals.length);
  console.log(faces.length);

  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  //attributes.addAttribute('color', 4, 3, colors);
  attributes.addIndices(faces);
  
  //determines where to place each vertex
  //will be run on each vertex
  const vertexSource = `
  uniform mat4 transform;
  uniform mat4 worldToClip;
  in vec3 position;
  in vec3 color;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 fcolor;
  
  void main() {
    gl_Position = worldToClip * transform * vec4(position, 1.0);
    fcolor = color;
    fnormal = (transform * vec4(normal, 0)).xyz;
    //fnormal = normal;
  }
  `;
  
  //determines what color to make each vertex
  //will be run on each "triangle" of verticies
  const fragmentSource = `
  in vec3 fcolor;
  in vec3 fnormal;
  out vec4 fragmentColor;

  const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));
  
  void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    fragmentColor = vec4(vec3(litness), 1.0);
    // fragmentColor = vec4(abs(normal), 1.0);
  }
  `;
  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('keydown', event => {
    let rotationAmount = 10;

    if(event.key === 'ArrowUp')
    {
      transform = Matrix4.rotateY(-rotationAmount).multiplyMatrix4(transform);
    }
    if(event.key === 'ArrowDown')
    {
      transform = Matrix4.rotateY(rotationAmount).multiplyMatrix4(transform);
    }
    if(event.key === 'ArrowRight')
    {
      transform = Matrix4.rotateX(-rotationAmount).multiplyMatrix4(transform);
    }
    if(event.key === 'ArrowLeft')
    {
      transform = Matrix4.rotateX(rotationAmount).multiplyMatrix4(transform);
    }
    render();
  });
  onSizeChanged();
}

fetch('input.txt')
.then(function(response) {
  return response.text();
})
.then(function(data) {
  initialize(data);
})
.catch(function(error) {
  console.log(error)
})
