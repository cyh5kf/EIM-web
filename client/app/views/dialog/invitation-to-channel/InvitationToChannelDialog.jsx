import React,{PropTypes} from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import UsersSelector from '../../view-components/users-selector/UsersSelector';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import AddUserFromGroupCommand from '../../../core/commands/channel/AddUserFromGroupCommand';
import exposeLocale from '../../../components/exposeLocale';
import StringUtils from '../../../utils/StringUtils';

import "./InvitationToChannelDialog.less";

@exposeLocale(['DIALOGS', 'dlg-invitation-to-channel'])
export default class InvitationToChannnelDialog extends React.Component {
    static propTypes = {
        memberUid: PropTypes.string.isRequired
    }
    constructor(props) {
        super(props);
        this.state={
            show: true,
            selectedChannel: null
        };
    }

    close(e){
        this.setState({show: false});
    }

    open(){
        this.setState({show: true});
    }

    filterUsers = users => {
        const {memberUid} = this.props;

        return users.filter(user => memberUid.indexOf(user.id) === -1);
    }

    onSelectedUserChange = channel => {
        this.setState({selectedChannel: channel});
    }

    addMemberToChannel(e){
        const {selectedChannel} = this.state,{memberUid} = this.props;
        if (selectedChannel) {
            var opt ={members:[memberUid], gid:selectedChannel.channelId};
            AddUserFromGroupCommand({options:opt})
                .then(() => this.close());
        }
    }

    render(){
        const {selectedChannel,locale} = this.state;
        return (
            <Modal
                show={this.state.show}
                backdrop="static"
                animation={true}
                dialogClassName="invitation_to_channel mission_global"
            >
                <Modal.Header>
                    <a 
                        href="javascript:;"
                        className="close" 
                        onClick={e=>this.close(e)}
                    >
                        <i className="ficon_delete"></i>
                    </a>
                    <h3>{StringUtils.format(locale.title, this.props.userName)}</h3>
                </Modal.Header>
              <Modal.Body>
                    <div className="top_margin">
                        <label htmlFor="">{locale.inviteTo}</label>
                        <UsersSelector 
                            multiple={false}
                            userTypes={[EnumSearchUserType.Channel]}
                            filterResultsDatasource={this.filterUsers}
                            onSelectedUserChange={this.onSelectedUserChange}
                            selectedUser = {selectedChannel}
                        />
                    </div>
              </Modal.Body>
              <Modal.Footer>
                     <button className="g_btn btn_outline" onClick={e=>this.close(e)}>{locale.cancelLabel}</button>
                     <button className="g_btn" onClick={e=>this.addMemberToChannel(e)}>{locale.inviteLabel}</button>
              </Modal.Footer>
            </Modal>
        );
    }
}
