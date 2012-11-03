/*
 *        .þÛÛþ þ    þ þÛÛþ.     þ    þ þÛÛÛþ.  þÛÛÛþ .þÛÛþ. þ    þ
 *       .þ   Û Ûþ.  Û Û   þ.    Û    Û Û    þ  Û.    Û.   Û Ûþ.  Û
 *       Û    Û Û Û  Û Û    Û    Û   þ. Û.   Û  Û     Û    Û Û Û  Û
 *     .þþÛÛÛÛþ Û  Û Û þÛÛÛÛþþ.  þþÛÛ.  þþÛÛþ.  þÛ    Û    Û Û  Û Û
 *    .Û      Û Û  .þÛ Û      Û. Û   Û  Û    Û  Û.    þ.   Û Û  .þÛ
 *    þ.      þ þ    þ þ      .þ þ   .þ þ    .þ þÛÛÛþ .þÛÛþ. þ    þ
 *
 * 
 * Author: Martin Stransky <stransky@anakreon.cz>
 *
 * Vaguely based on WebGL tutorials (http://learningwebgl.com/)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

// Globalni WebGL objekt
var gl;

// Globalni objekt pro graficke data
var graph = new Object();

// Moje WebGL matice
graph.worldMatrix = mat4.create();
mat4.identity(graph.worldMatrix);  
graph.cameraMatrix = mat4.create();  

// Vysledne transformacni matice pro WebGL
graph.modelViewMatrix = mat4.create();  
graph.projectionMatrix = mat4.create();

// Konfigurace polarnich souradnic kamery
graph.camera = new Object();
graph.camera.position = [0.0, 0.0, 0.0];
graph.camera.rotation = 0.0;
graph.camera.elevation = Math.PI/4; // 45 stupnu
graph.camera.distance = 10.0;
graph.camera.changed = 1;

/* Zkompiluje DOM element script s programem shaderu 
   a vrati jako shader objekt WebGLShader
*/
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    /* Sestavi program shaderu z DOM elementu script do jednoho retezce
    */
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

/* Vytvori WebGLProgram objekt (potrebuje jak vertex tak pixel shader)
*/ 
function createWebGLProgram() {
    var fragmentShader = getShader(gl, "pixel-ps");
    var vertexShader = getShader(gl, "vertex-vs");

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }      

    gl.useProgram(program);
    
    // Vraci index promene aVertexPosition (soucast naseho vertex shaderu)
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    // Nastavime aVertexPosition ke spracovani jako pole
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    // Podobne pro aTextureCoord - nastavime jako pole "vertexu"
    program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(program.textureCoordAttribute);

    // Getting reference to Vertex normal attribute
    program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);

    // Nacti indexy pro matice
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    
    // Nacti index me promene s texturou
    program.samplerUniform = gl.getUniformLocation(program, "uTexture");
    
    return program;
}

function graphicsInit() {  
    var canvas = document.getElementById("webgl-canvas");
    try {
      gl = canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl) {
      alert("Sorry kamo, ale chce to jinej prohlizec!");
    }

    // Zakladni WebGL konfigurace
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Nastav projekcni matici
    gl.viewport(0, 0, canvas.width, canvas.height);
    mat4.perspective(45, canvas.width / canvas.height, 1, 10000.0, graph.projectionMatrix);

    // Zkompiluj shader program
    graph.shaderProgram = createWebGLProgram();  
}

// Calc final matrix (modelViewMatrix)
function modelViewMatrixSet() {
  mat4.multiply(graph.cameraMatrix, graph.worldMatrix, graph.modelViewMatrix);
}

// Set matrices for shader program
function setMatrixUniforms() {
  gl.uniformMatrix4fv(graph.shaderProgram.pMatrixUniform, false, graph.projectionMatrix);
  gl.uniformMatrix4fv(graph.shaderProgram.mvMatrixUniform, false, graph.modelViewMatrix);
}

function drawGeometryObject(container) {

  // Drawing models from container
  for (object in container.objects) {

      // Transformed center of model
      var newCenter = [0, 0, 0];

      // Transform center according to bounding box
      // mat4.multiplyVec3(mvMatrix, container.objects[object].center, newCenter);
      modelViewMatrixSet();
      setMatrixUniforms();

      // Set pipeline
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);

      // Load vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, container.objects[object].vertexPositionBuffer);
      gl.vertexAttribPointer(graph.shaderProgram.vertexPositionAttribute, 
                             container.objects[object].vertexPositionBuffer.itemSize, 
                             gl.FLOAT, false, 0, 0);

      // Load texture coords
      gl.bindBuffer(gl.ARRAY_BUFFER, container.objects[object].vertexTextureCoordBuffer);
      gl.vertexAttribPointer(graph.shaderProgram.textureCoordAttribute, 
                             container.objects[object].vertexTextureCoordBuffer.itemSize, 
                             gl.FLOAT, false, 0, 0);

      // If textures enabled, load textures      
      gl.uniform1i(graph.shaderProgram.useTexturesUniform, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, scene.materials[container.objects[object].material].textures[0]);
      gl.uniform1i(graph.shaderProgram.samplerUniform, 0);

      // Load normals
      gl.bindBuffer(gl.ARRAY_BUFFER, container.objects[object].vertexNormalBuffer);
      gl.vertexAttribPointer(graph.shaderProgram.vertexNormalAttribute, 
                             container.objects[object].vertexNormalBuffer.itemSize,
                             gl.FLOAT, false, 0, 0);

      // Load indices
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, container.objects[object].vertexIndexBuffer);

      // Draw model according to selected mode
      gl.drawElements(gl.TRIANGLES, container.objects[object].vertexIndexBuffer.numItems, 
                      gl.UNSIGNED_SHORT, 0);      
  }
}
