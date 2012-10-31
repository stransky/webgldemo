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

/* Scene representation  
*/

/* Scene object
*/ 
var scene = new Object();

/**
* Array of dynamic GeometryContainer
* objects
*/
scene.dynamicObjects = [];
scene.dynamicObjectsNum;

/**         
* Array of static GeometryContainer
* objects
*/  
scene.staticObjects = [];
scene.staticObjectsNum;

/**
* Logic representation of game field
*/
scene.logic;

/**
* Lights in the scene
*/
scene.lights = [];
scene.lightsNum;

/**
* Game materials
*/
scene.materials = [];

/**
* Scene params
*/
scene.center = [];
scene.size = [];
scene.min = [];
scene.max = [];

/**
* Scene methods
*/
scene.sizeCalc = function() {
  var min = [ MAX_NUMBER, MAX_NUMBER, MAX_NUMBER];
  var max = [-MAX_NUMBER,-MAX_NUMBER,-MAX_NUMBER];

  for (i in scene.staticObjects) {
    var omin = scene.staticObjects[i].min;
    var omax = scene.staticObjects[i].max;
    
    min[0] = getMin(min[0], omin[0]);
    min[1] = getMin(min[1], omin[1]);
    min[2] = getMin(min[2], omin[2]);
    
    max[0] = getMax(max[0], omax[0]);
    max[1] = getMax(max[1], omax[1]);
    max[2] = getMax(max[2], omax[2]);
  }
  
  this.min = min;
  this.max = max;
  
  this.center[0] = getCenter(min[0], max[0]);
  this.center[1] = getCenter(min[1], max[1]);
  this.center[2] = getCenter(min[2], max[2]);
  
  this.size[0] = max[0] - min[0];
  this.size[1] = max[1] - min[1];
  this.size[2] = max[2] - min[2];  
}
