#version 300 es
precision mediump float;

in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTextureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(uTextureUnit, vTextureCoord)*vColor;
    fColor.a = 1.0;

}
