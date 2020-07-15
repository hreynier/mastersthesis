// - AFrame Components - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //


// DESCRIPTION GOES HERE.
//

// Declare package imports.


// Embeds data into 3D gltf city model.
AFRAME.registerComponent('embed-data', {
    schema: {type: 'string', default: 'pop2010'},
    init: function () {
        let el = this.el;
        let data = this.data;
        let colours;

        // Wait for model to load.
        el.addEventListener('model-loaded', () => {
            let id = el.id;
            let district;
            console.log(`This is the id: ${id}`);
            
            if(popObj){
                
                console.log(`Component object input: ${popObj}`);
                popObj.then(value => {
                    let inputData = value;
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
                                x.material.metalness = 0;
                                x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                            }
                        }
                    }
                    else{
                        for(x of obj.children){
                            //console.log(x);
                            if(x.material){
                                x.material.metalness = 0;
                                x.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                            }
                        }
                    }
                    
                    //obj.color = new THREE.Color(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);
                    //obj.material.color.set(`rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`);


                })

            }
            else{
                console.log(`The input data does not exist. This may be due to an async error.`);
            }
        });
    }   
});