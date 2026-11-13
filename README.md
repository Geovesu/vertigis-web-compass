# Compass for VertiGIS Studio Web

A drop-in replacement for the built-in Compass component in [VertiGIS Studio Web](https://www.vertigis.com/vertigis-studio/). It works the same way in a map, but in a **scene** a click also resets the camera **tilt**, not only the heading.

The built-in compass (and Esri's Compass widget under it) only turns a scene back to north and leaves the camera tilted. You could reset the tilt with a workflow behind a button, but that loses the live compass icon. This library keeps Esri's Compass widget, so the icon still turns with the view, and changes only what a click does.

| View | Click does |
|------|------------|
| Map (2D) | Rotates to north, same as the built-in compass |
| Scene (3D) | Rotates to north **and** tilts the camera to look straight down, around the current center |

## Settings

Besides the usual Title, Icon, Visibility and Layout settings, the component has two settings in Designer:

| Setting | Default | What it does |
|---------|---------|--------------|
| Reset tilt in 3D (`resetTilt`) | on | In a scene, a click also sets the tilt to 0. Turn off to get Esri's default (heading only). |
| Hide when north (`hideWhenReset`) | on | Hides the compass while the view faces north, like the built-in one. With *Reset tilt in 3D* on, a tilted scene also shows it, because a click then has something to reset. |

## Use it in an app

1. Download `main.js` from the [latest release](../../releases/latest), or build it yourself (below).
2. In VertiGIS Studio Web Designer, add it under **Libraries**: upload the file, or link to a URL where it is hosted.
3. Add **Compass** (from this library) to the map, for example in the top-left slot, and remove the built-in compass.

In layout XML it looks like this:

```xml
<layout xmlns="https://geocortex.com/layout/v1" xmlns:geodata="geodata.web" ...>
    <map id="map-1" config="map-config-1">
        <geodata:compass slot="top-left" config="geodata-compass-1" />
    </map>
</layout>
```

and in `app.json`:

```json
{
    "$type": "geodata-compass",
    "id": "geodata-compass-1",
    "resetTilt": true,
    "hideWhenReset": true
}
```

Texts are in English and Norwegian (`no`, `nb`, `nn`).

## Build

This is a standard [VertiGIS Studio Web SDK](https://developers.vertigisstudio.com/docs/web/sdk-overview/) project. You need Node.js.

```bash
npm install
npm start        # dev server on http://localhost:3001, opens a sample scene
npm run build    # writes build/main.js
```

Built against `@vertigis/web` 5.43 (ArcGIS Maps SDK for JavaScript 5.0).

## How it works

`src/components/Compass/Compass.tsx` wraps Esri's `Compass` widget with `createEsriMapWidget`. The widget's click handler calls `viewModel.reset()` each time it is clicked, so the component replaces `reset` on that one view model instance. In a scene it calls `view.goTo({ heading: 0, tilt: 0 })`; otherwise it uses Esri's own reset. The *Hide when north* behaviour watches the scene camera (or the map rotation) through VertiGIS' `observableUtils`.
