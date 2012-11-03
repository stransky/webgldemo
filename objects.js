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
* @contains size
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
    * Vertex Index Buffer 
    */
    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(containerObject.indices), gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    this.vertexIndexBuffer.numItems = containerObject.indices.length;

    /** 
    * Creating center of object
    */
    this.size = [];
    this.size[0] = this.max[0] - this.min[0];
    this.size[1] = this.max[1] - this.min[1];
    this.size[2] = this.max[2] - this.min[2];
    
    this.center = [];
    this.center[0] = getCenter(this.min[0], this.max[0]);
    this.center[1] = getCenter(this.min[1], this.max[1]);
    this.center[2] = getCenter(this.min[2], this.max[2]);
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

    /* Size and center attributes
    */
    this.center = [];
    this.size = [];
    this.min = [];
    this.max = [];
    
    this.sizeCalc = function() {      
      var min = [ MAX_NUMBER, MAX_NUMBER, MAX_NUMBER ];
      var max = [-MAX_NUMBER,-MAX_NUMBER,-MAX_NUMBER ];
    
      for (i in this.objects) {                
        min[0] = getMin(min[0], this.objects[i].min[0]);
        min[1] = getMin(min[1], this.objects[i].min[1]);
        min[2] = getMin(min[2], this.objects[i].min[2]);
        
        max[0] = getMax(max[0], this.objects[i].max[0]);
        max[1] = getMax(max[1], this.objects[i].max[1]);
        max[2] = getMax(max[2], this.objects[i].max[2]);
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
    
    this.sizeCalc();
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
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            // Mipmap generation - diffent textures for different camera distance
            gl.generateMipmap(gl.TEXTURE_2D);

            // Unbind
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        // Asynchronous image load
        this.textures[texture].image.src = "./textures/" + structure["textures"][texture];
        //textureCount++;
        
        console.log("Texture = " + this.textures[texture].image.src + "\n");
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
