import EventBus, {COMMON_EVENTS} from '../../utils/EventBus';
import {createImmutableSchemaData} from '../../utils/schema';
import {RightPanelConfigSchema} from '../schemas/RightPanelConfigSchemas';
import EnumRightPanelType from '../enums/EnumRightPanelType';

class RightPanelConfigStore extends EventBus {
    _panelConfig = createImmutableSchemaData(RightPanelConfigSchema, {
        panelType: EnumRightPanelType.HIDE_PANEL
    })

    getPanelConfig() {
        return this._panelConfig;
    }

    setPanelConfig(panelConfig) {
        this._panelConfig = createImmutableSchemaData(RightPanelConfigSchema, panelConfig);
        this.emit(COMMON_EVENTS.ON_CHANGE);
    }
}

export default new RightPanelConfigStore();
