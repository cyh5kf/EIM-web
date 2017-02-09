import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import Button from '../../../components/button/Button';
import {MessageSchema, MentionMsgSchema} from '../../../core/schemas/MessageSchemas';
import MessageHelper from './../MessageHelper';
import MessageInputView from '../../view-components/message-input/MessageInputView';
import {EnumSendingStatus} from '../../../core/enums/MessageEnums';
import ReactPropTypes from '../../../core/ReactPropTypes';
import RegExpUtils from '../../../utils/RegExpUtils';


export default class MessageTextHolder extends PureRenderComponent {
    static propTypes = {
        message: ReactPropTypes.ofSchemas([MessageSchema, MentionMsgSchema]).isRequired,
        editing: ReactPropTypes.bool.isRequired,
        onEdited: ReactPropTypes.func.isRequired,
        locale: ReactPropTypes.object.isRequired,
        highlightwords: ReactPropTypes.string.isRequired
    }

    handleSaveClick = () => {
        this.refs['message-input'].sendMessage();
    }

    render() {
        const {editing, onEdited, locale, message, highlightwords} = this.props;
        if (editing) {
            return (
                <div className="text-msg-editor-wrapper">
                    <MessageInputView ref="message-input"
                                      sessionid={message.sessionid} sessiontype={message.sessiontype}
                                      defaultValue={message.text} locale={locale} onSendMessage={onEdited} editingMsg={message}/>
                    <div className="buttons-container">
                        <Button className="button-simple" onClick={onEdited}>{locale.MESSAGES.btnCancelTextEdit}</Button>
                        <Button className="button-green" onClick={this.handleSaveClick}>{locale.MESSAGES.btnSaveTextEdit}</Button>
                    </div>
                </div>
            );
        } else {
            let msgHtml = MessageHelper.parse(message);
            if (highlightwords) {
                highlightwords.split(',').forEach(highlightword => {
                    msgHtml = msgHtml.replace(
                        RegExpUtils.newRegForText(highlightword, 'g'),
                        `<span class="highlight-word">${_.escape(highlightword)}</span>`
                    );
                });
            }
            return (
                <div className="message-item-content text-msg">
                    <span dangerouslySetInnerHTML={{__html: msgHtml}}/>
                    {(message.clientSendingStatus === EnumSendingStatus.ClientEditing || message.clientSendingStatus === EnumSendingStatus.ClientEditFailed)
                    && <span className="edited-indicator"> ({locale.MESSAGES.editedLabel})</span>}
                </div>
            );
        }
    }
}
