import {VertexArray} from '../../src/VertexArray.js';
import {VertexAttributes} from '../../src/VertexAttribute.js';
import {ShaderProgram} from '../../src/ShaderProgram.js';
import {Matrix4} from '../../src/Matrix4.js';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let vertexAttributes;

function render() {
  gl.clearColor(1, 0.5, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  // draw geometry
  shaderProgram.bind();
  vertexArray.bind();
  // since we have indexed triangles in buffer
  vertexArray.drawIndexed(gl.TRIANGLES);
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

async function initialize() {
  window.addEventListener('resize', onSizeChanged);
  const positions = [
    -1, -1, 0, // bottom left
     1, -1, 0, // bottom right
    -1,  1, 0, // top left
     1, 1, 0,
  ];

  // colors for each vertex
  // 4 vertices for 2 triangles
  // triangles share two vertices, so result is quadrilateral
  const colors = [
    1, 1, 0,
    0, 1, 0,
    0, 1, 1,
    0, 1, 0,
  ]

  const faces = [
    0, 1, 2, // first triangle is made of vertices 0, 1, and 2
    1, 3, 2, // second triangle
  ]

  vertexAttributes = new VertexAttributes();
  vertexAttributes.addIndices(faces);
  vertexAttributes.addAttribute('position', 4, 3, positions);
  vertexAttributes.addAttribute('color', 4, 3, colors);

  const vertexSource = `
    precision highp float;

    in vec3 position;
    in vec3 color; // color of pixel, need to pass to frag shader
    out vec3 fragColor; // output for color input
    void main() {
      gl_Position = vec4(position, 1.0);
      fragColor = color;
    }
  `;
   
   var test = document.getElementById("input_function").value;
   //console.log(test);
    const fFunction = `
    float x = gl_FragCoord.x;
    if (x <= 0.5) {
      x = 1.0;
    } 
    return vec3(x*0.5, sin(0.6*x), tan(100.0*x/80000.0));`;
  // make a function which puts the dimension in when its inserting. 

  // fragment shader decides color of pixel
  const fragSource = `
    precision highp float;
    in vec3 fragColor; // names must match
    out vec4 fragmentColor;
    vec3 f() {` + fFunction + `}
    void main() {
      fragmentColor = vec4(f(), 1.0);
      //fragmentColor = vec4(fragColor, 1.0);
    }
  `;

  shaderProgram = new ShaderProgram(vertexSource, fragSource);
  vertexArray = new VertexArray(shaderProgram, vertexAttributes);
  onSizeChanged();
}

initialize();
