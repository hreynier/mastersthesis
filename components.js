// - AFrame Components - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //




// DESCRIPTION GOES HERE.
//

// 

// Embeds data into 3D gltf city model.
AFRAME.registerComponent('embed-data', {
    schema: {type: 'string', default: 'pop2010'},
    init: function () {
        //console.log("attribute set: init");
        let el = this.el;
        let data = this.data;
        let colours;
        console.log(el);

        // Don't need to wait for model to load as this is applied long after the model has looaded.
        //el.addEventListener('model-loaded', () => {
            let id = el.id;
            let district;
            console.log(`This is the id: ${id}`);
            
            if(popObj){
                
                console.log(`Component object input: ${popObj}`);
                //popObj.then(value => {
                    let inputData = popObj;
                    let col;

                    switch(data){
                        case 'pop2000':
                            col = inputData.pop00;
                            break;
                        
                        case 'pop2010':
                            col = inputData.pop10;
                            break;
                        case 'popDiff':
                            col = inputData.popDiff;

                    }

                    switch(id){
                        case 'cd1':
                            district=0;
                            colours = col[district];
                            
                            break;
                        case 'cd2':
                            district=1;
                            colours = col[district];
                            break;
                        case 'cd3':
                            district=2;
                            colours = col[district];
                            break;
                        case 'cd4':
                            district=3;
                            colours = col[district];
                            break;
                        case 'cd5':
                            district=4;
                            colours = col[district];
                            break;
                        case 'cd6':
                            district=5;
                            colours = col[district];
                    }

                    //console.log(`colors: ${colours[0]}`);

                    // Grab the mesh/scene.
                    const obj = el.getObject3D('mesh');

                    if(id == 'cd1'){
                        for(row of obj.children){
                            for(x of row.children){
                                
                                x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                            }
                        }
                    }
                    else{
                        for(x of obj.children){
                            //console.log(x);
                            if(x.material){
                                
                                x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                            }
                        }
                    }

                //})
                return;

            }
            else{
                console.log(`The input data does not exist. This may be due to an async error.`);
                return;
            }
        //});
    },
    remove: function(){
        const el = this.el;
        const data = this.data;
        const id = el.id;
        const obj = el.getObject3D('mesh');
        let baseColor = [127, 135, 148];


        

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
        alterSize : {type: 'boolean', default: false},
        input: {type: 'string', default: 'ok'}
    },
    init: function() {
        const el = this.el;
        const id = el.id;
        const data = this.data;
        let textValue = data.input
        let alterSize = data.alterSize;
        let camera = document.querySelector('a-entity[camera]');


        //console.log(`add-text has been added to object`);
        let txt = document.createElement('a-entity');
        txt.setAttribute('text', {
            'color' : 'red',
            'align' : 'center',
            'width': '10',
            'value' : textValue
        });
        txt.setAttribute('position', '0 2 0');

        let camRot = camera.object3D.rotation
        let txtRot = (camRot._y + Math.PI);

        //txt.object3D.rotation.x = parseFloat(camRot._x);
        txt.object3D.rotation.y = parseFloat(camRot._y);
        //txt.object3D.rotation.z = parseFloat(camRot._z);
        console.log(`x: ${camRot._x}, Y: ${camRot._y}`);
        
       
        el.appendChild(txt);
        
        if(alterSize){
            el.object3D.scale.multiplyScalar(1.1);
        }
        
    },
    remove: function(){
        const el = this.el;
        const data = this.data;
        let alterSize = data.alterSize;
        //console.log("Child removing.")
        //console.log(el);
        //console.log(el.childNodes);
        el.removeChild(el.childNodes[0]);
        //console.log(el.getAttribute('scale'));
        if(alterSize){
            //console.log("size altered- revert.")
            el.object3D.scale.divideScalar(1.1);
        }
        
    }
})


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