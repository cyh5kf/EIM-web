import React, {PropTypes} from  'react';
import {SetGroupPurposeCmd} from '../../core/commands/channel/GroupInfoCommands';
import {ChannelSchema} from '../../core/schemas/ChannelSchemas';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import StringUtils from '../../utils/StringUtils';
import moment from 'moment';
import ReactPropTypes from '../../core/ReactPropTypes';

export default class ChannelPurposeView extends React.Component{
    static propTypes = {        
        displayState: PropTypes.string.isRequired,
        showRealname: PropTypes.bool.isRequired,
        channelData: ReactPropTypes.ofSchema(ChannelSchema),
        locale: PropTypes.object.isRequired
    };

     constructor(props){
        super(props);
        this.state = {
            isEdited: false
        };
    }

    onSavePurpose=()=>{
        let purpose = document.getElementById("purpose-input").value;
        SetGroupPurposeCmd(this.props.channelData,purpose);
        this.setState({
            isEdited:false
        });
    }

    //fcj.todo:
    onCancelEdit=()=>{
        this.setState({
            isEdited:false
        });
    }

    render(){
        const isEdited = this.state.isEdited;
        const locale = this.props.locale;
        const channelData = this.props.channelData;

        let creatorname = '';
        if (channelData.owner) {
            creatorname = channelData.owner.firstname + channelData.owner.lastname;
            if (!creatorname) {
                creatorname = channelData.owner.username;
            }
        }

        //time        
        let dateTime = moment(parseInt(channelData.createtime));
        let createTime = dateTime.format('YYYY MMM Do');
        if(TimeZoneUtils.isCurrentYear(channelData.createtime)){
            createTime = dateTime.format('MMM Do');
        }                        
        const createInfo =  StringUtils.format(locale.createlabel,creatorname, createTime);        

        const hasPurpose = (channelData.purpose !==undefined && channelData.purpose !==null && channelData.purpose !== "");

        let purposeInput = null;
        if(isEdited){
            purposeInput = (
                <textarea type="text" id="purpose-input" className="disp-block purpose-input" maxLength="250" defaultValue={hasPurpose?channelData.purpose:""}></textarea>
            );
        }

        return (
            <div className={"content " + this.props.displayState}>
                <div className="disp-block purpose-section">
                    <div className="disp-block purpose-note">{isEdited?(locale.setpurpose):(locale.purpose)}</div>
                    <div className={"disp-block purpose-text" + (isEdited?" hidden":"")}>
                        {hasPurpose?channelData.purpose:""}
                        <a className={"edit-purpose"+(hasPurpose?"":" always-show")} onClick={(e)=>this.setState({isEdited:true})}>{hasPurpose?locale.edit:locale.newset}</a>
                    </div>
                    {purposeInput}                    
                    <div className={"disp-block btn-container"+(isEdited?"":" hidden")}>
                        <div className="disp-inblock btn-common cancel" onClick={this.onCancelEdit}>{locale.Cancel}</div>
                        <div className="disp-inblock btn-common confirm" onClick={this.onSavePurpose}>{locale.Done}</div>
                    </div>                    
                </div>
                <div className="disp-block creator">
                    <a className="creat-link">{createInfo}</a>
                </div>
            </div>
        );
    }
}

