import type { LibraryRegistry } from "@vertigis/web/config";
import type { GetDesignerSettingsSchemaArgs } from "@vertigis/web/designer";

import type { CompassModel } from "./components/Compass";
import invLanguage from "./locale/inv.json";
import noLanguage from "./locale/no.json";

const getCompass = () => import("./components/Compass");

export default function (registry: LibraryRegistry): void {
    registry.registerModel({
        getModel: async (config) => new (await getCompass()).CompassModel(config),
        itemType: "geodata-compass",
    });

    registry.registerComponent({
        name: "compass",
        namespace: "geodata.web",
        getComponentType: async () => (await getCompass()).default,
        getDesignerSettings: async (
            args: GetDesignerSettingsSchemaArgs<CompassModel, "">
        ) => (await getCompass()).getSettings(args),
        applyDesignerSettings: async (args) =>
            (await getCompass()).applySettings(args),
        getDesignerSettingsSchema: async (
            args: GetDesignerSettingsSchemaArgs<CompassModel, "">
        ) => (await getCompass()).getSettingsSchema(args),
        category: "map",
        itemType: "geodata-compass",
        title: "language-geodata-compass-title",
        description: "language-geodata-compass-description",
        iconId: "map-3rd-party",
    });

    registry.registerLanguageResources({
        locale: "inv",
        values: invLanguage,
    });
    registry.registerLanguageResources({
        locale: "en",
        values: invLanguage,
    });
    // Apps are usually configured as "nb" (Bane NOR is), which does not fall
    // back to "no".
    for (const locale of ["no", "nb", "nn"]) {
        registry.registerLanguageResources({
            locale,
            values: noLanguage,
        });
    }
}
