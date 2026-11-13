import { getLocale, setLocale } from "@arcgis/core/intl";
import type { PropertyDef } from "@vertigis/arcgis-extensions/support/Serializable";
import type { IHandle } from "@vertigis/arcgis-extensions/support/observableUtils";
import { watch } from "@vertigis/arcgis-extensions/support/observableUtils";
import type { MapModel } from "@vertigis/web/mapping";
import type {
    ComponentModelProperties,
    PropertyDefs,
} from "@vertigis/web/models";
import {
    ComponentModelBase,
    importModel,
    serializable,
} from "@vertigis/web/models";
import type { RegionService } from "@vertigis/web/region";
import { FrameworkServiceType, inject } from "@vertigis/web/services";

// The Esri locale is global, so one watch is enough for all components.
let localeHandle: IHandle | undefined;

/**
 * Keeps the ArcGIS Maps SDK locale in step with the app locale. The SDK reads
 * `<html lang>`, which Web leaves as "en", so the "Reset" tooltip would
 * otherwise stay in English.
 */
function syncEsriLocale(regionService: RegionService | undefined): void {
    if (localeHandle || !regionService) {
        return;
    }
    localeHandle = watch(
        regionService,
        "locale",
        (locale) => {
            if (locale && locale !== "inv" && locale !== getLocale()) {
                setLocale(locale);
            }
        },
        { initial: true }
    );
}

interface CompassModelProperties extends ComponentModelProperties {
    hideWhenReset?: boolean;
    resetTilt?: boolean;
}

@serializable
export default class CompassModel extends ComponentModelBase<CompassModelProperties> {
    @importModel("map-extension")
    map: MapModel;

    @inject(FrameworkServiceType.REGION)
    regionService: RegionService;

    /**
     * Hide the compass while the map faces north (and, with `resetTilt`, the
     * scene is not tilted). This is how the built-in compass behaves.
     */
    hideWhenReset?: boolean;

    /**
     * In a scene view, a click also sets the camera tilt to 0 (straight down),
     * not only the heading.
     */
    resetTilt?: boolean;

    protected override async _onInitialize(): Promise<void> {
        await super._onInitialize();
        syncEsriLocale(this.regionService);
    }

    protected override _getSerializableProperties(): PropertyDefs<CompassModelProperties> {
        const props = super._getSerializableProperties();

        // A def without serializeModes gets an empty list, and Designer saves
        // the app in "initial" mode, so such a setting works in Designer but
        // is never written to app.json. Every setting needs it explicitly.
        const setting = <T>(defaultValue: T): PropertyDef<T> => ({
            serializeModes: ["initial"],
            default: defaultValue,
        });

        return {
            ...props,
            title: {
                ...this._toPropertyDef(props.title),
                default: "language-geodata-compass-title",
            },
            icon: {
                ...this._toPropertyDef(props.icon),
                default: "map-3rd-party",
            },
            hideWhenReset: setting(true),
            resetTilt: setting(true),
        };
    }
}
