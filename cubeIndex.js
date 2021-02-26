import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {Matrix4} from './Matrix4';

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

async function initialize() {
  transform = Matrix4.identity();

  const positions = [
    // Front Face
    -1, -1,  1,
     1, -1,  1,
    -1,  1,  1,
     1,  1,  1,

    // Back Face
    -1, -1, -1,
     1, -1, -1,
    -1,  1, -1,
     1,  1, -1,

    // Right Face
     1, -1,  1,
     1, -1, -1,
     1,  1,  1,
     1,  1, -1,

    // Left Face
    -1, 1,  1,
    -1, 1, -1,
    -1,  -1,  1,
    -1,  -1, -1,
    
    // Top Face
    -1, 1, -1,
     1, 1, -1,
    -1, 1,  1,
     1, 1,  1,

    // Bottom Face
    -1, -1, -1, 
     1, -1, -1,
    -1, -1,  1,
     1, -1,  1,
  ];
  
  const colors = [
    // front - green 
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // back - red
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // right - blue
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    //left - cyan
    0, 1, 1,
    0, 1, 1,
    0, 1, 1,
    0, 1, 1,
    
    // top - yellow
    1, 1, 0,
    1, 1, 0,
    1, 1, 0,
    1, 1, 0,
    
    //bottom - purple
    1, 0, 1,
    1, 0, 1,
    1, 0, 1,
    1, 0, 1,
  ];
  
  const faces = [
     // Front - green
     0, 1, 2,
     1, 3, 2,

     // Top - red
     4, 5, 6,
     5, 7, 6,
  
     // Back - blue
     8, 9, 10,
     9, 11, 10,

     // Bottom -cyan
     8, 13, 4,
     9, 5, 4,

     // Right - yellow
     5, 9, 7,
     9, 11, 7,

     // Left - purple
     8, 4, 10,
     4, 6, 10,
   ];
  
  const normals = [
    // Front Face
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
        
    // Back Face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // Right Face
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Left Face
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    
    // Top Face
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    
    // Bottom Face
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ];
  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  attributes.addAttribute('color', 4, 3, colors);
  attributes.addIndices(faces);
  
  //determines where to place each vertex
  //will be run on each vertex
  const vertexSource = `
  uniform mat4 transform;
  uniform mat4 worldToClip;
  in vec3 position;
  in vec3 color;
  out vec3 fcolor;
  
  void main() {
    gl_Position = worldToClip * transform * vec4(position, 1.0);
    fcolor = color;
  }
  `;
  
  //determines what color to make each vertex
  //will be run on each "triangle" of verticies
  const fragmentSource = `
  in vec3 fcolor;
  out vec4 fragmentColor;
  
  void main() {
    fragmentColor = vec4(fcolor, 1.0);
  }
  `;
  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('keydown', event => {
    let rotationAmount = 10;

    if(event.key === 'ArrowRight')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateY(rotationAmount));
    }
    if(event.key === 'ArrowLeft')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateY(-rotationAmount));
    }
    if(event.key === 'ArrowUp')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateX(rotationAmount));
    }
    if(event.key === 'ArrowDown')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateX(-rotationAmount));
    }
    render();
  });
  onSizeChanged();
}

initialize();
