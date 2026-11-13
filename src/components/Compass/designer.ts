import type {
    ApplyDesignerSettingsCallback,
    ComponentModelDesignerSettings,
    DesignerSettings,
    GetDesignerSettingsCallback,
    GetDesignerSettingsSchemaCallback,
    Setting,
    SettingsSchema,
} from "@vertigis/web/designer";
import {
    applyComponentModelDesignerSettings,
    getComponentModelDesignerSettings,
    getComponentModelDesignerSettingsSchema,
} from "@vertigis/web/designer";

import type CompassModel from "./CompassModel";

export interface CompassSettings extends ComponentModelDesignerSettings {
    hideWhenReset?: boolean;
    resetTilt?: boolean;
}

export type SettingsMap = DesignerSettings<CompassSettings>;

export const applySettings: ApplyDesignerSettingsCallback<
    CompassModel,
    SettingsMap
> = async (args) => {
    const { model, settings } = args;
    await applyComponentModelDesignerSettings(args);
    model.assignProperties(settings);
};

export const getSettings: GetDesignerSettingsCallback<
    CompassModel,
    SettingsMap
> = async (args) => {
    const { hideWhenReset, resetTilt } = args.model;
    return {
        ...(await getComponentModelDesignerSettings(args)),
        hideWhenReset,
        resetTilt,
    };
};

export const getSettingsSchema: GetDesignerSettingsSchemaCallback<
    CompassModel,
    SettingsMap
> = async (args) => {
    const baseSchema = await getComponentModelDesignerSettingsSchema(args);
    (baseSchema.settings[0].settings as Setting<CompassSettings>[]) = (
        baseSchema.settings[0].settings as Setting<CompassSettings>[]
    ).concat([
        {
            id: "resetTilt",
            type: "checkbox",
            description:
                "language-designer-geodata-compass-reset-tilt-description",
            displayName: "language-designer-geodata-compass-reset-tilt-title",
        },
        {
            id: "hideWhenReset",
            type: "checkbox",
            description:
                "language-designer-geodata-compass-hide-when-reset-description",
            displayName:
                "language-designer-geodata-compass-hide-when-reset-title",
        },
    ]);
    const schema: SettingsSchema<CompassSettings> = {
        ...baseSchema,
        settings: [...baseSchema.settings],
    };
    return schema;
};
