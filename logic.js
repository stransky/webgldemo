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
 * This file contains logic object constructors used in Berusky 2 WebGL game.
 *
 */

/**
* Logic item class
* Used for representation of item in game field
* @contains name
* @contains guid
* @contains itemClass
* @contains itemSubclass
* @contains position
* @contains direction
* @contains vitamin
* @contains weight
* @contains snorchl
* @contains rotation
* @contains id
* @contains polyID
* @param structure JSON array with item definition
* @return new Logic item object
*/
function LogicItem(structure) {

    /**
    * Item name
    */
    this.name = structure["name"];
    /**
    * Item GUID for various tests
    */
    this.guid = parseInt(structure["guid"]);
    /**
    * Item Class
    * Defines type of logic object
    *
    * Classes and several subclassed:
    * -------------------------------
    * 0. Nothing
    * 1. Bug
    * 2. Wall
    * 3. Nothing
    * 4. Exit
    * 5. Box
    * 6. Explosive
    * 7. Stone
    * 8. Doors
    * 9. Teleport
    * 10. Button
    * 11. Elevator
    * 12. Water
    * 13. Item
    *   0 Snorkel
    *   1 Backpack
    *   2 Nothing
    *   3 Food
    *   4 Dynamite
    *   5 Vitamine
    *   6 Light
    *   7 Weight
    *   8 Pickaxe
    * 14. Nothing
    * 15. Sinking floor
    * 16. Nothing
    * 17. Nothing
    * 18. Nothing
    * 19. Inclined floor
    * 20. Nothing
    * 21. Invisible wall
    */
    this.itemClass = parseInt(structure["class"]);
    /**
    * Item subclass
    * Detail of item class
    * For example - Box
    *   Light box - subclass 1
    *   Heavy box - subclass 0
    */
    this.itemSubclass = parseInt(structure["subclass"]);
    /**
    * Position of item in game field
    * [x, y, z]
    */
    this.position = structure["position"];
    /**
    * Rotation of item
    * Used for inclined floor
    */
    this.rotation = parseInt(structure["rotation"]);
    /**
    * ID of item
    * Used for connection between
    * model and logic
    */
    this.id = parseInt(structure["container_id"]);
    /**
    * Not used yet
    */
    this.polyID = -1;
    if(structure["poly_id"]){
        this.polyID = parseInt(structure["poly_id"]);
    }

    /** ONLY FOR BUGS **/

    /**
    * Direction of bug
    */
    this.direction = "left";
    /**
    * Indicates whether bug has vitamin
    * in inventory.
    */
    this.vitamin = false;
    /**
    * Indicates whether bug has additional
    * weight in inventory
    */
    this.weight = false;
    /**
    * Indicates whether bug has snorkel
    * in inventory.
    */
    this.snorchl = false;
}

/**
* Logic representation class
* Contains all game logic
* Contains variables for setting
* game behaviour
* @param structure JSON object with logic definition
* @return new Logic object
*/
function Logic(structure) {

    /** 
    *  Game Field Scheme 
    *        6x6
    *                x
    *   |x|x|x|x|x|x|5
    *   |x|x|x|x|x|x|4
    *   |x|x|x|x|x|x|3
    *   |x|x|x|x|x|x|2
    *   |x|x|x|x|x|x|1
    *   |x|x|x|x|x|x|0
    *<-z|5|4|3|2|1|0|
    */

    /** 
    * Bug Rotation
    * Corresponds with Game Field Scheme above
    *        
    *   o-> "right"
    *   <-o "left"
    *    ^  "up"
    *    v  "down"    
    */
        
    /*-------------------------*/   
    /* LOADING FROM JSON FILE  */
    /*-------------------------*/
    
    /**
    * This variable is set when
    * the player wins
    */
    this.gameOver = false;
    /**
    * Game field size in axis X
    */
    this.sizeX = structure["logic_level_size"][0];
    /**
    * Game field size in axis Y
    */
    this.sizeY = structure["logic_level_size"][1];
    /**
    * Game field size in axis Z
    */
    this.sizeZ = structure["logic_level_size"][2];
    /**
    * Level start coordinates
    * Used for moving dynamic object to its place
    */
    this.startX = structure["level_start"][0];
    this.startY = structure["level_start"][1];
    this.startZ = structure["level_start"][2];

    /**
    * Size of logic item in game field
    * Usually equal to 2
    */
    this.itemSize = parseInt(structure["item_size"]);

    /** CREATION OF FLOOR FOR GAME FIELD TYPE OF RENDERING **/ 
    /**----------------------------------------------------**/

    /** 
    * Array of 4 floor vertices
    * Each vertex defined as [x, y, z]
    */
    this.floorPlane = [];

    var X = 0 - this.itemSize/2;
    var Y = 0;
    var Z = 0 + this.itemSize/2;

    var floorRightX = X;
    var floorLeftX = X + this.sizeX * this.itemSize;

    var floorY = Y;

    var floorBackZ = Z;
    var floorFrontZ = Z - this.sizeZ * this.itemSize;

    // Adding vertices
    this.floorPlane[0] = [floorRightX, floorY, floorBackZ];
    this.floorPlane[1] = [floorRightX, floorY, floorFrontZ];
    this.floorPlane[2] = [floorLeftX, floorY, floorFrontZ];
    this.floorPlane[3] = [floorLeftX, floorY, floorBackZ];

    /**
    * Array for plane buffer creation
    */
    this.floorPlaneArray = [  
        
        this.floorPlane[3][0], this.floorPlane[3][1], this.floorPlane[3][2],
        this.floorPlane[2][0], this.floorPlane[2][1], this.floorPlane[2][2],
        this.floorPlane[0][0], this.floorPlane[0][1], this.floorPlane[0][2],
        this.floorPlane[1][0], this.floorPlane[1][1], this.floorPlane[1][2]

    ]

    /**
    * Floor plane buffer
    */
    this.floorPlaneBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorPlaneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.floorPlaneArray), gl.STATIC_DRAW);
    this.floorPlaneBuffer.itemSize = 3;
    this.floorPlaneBuffer.numItems = 4;

    /**
    * Texture coord for floor plane buffer
    */
    this.floorPlaneTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorPlaneTextureCoordBuffer);
    var textureCoords = [

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    this.floorPlaneTextureCoordBuffer.itemSize = 2;
    this.floorPlaneTextureCoordBuffer.numItems = 4;

    /**
    * Central point of game field
    * Used for camera
    */
    this.centerX = - this.startX - (this.sizeX/2)*this.itemSize;
    this.centerY = this.startY + (this.sizeY/2)*this.itemSize;
    this.centerZ = this.startZ + (this.sizeZ/2)*this.itemSize;

    /**
    * Items in the game scene
    * Only for information - not used
    */
    this.itemCount = parseInt(structure["level_items_num"]);
    
    /** 
    * Bug strength
    * Default = 2
    */
    this.bugStrength = 2;

    /**
    * Durability of sinking floor
    * Default = 2
    */
    this.durability = 2;
    
    /**
    * Types of items, that cannot serve as floor
    * for another items.
    */
    this.restrictedStepOver = [1, 2, 4, 8, 12, 13, 16, 17, 21];
    
    /**
    * Static Items of game field
    */
    this.staticItems = [];
    
    /**
    * Dynamic Items of game field
    */
    this.dynamicItems = [];

    /**
    * Loading of static and dynamic items 
    * from JSON file.
    */
    var logicItemCounter = 0;
    for (item in structure["level_items"]) {

        var id = parseInt(structure["level_items"][item]["container_id"]);
        var name = structure["level_items"][item]["name"];

        // Static item
        if (isObjectStatic(structure["level_items"][item]["guid"])) {
            this.staticItems[logicItemCounter] = new LogicItem(structure["level_items"][item]);
            logicItemCounter++;

        }
        // Dynamic item
        else {
            this.dynamicItems[id] = new LogicItem(structure["level_items"][item]);
        }
    }

    /**
    * How many bugs escaped
    */
    this.releasedBugCounter = 0;
    
    /**
    * This array contains IDs of all bugs
    * currently in the game.
    */
    this.bugIDs = [];
    
    /**
    * Bugs inventories
    */
    this.bugInventories = [];
    
    /**
    * Adding bugs to bugIDs array
    */
    var i = 0;
    for (item in this.dynamicItems) {
        
        // Bug = itemClass 1
        if (this.dynamicItems[item].itemClass == 1) {
            
            // Adding bug
            this.bugIDs.push(this.dynamicItems[item].id);
            
            // Adding new inventory
            this.bugInventories[this.dynamicItems[item].id] = [];
        }
    }
    
    /**
    * This variable contains ID of
    * actually selected bug.
    */
    this.selectedBugID = this.bugIDs[0];
    
    /*----------------------------*/
    /* GAME FIELD ITEM SELECTION  */
    /*    Only for debugging      */
    /*----------------------------*/
    
    /**
    * This is used for selecting items of game field
    * Only for debugging
    */
    this.selectedObjectID;
    
    /**
    * Select item of game field
    * @param id ID of item to be selected
    */
    this.selectObject = function(id){

        this.selectedObjectID = id;
    }

    /**
    * Checks whether item with specified id
    * is contained in logic.
    * @param id ID of item
    * @return True - item is part of game field, False item is not part of game field
    */
    this.isItLogicItem = function(id){

        if(this.dynamicItems[id]){

            return true;
        }
        else{

            var i = 0;
            var length = this.staticItems.length;
            for(i; i < length; i++){

                if(this.staticItems[i].id == id){

                    return true;
                }
            }
            return false;
        }
    }
    
    /*-------------------*/
    /*   BUG FUNCTIONS   */
    /*   Not bugged :D   */
    /*-------------------*/
    
    /**
    * Selects bug with specified id
    * @param id ID of bug to be selected
    */
    this.selectBug = function(id) {

        // Bug is painted with red texture
        paintSelectedBugRed = true;

        // Cleaning previous timeout
        if(paintSelectedBugRedTimeoutID != -1){
            clearTimeout(paintSelectedBugRedTimeoutID);
        }

        // Bug will stay red for resetSelectionPainterTime
        paintSelectedBugRedTimeoutID = setTimeout(resetSelectionPainter, resetSelectionPainterTime);

        // Looking for bug's id in bugIDs
        var bugPosition = -1;
        var i = 0;
        for(i; i < this.bugIDs.length; i++){

           if(this.bugIDs[i] == id){
                // Bug found
                bugPosition = i;
                break;
            } 
        }

        //TODO Bug not found
        if(bugPosition == -1) return;

        // Selecting bug and showing his inventory
        this.selectedBugID = id;
        resetUiInventory();
        setUiInventory(id);

        // Showing animation
        if(bugPosition != -1){
            notificationAnimation('bug'+(bugPosition + 1));
        }
        
    }

    /**
    * This function selects bug at desired 
    * position in bugIDs array
    * @param position Position in bugIDs array
    */
    this.selectBugOnPosition = function(position){

        // Position higher than array lenght
        if(position > this.bugIDs.length){

            return;
        }

        // Old - remove this
        var finalPosition;
        if(this.bugIDs.length < position){

            finalPosition = this.bugIDs.length - 1;
        }
        else{

            finalPosition = position - 1;
        }

        // Selecting bug
        this.selectBug(this.bugIDs[finalPosition]);
    }

    /**
    * Selects next bug in bugIDs array.
    * This is used when bug leaves game field.
    */
    this.selectNextBug = function(){

        // Get position of next bug in bugIDs array
        var i = 0;
        for(i; i < this.bugIDs.length; i++){

            if(this.bugIDs[i] || this.bugIDs[i] === 0){

                this.selectBug(this.bugIDs[i]);
                return;
            }
        }
    }

    /**
    * This function checks whether container
    * entered container belongs to bug.
    * Used in draw function for easy access
    * @param containerId Identification of container
    */
    this.isItBug = function(containerId){

        // Bug is itemClass 1
        if(this.dynamicItems[containerId].itemClass == 1){

            return true;
        }
        else{

            return false;
        }
    }

    /**
    * Removes bug from game field.
    * Removes model and logic representation of bug in game field.
    * Updates game progress bar and selects next bug
    * @param id ID of bug to be removed
    */
    this.removeBug = function(id){

        // Finding bug in bugIDs
        var i = 0;
        for(i; i < this.bugIDs.length; i++){

            if(this.bugIDs[i] == id){

                break;
            }
        }

        // Bug not found
        if(i == this.bugIDs.length){
            return;
        }
        // Bug found
        else{
            if(this.releasedBugCounter != this.bugIDs.length){

                // Displaying notification
                notificationAnimation('bugEscaped');
            }

            $("#gameProgress").progressbar({

                // Updating progress bar
                value: ((this.releasedBugCounter / this.bugIDs.length)*100)
            });

            // Removing bug from bugIDs array
            delete this.bugIDs[i];
            // Selecting next bug
            this.selectNextBug();
            // Removing bugs model
            delete this.dynamicItems[id];
            // Removing bugs logic item
            delete dynamicObjects[id];
        }
    }
    
    /*------------------------------------------*/
    /* POMOCNE FUNKCE PRO PRACI S OBJEKTY SCENY */
    /*------------------------------------------*/
    
    /**
    * Helper function.
    * No reference to array, deep copy, new array.
    * @param arrayIn Array to be cloned.
    * @return Clonned array
    */
    this.deepCopy = function(arrayIn) {
        
        var returnArray = [];
        var i = 0;

        // Copying item by item
        for (i = 0; i < arrayIn.length; i++) {

            returnArray[i] = arrayIn[i];
        }
        return returnArray;
    }

    /* TODO tohle predelat tak, aby to vracelo referenci na vyhledavany objekt */
    /**
    * This function acquires itemClass property from
    * game item at selected position
    * @param position Position of object 
    * @return itemClass property of object
    */
    this.getItemClass = function(position) {

        var nextStepObjectType = -1;

        // Looking for item in staticItems
        for (object in this.staticItems) {

            if (this.staticItems[object].position[0] == position[0] && 
                this.staticItems[object].position[1] == position[1] && 
                this.staticItems[object].position[2] == position[2]) {
                
                // Item found
                nextStepObjectType = this.staticItems[object].itemClass;
            }
        }

        // Looking for item in dynamicItems
        if (nextStepObjectType == -1) {

            for (object in this.dynamicItems) {

                if (this.dynamicItems[object].position[0] == position[0] && 
                    this.dynamicItems[object].position[1] == position[1] && 
                    this.dynamicItems[object].position[2] == position[2]) {

                    // Item found
                    nextStepObjectType = this.dynamicItems[object].itemClass;
                }
            }
        }

        return nextStepObjectType;
    }
    
    /**
    * Acquires reference to object on selected position.
    * Used extensively.
    * @param position Position of requested object
    * @return Reference to object at selected position
    */
    this.getObjectOnPosition = function(position) {
        
        if(this.isPositionOutside(position)){

            return 0;
        }
        
        // Looking for item in staticItems
        for (object in this.staticItems) {

            if (this.staticItems[object].position[0] == position[0] && 
                this.staticItems[object].position[1] == position[1] && 
                this.staticItems[object].position[2] == position[2]) {

                // Item found
                return this.staticItems[object];
            }
        } 

        // Looking for item in dynamicItems
        for (object in this.dynamicItems) {

            if (this.dynamicItems[object].position[0] == position[0] && 
                this.dynamicItems[object].position[1] == position[1] && 
                this.dynamicItems[object].position[2] == position[2]) {

                // Item found
                return this.dynamicItems[object];
            }
        }
        
        // Item not found
        // Important
        // There are empty positions
        // without logical record        
        return 0;
    }
    
    /**
    * This function acquires reference to
    * object with entered id.
    * @param ID ID of object
    * @return Reference to object
    */
    this.getObjectByID = function(ID) {
        
        // Looking for item in staticItems
        for (object in this.staticItems) {

            if (this.staticItems[object].id == ID) {

                // Item found
                return this.staticItems[object];
            }
        } 

        // TODO this is strange :)
        /*
        for (object in this.dynamicItems) {
            if (this.dynamicItems[object].id == ID) {
                return this.dynamicItems[object];
            }
        }
        */
        
        return this.dynamicItems[ID];
        
        return 0;
    }

    /**
    * This function looks for object with
    * id and returns its position.
    * @param id ID of object
    * @return Position of object or 0 when not found
    */
    this.getPositionOfObject = function(id) {

        // Looking for item in staticItems
        for (object in this.staticItems) {

            if (this.staticItems[object].id == id) {

                // Item found, deepcopy its position and return
                return this.deepCopy(this.staticItems[object].position);
            }
        }

        // Looking for item in dynamicItems
        for (object in this.dynamicItems) {

            if (this.dynamicItems[object].id == id) {

                // Item found, deepcopy its position and return
                return this.deepCopy(this.dynamicItems[object].position);
            }
        }
        
        // Item not found
        return 0;
    }
    
    /**
    * Weight of item is specified in this function.
    * Used extensively.
    * @param position Position of item
    * @return Weight of item
    */
    this.getWeightOfObject = function(position) {
        
        // Is item outside game field?
        if(this.isPositionOutside(position)){

            // Ouside of gamefield acts like static object
            return 1000;
        }
        
        // Reference to item
        var tempObject = this.getObjectOnPosition(position);

        // Item not found 
        if(tempObject == 0) return 0;

        // Returns weight according to itemClass and itemSubclass        
        switch(tempObject.itemClass){
            
            // Nothing
            case 0:
                return 0;
                break;
            
            // Bug
            case 1:

                // Bug with additional weight in inventory
                if(tempObject.weight){
                    return 2
                }
                // Normal bug
                else{
                    return 1;   
                }
                break;
            
            // Wall - static
            case 2:
                return 1000;
                break;
            
            // Nothing
            case 3:
                return 0;
                break;
            
            // Exit
            case 4:
                return 1000;
                break;
            
            // Box
            case 5:

                // Heavy box
                if(tempObject.itemSubclass == 0){
                    return 2;
                }
                // Light box
                else{
                    return 1;  
                }
                break;
            
            // Explosive
            case 6:
                return 2;
                break;
            
            // Rock
            case 7:
                return 1000;
                break;
            

            // Door - not used
            case 8:
                return 1000;
                break;
            
            // Teleport - not used
            case 9:
                return 1000;
                break;
            
            // Button - not used
            case 10:
                return 1000;
                break;
            
            // Elevator -- not used
            case 11:
                return 0;
                break;
            
            // Water - water does not
            // act as item of game field
            // Only used when snorkel checking
            case 12:
                return 0;
                break;
            
            // Item 
            // Item acs as static object
            // TODO Check this
            case 13:
                return 1000;
                break;
            
            // Nothing
            case 14:
                return 0;
                break;
            
            // Sinking floor
            // TODO Check this
            case 15:
                return 1000;
                break;
            
            // Not used
            case 16:
                return 0;
                break;
            
            // Not used
            case 17:
                return 0;
                break;
            
            // Nothing
            case 18:
                return 0;
                break;

            // Inclined floor
            case 19:
                return (-1);
                break;
            
            // Nothing
            case 20:
                return 0;
                break;
            
            // Invisible wall - not used
            case 21:
                return 0;
                break;

            // Other
            default:
                break;
        }
        
        return 0;
    }
    
    /**
    * This function returns weitght of column, specified by position.
    * @param position Position inside column
    * @return Weight of column
    */
    this.getWeightOfColumn = function(position){
        

        // Is item outside game field?
        if(this.isPositionOutside(position)){

            // Static
            return 1000;
        }
        
        // Working with deep copy
        var tempPosition = this.deepCopy(position);
        var totalWeight = 0;

        // Y axis
        var i;

        // Starts at actual level
        for(i = tempPosition[2]; i - 1 <= this.sizeY; i = i + this.itemSize){
            
            // Object can be moved under wall!
            tempPosition[2] = i;

            // Next position object
            var itemOnPosition = this.getObjectOnPosition(tempPosition);

            if(i > position[2] && itemOnPosition.itemClass == 2){

                // Wall found!
                return totalWeight;
            }

            // If already static, there is no need to continue
            if(totalWeight >= 1000) break;
            
            // Weight of current item
            var weight = this.getWeightOfObject(tempPosition);

            // Empty space means no more items above
            if(weight == 0) break;
            
            // Sum it
            else{

                totalWeight +=  weight  
            }
        }
        
        // Weight of column
        return totalWeight;
    }
    
    /**
    * Is position outside game field?
    * @param position Checked position
    * @return true - outside, false - inside game field
    */
    this.isPositionOutside = function(position){

        if(position[0] >= this.sizeX || 
           position[0] < 0 || 
           position[1] >= this.sizeZ || 
           position[1] < 0 || 
           position[2]/2 >= this.sizeY || 
           position[2] < 0) {
           
           // Position outside
           return true;
        }
        else{

            // Position inside
            return false;
        }
    }

    /**
    * Recursively sums up weight of items in selected direction.
    * Recursion ends when item with 0 weight found.
    * @param direction - up, right, down, left 
    * @param position - sum up from this position
                      - usually bugs next position
    * @return Weight of items in selected direction
    */
    this.countWeight = function(direction, position){
        
        // Weight of items at this position
        var weight;
        var moveUp = false;
        
        // Is position outside of game field?
        if(this.isPositionOutside(position)){

            return 1000;
        }
        // Empty column - zero weight
        else if((weight = this.getWeightOfColumn(position)) == 0){

            return 0;
        }
        // Non-empty column
        else{

            // If item is inclined floor
            if(weight == (-1)){

                // TODO CHECK THIS ROTATION DIRECTION!!!

                // Is inclined floor in desired rotation?
                var sikminaRef = this.getObjectOnPosition(position);
                var rotation = sikminaRef.rotation;

                if(rotation == 0 && direction == "left"){

                    // Desired rotation
                    moveUp = true;
                }
                else if(rotation == 1 && direction == "down"){

                    // Desired rotation
                    moveUp = true;       
                }
                else if(rotation == 2 && direction == "down"){

                    // Desired rotation
                    moveUp = true;         
                }
                else if(rotation == 3 && direction == "right"){

                    // Desired rotation
                    moveUp = true;           
                }
                else{

                    // Undesired rotation - acts as static item
                    return 1000;
                }
            }

            // Moving to the next position
            var tempPosition = this.deepCopy(position);
            this.movePosition(direction, tempPosition);

            // If inclined floor id desired rotation found, then
            // move position up a in direction
            if(moveUp == true){

                // In direction
                this.movePosition(direction, tempPosition);

                // Up
                tempPosition[2] = tempPosition[2] + this.itemSize;
            }

            // Recursion
            return weight + this.countWeight(direction, tempPosition);
        }
    }
    
    /**
    * Moves item from its current position into selected direction.
    * @param id ID of item to be moved.
    * @param direction Direction - left, down, right, up
    */
    this.moveObjectID = function(direction, id){
        
        // Object reference
        var tempObject = this.getObjectByID(id);

        // Moving
        switch(direction){
            case "up":
                tempObject.position[0]++;
                break;
            case "right":
                tempObject.position[1]--;
                break;
            case "down":
                tempObject.position[0]--;
                break;
            case "left":
                tempObject.position[1]++;
                break;
            default:
                break;
        }
    }
    
    /**
    * Moves item from its current position into selected direction.
    * @param position Position of item.
    * @param direction Direction - left, down, right, up
    */
    this.moveObjectOnPosition = function(direction, position){
        
        // Is position outside game field?
        if(this.isPositionOutside(position)){

            return;
        }
        
        // Object reference
        var tempObject = this.getObjectOnPosition(position);

        // Moving
        switch(direction){
            case "up":
                tempObject.position[0]++;
                break;
            case "right":
                tempObject.position[1]--;
                break;
            case "down":
                tempObject.position[0]--;
                break;
            case "left":
                tempObject.position[1]++;
                break;
            default:
                break;
        }
    }
    
    /**
    * Checks if there is not bug under next position of box.
    * @param position Position in column
    */ 
    this.isBugKilled = function(position){
        
        var tempPosition = this.deepCopy(position);
        
        // Column item iteration
        var i;
        for(i = tempPosition[2] - this.itemSize; i >= 1; i = i - this.itemSize){

            // Next item
            tempPosition[2] = i;

            // Item reference
            var tempObject = this.getObjectOnPosition(tempPosition);
            
            // Is it bug?
            if(tempObject.itemClass == 1){

                return true;
            }
        }

        return false;
    }
    
    /**
    * Moves object to selected direction
    * @param direction Move direction
    * @param tempObject Referecence to the moved object
    */
    this.moveObject = function(direction, tempObject){
        
        // Is the position outside?
        if(this.isPositionOutside(tempObject.position)){
            return;
        }
        // Static object cannot be moved
        if(isObjectStatic(tempObject.guid)){
            return;
        }

        // Check object on next position
        var tempCheckPosition = this.deepCopy(tempObject.position);
        var positionBackup = this.deepCopy(tempObject.position);
        this.movePosition(direction, tempCheckPosition);

        var nextPositionObject = this.getObjectOnPosition(tempCheckPosition);

        // Cannot move item outside game field
        if(this.isPositionOutside(tempCheckPosition) || this.isBugKilled(tempCheckPosition)){
            return;
        }
        /*  Pokud je na nasledujici pozici nalezena sikmina, pak vime, ze nad ni muzeme posunout
            Posunume objekty ve smeru pohybu nad sikminu 
        */ 
        // If inclined floor found, then you already know
        // you can use it           
        else if(nextPositionObject.itemClass == 19){
            
            // Move position of this object further
            this.movePosition(direction, tempCheckPosition);
            tempCheckPosition[2] += this.itemSize;
            tempObject.position = tempCheckPosition;
        }
        else{
        
            // Moving
            tempObject.position = tempCheckPosition;
        }
        
        //  
        // Levitation check
        //
        var tempPosition = this.deepCopy(tempObject.position);
        var tempPositionBackup = this.deepCopy(tempPosition);

        // Object is still levitating - checking
        if(tempPosition[2] != 0 || tempPosition[2] != 1){
           
            // Lowering Y axis position
            // TODO check this
            var explosiveFound = false;
            if(tempObject.itemClass == 6){

                explosiveFound = true;
            }
            
            // Next item
            tempPosition[2] = tempPosition[2] - logic.itemSize;

            // Getting ID of items under this item
            var underThisObject = this.getObjectOnPosition(tempPosition);
            while(underThisObject == 0 && tempObject.position[2] > 1){

                // Decrease Y axis position
                tempObject.position[2] -= this.itemSize;
                tempPosition[2] -= this.itemSize;
                underThisObject = this.getObjectOnPosition(tempPosition);

                // If explosive found, then remove normal box
                if(explosiveFound && underThisObject.itemClass == 5){

                    // Removing box and explosive
                    this.removeItem(tempObject);
                    this.removeItem(underThisObject);
                }
            }
        }

        // Kontrola, zda nebylo pod objektem propadlo
        //var underThisObject = this.getObjectOnPosition(tempPositionBackup);

        // Check whether there is not sinking floor
        while(tempPositionBackup[2] >= 1){

            // Decrease Y axis value
            tempPositionBackup[2] -= this.itemSize;
            
            // Reference to the object below
            var object = this.getObjectOnPosition(tempPositionBackup);

            // Sinking floor?
            if(object.itemClass == 15){

                // Get weight above sinking floor
                var upPosition = this.deepCopy(tempPositionBackup);
                upPosition[2] += this.itemSize;
                var weight = this.getWeightOfColumn(upPosition);

                // Remove floor if weight is to high
                if(weight >= this.durability){

                    // Revome sinking floor
                    this.removeItem(object);
                }
            }
        }

        // Looking for items above moved one and moving them as well
        var i;
        for(i = positionBackup[2] + this.itemSize; i - 1 <= this.sizeY; i = i + this.itemSize){

            positionBackup[2] = i;
            var tempObject2 = this.getObjectOnPosition(positionBackup);
            if(tempObject2 != 0){

                // Moving other items
                this.moveObject(direction, tempObject2);
            }
        }  
    }
    
    /**
    * Moves position to the selected direction
    * @param direction Direction
    * @param position Position
    */
    this.movePosition = function(direction, position){

        switch(direction){
            case "up":
                position[0]++;
                break;
            case "down":
                position[0]--;
                break;
            case "right":
                position[1]--;
                break;
            case "left":
                position[1]++;
                break;
            default:
                break;
        }
    }
    
    /**
    * Move position to the opposite direction
    * @param direction Directon
    * @param position Position
    */
    this.movePositionInv = function(direction, position){

        switch(direction){
            case "up":
                position[0]--;
                break;
            case "down":
                position[0]++;
                break;
            case "right":
                position[1]++;
                break;
            case "left":
                position[1]--;
                break;
            default:
                break;
        }
    }
    
    /**
    * This function recursively moves
    * all connected items. Position is usually
    * item in front of bug and direction is bugs
    * actual rotation. Uses moveObject function.
    * @param direction Direction
    * @param position Position of first object
    * @return 0 when trying to move empty position
    */
    this.moveAction = function(direction, position){
        
        var tempObject;

        // Is position outside game field?
        if(this.isPositionOutside(position)){
            return 0;
        }
        // Are you trying to move empty position?
        else if((tempObject = this.getObjectOnPosition(position)) == 0){
            return 0;
        }
        // Everything ok
        else{

            /* TRANSLATE Nejdrive se vsechny objekty posunou v danem smeru a potom se pozice jeste upravi, aby pod sebou neco meli */
            /* TRANSLATE Navic uz vime, ze lze objekty posunout, protoze se kontrolovala vaha */
            var tempPosition = this.deepCopy(position);
            this.movePosition(direction, tempPosition);
            var nextStepObject = this.getObjectOnPosition(tempPosition);

            /*  TRANSLATE Pokud je nalezena sikmina, tak uz z vypoctu vahy vime, 
                ze pres ni lze posunou objekt, takze ve smeru posunu skocime
                na pozici nad sikminou a posouvame objekty tam.
                Objekt, ktery ma za sebou sikminu je posunut nad ni
            */
            if(nextStepObject.itemClass == 19){

                this.movePosition(direction, tempPosition);
                tempPosition[2] += this.itemSize;
            }
            if(this.moveAction(direction, tempPosition) == 0){

                this.moveObject(direction, tempObject);
            }

            return 0;
        }
    }

    /**
    * Moves selected bug.
    * Looks for sinking floors.
    * @param id ID of bug
    * @positionIn Next positon of bug
    */
    this.moveBug = function(id, positionIn){

        // Move bug to selected position
        this.dynamicItems[id].position = this.deepCopy(positionIn);

        var position = this.deepCopy(positionIn);

        // Looking for sinking floor under the bug
        for(position[2]; position[2] >= 1; position[2] -= this.itemSize){

            var object = this.getObjectOnPosition(position);


            // Sinking floor found
            if(object.itemClass == 15){

                // Getting weight of column above sinking floor
                var upPosition = this.deepCopy(object.position);
                upPosition[2] += this.itemSize;

                var weight = this.getWeightOfColumn(upPosition);

                // Durability is lower that weight
                if(weight > this.durability){

                    // Removing sinking floor
                    this.removeItem(object);
                }

            }
        }
    }
    
    /**
    * Checks whether position1 and position2 is the same.
    * @param position1
    * @param position2
    */
    this.isPositionEqual = function(position1, position2){

        if(position1[0] == position2[0] && 
           position1[1] == position2[1] && 
           position1[2] == position2[2]){
           
            return true;
        }
        else{

            return false;
        }
    }
    
    /**
    * Get position of item in inventory. 
    * @param bugID ID of bug
    * @param itemSubclass Pickaxe, weight, ...
    * @return Position of item in inventory, -1 if not found
    */
    this.inventoryContains = function(bugID, itemSubclass){
        
        var bugsInventory = this.bugInventories[bugID];
        return $.inArray(itemSubclass, bugsInventory);
    
    }

    /**
    * Appends item into bugs inventory
    * @param bugID ID of bug
    * @param itemSubclass Subclass of appended item
    */
    this.inventoryAppend = function(bugID, itemSubclass){

        var bugsInventory = this.bugInventories[bugID];
        bugsInventory.push(itemSubclass);

        /* TODO kontrola, zda jiz neni inv. plny popr zda jiz neobsahuje dany item */
        /* pouzit inventory contains...mrknout jestli neumi vratit pole */
        // To se odviji podle toho kolik tech itemu muze beruska mit...treba krumpacu vice, zavazi jedno 
    }

    /**
    * Removes item from inventory
    * @param bugID ID of bug
    * @param itemPosition Position of item in inventory
    */
    this.removeFromInventory = function(bugID, itemPosition){

        var bugsInventory = this.bugInventories[bugID];
        delete bugsInventory[itemPosition];

    }

    /**
    * Return array of item in selected column
    * @param positionIn Position of column
    * @return Array of items in column
    */
    this.getObjectsInColumn = function(positionIn){

        var position = this.deepCopy(positionIn);

        position[2] = 1;
        var objectsInColumn = [];
        var i;
        for(i = position[2]; i - 1 <= this.sizeY; i = i + 2){

            position[2] = i;
            var foundObject = this.getObjectOnPosition(position);

            // Zero item when empty position
            // For unification of next algorithms
            if(foundObject == 0){

                foundObject = new ZeroItem();
            }
            // Wall found
            // Used when player wants to move boxes under wall
            else if(foundObject.itemClass == 2){

                return objectsInColumn;
            }

            // Appending reference to the found item
            objectsInColumn.push(foundObject);
        }

        return objectsInColumn;
    }

    /**
    * Moves column of items vertically from selected position
    * @param column Column of items
    * @param shiftFrom Where to start
    */
    this.shiftColumn = function(column, shiftFrom){

        var i;

        for(i = shiftFrom; i < column.length; i++){

            if(column[i].itemClass != 0){

                column[i].position[2] = column[i].position[2] - this.itemSize;
            }
        }
    }

    /**
    * Removes item from game field.
    * 1. Removes bounding box with models
    * 2. Removes logic representation
    * @param item Reference to item  you want to remove
    */
    this.removeItem = function(item){

        var id = item.id;

        // Pickaxe, weight, vitamin, ...
        // No item above
        if(item.itemClass == 13){

            delete this.dynamicItems[id];
            delete dynamicObjects[id];
        }
        // Explosive
        else if(item.itemClass == 6){

            // Notification
            notificationAnimation('bang');

            delete this.dynamicItems[id];
            delete dynamicObjects[id];
        }
        // Box
        else if(item.itemClass == 5){

            delete this.dynamicItems[id];
            delete dynamicObjects[id];
        }
        // Rock
        else if(item.itemClass == 7){

            delete this.dynamicItems[id];
            delete dynamicObjects[id];
        }
        // Sinking floor
        else if(item.itemClass == 15){

            delete this.dynamicItems[id];
            delete dynamicObjects[id];
        }

        //
        // Shifting items in column 
        //
        var objectsInColumn = this.getObjectsInColumn(item.position); 
        column = objectsInColumn;

        // Looking for explosive
        var itemsToDelete = [];
        var lookingForBox = false;
        var columnHeigth = objectsInColumn.length;
        var explosiveIndex;

        for(i = columnHeigth - 1; i >= 0; i--){

            // Explosive found - skip empty positions and remove box under this explosive
            if(objectsInColumn[i].itemClass == 6){

                lookingForBox = true;
                explosiveIndex = i;
            }
            // Box under explosive found
            else if(objectsInColumn[i].itemClass == 5 && lookingForBox){

                // Not looking for box anymore
                lookingForBox = false;
                itemsToDelete.push(explosiveIndex);
                itemsToDelete.push(i);
            }
        }

        // Removing marked items
        for(item in itemsToDelete){

            delete dynamicObjects[objectsInColumn[itemsToDelete[item]].id];
            delete this.dynamicItems[objectsInColumn[itemsToDelete[item]].id];

            delete objectsInColumn[itemsToDelete[item]];


            objectsInColumn[itemsToDelete[item]] = new ZeroItem;
        }

        // No levitation!
        for(i = 0; i < objectsInColumn.length ; i++){

            // Empty space -> shift down
            if(objectsInColumn[i].itemClass == 0){

                this.shiftColumn(objectsInColumn, i);
            }
        }
    }

    /**
    * Main function of game logic
    * Handles user events
    * Uses only one parameter -> use direction or newBugPositionIn
    * @param direction Direction from user event
    * @param newBugPositioIn Set position from program
    */
    this.gameStep = function(direction, newBugPositionIn) {
        
        // Game is over - no need to handle events
        if(this.gameOver) return;

        // Not used yet
        if(useCameraReset){
            resetCamera();
        }
        
        /* TODO Deaktivace klaves - aktivuji se po 150ms */
        //deactivateKeys();
        
        // Actual bugs position [x, y, z]
        var bugPosition = this.deepCopy(this.dynamicItems[this.selectedBugID].position);
    
        // Next bugs position [x, y, z]
        var newBugPosition;

        // Parameter not entered, using second parameter
        if(direction == ""){

            newBugPosition = newBugPositionIn;
        }
        else{

            // Using actual position
            newBugPosition = this.deepCopy(bugPosition);
        }


        // New direction of bug
        var bugDirection = this.dynamicItems[this.selectedBugID].direction;
        var newBugDirection = bugDirection;
        
        // User event
        if(direction != ""){

            switch (direction) {
            case "cursorUp":

                // Bugs rotation still the same
                if (bugDirection == "up") {
                    newBugPosition[0]++;
                } else if (bugDirection == "down") {
                    newBugPosition[0]--;
                } else if (bugDirection == "left") {
                    newBugPosition[1]++;
                } else if (bugDirection == "right") {
                    newBugPosition[1]--;
                }
                break;

            // Bugs rotation +180 degrees
            case "cursorDown":

                if (bugDirection == "up") {
                    //newBugPosition[0]--;
                    newBugDirection = "down";
                } else if (bugDirection == "down") {
                    //newBugPosition[0]++;
                    newBugDirection = "up";
                } else if (bugDirection == "left") {
                    //newBugPosition[1]--;
                    newBugDirection = "right";
                } else if (bugDirection == "right") {
                    //newBugPosition[1]++;
                    newBugDirection = "left";
                }
                break;

            // Bugs rotation -90 degrees
            case "cursorLeft":

                if (bugDirection == "up") {
                    //newBugPosition[1]++;
                    newBugDirection = "left";
                } else if (bugDirection == "down") {
                    //newBugPosition[1]--;
                    newBugDirection = "right";
                } else if (bugDirection == "left") {
                    //newBugPosition[0]--;
                    newBugDirection = "down";
                } else if (bugDirection == "right") {
                    //newBugPosition[0]++;
                    newBugDirection = "up";
                }
                break;

            // Bugs rotation +90 degrees
            case "cursorRight":

                if (bugDirection == "up") {
                    //newBugPosition[1]--;
                    newBugDirection = "right";
                } else if (bugDirection == "down") {
                    //newBugPosition[1]++;
                    newBugDirection = "left";
                } else if (bugDirection == "left") {
                    //newBugPosition[0]++;
                    newBugDirection = "up";
                } else if (bugDirection == "right") {
                    //newBugPosition[0]--;
                    newBugDirection = "down";
                }
                break;

            default:
                break;
            }
        }

        // Direction is always used
        this.dynamicItems[this.selectedBugID].direction = newBugDirection;
        
        // If there is no move, then there is no need for next operations
        if(this.isPositionEqual(newBugPosition, this.dynamicItems[this.selectedBugID].position)){

            return;
        }

        // Is position outside game field?
        if (newBugPosition[0] >= this.sizeX || 
            newBugPosition[0] < 0 || 
            newBugPosition[1] >= this.sizeZ || 
            newBugPosition[1] < 0) { 

            return;
        }
              
        // Looking for item on next bugs position (Next step object)
        var nextStepObject = this.getObjectOnPosition(newBugPosition); 
        var selectedBugObject = this.dynamicItems[this.selectedBugID]; 

        //
        // LOGIC
        //
        // Item not found and bug is inside game field
        if (nextStepObject == 0) {
            
            // Checking position under next step pos.
            if (newBugPosition[2] > 1) {
                
                
                var lowerNewBugPosition = [];
                lowerNewBugPosition[0] = newBugPosition[0];
                lowerNewBugPosition[1] = newBugPosition[1];
                lowerNewBugPosition[2] = newBugPosition[2] - 2;
                
                // Get reference                
                var lowerObjectReference = this.getObjectOnPosition(lowerNewBugPosition);

                // Position empty - cannot move bug, bug cannot jump
                if(lowerObjectReference == 0){

                    return;
                }
                // Bug under bug - cannot move
                else if(lowerObjectReference.itemClass == 1){

                    return;
                }
                // Inclined floor
                else if(lowerObjectReference.itemClass == 19){
                    
                    // Check whether inclined floor leads into water
                    var waterCheckPosition = [];
                    waterCheckPosition[0] = newBugPosition[0];
                    waterCheckPosition[1] = newBugPosition[1];
                    waterCheckPosition[2] = newBugPosition[2] - 1;
                    
                    var waterCheckReference = this.getObjectOnPosition(waterCheckPosition);


                    // Water found - bug needs snorkel
                    if(waterCheckReference.itemClass == 12){

                        // Snorkel test
                        if(!this.dynamicItems[this.selectedBugID].snorchl){

                            // No snorkel, no water
                            return;
                        }
                    }
                    
                    // Inclined floor must have correct rotation, so
                    // that bug can use it
                    // Also looking for item under inclined floor to
                    // decide whether move can be done
                    // If item under inclined floor movable or pickable,
                    // then game step called again and bug is moved
                    var rotation = lowerObjectReference.rotation;
                    var nextLowerObjectPosition = this.deepCopy(lowerNewBugPosition);
                    this.movePosition(newBugDirection, nextLowerObjectPosition);
                    var nextLowerObjectReference = this.getObjectOnPosition(nextLowerObjectPosition);
                    
                    // Checking rotation
                    // LEFT
                    if(rotation == 0 && newBugDirection == "left"){

                        this.gameStep("", nextLowerObjectPosition);
                    }
                    // DOWN
                    else if(rotation == 3 && newBugDirection == "down"){

                        this.gameStep("", nextLowerObjectPosition);
                    }
                    // UP
                    else if(rotation == 1 && newBugDirection == "up"){

                        this.gameStep("", nextLowerObjectPosition);  
                    }
                    // RIGHT
                    else if(rotation == 2 && newBugDirection == "right"){

                        this.gameStep("", nextLowerObjectPosition);  
                    }
                    else{

                        return;
                    }
                    return;
                }

                // Sinking floor under bug
                else if(lowerObjectReference.itemClass == 15){

                    // Checking for weight
                    if(selectedBugObject.weight){

                        this.removeItem(lowerObjectReference);
                        this.gameStep("", lowerNewBugPosition);
                        return;
                    }

                }
            }
            
            // Moving bug
            this.moveBug(this.selectedBugID, newBugPosition)
            return;
        
        }
        
        // Bug - not moving
        else if(nextStepObject.itemClass == 1){

        }
        
        // Wall
        // Static
        else if(nextStepObject.itemClass == 2){

        }
        
        // Nothing
        else if(nextStepObject.itemClass == 3){

        }
        
        // Exit
        else if(nextStepObject.itemClass == 4){
            
            
            // Next bug rescued
            this.releasedBugCounter++;
            
            // End of game?
            if(this.releasedBugCounter == this.bugIDs.length){
                
                // Notification
                notificationAnimation('youWin');
                this.gameOver = true;
            }
            

            // Remove bug from game field
            this.removeBug(this.selectedBugID);
            
        }
        
        // Box
        else if(nextStepObject.itemClass == 5){
            
            
            var weight;
            var strength;

            // Vitamin in inventory?
            if(selectedBugObject.vitamin){
                strength = 2 * this.bugStrength;
            }
            else{
                strength = this.bugStrength;
            }

            // Get weight and if its lower than bugs strength, then move
            if((weight = this.countWeight(newBugDirection, newBugPosition)) <= strength){

                // Move items
                this.moveAction(newBugDirection, newBugPosition);

                // Move bug
                this.moveBug(this.selectedBugID, newBugPosition);
            }
        }
        
        // Explosive
        else if(nextStepObject.itemClass == 6){
            
            if(log){
                console.log("Explosive SubClass:"+nextStepObject.itemSubclass);
            }
            
            var weight;
            var strength;

            // Get bugs strength
            if(selectedBugObject.vitamin){
                strength = 2 * this.bugStrength;
            }
            else{
                strength = this.bugStrength;
            }

            // Looking for normal box in front of this explosive
            var nextNextPosition = this.deepCopy(nextStepObject.position);
            this.movePosition(newBugDirection, nextNextPosition);
            nextNextStepObject = this.getObjectOnPosition(nextNextPosition);
            
            // Box found - removing explosive and box
            if(nextNextStepObject.itemClass == 5){

                this.removeItem(nextNextStepObject);
                this.removeItem(nextStepObject);
            }
            // Box not found - moving explosive
            else if((weight = this.countWeight(newBugDirection, newBugPosition)) <= strength){

                // Moving boxes
                this.moveAction(newBugDirection, newBugPosition);

                // Moving bug
                this.moveBug(this.selectedBugID, newBugPosition);
            }

        }
        
        // Rock
        // Removed by pickaxe
        else if(nextStepObject.itemClass == 7){


            // Pickaxe in inventory?
            var itemPosition = this.inventoryContains(this.selectedBugID, 8);


            // Pickaxe found
            if(itemPosition != -1){


                // Remove rock and pickaxe
                this.removeItem(nextStepObject);
                this.removeFromInventory(this.selectedBugID, itemPosition);

                // Update inventory UI
                inventoryAnimation('pickaxe', false);
            }
        }
        
        // Doors
        else if(nextStepObject.itemClass == 8){
        }
        
        // Teleport
        else if(nextStepObject.itemClass == 9){
        }
        
        // Button
        else if(nextStepObject.itemClass == 10){
        }
        
        // Lift
        else if(nextStepObject.itemClass == 11){
        }
        
        // Water
        else if(nextStepObject.itemClass == 12){
        }
        
        // Item
        else if(nextStepObject.itemClass == 13){

            // What kind of item?
            var itemSubclass = nextStepObject.itemSubclass;
            
            // Snorkel
            if(itemSubclass == 0){

                // Only one snorkel in invetory!
                if(selectedBugObject.snorchl == false){

                    // Append item, remove from scene, 
                    // show notification and update UI
                    selectedBugObject.snorchl = true;
                    this.removeItem(nextStepObject);
                    selectedBugObject.position = newBugPosition;
                    inventoryAnimation('snorchel', true);
                    notificationAnimation('snorkel');
                }
                else{

                    return;
                }
            }
            // Bag
            else if(itemSubclass == 1){
                return;
            }
            // Nothing
            else if(itemSubclass == 2){
                return;
            }
            // Food
            else if(itemSubclass == 3){
               return;
            }
            // Dynamite
            else if(itemSubclass == 4){
                return;
            }
            // Vitamin
            else if(itemSubclass == 5){

                // Only one vitamin in invetory!
                if(selectedBugObject.vitamin == false){

                    // Append item, remove from scene, 
                    // show notification and update UI
                    selectedBugObject.vitamin = true;
                    this.removeItem(nextStepObject);
                    selectedBugObject.position = newBugPosition;
                    inventoryAnimation('strength', true);
                    notificationAnimation('strength');
                }
                else{

                    return;
                }
            }
            // Light
            else if(itemSubclass == 6){
                return;
            }
            // Weight
            else if(itemSubclass == 7){

                // Only one weight in invetory!
                if(selectedBugObject.weight == false){

                    // Append item, remove from scene, 
                    // show notification and update UI
                    inventoryAnimation('weight', true);
                    notificationAnimation('weight');
                    selectedBugObject.weight = true;
                    this.removeItem(nextStepObject);
                    selectedBugObject.position = newBugPosition;
                }
                else{

                    return;
                }
            }
            // Pickaxe
            else if(itemSubclass == 8){

                // Append item, remove from scene, 
                // show notification and update UI
                this.inventoryAppend(this.selectedBugID, itemSubclass);
                this.removeItem(nextStepObject);
                selectedBugObject.position = newBugPosition;
                inventoryAnimation('pickaxe', true);
                notificationAnimation('pickaxe');

            }
            else{

                return;
            }
            
        }
        
        // Nothing
        else if(nextStepObject.itemClass == 14){
        }
        
        // Sinking floor
        else if(nextStepObject.itemClass == 15){

            if(this.dynamicItems[this.selectedBugID].weight){

                var aheadDownPosition = this.deepCopy(newBugPosition);
                aheadDownPosition[2] -= 2;

                this.removeItem(nextStepObject);
                this.gameStep("", aheadDownPosition);
                
            }
            else{
                selectedBugObject.position = newBugPosition;
            }
        }
        
        // Nail
        else if(nextStepObject.itemClass == 16){
        }
        
        // Magnet
        else if(nextStepObject.itemClass == 17){
        }
        
        // Nothing
        else if(nextStepObject.itemClass == 18){
        }
        
        // Inclined floor
        else if(nextStepObject.itemClass == 19){
            
            var rotation = nextStepObject.rotation;
            
            // Inclined floor must have correct rotation, so
            // that bug can use it
            // Also looking for item under inclined floor to
            // decide whether move can be done
            // If item under inclined floor movable or pickable,
            // then game step called again and bug is moved
            var upperObjectPosition = [];
            upperObjectPosition[0] = newBugPosition[0];
            upperObjectPosition[1] = newBugPosition[1];
            // Moving position up
            upperObjectPosition[2] = newBugPosition[2] + this.itemSize;

            var upperObjectPositionBackup = this.deepCopy(upperObjectPosition);
            // moving position in bugs direction
            this.movePosition(newBugDirection, upperObjectPosition);

            // Reference to object above inclined floor
            var upperObjectReference = this.getObjectOnPosition(upperObjectPosition);
            
            // TODO CHECK MOVEBUG? PROC?
            // RIGHT - OK
            if(rotation == 0 && newBugDirection == "right"){

                this.gameStep("", upperObjectPosition);
            }
            // DOWN - OK
            else if(rotation == 1 && newBugDirection == "down"){

                this.moveBug(this.selectedBugID, upperObjectPositionBackup);
                this.gameStep("", upperObjectPosition);
            }
            // DOWN - OK
            else if(rotation == 2 && newBugDirection == "left"){

                this.gameStep("", upperObjectPosition);  
            }
            // RIGHT - OK
            else if(rotation == 3 && newBugDirection == "up"){

                this.moveBug(this.selectedBugID, upperObjectPositionBackup);
                this.gameStep("", upperObjectPosition);  
            }
            else{
                return;
            }
            return;
        }
        
        // Nothing
        else if(nextStepObject.itemClass == 20){

        }
        
        // Invisible wall
        else if(nextStepObject.itemClass == 21){

        } 
    }
}
