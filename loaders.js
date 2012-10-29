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

/**
* Callback called when texture has been loaded
* Updates loading progress bar
*/
function textureLoaded(){

    // Next texture
    loadedTextureCount++;

    // New progressbar value
    var value = (loadedTextureCount / textureCount) * 100;
    $("#progressbar").progressbar({

        value: (loadedJSONValue + value)
    });

    // When fully loaded, hide progressbar
    if(loadedTextureCount == textureCount){

        $("#progressbar").stop().animate({'opacity':'0.0'}, 400);
        $("#notification").animate({'opacity':'0.0'}, 400);

        // Level loaded
        loaded = true;

        showTime = false;
    }
}

/** 
* Handles loaded texture...as expected :D
* Creates texture buffers, sets filtering, ...
* @param texture Texture object including texture image
*/
function handleLoadedTexture(texture) {

    /**
    * There is different coordination system in WebGL, so every
    * texture has to be fliiped aroud Y axis.
    * Point [0, 0] is top left corner of texture.
    */
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // You have to bind texture before working with it
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Loading texture into GPU
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    // Magnify filtering - how texture acts when being upscaled
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 

    // How texture acts when being downscaled
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    // Mipmap generation - diffent textures for different camera distance
    gl.generateMipmap(gl.TEXTURE_2D);

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
* Handles JSON file
* Creates objects from this file
* @param inputJSON JSON file
*/
function handleLoadedJSON(inputJSON) {

    if(log){
        console.log("handling");
    }

    var i;
    var j = 0;
    var textureCounter = 0;
    var staticObjectsCounter = 0;
    var materialsCounter;

    // Loading JSON file
    for (structure in inputJSON) {

        // Container
        if ((inputJSON[structure].type == "geometry_container" || 
             inputJSON[structure].type == "geometry_container_poly") && 
             !(parseInt(inputJSON[structure].hierarchy_level) > 0)) {

            // Poly container
            if(inputJSON[structure].type == "geometry_container_poly"){
                
                // Using lightmaps
                if(useLightmaps){

                    try{
                            var polyID = parseInt(inputJSON[structure].poly_id);
                            // Load lightmap
                            lightmaps[polyID] = (new Lightmap(polyID, (lightmapPath + selectedLevel)));
                    }
                    catch(error){
                        ;
                    }
                }
            }
            
            // Dynamic container
            if (inputJSON[structure]["container_id"] != -1) {

                // Create dynamic item object
                dynamicObjects[inputJSON[structure]["container_id"]] = new GeometryContainer(inputJSON[structure]);
            } 
            // Static container
            else {

                // Create static item object
                staticObjects[staticObjectsCounter] = new GeometryContainer(inputJSON[structure]);
                staticObjectsCounter++;
            }
        } 
        // Material
        else if (inputJSON[structure].type == "material") {

            // Create material object
            materials["" + inputJSON[structure].name] = new Material(inputJSON[structure]);
        } 
        // Level logic
        else if (inputJSON[structure].type == "level_logic") {

            // Create logic object
            logic = new Logic(inputJSON[structure]);

        }
        // Light
        else if(inputJSON[structure].type == "light"){

            // Create light object
            lights.push(new Light(inputJSON[structure]));
        }
    }
    
    var lightning = true;
    gl.uniform1i(shaderProgram.useLightingUniform, lightning);
    
    // Create light
    var light = {
        "type" : "light",
        "name" : "Svetlo 0",
        "position" : [ logic.centerX, 0, logic.centerZ],
        "diffuse_color" : [ 0.8, 0.8, 0.8],
        "coeficients" : [ 0.000000, 0.250000, 0.000000],
        "max_range" : "5.000000"
    }
    lights[0] = new Light( light );
    
    // Set lightning
    if (lightning) {
        gl.uniform3f(shaderProgram.ambientColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
        gl.uniform3f(shaderProgram.pointLightingLocationUniform, lights[0].position[0], lights[0].position[1], lights[0].position[2]);
        gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
        gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, lights[0].diffuseColor[0], lights[0].diffuseColor[1], lights[0].diffuseColor[2]);
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

    materials[selectedBugTexture.name] = new Material(selectedBugTexture);

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

    materials[floorTexture.name] = new Material(floorTexture);
    
    // START DRAWING
    tick();

    // Start FPS showing
    if(showFPSinConsole){
        if(fpsTimeoutID != 0){
            clearTimeout(fpsTimeoutID);
        }
        fpsTimeoutID = setTimeout(showFPS, 1000);  
    }

}


/**
* This function is called when JSON file loaded
* Updates loading progress bar
*/
function jsonLoaded(){

    if(log){
        console.log('json loaded');
    }

    $("#progressbar").progressbar({
        value: loadedJSONValue
    });

    $("#gameProgress").progressbar({
        value: 0
    });

    resetUiInventory();  
    //logicBackup = clone(logic);

    draw = true;

}

/**
* Loads level specified in selectedLevel variable
*/
function loadLevel() {
    
    loaded = false;

    // Loading notification
    notificationAnimation('loading');
    $("#progressbar").progressbar({value: 0}).stop().css({'opacity':'0.0'}).animate({'opacity':'1.0'}, 400);

    // Load level from server
    var request = new XMLHttpRequest();
    request.open("GET", levelPath + selectedLevel + levelFileType);
    // Set handle
    request.onreadystatechange = function() {
        
        if (request.readyState == 4) {
            
            // Load JSON file
            handleLoadedJSON(JSON.parse(request.responseText));

            // JSON loaded
            jsonLoaded();

            // Select Bug
            logic.selectNextBug();

            // Do correntions
            corrections();

        }
    }

    // Make request
    request.send();
}

/**
* Restart of level
*/
function reloadLogic() {

    logic.selectNextBug();
    loadLevel();
}

/**
* Restarts game level
*/
function reloadLevel(){

    draw = false;

    logic = [];
    dynamicObjects = [];
    staticObjects = [];

    loadLevel();  
}