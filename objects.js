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
 * This file contains object constructors used in Berusky 2 WebGL game.
 *
 */

/**
* This class is used for blending.
* It contains all informations needed for blending
* @param geometryObjectIn Model object reference
* @param zValueIn Distance of model form camera
* @param idIn ID of model object
* @param staticIn True for static object and false for dynamic one
* @return new BlendedObject
*/
function BlendedObject(geometryObjectIn, zValueIn, idIn, staticIn){

    /**
    * Reference to the model object
    */
    this.geometryObject = geometryObjectIn;
    
    /**
    * Distance of model form camera
    */
    this.zValue = zValueIn;

    /**
    * ID of model object
    */
    this.id = idIn;

    /**
    * True for static object and false for dynamic one
    */
    this.staticObject = staticIn;
}

/**
* Model class
* Constructs object from JSON data
* @contains name
* @contains material
* @contains vertexNormalBuffer
* @contains vertexTextureCoordBuffer
* @contains vertexDiffuseColorBuffer
* @contains vertexSpecularColorBuffer
* @contains vertexLightmapCoordBuffer
* @contains max
* @contains min
* @contains center
* @contains frontPlaneBuffer
* @contains backPlaneBuffer
* @contains topPlaneBuffer
* @contains rightPlaneBuffer
* @contains bottomPlaneBuffer
* @contains leftPlaneBuffer
* @contains envelopePoints
* @contains vertexIndexBuffer
* @param containerObject JSON array with object data
* @param isItPoly True - Polygon, False - Non-Polygon
*/
function GeometryObject(containerObject, isItPoly) {

    /**
    * Name of object
    */
    this.name = containerObject.name;

    /**
    * Object material 
    */
    this.material = containerObject.material;
    
    /**
    * Vertex Normal Buffer 
    */
    this.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexNormals), gl.STATIC_DRAW);
    this.vertexNormalBuffer.itemSize = 3;
    this.vertexNormalBuffer.numItems = containerObject.vertexNormals.length / 3;

    /**
    * Vertex Texture Coordination Buffer 
    */
    this.vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexTextureCoords0), gl.STATIC_DRAW);
    this.vertexTextureCoordBuffer.itemSize = 2;
    this.vertexTextureCoordBuffer.numItems = containerObject.vertexTextureCoords0.length / 2;

    /**
    * Polygon have addition attributes - they have lightmaps
    */
    if(!isItPoly){

        /**
        * Vertex Diffuse Color Buffer 
        */
        this.vertexDiffuseColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexDiffuseColorBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexDiffuse), gl.STATIC_DRAW);
        this.vertexDiffuseColorBuffer .itemSize = 2;
        this.vertexDiffuseColorBuffer .numItems = containerObject.vertexDiffuse.length / 2;
        
        /**
        * Vertex Specular Color Buffer 
        */
        this.vertexSpecularColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexSpecularColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexSpecular), gl.STATIC_DRAW);
        this.vertexSpecularColorBuffer.itemSize = 2;
        this.vertexSpecularColorBuffer.numItems = containerObject.vertexDiffuse.length / 2;
        
    }
    else if(useLightmaps){
        
        /**
        * Lightmap Texture Coordination Buffer 
        */
        this.vertexLightmapCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexLightmapCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexTextureCoordsLight), gl.STATIC_DRAW);
        this.vertexLightmapCoordBuffer.itemSize = 2;
        this.vertexLightmapCoordBuffer.numItems = containerObject.vertexTextureCoordsLight.length / 2;
        
    }

    /** 
    * Vertex Position Buffer 
    */
    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(containerObject.vertexPositions), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = containerObject.vertexPositions.length / 3;

    /**
    * Original vertex positions
    */
    this.originalVertexPositions = new Float32Array(containerObject.vertexPositions);

    /**
    * Original indices
    */
    this.originalIndices = new Uint16Array(containerObject.indices);

    /**
    * Maximal values in x, y and z axis
    */
    this.max = [0, 0, 0];

    /**
    * Minimal values in x, y and z axis
    */
    this.min = [0, 0, 0];

    if(log){

        console.log("Loading "+ this.name);
    }

    /**
    * Creating envelope - getting maximal and
    * minimal values in all axis
    */
    var index = 0;
    for(index; index < this.originalIndices.length; index++){

        var indexInVertexPositions = this.originalIndices[index] * 3;
        var vertexPositionInAxisX = this.originalVertexPositions[indexInVertexPositions];
        var vertexPositionInAxisY = this.originalVertexPositions[indexInVertexPositions + 1];
        var vertexPositionInAxisZ = this.originalVertexPositions[indexInVertexPositions + 2];


        if(vertexPositionInAxisX > this.max[0]){
            this.max[0] = vertexPositionInAxisX;
        }
        else if(vertexPositionInAxisX < this.min[0]){
            this.min[0] = vertexPositionInAxisX;
        }

        if(vertexPositionInAxisY > this.max[1]){
            this.max[1] = vertexPositionInAxisY;
        }
        else if(vertexPositionInAxisY < this.min[1]){
            this.min[1] = vertexPositionInAxisY;
        }

        if(vertexPositionInAxisZ > this.max[2]){
            this.max[2] = vertexPositionInAxisZ;
        }
        else if(vertexPositionInAxisZ < this.min[2]){
            this.min[2] = vertexPositionInAxisZ;
        }

    }

    /** 
    * Creating center of object
    */
    this.center = [];
    this.center[0] = this.max[0] - this.min[0];
    this.center[1] = this.max[1] - this.min[1];
    this.center[2] = this.max[2] - this.min[2]; 

    this.centerBackup = [];
    
    /**
    * Backs up center of object when using some
    * transformation over the original one
    */
    this.backupCenter = function(){

        this.centerBackup[0] = this.center[0];
        this.centerBackup[1] = this.center[1];
        this.centerBackup[2] = this.center[2];

    }

    /**
    * Restores center of object
    */
    this.centerRestore = function(){

        this.center[0] = this.centerBackup[0];
        this.center[1] = this.centerBackup[1];
        this.center[2] = this.centerBackup[2];
    }

    /**
    * Creating Bounding Box of object
    */
    // FRONT PLANE
    var frontPlane = [ 
        this.max[0], this.max[1], this.min[2],
        this.max[0], this.min[1], this.min[2],
        this.min[0], this.max[1], this.min[2],   
        this.min[0], this.min[1], this.min[2]
    ]

    // Front plane buffer
    this.frontPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.frontPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(frontPlane), gl.STATIC_DRAW);
    this.frontPlaneBuffer.itemSize = 3;
    this.frontPlaneBuffer.numItems = 4;

    // TOP PLANE 
    var topPlane = [
        this.max[0], this.max[1], this.min[2],
        this.min[0], this.max[1], this.min[2],   
        this.max[0], this.max[1], this.max[2],
        this.min[0], this.max[1], this.max[2]
    ]

    // Top Plane buffer
    this.topPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.topPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(topPlane), gl.STATIC_DRAW);
    this.topPlaneBuffer.itemSize = 3;
    this.topPlaneBuffer.numItems = 4;

    // RIGHT PLANE
    var rightPlane = [
        this.max[0], this.max[1], this.min[2],
        this.max[0], this.max[1], this.max[2],
        this.max[0], this.min[1], this.min[2],
        this.max[0], this.min[1], this.max[2]
    ]

    // Right plane buffer
    this.rightPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.rightPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rightPlane), gl.STATIC_DRAW);
    this.rightPlaneBuffer.itemSize = 3;
    this.rightPlaneBuffer.numItems = 4;

    // LEFT PLANE
    var leftPlane = [
        this.min[0], this.max[1], this.min[2],   
        this.min[0], this.max[1], this.max[2], 
        this.min[0], this.min[1], this.min[2],   
        this.min[0], this.min[1], this.max[2]
    ]

    // Left plane buffer
    this.leftPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.leftPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(leftPlane), gl.STATIC_DRAW);
    this.leftPlaneBuffer.itemSize = 3;
    this.leftPlaneBuffer.numItems = 4;

    // BACK PLANE
    var backPlane = [  
        this.min[0], this.max[1], this.max[2],  
        this.min[0], this.min[1], this.max[2],
        this.max[0], this.max[1], this.max[2],  
        this.max[0], this.min[1], this.max[2]
    ]

    // Back plane buffer
    this.backPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backPlane), gl.STATIC_DRAW);
    this.backPlaneBuffer.itemSize = 3;
    this.backPlaneBuffer.numItems = 4;

    // BOTTOM PLANE
    var bottomPlane = [  
        this.min[0], this.min[1], this.max[2],
        this.max[0], this.min[1], this.max[2],
        this.min[0], this.min[1], this.min[2],
        this.max[0], this.min[1], this.min[2],
    ]

    // Bottom plane buffer
    this.bottomPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bottomPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottomPlane), gl.STATIC_DRAW);
    this.bottomPlaneBuffer.itemSize = 3;
    this.bottomPlaneBuffer.numItems = 4;

    /**
    * Envelope is created from 8 vertices
    * as shown below
    */
    this.envelopePoints = [

    /*
              6____________7
              /|          /|
             / |         / |
            /__|________/  |
          2 |  |        |3 |
            |  |        |  |
            | 5|________|_ |8
            | /         |  /
            |/          | /
            |           |/
          1 _____________ 4

    */

        // 1
        [this.min[0], this.min[1], this.max[2]],
        
        // 2
        [this.min[0], this.max[1], this.max[2]],

        // 3
        [this.max[0], this.max[1], this.max[2]],

        // 4
        [this.max[0], this.min[1], this.max[2]],

        // 5
        [this.min[0], this.min[1], this.min[2]],

        // 6
        [this.min[0], this.max[1], this.min[2]],

        // 7
        [this.max[0], this.max[1], this.min[2]],

        // 8
        [this.max[0], this.min[1], this.min[2]]

    ]

    /**
    * Vertex Index Buffer 
    */
    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(containerObject.indices), gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    this.vertexIndexBuffer.numItems = containerObject.indices.length;
}

/**
* Container class.
* Serves as envelope for related models
* @contains name
* @contains id
* @contains objects
* @contains isItPoly
* @contains polyID
* @param container JSON array with container definition
* @return new GeometryContainer
*/
function GeometryContainer(container) {

    /**
    * Container name
    */
    this.name = container["name"];
    
    /**
    * Container ID - used only for dynamic containers
    * static containers always -1
    */
    this.id = parseInt(container["container_id"]);
    
    /**
    * GeometryObjects in container
    */
    this.objects = [];

    /**
    * Indicates whether this container is part of game field
    */
    this.gameField = parseInt(container["prvek"]);
    
    /**
    * Indicates whether this is polygon container
    * Polygons have lightmaps
    */
    this.isItPoly = false;
    this.polyID = -1;
    if(container["type"] == "geometry_container_poly"){
        this.isItPoly = true;
        this.polyID = container["poly_id"];
    }

    /* Pruchod objektu v kontejneru a vytvareni odpovidajicich objektu a jejich naplneni */
    /* Objekty jsou v poli identifikovany cislem, ktere urcuje poradi, ve kterem byli nacteny */

    /**
    * Loading of all models inside container and
    * creating new GeometryObject objects with those models.
    * Objects are indexed by their order.
    */
    var containerObjectCounter = 0;
    for (containerObject in container["geometry_objects"]) {

        // Adding new GeometryObject
        this.objects[containerObjectCounter] = new GeometryObject(container["geometry_objects"][containerObject], this.isItPoly);
        containerObjectCounter++;
    }
}

/**
* Object reprezenting light in the scene
* @param structure JSON light array
* @return new Light object
*/
function Light( structure ){
	
	/**
    * Light name
    */
	this.name = structure["name"];
	
	/**
    * Light position [x, y, z]
    */
	this.position = structure["position"];
	
	/**
    * Lights diffuse color
    */
	this.diffuseColor = structure["diffuse_color"];
	
	/**
    * Intensity inhibition
    */
	this.coeficients = structure["coeficients"];
	
	/**
    * Maximal range that is affected by light
    */
	this.maxRange = structure["max_range"];
}	

/**
* Lightmap class
* @contains id
* @contains path
* @contains lightmap
* @param id ID of lithtmap
* @param path Path to lightmap
* @return new Lightmap object
*/
function Lightmap(id, path) {
	
    /**
    * ID of lightmap
    */
	this.id = id;
	
    /** 
    * Path to lightmap image
    */
    this.path = path + "/lightmap_" + id + lightmapFileType;
	
    /**
    * Lightmap texture buffer
    */
	this.lightmap = gl.createTexture();
	
    /** 
    * Lightmap image
    */
    this.lightmap.image = new Image();
	
    // Saving this reference for onload function	
	var that = this;
	
    // Settings onload handler
	this.lightmap.image.onload = function() {
		
        //TODO
        if(!that.lightmap.image) return;

        /**
        * There is different coordination system in WebGL, so every
        * texture has to be fliiped aroud Y axis.
        * Point [0, 0] is top left corner of texture.
        */
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // You have to bind texture before working with it
		gl.bindTexture(gl.TEXTURE_2D, that.lightmap);

        // Loading texture into GPU
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.lightmap.image); 

        // Magnify filtering - how texture acts when being upscaled
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // How texture acts when being downscaled
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

        // Mipmap generation - diffent textures for different camera distance
		gl.generateMipmap(gl.TEXTURE_2D); 
		
        // Unbind
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	try{

        // Settings path to lightmap
		this.lightmap.image.src = this.path;
	}
	catch(e){
		;
	}	
}

/**
* Material class
* Loads information about material from JSON file,
* loads image from server a creates texture buffers.
* @contains name
* @contains blending
* @contains textures
* @param structure JSON array with material definition
* @return new Material object
*/
function Material(structure) {

    /**
    * Material name
    */
    this.name = structure["name"];

    /**
    * Incates whether use blending or not on this material
    */
    this.blending = false;

    // Blening is used only for this texture...little hack
    if(this.name == "8_voda1"){
        this.blending = true;
    }

    /**
    * Texture array
    */
    this.textures = [];

    /**
    * Loading textures from JSON file and server one by one
    */
    for (texture in structure["textures"]) {

        // Texture buffer
        this.textures[texture] = gl.createTexture();

        // Texture image
        this.textures[texture].image = new Image();
        
        // Context preservation
        var that = this;
        var temp = texture;

        this.textures[texture].image.onload = function() {

            /**
            * There is different coordination system in WebGL, so every
            * texture has to be fliiped aroud Y axis.
            * Point [0, 0] is top left corner of texture.
            */
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            // You have to bind texture before working with it
            gl.bindTexture(gl.TEXTURE_2D, that.textures[temp]); 

            // Loading texture into GPU
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.textures[temp].image);

            // Magnify filtering - how texture acts when being upscaled
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // How texture acts when being downscaled
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

            // Mipmap generation - diffent textures for different camera distance
            gl.generateMipmap(gl.TEXTURE_2D);

            // Unbind
            gl.bindTexture(gl.TEXTURE_2D, null);

            // Actualization of progressbar
            textureLoaded();
        }

        // Asynchronous image load
        this.textures[texture].image.src = "./textures/" + structure["textures"][texture];
        textureCount++;
    }
}

/**
* Zero logic item class
* used when deletening some item from
* logic representation
* @contains itemClass
* @contains itemSubClass
* @contains position 
* @return new ZeroItem object
*/
function ZeroItem() {

    /**
    * Class
    */
    this.itemClass = 0;

    /**
    * Sub Class
    */
    this.itemSubclass = 0;

    /**
    * Position
    */
    this.position = [0, 0, 0];
}