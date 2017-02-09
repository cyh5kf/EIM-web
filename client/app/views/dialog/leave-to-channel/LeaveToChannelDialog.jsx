import React,{PropTypes} from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import StringUtils from '../../../utils/StringUtils';
import exposeLocale from '../../../components/exposeLocale';
import LoginStore from '../../../core/stores/LoginStore';
import RemoveUserFromGroupCommand from '../../../core/commands/channel/RemoveUserFromGroupCommand';
import {ChannelSchema} from '../../../core/schemas/ChannelSchemas';
import ReactPropTypes from '../../../core/ReactPropTypes';


@exposeLocale(['DIALOGS', 'dlg-leave-to-channel'])
export default class LeaveToChannelDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        targetChannel: ReactPropTypes.ofSchema(ChannelSchema).isRequired
    }
    constructor(props) {
        super(props);
        this.state={
            show: props.show
        };
    }

    close(){
        this.setState({show: false});
    }

    open(){
        this.setState({show: true});
    }

    leaveToChannel(e){
        let channelData = this.props.targetChannel;
        var opt = {
            gid : channelData.sessionid,
            frienduid: [LoginStore.getUID()]
        };
        RemoveUserFromGroupCommand({options:opt});
        this.close();
    }


    render(){
        const {locale} = this.state, {targetChannel} = this.props;
        return (
            <Modal
                show={this.state.show}
                backdrop="static"
                animation={true}
                dialogClassName="mission_global"
            >
                <Modal.Header>
                    <a 
                        href="javascript:;"
                        className="close" 
                        onClick={()=>this.close()}
                    >
                        <i className="ficon_delete"></i>
                    </a>
                    <h3>{StringUtils.format(locale.title, targetChannel.displayname)}</h3>
                </Modal.Header>
              <Modal.Body>
                    <div className="top_margin">
                        <p>{locale.content}</p>
                        <p>{locale.question}</p>
                    </div>
              </Modal.Body>
              <Modal.Footer>
                     <button className="g_btn btn_outline" onClick={e=>this.close(e)}>{locale.cancelLabel}</button>
                     <button className="g_btn" onClick={e=>this.leaveToChannel(e)}>{locale.LeaveLabel}</button>
              </Modal.Footer>
            </Modal>
        );
    }
}
