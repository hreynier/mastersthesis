// - AFrame Components - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //

// This script containst the custom components created
// for the NYC VR data explorer. 
// These components are used to add interaction and styling
// to the rendered data points



// Embeds data into 3D gltf city model.
// Colors the model based on the input variable.
// Also creates an interactive entity above each district
// that on mouse-hover shows the user the embedded data and
// updates the legend.

AFRAME.registerComponent('embed-data', {
    schema: {type: 'string', default: 'pop2010'},
    init: function () {
        
        // Declare constants for entity + input data.
        let el = this.el;
        let data = this.data;
        let colours;

        let sceneEl = document.querySelector('a-scene');

        //console.log(el);

        // Don't need to wait for model to load as this is applied long after the model has looaded.
        // Declare variables for each district + entity id;
        let id = el.id;
        let district;
        //console.log(`This is the id: ${id}`);

        // Declare variables for min/max + data (to calculate ratio for marker);
        let min;
        let max;
        let pointCol;
        let pointRow;

        // Create position variables for the interactive box entity
        // that is created later.
        //Grab the 3d models position;
        let interactorX = -8.169;
        let interactorZ = 8.841;

        let baseColor = [127, 135, 148];
        
        
        if(popObj){
            
            //console.log(`Component object input: ${popObj}`);

            // Grab embedded data promise and resolve to access values.
            popPromise.then(value => {

                // Declare blank variables for the colour objects + column numbe
                // for determine correct column based on entity id.
                let inputData = popObj;
                let col;

                // Switch expression that parses the input data to determine what 
                // colours + data are used.
                switch(data){
                    case 'pop2000':
                        col = inputData.pop00;
                        min = value.min00;
                        max = value.max00;
                        pointCol = 1;
                        break;
                    
                    case 'pop2010':
                        col = inputData.pop10;
                        min = value.min10;
                        max = value.max10;
                        pointCol = 2;
                        break;
                    case 'popDiff':
                        col = inputData.popDiff;
                        min = value.minDiff;
                        max = value.maxDiff;
                        pointCol = 3;
                        break;
                    case 'income':
                        col = inputData.inc;
                        min = value.minInc;
                        max = value.maxInc;
                        pointCol = 4;
                        break;
                    case 'employment':
                        col = inputData.emp;
                        min = value.minEmp;
                        max = value.maxEmp;
                        pointCol = 5;
                        break;
                    case 'emplPerc':
                        col = inputData.empPerc;
                        min = value.minEmpPerc;
                        max = value.maxEmpPerc;
                        pointCol = 6;
                }

                // Second switch to determine what district to apply the colours to.
                switch(id){
                    case 'cd1':
                        district=0;
                        colours = col[district];
                        pointRow = value.data[0];
                        
                        break;
                    case 'cd2':
                        district=1;
                        colours = col[district];
                        pointRow = value.data[1];
                        interactorX = -7;
                        interactorZ = 4.5;
                        break;
                    case 'cd3':
                        district=2;
                        colours = col[district];
                        pointRow = value.data[2];
                        interactorX = -4;
                        interactorZ = 5.5;
                        break;
                    case 'cd4':
                        district=3;
                        colours = col[district];
                        pointRow = value.data[3];
                        interactorX = -7;
                        interactorZ = 1;
                        break;
                    case 'cd5':
                        district=4;
                        colours = col[district];
                        pointRow = value.data[4];
                        interactorX = -5;
                        interactorZ = 1.5;
                        break;
                    case 'cd6':
                        district=5;
                        colours = col[district];
                        pointRow = value.data[5];
                        interactorX = -3;
                        interactorZ = 2;
                }

                // Debugging
                //console.log(`col: ${pointCol}, row: ${pointRow}`);
                //console.log(pointRow);

                // Create new variable to grab district data.
                let embedData = pointRow[pointCol];

                //console.log(`embedded data: ${embedData}`);
                // Calculate the ratio between the data and the rest of the dataset.
                let delta = (embedData - min) / (max - min);

                // Create new interactive entity.
                let interactor = document.createElement('a-box');

                // Create smaller entity that will fit inside the rotating interactor box.
                let interactorEntity = document.createElement('a-box');

                
                // Set Attributes for color, size, position etc.
                interactor.setAttribute('id', `box-${id}`);
                interactorEntity.setAttribute('id', `boxEnt-${id}`);
                interactor.setAttribute('material', { color: `rgb(${baseColor[0]},${baseColor[1]}, ${baseColor[2]})` });
                interactor.object3D.position.set(interactorX, 3.5, interactorZ);
                interactorEntity.object3D.position.set(interactorX, 3.5, interactorZ);
                interactorEntity.object3D.scale.set(0.2, 0.2, 0.2);
                interactor.object3D.scale.set(0.5, 0.5, 0.5);

                // Create rotating animation entity to attach to interactor box
                // so that the user can easily see the interactor.
                interactor.setAttribute('animation', { property: 'rotation', dur: '7000', to: '0 360 0', loop: 'true', easing: 'linear'});
              
                // Create text element to append to the rotating box.
                let interactorLabel1 = document.createElement('a-text');
                interactorLabel1.object3D.position.set(0, 0, 0.5);
                interactorLabel1.setAttribute('color', 'red');
                interactorLabel1.setAttribute('width', 5);
                interactorLabel1.setAttribute('align', 'center');
                interactorLabel1.setAttribute('value', `District : ${district+1}`);

                interactor.appendChild(interactorLabel1);

                // Create second text element to append to other side of rotating box.
                let interactorLabel2 = document.createElement('a-text');
                interactorLabel2.object3D.position.set(0, 0, -0.5);
                interactorLabel2.object3D.rotation.y = parseFloat(Math.PI);
                interactorLabel2.setAttribute('color', 'red');
                interactorLabel2.setAttribute('width', 5);
                interactorLabel2.setAttribute('align', 'center');
                interactorLabel2.setAttribute('value', `District : ${district+1}`);

                interactor.appendChild(interactorLabel2);

                // Grab the marker element and store its position.
                let marker = document.getElementById('embedded-marker');
                let oldPos = marker.getAttribute('position');
                oldPos = oldPos.y;

                // Grab the mesh/scene.
                const obj = el.getObject3D('mesh');

                // Append interactor to scene.
                sceneEl.appendChild(interactor);
                sceneEl.appendChild(interactorEntity);

                // Add event listener that upon hovering on the rotating box, causes the rotating box to grow in size
                // and the smaller box to display the embedded data above the rotating box.
                // This also moves the marker appropriately.
                interactor.addEventListener('mouseenter', () => {
                    console.log("mouse has entered.");

                    interactor.setAttribute('interaction-on-hover', {
                        'alterSize' : true,
                        'input': '  '
                    });

                    interactorEntity.setAttribute('interaction-on-hover', {
                        'alterSize': false,
                        'input': embedData,
                        'textWidth': '22'
                    })

                    marker.setAttribute('legend-marker-value', {
                        'input': embedData,
                        'side': 'right'
                    })

                    // HARD CODED length of legend.
		            let length = 11 * 0.03;

		            // new position according to ratio (delta) in dataset.
		            let newPos  = ( ( delta * length) + oldPos);
		            marker.object3D.position.set(0, newPos, 0);

                })
                // Remove attributes on mouse-leave.
                interactor.addEventListener('mouseleave' , () => {
                    console.log('mouse has left.')
                    interactor.removeAttribute('interaction-on-hover');
                    interactorEntity.removeAttribute('interaction-on-hover');
            
                    // remove marker value and reset to og position.
                    marker.removeAttribute('legend-marker-value');
                    marker.object3D.position.set(0, oldPos, 0);
                    
                })

                // Community District 1 model has a slightly different structure to the rest of the models, so we need to 
                // parse through two sets of arrays. 
                if(id == 'cd1'){
                    for(row of obj.children){
                        for(x of row.children){
                            
                            // Set the colour of the district according to the embedded dataset.
                            x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                        }
                    }
                }
                else{
                    for(x of obj.children){
            
                        if(x.material){

                            // Set the colour of the district according to the embedded dataset.
                            x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                        }
                    }
                }

            })
            return;

        }
        else{
            console.log(`The input data does not exist. This may be due to an async error.`);
            return;
        }
        
    },
    remove: function(){
        // When this component is removed, reset the colours of each district to the base colour,
        // and remove the rotating boxes + legend.
        const el = this.el;
        const data = this.data;
        const id = el.id;
        const obj = el.getObject3D('mesh');
        let baseColor = [127, 135, 148];


        let interactor = document.getElementById(`box-${id}`);
        let interactorEntity = document.getElementById(`boxEnt-${id}`);

        interactor.parentNode.removeChild(interactor);
        interactorEntity.parentNode.removeChild(interactorEntity);

        if(id == 'cd1'){
            for(row of obj.children){
                for(x of row.children){
                    if(x.material){
                        x.material.color.set(`rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`);
                    }
                    
                }
            }
        }
        else{
            for(x of obj.children){
                if(x.material){
                    x.material.color.set(`rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`);
                }
            }
        }

    }

});

// Sets the metal and color of the gltf models so that on initial load they look like this.
AFRAME.registerComponent('model-initial-settings', {
    init: function() {
        const el = this.el
        const id = el.id;
        
        let baseColor = [127, 135, 148];

        //console.log(`element: ${el}`);
        // Wait for model to load.
        el.addEventListener('model-loaded', () => {
            const obj = el.getObject3D('mesh');

            if(id == 'cd1'){
                for(row of obj.children){
                    for(x of row.children){
                        if(x.material){
                            x.material.color.set(`rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`);

                            x.material.metalness = 0;
                            //console.log(`Color for ${id} set: ${x.material.color}, ${x.material.metalness}`);
                        }
                        
                    }
                }
            }
            else{
                for(x of obj.children){
                    if(x.material){
                        x.material.color.set(`rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`);
                        x.material.metalness = 0;
                        //console.log(`Color for ${id} set: ${x.material.color}, ${x.material.metalness}`);
                    }
                }
            }
        })
    }
});

// Create on-hover component that changes size of entity and displays a given input.
AFRAME.registerComponent('interaction-on-hover', {
    schema: {
        // Takes input that can alter the size of the element,
        // The text to displayed,
        // The width of the text,
        // and the color of the text.
        alterSize : {type: 'boolean', default: false},
        input: {type: 'string', default: 'ok'}, 
        textWidth : {type: 'string', default: '10'},
        color: {type: 'string', default: 'red'}
    },
    init: function() {
        const el = this.el;
        const id = el.id;
        const data = this.data;
        let textValue = data.input;
        let textWidth = data.textWidth;
        let textColor = data.color;
        let alterSize = data.alterSize;
        let camera = document.querySelector('a-entity[camera]');


        //console.log(`add-text has been added to object`);

        // Create text element, with the parameters set according to the components schema.
        let txt = document.createElement('a-entity');
        txt.setAttribute('text', {
            'color' : textColor,
            'align' : 'center',
            'width': textWidth,
            'value' : textValue
        });
        // Add ID so that text can be queried and added quickly.
        txt.setAttribute('id', `txt-${id}`);
        // Set position to 2 units in the positive y axis.
        txt.setAttribute('position', '0 2 0');

        // Determine the camera's current rotation, and calculate the opposite in radians
        // using the PI number.
        let camRot = camera.object3D.rotation
        let txtRot = (camRot._y + Math.PI);

        // Set the text rotation to be the oppposite of the Camera elements y rotation in radians.
        // This means that when the user interacts with the element the text will always be rotated to 
        // face the camera/user.
        txt.object3D.rotation.y = parseFloat(Math.PI+camRot._y);
        
        // De-Bugging
        //console.log(`x: ${camRot._x}, Y: ${camRot._y}`);
        //console.log(`Inverse Rot: ${txtRot}`);
        
       // Append the text element to the components parent element.
        el.appendChild(txt);
        
        // If the alterSize attribute is set to true, change the size of the parent element by 110%.
        if(alterSize){
            el.object3D.scale.multiplyScalar(1.1);
        }
        
    },

    // When this component is removed, delete the text element, and reduce the size of the parent element by 110%
    remove: function(){
        const el = this.el;
        const data = this.data;
        const id = el.id;
        let alterSize = data.alterSize;

        let txt = document.getElementById(`txt-${id}`);
        console.log(txt);
        //console.log("Child removing.")
        //console.log(el);
        //console.log(el.childNodes);
        txt.parentNode.removeChild(txt);
        //console.log(el.getAttribute('scale'));
        if(alterSize){
            //console.log("size altered- revert.")
            el.object3D.scale.divideScalar(1.1);
        }
        
    }
})

// Component that colours each triangle of a 3D object separately.
AFRAME.registerComponent('multicolored-cube', {
    dependencies: ['geometry'],
  
    init: function() {
      var mesh = this.el.getObject3D('mesh');
      var geom = mesh.geometry;
      for (var i = 0; i < geom.faces.length; i++) {
        var face = geom.faces[i]; 
        face.color.setRGB(Math.random(), Math.random(), Math.random());
      }
      
      geom.colorsNeedUpdate = true;
      mesh.material.vertexColors = THREE.FaceColors;
    }
});

// Component that displays the input text over an element. 
// This is adapted to suit the marker entity on the custom legend.
// The input is a string which gets rendered.
AFRAME.registerComponent('legend-marker-value', {
    schema : { 
        input: {type: 'string', default: 'placeholder'},
        side:  {type: 'string', default: 'right'}
    },

    // Function that runs on initialisation of attribute.
    init: function() {
        
        // Declare element + data variables.
        const el = this.el;
        const data = this.data;
        const id = el.id;


        // Create plane element, and add text component to it.
        // Text holds value of the component input.
        let txt = document.createElement('a-plane');
        txt.setAttribute('text', {
            'color' : 'red',
            'align' : 'center',
            'width': '0.4',
            'value' : data.input
        });

        // Set plane background to black.
        txt.setAttribute('material', 'color: black');
        txt.setAttribute('geometry', {width: 0.06, height: 0.03});

        
        
        // As marker is rotated about z-axis by 45 we must also position the entity
        // in Y as well. Through trig -> it is 0.4 too.
        let posX = 0.035
        let posY = ( Math.tan(45 * Math.PI / 180) * Math.abs(posX));

        // According to side parameter, set the position of the element.
        // Side indicates the side of the legend (e.g legend on left-hand side of screen => side = 'left').
        switch (data.side){
            case 'left':
                posX = posX + 0.027;
                posY = -( Math.tan(45 * Math.PI / 180) * Math.abs(posX));
                break;
            case 'right':
                posX = -posX;
                posY = ( Math.tan(45 * Math.PI / 180) * Math.abs(posX));;
        }
        
        txt.object3D.position.set(posX, posY, 0.001);
        

        // Set rotation to offset marker rotation.
        let rotationZ = THREE.Math.degToRad(-45)
        txt.object3D.rotation.z = (rotationZ);

        // Append to marker element.
        el.appendChild(txt);
        
    },
    remove: function(){

        //Declare constants.
        const el = this.el;

        // Remove child elements.
        el.removeChild(el.childNodes[0]);
        
    }
})