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

// Sestavi matici kamery z polarnich souradnic
function cameraSet(position, rotation, elevation, distance) {
  var camera = mat4.create();
  
  mat4.identity(camera);
  mat4.translate(camera, position);
  mat4.rotateY(camera, rotation);
  mat4.rotateX(camera, -elevation);
  mat4.translate(camera, [0.0, 0.0, distance]);

  return mat4.inverse(camera);
}

/* Center camera to scene
*/
function cameraCenter(center, size) {
  graph.camera.position = center;  
  graph.camera.distance = Math.sqrt(size[0]*size[0] + size[1]*size[1] + size[2]*size[2]);
  graph.camera.rotation = 0.0;
  graph.camera.elevation = Math.PI/4; // 45 degrees
  
  console.log("Centering camera to point " + center);
  console.log("Centering camera to distance " + graph.camera.distance);
  
  graph.camera.changed = 1;
}

function handleCamera() {
  if(graph.camera.changed) {
    graph.cameraMatrix = cameraSet(graph.camera.position, 
                                   graph.camera.rotation,
                                   graph.camera.elevation,
                                   graph.camera.distance);
    graph.camera.changed = 0;
  }
}

function handleCameraControl() {
  // rotate camera
  if(control.keys[KeyEvent.DOM_VK_CONTROL]) {
    graph.camera.rotation -= Math.PI*0.002*control.mouse.dx;
    graph.camera.elevation += Math.PI*0.002*control.mouse.dy;
    /*
    if(graph.camera.elevation < 0)
      graph.camera.elevation = 0;
    if(graph.camera.elevation > Math.PI/2)
      graph.camera.elevation = Math.PI/2;
    */
    graph.camera.changed = 1;
  }
  
  // camera move
  if(control.keys[KeyEvent.DOM_VK_SHIFT]) {
  }
  
  // camera zoom 
  if(control.keys[KeyEvent.DOM_VK_EQUALS]) {
    graph.camera.distance -= 0.5;
    //graph.camera.distance -= 30;
    graph.camera.changed = 1;
  }
  if(control.keys[KeyEvent.DOM_VK_HYPHEN_MINUS]) {
    graph.camera.distance += 0.5;
    //graph.camera.distance += 30;
    graph.camera.changed = 1;
  }

  // Camera center
  if(control.keys[KeyEvent.DOM_VK_C]) {
    if(control.keys[KeyEvent.DOM_VK_SHIFT]) {
      scene.sizeCalc();
      cameraCenter(scene.center, scene.size);
    }
    else {
      var center = [ scene.logic.centerX, scene.logic.centerY, scene.logic.centerZ];
      var size = [ scene.logic.sizeX, scene.logic.sizeY, scene.logic.sizeZ];
      cameraCenter(center, size);
    }
  }

  if(control.keys[KeyEvent.DOM_VK_CONTROL]) {
    if(control.keys[KeyEvent.DOM_VK_UP]) {
      graph.camera.position[2] += 0.5;
      graph.camera.changed = 1;
    }
    if(control.keys[KeyEvent.DOM_VK_DOWN]) {
      graph.camera.position[2] -= 0.5;
      graph.camera.changed = 1;
    }
    if(control.keys[KeyEvent.DOM_VK_RIGHT]) {
      graph.camera.position[0] += 0.5;
      graph.camera.changed = 1;
    }
    if(control.keys[KeyEvent.DOM_VK_LEFT]) {
      graph.camera.position[0] -= 0.5;
      graph.camera.changed = 1;
    }
  }  
}
