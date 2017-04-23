export default {
	uniforms: {
		"baseColor": { value: [0, 0, 0] },
		"ambientColor": { value: [0.2, 0.2, 0.2] },
		"lightColor": { value: [0.2, 0.2, 0.2] },
		"roughness": { value: 0 },
		"metalness": { value: 0.5 },
		"LightDirection": { value: [0.5, 0.5, 0.5] },
		"envMap": { value: null },
		"irradianceMap": { value: null },
		"BRDFlut": { value: null }
	},

	vertexShader: [
		"uniform vec3 LightDirection;",

		"varying vec3 N;",
		"varying vec3 V;",
		"varying vec3 L;",
		"varying vec4 worldPosition;",

		"void main() {",
			"N = normal;",
			"worldPosition = modelMatrix * vec4( position, 1.0 );",
			"V = worldPosition.xyz - cameraPosition;",
			"L = LightDirection;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"const float PI = 3.14159265358979323846;",
		"const float gamma = 2.2;",

		"uniform vec3 baseColor;",
		"uniform vec3 lightColor;",
		"uniform vec3 ambientColor;",
		"uniform float roughness;",
		"uniform float metalness;",
		"uniform samplerCube envMap;",
		"uniform samplerCube irradianceMap;",
		"uniform sampler2D BRDFlut;",

		"varying vec3 N;",
		"varying vec3 V;",
		"varying vec3 L;",
		"varying vec4 worldPosition;",

		"vec3 BRDF_Diffuse(in vec3 color) {",
		"	return color / PI;",
		"}",

		"float Specular_D(in float roughness, in vec3 N, in vec3 H) {",
		"	float a2 = pow(roughness, 2.0);",
		"	float NoH = saturate(dot(N, H));",
		"	return a2 / (PI * pow(pow(NoH, 2.0) * (a2 - 1.0) + 1.0, 2.0));",
		"}",

		"float Specular_G1(in float roughness, in vec3 N, in vec3 V) {",
		"	float k = pow(roughness + 1.0, 2.0) / 8.0;",
		"	float NoV = max( dot(N, V), 1e-5 );",
		"	return NoV / (NoV * (1.0 - k) + k);",
		"}",

		"float Specular_G(in float roughness, in vec3 N, in vec3 V, in vec3 L) {",
		"	return Specular_G1(roughness, N, L) * Specular_G1(roughness, N, V);",
		"}",

		"vec3 Specular_F(in vec3 specularColor, in vec3 V, in vec3 H) {",
		"	float VoH = saturate(dot(V, H));",
		" 	return specularColor + (1.0 - specularColor) * pow(2.0, (-5.55473 * VoH - 6.98316) * VoH);",
		"}",

		"vec3 BRDF_Specular(in vec3 specularColor, in float roughness, in vec3 L, in vec3 N, in vec3 V) {",
		"	vec3 H = normalize(V + L);",
		"	float NoL = saturate(dot(N, L));",
		"	if(NoL <= 0.0) return vec3(0, 0, 0);",
		"	float NoV = max( dot(N, V), 1e-5 );",
		"	return Specular_D(roughness, N, H) * Specular_F(specularColor, V, H) * Specular_G(roughness, N, V, L) / (NoL * NoV);",
		"}",

		"vec3 prefilterIrradiance(samplerCube irradianceMap, vec3 N) {",
		"	return textureCube(irradianceMap, N).rgb;",
		"}",

		"vec3 prefilterEnvMap(samplerCube envMap, float roughness, vec3 R) {",
		"	return textureCube( envMap, vec3(R.x, -R.y, -R.z), roughness).rgb;",
		"}",

		"vec2 integrateBRDF(sampler2D BRDFlut, float roughness, float NoV) {",
		" return texture2D(BRDFlut, vec2(roughness, NoV)).xy;",
		"}",

		"vec3 approximateSpecularIBL(samplerCube envMap, sampler2D BRDFlut, vec3 specularColor, float roughness, vec3 N, vec3 V) {",
		"	float NoV = saturate(dot(N, V));",
		"	vec3 R = 2.0 * dot(V, N) * N - V;",

		"	vec3 prefilteredColor = prefilterEnvMap(envMap, roughness, R);",
		"	vec2 envBRDF = integrateBRDF(BRDFlut, roughness, NoV);",
		"	return prefilteredColor * (specularColor * envBRDF.x + envBRDF.y);",
		"}",

		"vec3 modelShading(vec3 diffuseColor, vec3 specularColor, vec3 ambientColor, vec3 lightColor, float roughness, vec3 L, vec3 N, vec3 V) {",
			"float NoL = saturate(dot(N, L));",
			"return (ambientColor + BRDF_Diffuse(diffuseColor) + BRDF_Specular(specularColor, roughness, L, N, V)) * lightColor * NoL;",
		"}",

		"vec3 envShading(vec3 diffuseColor, vec3 specularColor, samplerCube envMap, samplerCube irradianceMap, sampler2D BRDFlut, float roughness, vec3 N, vec3 V) {",
		"	vec3 diffuse = BRDF_Diffuse(diffuseColor) * prefilterIrradiance(irradianceMap, N);",
		"	vec3 specular = approximateSpecularIBL(envMap, BRDFlut, specularColor, roughness, N, V);",
		"	return diffuse + specular;",
		"}",

		"vec3 gammaCorrection(vec3 color) {",
		"	return pow(color, vec3(gamma));",
		"}",

		"vec3 deGammaCorrection(vec3 color) {",
		"	return pow(color, vec3(1.0 / gamma));",
		"}",

		"void main() {",
			"vec3 _baseColor = gammaCorrection(baseColor);",
			"vec3 diffuseColor = mix(_baseColor, vec3(0), metalness);",
			"vec3 specularColor = mix(vec3(0.04), _baseColor, metalness);",
			"vec3 modelColor = modelShading(diffuseColor, specularColor, ambientColor, lightColor, roughness, L, N, V);",
			"vec3 envColor = envShading(diffuseColor, specularColor, envMap, irradianceMap, BRDFlut, roughness, N, V);",
			"gl_FragColor = vec4(modelColor + envColor, 1);",
    		"gl_FragColor.rgb = deGammaCorrection(gl_FragColor.rgb);",
		"}"

	].join( "\n" )

}