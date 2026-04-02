# Urban Legend Web Game — Current Project Memo (2026-04-02)

## Project Goal
A dreamcore/pastel web game scene (Three.js) with a character on a high platform, a drink → walk → jump → fall sequence, ground with L-system plants, and stylized UI. Users submit text to grow plants. Visual style: bubblegum dreamcore, pearl platform, Saint font. Mobile support important.

## Repo Structure
- `index.html` — single-file app with Three.js, UI, animation logic, plants, audio, effects.
- `character.glb` — character model with animations.
- `music/4月2日.MP3` — background music.

## Key Visuals & UI
- UI uses embedded `Saint` font (base64 in CSS). All UI text should be English.
- Bubble/"fish-eye" UI style with rounded shapes, gradients, and soft shadows.
- UI starts collapsed (mini) at bottom-right; clicking expands. "WRITE" button triggers restart when in DONE.
- Title text `URBAN LEGEND` added near top (metallic text + shadow) with `#title` overlay.
- Search button is a bubble-style oval at bottom-left.

## Character & Animation
- State machine: IDLE → DRINK → WALK → JUMP → FALL → LAND → DONE.
- Walk once to platform edge, jump forward, fall.
- Character visibility enforced during active phases.
- Root motion stripped for hips/root; `baseModelY` auto-calculated from bounding box + FOOT_LIFT.
- Camera: orbit allowed on platform phases; cinematic on FALL/LAND with closer camera.

## Drink Glow (Important)
- Pulse glow is an outline clone of character using **backside additive** materials.
- Pulse expands then contracts at 10Hz, scaled from character center. Must follow body silhouette, not a simple sphere.
- Body emissive tint reduced so pulse is visible.
- User requested warm orange/yellow glow (currently more orange `#ff7a00`).

## Drink Text Mouth Effect
- 10 red text items animate from UI input box → mouth.
- Uses screen-space DOM elements in `#mouth-text-layer` overlay.
- Start position derived from textarea center if expanded, else from mini UI center.
- Moves to mouth screen position via projection. Red text shrinks/flickers and disappears.

## Plants
- L-system plants generated in `makePlant`.
- Plants grow outward, 50% chance to spawn at 50% height of existing plant branch.
- Growth uses drawRange for growth animation.
- During explosion, plants are dimmed (opacity reduced) so explosion is visible.

## Explosion
- `createBurst` spawns large 3D particle sphere (22k particles) with higher radius/speed.
- Particles are additive and floaty. Plants dim during explosion via `setPlantsDim`.

## Ground & Platform
- Ground: glowing green plane + grass points. Currently rectangular plane.
- User complained about a "white square plane" floating; aim is to remove ONLY the floating white square, keep green ground.
- Platform: pearl material, top+side (no bottom). Uses MeshPhysicalMaterial.

## Audio
- Background music at `music/4月2日.MP3`.
- Autoplay blocked; must start on WRITE click.
- Current logic: `startBgm()` called on WRITE click; audio element uses `playsinline`.

## Known Issues / Requests
- Title visibility on iOS sometimes not appearing; fallback may be needed.
- UI WRITE text color should be coffee brown, and always use Saint font.
- User wants mouth text always from UI, not top-right.
- White square plane below platform must be removed without removing green ground.
- Character loading is slow; caching/preload added but may still feel slow.

## Restore Tags
- Tags created: F, G, H, I, J. (Current branch moved past I; latest tag J created before recent features.)

## Recent Commits (latest)
- `8f66387`: Mouth text as screen-space overlay; title in CSS; fixes start position.

## Quick Navigation (index.html)
- UI styles near top in `<style>`.
- Title: `#title` element in body.
- Audio: `<audio id="bgm">` and JS `startBgm()`.
- Drink glow: `updateDrinkGlow` function.
- Mouth text: `startMouthText` / `updateMouthText`.
- Plants: `addPlant`, `makePlant`.
- Explosion: `createBurst` / `updateBurst`.

## Next Steps Suggestions
- Diagnose floating white plane: identify any plane/circle geometry besides ground. Possibly platform bottom or helper plane. Search for `PlaneGeometry` and ensure only ground plane exists.
- Improve title visibility on iOS: consider using plain text color or SVG overlay.
- Improve load speed: use `preload` and possibly small LOD for character.

