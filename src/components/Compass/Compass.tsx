import type Accessor from "@arcgis/core/core/Accessor";
import type { GoToTarget3D } from "@arcgis/core/views/types";
import CompassWidget from "@arcgis/core/widgets/Compass";
import { watch } from "@vertigis/arcgis-extensions/support/observableUtils";
import { useWatchAndRerender } from "@vertigis/web/ui";
import type {
    MapOrSceneView,
    MapWidgetConstructor,
    MapWidgetProps,
} from "@vertigis/web/ui/esriUtils";
import { createEsriMapWidget } from "@vertigis/web/ui/esriUtils";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import type CompassModel from "./CompassModel";

export type CompassProps = MapWidgetProps<CompassModel & Accessor>;

const CompassWidgetWrapper = createEsriMapWidget(
    CompassWidget as MapWidgetConstructor<CompassWidget>,
    false,
    true
);

/** Below this many degrees, heading and tilt count as reset. */
const TOLERANCE = 0.1;

/** Distance in degrees from north, whichever way round is shorter. */
function offsetFromNorth(angle: number): number {
    const normalized = ((angle % 360) + 360) % 360;
    return Math.min(normalized, 360 - normalized);
}

function isReset(view: MapOrSceneView | undefined, resetTilt: boolean): boolean {
    if (!view) {
        return true;
    }
    if (view.type === "3d") {
        const { camera } = view;
        if (!camera) {
            return true;
        }
        return (
            offsetFromNorth(camera.heading) < TOLERANCE &&
            (!resetTilt || camera.tilt < TOLERANCE)
        );
    }
    return offsetFromNorth(view.rotation) < TOLERANCE;
}

export default function Compass(props: CompassProps): ReactElement {
    const { model } = props;
    const { map } = model;
    const [widget, setWidget] = useState<CompassWidget>();

    useWatchAndRerender(map, "view");
    useWatchAndRerender(model, ["title", "hideWhenReset", "resetTilt"]);

    const view = map?.view;
    const resetTilt = model.resetTilt ?? true;
    const hideWhenReset = model.hideWhenReset ?? true;

    // Track whether the view is in its reset state, so the compass can hide
    // like the built-in one. setState skips the rerender when the value is
    // the same, so the frequent camera updates are cheap.
    const [atReset, setAtReset] = useState(true);
    useEffect(() => {
        if (!view) {
            return undefined;
        }
        const update = () => setAtReset(isReset(view, resetTilt));
        update();
        const handle =
            view.type === "3d"
                ? watch(view, "camera", update)
                : watch(view, "rotation", update);
        return () => handle.remove();
    }, [view, resetTilt]);

    useEffect(() => {
        if (widget) {
            widget.label = model.title;
        }
    }, [widget, model.title]);

    // Esri's reset only sets the heading in a scene view. The widget's click
    // handler calls `this.viewModel.reset()` at click time, so replacing the
    // method on this instance changes what a click does.
    useEffect(() => {
        const viewModel = widget?.viewModel;
        if (!viewModel) {
            return;
        }
        const esriReset = viewModel.reset.bind(viewModel);
        viewModel.reset = () => {
            const current = viewModel.view;
            if (
                current?.type === "3d" &&
                current.ready &&
                (model.resetTilt ?? true)
            ) {
                // Rotates around the current center. Core 5.0 typings leave
                // heading/tilt out of GoToTarget3D, but goTo still takes them
                // (Esri's own CompassViewModel passes { heading: 0 }).
                // goTo rejects when the user interrupts the animation.
                current
                    // The build fails without the cast, whatever ESLint says.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    .goTo({ heading: 0, tilt: 0 } as unknown as GoToTarget3D)
                    .catch(() => undefined);
                return;
            }
            esriReset();
        };
    }, [widget, model]);

    return (
        <CompassWidgetWrapper
            onWidgetCreated={setWidget}
            {...props}
            sx={hideWhenReset && atReset ? { display: "none" } : undefined}
        />
    );
}
