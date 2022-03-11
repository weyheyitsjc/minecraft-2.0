#version 300 es
in vec3 aPosition;
in vec3 aNormal;

out vec3 R;
uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    
    //compute vectors in world coordinates
    //the vertex in world coordinates
    vec4 pos = (modelMatrix*vec4(aPosition,1.0));

    //the ray from the vertex towards the camera
    vec3 I = normalize(inverse(cameraMatrix)*vec4(0,0,0,1)-pos).xyz;

    //normal in camera coordinates
    vec3 N = normalize(modelMatrix*vec4(aNormal,0.0)).xyz;

    R = normalize(vec3(reflect(-I,N)));
}