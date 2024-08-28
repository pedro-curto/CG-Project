# How to run

First, clone the project:

`git clone https://github.com/pedro-curto/CG-Project.git`

Navigate to this directory:

`cd deliveryC`

Then, start a live server. You can either use VSCode's live server extension (what I used), or, for example, install Node.js's live-server:

`npm install -g live-server`

And then start it:

`live-server`

You can then access it on your browser at `localhost:8080/`.

## Instructions
The requirements for this project are fully described in the `statement.pdf`. However, here is a quick feature guide for the available keys:
### Movement
- '1': Toggle movement for inner ring (red)
- '2': Toggle movement for medium ring (blue)
- '3': Toggle movement for outer ring (green)
### Lights
- 'd'/'D': Toggle global scene illumination
- 'p'/'P': Toggle Mobius strip's lighting
- 's'/'S': Toggle lights for each spotlight (pointing to each shape)
### Materials
- 'q'/'Q': Switch to MeshLambertMaterial (Gouraud shading)
- 'w'/'W': Switch to MeshPhongMaterial (Phong shading)
- 'e'/'E': Switch to MeshToonMaterial (Cartoon shading)
- 'r'/'R': Switch to MeshNormalMaterial (NormalMap shading)

You can also enter VR mode via the WebXR API Emulator extension, for example.

Have fun!
