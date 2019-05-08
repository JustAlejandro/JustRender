R"zzz(#version 410 core
layout(location = 0) out vec4 fragment_color;
in vec2 tex_coord;
uniform sampler2D sampler;
uniform sampler2D depSten;
uniform sampler2D specular;
uniform sampler2D vs_Normals;
uniform sampler2D vs_Ray;

uniform float aspect;
uniform mat4 projection;

vec4 toTextureSpace(vec4 r){
	r.x = (r.x + 1.0) / 2.0;
	//Aspect ration correction
	r.y = ((r.y + 1.0) / 2.0) * aspect;
	r.z = (r.z + 1.0) / 2.0;
	return r;
}

//Here's where we'll trace our SS ray
bool traceRay(vec4 color){
	//Start position of the ray
	vec3 normal = texture(vs_Normals,tex_coord).xyz;

	//Start postion in view Space
	vec3 viewRay = (texture(vs_Ray,tex_coord)).xyz;
	vec4 start = vec4((viewRay).xyz,1.0);

	//Reflected view space Ray
	vec3 vsRefl = reflect(normalize(viewRay.xyz), normalize(normal));

	//End Postition in view Space
	vec4 end = start + vec4(vsRefl * 1000000, 1.0);

	//Start Position in texture Space;
	start = (projection * start);
	start = toTextureSpace(start / start.w);

	//End Position in texture Space
	end = (projection * end);
	end = toTextureSpace(end / end.w);

	vec4 tsRefl = vec4(normalize((end - start).xyz),0.0);
	vec4 pos = start + tsRefl * 0.01;

	bool hit = false;
	int step = 0;
	while(!hit && pos.x >= 0.0 && (pos.x) < 1.0 && pos.y >= 0.0 && (pos.y) < 1.0 && pos.z < 1.0 && pos.z > 0.0 && step < 3000){
		step++;
		if(abs(pos.z - (texture(depSten, vec2(pos.x, pos.y))).x) < 0.0001 && texture(depSten, vec2(pos.x,pos.y)).x < 0.988){
			hit = true;
			fragment_color = texture(sampler, vec2(pos.x, pos.y));
		}
		pos += tsRefl * 0.001;
	}
	return hit;
}

void main() {
	//Don't run reflections if specular not specified
	if(texture(specular,tex_coord).x <= 0.01){
		fragment_color = vec4(texture(sampler, tex_coord).xyz, 1.0);
		return;
	}
	//Reflection running will be put in here.
	vec4 rayCol = vec4(1.0);
	if(traceRay(rayCol)){

	}
	else{
		fragment_color = vec4(texture(sampler, tex_coord).xyz, 1.0);
	}
}
)zzz"