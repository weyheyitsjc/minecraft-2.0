#version 300 es
precision mediump float;

in vec2 vTextureCoord;
uniform sampler2D uTextureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(uTextureUnit, vTextureCoord);
}
