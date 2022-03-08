#version 300 es
precision mediump float;

in vec3 texCoord;
in vec4 vColor;

uniform samplerCube textureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(textureUnit, texCoord)*vColor;
    fColor.a = 1.0;
}