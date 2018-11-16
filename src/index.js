import * as CANNON from 'cannon';


const WORLD = new CANNON.World();
const SCENE = new THREE.Scene();
const cannonDebugRenderer = new THREE.CannonDebugRenderer( WORLD, SCENE );


// To use the tool, you have to do two simple things.

// 1. Create a ```THREE.CannonDebugRenderer``` instance.
// 2. Run ```.update()``` in your render loop.

// TODO: add debugger
// var world = new CANNON.World();
// var scene = new THREE.Scene();
// var cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );

// TODO: active debugger in render function
// function render() {
//   requestAnimationFrame( render );
//   world.step( timeStep );            // Update physics
//   cannonDebugRenderer.update();      // Update the debug renderer
//   renderer.render( scene, camera );  // Render the scene
// }
// render();