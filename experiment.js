let sceneEl = document.querySelector('a-scene');



function createLegend(textObject, side, colorObject, data, id){
    /*  Creates an interactive legend in A-Frame, with customisation based on 
        input parameters.
        
        Text Object = {
            title: 'string',
            subtitle: 'string',
            min: 'float/int',
            max: 'float/int'
        }
        Title & Subtitle are both strings, which will be rendered as the legends title
        / subtitle. Representing the dataset and units for example.
        
        Side indicates the position of the legend.
        
        colorObject is an object formatted,
         {topColor: [R,G,B], bottomColor: [R,G,B], Steps: Integer}
        This utilises the colorGradient function to return an array, of length according to steps,
        containing the RGB values for a gradient from the bottom color to the top color.

        The data object is the data that should be represented in the legend.

        id is the id for the element.
    */
    
    // NEED TO ADD REQUIRE AFRAME TO ENSURE FUNCTION ONLY RUNS IF AFRAME IS LOADED.

    // TO MAKE FULLY GENERIC/ABSTRACT NEED TO TAKE INTO ACCOUNT VARYING STEP SIZES,
    // NOT JUST '10'.

    // Declare variables.
    let sceneElement = document.querySelector('a-scene');
    let cameraElement = document.querySelector('[camera]');

    // Blank inputs. NEED TO ADD.
    

    // Calculate + return the color gradient array.
    let gradient = colorGradient(colorObject.topColor, colorObject.bottomColor, colorObject.steps);


    // Create parent object for legend.
    let legendParent = {};
    // position X value for background element.
    let bgX;
    // position X value for text elements.
    let txtX;
    let minX;

    // Declare x/z A-Frame positions according to 'side' parameter.
    switch (side){
        case 'left':
            legendParent.x = -0.6;
            legendParent.z = -0.47;
            bgX = -0.007;
            txtX = -0.065;
            minX = 0.02;
            
        break;
        case 'right':
            legendParent.x = 0.6;
            legendParent.z = -0.47;
            bgX = 0.007;
            txtX = -0.12;
            minX = -0.11;
    }

    // Create parent entity - assign position based on above.
    let parent = document.createElement('a-entity');
    parent.object3D.position.set(legendParent.x, 0, legendParent.z);
    parent.setAttribute('id', `${id}-legend`);
    parent.setAttribute('material', {shader: 'flat'}); // Stops legend from being affected by lighting - increases clarity + performance.


    // ----- LEGEND COLOURS ----- //
    // Set gradient entity parameters.
    let gradElSize = 0.03; //Assuming desired shape is square not rectangle.
    
    // Grab step parameter and step unit to determine position of entity later.
    let stepsTotal = parseInt(colorObject.steps,10);
    let stepSize   = 1 / stepsTotal;
    let length = stepsTotal * gradElSize;

    // Loop through gradient array and create gradient-legend entities accordingly.
    for(var i=0; i < gradient.length; i++){
        console.log(`i: ${i}, col: ${gradient[i]}`);
        // Grab colour from gradient array.
        let colour = gradient[i];

        // Calculate ratio of where entity is along position.
        let posRatio = stepSize * i;
        let position = posRatio * length;
        let posY     = (-length/2) + position; // divided by two as legend is centered around y = 0.
        

        // Create gradient element.
        let gradientEl = document.createElement('a-plane');
        // Set size (smol square).
        gradientEl.setAttribute('geometry', {width: gradElSize, height: gradElSize});
        // Set colour.
        gradientEl.setAttribute('material', { color: `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`});
        // Set position.
        gradientEl.object3D.position.set(0, posY, 0);
        // Stops legend from being affected by lighting - increases clarity + performance.
        gradientEl.setAttribute('material', {shader: 'flat'});

        // Append to parent entity.
        parent.appendChild(gradientEl);
    }

    // ----- MARKER ----- //    
    // Create the marker entity.
    let marker = document.createElement('a-entity');

    // Set basic attributes.
    marker.setAttribute('geometry', 'primitive: box');
    marker.setAttribute('material', { color: '#787469'});
    marker.setAttribute('geometry', {width: (gradElSize-0.01), height: (gradElSize-0.01), depth: 0.001});
    marker.setAttribute('material', {shader: 'flat'});
    
    // Set position
    // Calculate the minimum position according to the gradient elements dimensions.
    let markerY = - (length/2) - (gradElSize/2);
    marker.object3D.position.set(0, markerY ,0);

    // Set rotation to create diamond shape.
    let markerRotation = THREE.Math.degToRad(45)
    marker.object3D.rotation.z = (markerRotation);

    // Set marker id to allow for interaction outside of function.
    // Through DOM manipulation. (?)
    marker.setAttribute('id', `${id}-marker`);
    //console.log(`marker id: ${marker.getAttribute('id')}`);

    parent.appendChild(marker);

    // ---- LEGEND FRAME ---- //

    // Create legend frame object to incrase legend + marker clarity for certain colour combinations.
    let legendFrame = document.createElement('a-plane');
    
    // Set basic attributes.
    legendFrame.setAttribute('material', { color: 'black'});
    let lgdFrmWdt = (gradElSize + 0.01);
    let lgdFrmHgt = ((gradElSize * 2) + length);
    legendFrame.setAttribute('geometry', {width: lgdFrmWdt, height: lgdFrmHgt});
    legendFrame.object3D.position.set(bgX, 0, -0.005);

    // Append
    parent.appendChild(legendFrame);

    // ---- TITLE + SUBTITLE + TXT ---- //

    // Parse the title + subtitle values into two <a-text> entities and place them above the legend (leaving space.)
    // Add black <a-plane> bg to them.
    // Add max + min values? (possibly need to change the parameters to (TXT input)).

    // Declare title, subtitle, min, max values from input object.
    let title = textObject.title;
    let subtitle = textObject.subtitle;
    let min = textObject.min;
    let max = textObject.max;

    // Create text elements for each.
    let titleEl = document.createElement('a-text');
    let subtitEl= document.createElement('a-text');
    let minEl   = document.createElement('a-text');
    let maxEl   = document.createElement('a-text');
    
    // Set basic attributes + position for each.
    
    // Title
    titleEl.setAttribute('color', 'black');
    titleEl.setAttribute('width', 0.5 );
    let titleY = ( ( lgdFrmHgt / 2 ) + ( 1.2 * gradElSize ) );
    titleEl.object3D.position.set(txtX, titleY,0);
    titleEl.setAttribute('value', title);

    // Subtitle
    subtitEl.setAttribute('color','black')
    subtitEl.setAttribute('width', 0.3);
    let subtitY = ( titleY - ( 0.75 * gradElSize ) );
    subtitEl.object3D.position.set(txtX , subtitY, 0);
    subtitEl.setAttribute('value', subtitle);

    // Min
    minEl.setAttribute('color', 'black');
    minEl.setAttribute('width', 0.4 );
    let minY = - ( (lgdFrmHgt / 2 ) - (gradElSize / 2));
    
    minEl.object3D.position.set(minX, minY, 0);
    minEl.setAttribute('value', `Min: ${min}`);

    // Max
    maxEl.setAttribute('color', 'black');
    maxEl.setAttribute('width', 0.4 );
    let maxY = - minY;
    maxEl.object3D.position.set(minX, maxY, 0);
    maxEl.setAttribute('value', `Max: ${max}`);

    // Append as children to parent element.
    parent.appendChild(titleEl);
    parent.appendChild(subtitEl);
    parent.appendChild(minEl);
    parent.appendChild(maxEl);



    cameraElement.appendChild(parent);
}

function colorGradient(topColor, bottomColor, steps){
    /*  Given two RGB colours (provided as [arrays]), create and output
        an array of intermediary colours with a length
        equal to the steps specified.
    */
    // Empty Array for output
    let gradient = [];

    // Parse the steps as number to base 10.
    let stepsInt = parseInt(steps, 10);

    // Percentage representation of the given steps. DEPRECATED.
    let stepPerc = 100 / (stepsInt + 1);

    // Decimal representation of each step.
    let stepUnit = 1 / stepsInt;

    // Calc the difference between each colour.

    let diffRGB = [
        topColor[0] - bottomColor[0],
        topColor[1] - bottomColor[1],
        topColor[2] - bottomColor[2]
    ];

    // Loop through each step/colour in gradient. 
    // Calculate the RGB values based on difference + current step unit.
    for(var i=0; i < (stepsInt+1); i++){
        let col = [];

        let delta = i * stepUnit;
        //console.log(`Index: ${i}, Delta: ${delta}`);

        for (var j = 0; j < 3; j++){
            col[j] = parseInt((diffRGB[j]) * delta + bottomColor[j]);
        }

        // Push color to gradient.
        
        gradient.push(col);
    }

    // Return the final gradient object.


    return gradient
}


let loCol = [255, 255, 153];
let hiCol = [255, 80, 80];

let highLow = colorGradient(hiCol, loCol, 10);


let colObject = {
    topColor: hiCol,
    bottomColor: loCol,
    steps: 10
};

let txtObject = {
    title: 'Pollution (NOx)',
    subtitle: 'ppm 2017-2018 annual avg',
    min: '30',
    max: '2500'
}
createLegend(txtObject, 'left', colObject, 'd', 'id');

let obj = document.querySelector('a-box');
let marker = document.querySelector('#id-marker');

// Get marker position.
let oldPos = marker.getAttribute('position');
oldPos = oldPos.y;


// Make up delta ratio.
let delta = 0.8;

obj.addEventListener('mouseenter', () =>{
    console.log('mouseenter');
    obj.setAttribute('interaction-on-hover', {
        'alterSize' : true,
        'input' :  'This is the input'
    });
    obj.setAttribute('color', 'blue');

    marker.setAttribute('legend-marker-value', {
        'input' : '40',
        'side' : 'left'
    });

    // HARD CODED length of legend.
    let length = 11 * 0.03;
    let newPos  = ( ( delta * length) + oldPos);
    marker.object3D.position.set(0, newPos, 0);

    
    
})

obj.addEventListener('mouseleave', () => {
    console.log('mouse-leave');
    obj.removeAttribute('interaction-on-hover');
    obj.setAttribute('color', 'tomato');
    marker.removeAttribute('legend-marker-value');
    marker.object3D.position.set(0, oldPos, 0);
    
})
