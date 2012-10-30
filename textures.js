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

/* List of global textures
 */
var globalTextures = Array();

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

/* Load texture to given position
 */
function loadTexture(file, position) {
    globalTextures[position] = gl.createTexture();
    globalTextures[position].image = new Image();
    globalTextures[position].image.onload = function () {
        handleLoadedTexture(globalTextures[position])
    }
    globalTextures[position].image.src = file;
}
