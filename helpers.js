/**
 * @file
 * @author Martin Knapovsky <xknapo02@stud.fit.vutbr.cz>
 * @version 1.0
 *
 * @section LICENSE
 *
 * Copyright (c) 2012, Martin Knapovsky
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *    This product includes software developed by the Martin Knapovsky.
 * 4. Neither the name of the Martin Knapovsky nor the
 *    names of its contributors may be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY MARTIN KNAPOVSKY ''AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MARTIN KNAPOVSKY BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @section DESCRIPTION
 *
 * This file contains additional functions used in Berusky 2 WebGL game.
 *
 */
var MAX_NUMBER = Number.MAX_VALUE;

/**
* Determines if GUID belongs to static or dynamic object
* @param guid GUID attribute of object
* @return If object is static then true, else false
*/
function isObjectStatic( guid ){
	
	var itemClass = Math.floor(guid / 1000);
	
	return (itemClass == 2 || itemClass == 9 || itemClass == 17 || itemClass == 19 || itemClass == 20 || itemClass == 12 || itemClass == 4);
}

/** 
* Determines if GUID belong to bug 
* @param guid GUID attribute of object
* @return true if guid belongs to bug, else false
*/
function isObjectBug( guid ){
	
	var itemClass = Math.floor(guid / 1000);
	
	return (itemClass == 1);
}
	
/**
* Sort helper.
* Sorts objects by distance from camera.
* FAR -> CLOSE
*/
function sortObjectsByZOrder(object1, object2){

    if(object1.zValue < object2.zValue){

        return 1;
    }
    else{

        return -1;
    }

}

/**
* Convert degrees into radians
* @param degrees Angle in deg.
* @return Angle in radians
*/
function degToRad(degrees) {

    return degrees * Math.PI / 180;
}

/**
* Clones object 
* @param obj Object
* @return Copied object
*/
function clone(obj){

    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    // Copy it key by key
    for(var key in obj)
        temp[key] = clone(obj[key]);

    return temp;
}

function toArray(strg){
    strg = strg.replace(/left|top/g,'0px');
    strg = strg.replace(/right|bottom/g,'100%');
    strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
    var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
    return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
}

function getMax(a,b) {
    if(a > b)
      return a;
    else
      return b;
}

function getMin(a,b) {
    if(a < b)
      return a;
    else
      return b;
}

function getCenter(min,max) {
  return (min + (max-min)/2);
}
