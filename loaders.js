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
 * This file contains functions for loading levels and textures in 
 * Berusky 2 WebGL game.
 *
 */

useLightmaps = 0;

/**
* Handles JSON file
* Creates objects from this file
* @param inputJSON JSON file
*/
function handleLoadedJSON(inputJSON) {

    var i;
    var j = 0;
    var staticObjectsNum = 0;
    var dynamicObjectsNum = 0;
    lightsNum = 0;

    // Loading JSON file
    for (structure in inputJSON) {

        // Container
        if ((inputJSON[structure].type == "geometry_container" || 
             inputJSON[structure].type == "geometry_container_poly") && 
             !(parseInt(inputJSON[structure].hierarchy_level) > 0)) {
            
            // Dynamic container
            if (inputJSON[structure]["container_id"] != -1) {                
                scene.dynamicObjects[inputJSON[structure]["container_id"]] = new GeometryContainer(inputJSON[structure]);
                dynamicObjectsNum++;
            } 
            // Static container
            else {                
                scene.staticObjects[staticObjectsNum] = new GeometryContainer(inputJSON[structure]);
                staticObjectsNum++;
            }
        } 
        // Material
        else if (inputJSON[structure].type == "material") {

            // Create material object
            scene.materials["" + inputJSON[structure].name] = new Material(inputJSON[structure]);
        } 
        // Level logic
        else if (inputJSON[structure].type == "level_logic") {

            // Create logic object
            scene.logic = new Logic(inputJSON[structure]);

        }
        // Light
        else if(inputJSON[structure].type == "light"){

            // Create light object
            scene.lights.push(new Light(inputJSON[structure]));
            scene.lightsNum++;
        }
    }
    
    var lightning = true;
    //gl.uniform1i(shaderProgram.useLightingUniform, lightning);
    
    // Create light
    var light = {
        "type" : "light",
        "name" : "Svetlo 0",
        "position" : [ scene.logic.centerX, 0, scene.logic.centerZ],
        "diffuse_color" : [ 0.8, 0.8, 0.8],
        "coeficients" : [ 0.000000, 0.250000, 0.000000],
        "max_range" : "5.000000"
    }
    scene.lights[0] = new Light( light );
    
    // Set lightning
    if (lightning) {
/*
        gl.uniform3f(shaderProgram.ambientColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
        gl.uniform3f(shaderProgram.pointLightingLocationUniform, lights[0].position[0], lights[0].position[1], lights[0].position[2]);
        gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
        gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
*/        
    }

    // Create selected bug texture
    var selectedBugTexture = {

      "type" : "material",
      "name" : "beruska_chosen",
      "transparent" : "0",
      "z_buffer_mask" : "1",
      "z_buffer_test" : "1",
      "backface_culling" : "0",
      "diffuse_color" : "1",
      "specular_color" : "0",
      "textures" : [ "256_beruska1_chosen.jpg" ]
    }

    scene.materials[selectedBugTexture.name] = new Material(selectedBugTexture);

    // Create floor texture
    var floorTexture = {

      "type" : "material",
      "name" : "floor_texture",
      "transparent" : "0",
      "z_buffer_mask" : "1",
      "z_buffer_test" : "1",
      "backface_culling" : "0",
      "diffuse_color" : "1",
      "specular_color" : "0",
      "textures" : [ "floor_metal.jpg" ]
    }

    scene.staticObjectsNum = staticObjectsNum;
    scene.dynamicObjectsNum = dynamicObjectsNum;

    scene.materials[floorTexture.name] = new Material(floorTexture);
    scene.sizeCalc();
    
    cameraCenter(scene.center, scene.size);

    console.log("Loaded static objects = " + scene.staticObjectsNum + "\n");
    console.log("Loaded dynamic objects = " + scene.dynamicObjectsNum + "\n");
    console.log("Scene center = " + scene.center + "\n");
    console.log("Scene size = " + scene.size + "\n");
}

/**
* Loads level specified in selectedLevel variable
*/
function loadScene(file) {
    
    // Load level from server
    var request = new XMLHttpRequest();
    request.open("GET", file);
    // Set handle
    request.onreadystatechange = function() {        
      if (request.readyState == 4) {            
        // Load JSON file
        handleLoadedJSON(JSON.parse(request.responseText));
      }
    }

    // Make request
    request.send();
}
