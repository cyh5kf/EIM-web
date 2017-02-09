import {createCommand} from '../../utils/command';
import RightPanelConfigStore from '../stores/RightPanelConfigStore';

export const SwitchRightPanelCmd = createCommand(function (panelType, extraConfig = {}) {
    RightPanelConfigStore.setPanelConfig({
        panelType: panelType,
        ...extraConfig
    });
});
