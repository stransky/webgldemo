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

// Muj globalni objekt se vsupem z klavesnice/mysi
const BUTTON_FIRST = 0;
const BUTTON_MIDDLE = 1;
const BUTTON_SECOND = 2;
const BUTTON_WHEEL_UP = 4;
const BUTTON_WHEEL_DOWN = 5;

var control = new Object();
control.keys = new Array(); // pole stisknutych klaves
control.mouse = new Object(); // Stav mysi
control.mouse.mx = 0;
control.mouse.my = 0;
control.mouse.last_mx = 0;
control.mouse.last_my = 0;
control.mouse.buttons = new Array();


function calcMouse() {
  control.mouse.dx = control.mouse.mx - control.mouse.last_mx;
  control.mouse.dy = control.mouse.my - control.mouse.last_my;
/*    
  dump("\n*******************************************\n");
  
  dump("control.mouse.mx = " + control.mouse.mx + "\n");
  dump("control.mouse.my = " + control.mouse.my + "\n");
  
  dump("control.mouse.last_mx = " + control.mouse.last_mx + "\n");
  dump("control.mouse.last_my = " + control.mouse.last_my + "\n");
  
  dump("control.mouse.dx = " + control.mouse.dx + "\n");
  dump("control.mouse.dy = " + control.mouse.dy + "\n");
*/    
  control.mouse.last_mx = control.mouse.mx;
  control.mouse.last_my = control.mouse.my;
}

function saveMouse() {
  control.mouse.last_buttons = control.mouse.buttons;
}

// Klavesy jsou definovane jako KeyEvent.DOM_VK_* konstanty
// https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
function handleKeyDown(event) {
  control.keys[event.keyCode] = true;
}
function handleKeyUp(event) {
  control.keys[event.keyCode] = false;
}

// Vstup udalosti z mysi
// https://developer.mozilla.org/en-US/docs/DOM/MouseEvent
// event.screenX, event.screenY - globalni souradnice
// event.clientX, event.clientY - lokalni souradnice (canvas)
// event.button  - Left button=0, middle button=1, right button=2.
// event.buttons - Left button=0, middle button=1 (if present), right button=2.
//                 Middle (wheel) button=4,5
function handleMouse(event) {
  control.mouse.mx = event.clientX;
  control.mouse.my = event.clientY;
}

function handleMouseButtonDown(event) {
  if(event.buttons|1)
    control.mouse.buttons[BUTTON_FIRST] = 1;
  if(event.buttons|2)
    control.mouse.buttons[BUTTON_SECOND] = 1;
  if(event.buttons|4)
    control.mouse.buttons[BUTTON_MIDDLE] = 1;
}

function handleMouseButtonUp(event) {
  if(event.buttons|1)
    control.mouse.buttons[BUTTON_FIRST] = 0;
  if(event.buttons|2)
    control.mouse.buttons[BUTTON_SECOND] = 0;
  if(event.buttons|4)
    control.mouse.buttons[BUTTON_MIDDLE] = 0;
}

function inputInit() {
  var canvas = document.getElementById("webgl-canvas");
  
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;    
  
  canvas.onmousedown = handleMouseButtonDown;
  document.onmouseup = handleMouseButtonUp;
  document.onmousemove = handleMouse;
}

function handleKeyboardInput() {
}
