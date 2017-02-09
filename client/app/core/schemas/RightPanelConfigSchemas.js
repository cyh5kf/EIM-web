import _ from 'underscore';
import {compile, compileEnum} from '../../utils/schema';
import EnumRightPanelType from '../enums/EnumRightPanelType';
import {ContactGroupSchema} from './ContactGroupsSchemas';

const
    UserProfilePanelSchema = compile({
        panelType: compileEnum([EnumRightPanelType.USER_PROFILE]),
        uid: 'string'
    }),
    SessionDetailPanelSchema = compile({
        panelType: compileEnum([EnumRightPanelType.SESSION_DETAIL, EnumRightPanelType.SESSION_FILE]),
        sessionid: 'string'        
    }),
    UserGroupPanelSchema = compile({
        panelType: compileEnum([EnumRightPanelType.USER_GROUP]),
        contactGroup: ContactGroupSchema
    }),
    SimplePanelSchema = compile({
        panelType: compileEnum(_.without(_.values(EnumRightPanelType), EnumRightPanelType.USER_PROFILE, EnumRightPanelType.SESSION_DETAIL, EnumRightPanelType.USER_GROUP,
        EnumRightPanelType.SESSION_FILE))
    });

export const RightPanelConfigSchema = compile({
    __compiled: true,
    title: 'RightPanelConfigSchema',
    anyOf: [
        UserProfilePanelSchema,
        SessionDetailPanelSchema,
        UserGroupPanelSchema,
        SimplePanelSchema
    ]
});
