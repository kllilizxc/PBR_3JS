import THREElib from 'three-js'
import OBJLoader from 'addons/OBJLoader'
import OrbitControls from 'addons/OrbitControls'
import fresnelShader from './shaders/FresnelShader.js'
import basicShader from './shaders/BasicShader.js'
import physicalShader from './shaders/PhysicalShader.js'

var THREE = THREElib();
OBJLoader(THREE);
OrbitControls(THREE);

var container;
var camera;
var scene;
var spheres = [];
var renderer;
var mouseX = 0, mouseY = 0;

// document.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('resize', onWindowResize, false);

init();
animate();
// render();

function init() {
	container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera(60, 
		window.innerWidth / window.innerHeight,
		1, 100000);
	camera.position.z = 1000;

	scene = new THREE.Scene();

	let testEnvMaps = ['pisa', 'uffizi'];


	let envMapName = testEnvMaps[1];
	let envMap =  new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/lightProbes/')
								.load([
									`${envMapName}_c00.png`,
									`${envMapName}_c01.png`,
									`${envMapName}_c02.png`,
									`${envMapName}_c03.png`,
									`${envMapName}_c04.png`,
									`${envMapName}_c05.png`
								]);

	let mipmaps = new Array(4);
	for(let i = 1; i <= 5; i++) {
		mipmaps[i - 1] = new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/ggx_filtered/')
								.load([
									`${envMapName}_mip${i}_face0.png`,
									`${envMapName}_mip${i}_face1.png`,
									`${envMapName}_mip${i}_face2.png`,
									`${envMapName}_mip${i}_face3.png`,
									`${envMapName}_mip${i}_face4.png`,
									`${envMapName}_mip${i}_face5.png`
								]);
	}

	let BRDFlut = new THREE.TextureLoader()
							.load('png/convolution_spec.png');

	let irradianceMap = new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/diffuse/')
								.load([
									`${envMapName}_d_c00.png`,
									`${envMapName}_d_c01.png`,
									`${envMapName}_d_c02.png`,
									`${envMapName}_d_c03.png`,
									`${envMapName}_d_c04.png`,
									`${envMapName}_d_c05.png`
								]);
	irradianceMap.minFilter = THREE.LinearFilter;

	scene.background = envMap;

	let geometry = new THREE.SphereBufferGeometry(100, 32, 16);
	
	let baseMaterial = new THREE.ShaderMaterial(basicShader);


	// createSphere(scene, geometry, material);

	let testModels = [{
		name: 'sphere0',
		positionCorrection: {x: 110, y:-60},
		scale: 100
	},
	{
		name: 'LibertStatue.bak',
		positionCorrection: {x: 80, y: -120},
		scale: 400
	}];

	let model = testModels[1];

	new THREE.OBJLoader().load(
		`objs/${model.name}.obj`,
		objects => {
			objects.traverse(_object => {
				if(_object instanceof THREE.Mesh) {
					
					for (let i = 5; i >= 0; i--) {
						let object = _object.clone();
						let shader = Object.assign({}, physicalShader);
						shader.uniforms = {
							envMap: {value: i == 0 ? envMap : mipmaps[i - 1]},
							irradianceMap: {value: irradianceMap},
							BRDFlut: {value: BRDFlut},
							roughness: {value: 0.2 * i}
						}

						object.material = new THREE.ShaderMaterial(shader);;
						object.position.x = (2 * i - 5) * model.positionCorrection.x;
						object.position.y = model.positionCorrection.y;
						object.position.z = 0;
						object.scale.x = model.scale;
						object.scale.y = model.scale;
						object.scale.z = model.scale;
						scene.add(object);
					}
				}
			});
		});


	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
}

// function loadVertexShader(shader) {
// 	return new Promise((resolve, reject) => {
// 		loader.load(`../shaders/${shader}/vertexShader.glsl`, data => {
// 			resolve(data);
// 		},
// 		xhr => 0,
// 		xhr => reject(xhr));
// 	});
// }

// function loadFragmentShader(shader) {
// 	return new Promise((resolve, reject) => {
// 		loader.load(`../shaders/${shader}/fragmentShader.glsl`, data => {
// 			resolve(data);
// 		},
// 		xhr => 0,
// 		xhr => reject(xhr));
// 	});
// }

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	camera.position.x += (mouseX - camera.position.x) * .05;
	camera.position.y += (-mouseY - camera.position.y) * .05;


	camera.lookAt(scene.position);
	renderer.render(scene, camera);
}

function createSphere(scene, geometry, material, x = 0, y = 0, z = 0) {
	let mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;

	scene.add(mesh);
	spheres.push(mesh);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

// function onDocumentMouseMove(event) {
// 	mouseX = (event.clientX - window.innerWidth / 2) * 10;
// 	mouseY = (event.clientY - window.innerHeight / 2) * 10;
// }