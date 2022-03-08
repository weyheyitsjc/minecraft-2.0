#version 300 es
in vec3 aPosition;

out vec3 texCoord;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    texCoord = normalize(aPosition.xyz);
}