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

        // Wait for model to load.
        el.addEventListener('model-loaded', () => {
            let id = el.id;
            let district;
            console.log(`This is the id: ${id}`);
            switch(id){
                case 'cd1':
                    district=1;
                    break;
                case 'cd2':
                    district=2;
                    break;
                case 'cd3':
                    district=3;
                    break;
                case 'cd4':
                    district=4;
                    break;
                case 'cd5':
                    district=5;
                    break;
                case 'cd6':
                    district=6;
            }

            if(popObj){
                let minimum;
                let maximum;
                let dataset = popObj.data;
                let colNo;

                switch(data){
                    case 'pop2000':
                        minimum = popObj.min00;
                        maximum = popObj.max00;
                        colNo = 1;
                        break;
                    case 'pop2010':
                        minimum = popObj.min10;
                        maximum = popObj.max10;
                        colNo = 2;
                        break;
                    case 'popChange':
                        minimum = popObj.minDiff;
                        maximum = popObj.maxDiff;
                        colNo = 3;
                }
                
                for(var i=0; i < dataset.length; i++){

                }
            }
            //Grab the mesh / scene.
            const obj = el.getObject3D('mesh');
            // Go over the submeshes and modify materials we want.
            obj.traverse(node => {
                if (node.name.indexOf('ship') !== -1) {
                    node.material.color.set('red');
                }
            });
        });
    }   
});