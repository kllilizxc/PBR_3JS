import THREElib from 'three-js'
import fresnelShader from './shaders/FresnelShader.js'
import basicShader from './shaders/BasicShader.js'
import physicalShader from './shaders/PhysicalShader.js'

var THREE = THREElib();

var container;
var camera;
var scene;
var spheres = [];
var renderer;
var mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', onDocumentMouseMove, false);
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
	let envMap =  new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/LightProbes/')
								.load([
									'pisa_c00.png',
									'pisa_c01.png',
									'pisa_c02.png',
									'pisa_c03.png',
									'pisa_c04.png',
									'pisa_c05.png'
								]);


	let BRDFlut = new THREE.TextureLoader()
							.load('png/convolution_spec.png');

	let irradianceMap = new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/diffuse/')
								.load([
									'pisa_d_c00.png',
									'pisa_d_c01.png',
									'pisa_d_c02.png',
									'pisa_d_c03.png',
									'pisa_d_c04.png',
									'pisa_d_c05.png'
								]);
	irradianceMap.minFilter = THREE.LinearFilter;

	scene.background = envMap;

	let geometry = new THREE.SphereBufferGeometry(100, 32, 16);
	let shader = physicalShader;
	shader.uniforms.envMap.value = envMap;
	shader.uniforms.irradianceMap.value = irradianceMap;
	shader.uniforms.BRDFlut.value = BRDFlut;
	

	let material = new THREE.ShaderMaterial(shader);


	createSphere(scene, geometry, material);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
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

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - window.innerWidth / 2) * 10;
	mouseY = (event.clientY - window.innerHeight / 2) * 10;
}