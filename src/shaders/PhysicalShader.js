export default {
	uniforms: {
		"diffuseColor": { value: [1, 1, 1] }
	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec3 diffuseColor;",

		"void main() {",

			"gl_FragColor = vec4( Diffuse_BRDF(diffuseColor), 1 );",

		"}",

		"vec3 Diffuse_BRDF(vec3 diffuseColor) {",
		"	return diffuseColor / 3.1415;",
		"}"

	].join( "\n" )

}