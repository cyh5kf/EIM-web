import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import ApiConfig from '../../../core/constants/ApiConfig';
import SendTextMsgCmd from '../../../core/commands/messages/SendTextMsgCmd';
import SendFileMessageCmd from '../../../core/commands/messages/SendFileMessageCmd';
import EditTextMsgCmd from '../../../core/commands/messages/EditTextMsgCmd';
import EmojifyComposer from '../../../components/emojify/EmojifyComposer';
import CursorManager from './CursorManager';
import AtUserList from './AtUserList';
import UploadSingleFileDialog from '../../dialog/UploadSingleFileDialog';
import UploadBatchFileDialog from '../../dialog/UploadBatchFileDialog';
import PureRenderComponent from '../../../components/PureRenderComponent';
import InitDataStore from '../../../core/stores/InitDataStore';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';
import ReactPropTypes from '../../../core/ReactPropTypes';
import WebUploaderButton from '../../../components/webuploader/WebUploaderButton';

import './MessageInputView.less';

let ENTER_KEY_CODE = 13;

function replaceEmotionsTag(text){
    var $ = window.jQuery;
    text = text.replace(/<br>/gm, '\n');

    var $html = $("<div>" + text + "</div>");
    $html.find('.emojiObject').each(function () {
        var $this = $(this);
        var emoji = $this.attr('emoji');
        $this.html(":" + emoji + ":");
    });

    return $html.text();
}

export default class MessageInputView extends PureRenderComponent {
    static propTypes = {
        sessionid: ReactPropTypes.string.isRequired,
        sessiontype: ReactPropTypes.number.isRequired,
        defaultValue: PropTypes.string,
        onSendMessage: PropTypes.func,
        locale: PropTypes.object,
        editingMsg: ReactPropTypes.ofSchema(MessageSchema)
    };

    constructor(props) {
        super(...arguments);
        this.state = {dialogType: null};
    }

    componentWillReceiveProps(nextProps) {
        var dom = ReactDOM.findDOMNode(this.refs.messageInput);
        CursorManager.setEndOfContenteditable(dom);
        dom.focus();
    }

    componentDidMount() {
        var dom = ReactDOM.findDOMNode(this.refs.messageInput);
        CursorManager.setEndOfContenteditable(dom);
        dom.focus();
    }

    onFileUploaded = (file, response)=> {
        const {sessionid, sessiontype} = this.props;
        if (this.props.onSendMessage) {
            this.props.onSendMessage();
        }

        var data = {
            sessionid, sessiontype,
            filetype: response.data.filetype,
            filename: file.name,
            filedesc: response.filedesc,
            filesize: file.size,
            fileurl: response.data.url.replace(/http:\/\/rd.icoco.com/gi, ApiConfig.upload.download),
            ...(response.imgwidth ? {
                imgwidth: response.imgwidth,
                imgheight: response.imgheight
            } : {})
        };

        SendFileMessageCmd(data).then(this.afterSendMessage);

        this.closeFileDialog();
    };

    closeFileDialog() {
        let dialog = this.refs.singleFileRef || this.refs.batchFileRef;

        if (dialog) {
            dialog.close();
        }
    }

    beforePopupEmojify() {
        CursorManager.saveCursor();
    }

    onEmojiSelect = (emoji)=> {
        if (emoji) {
            CursorManager.restoreCursor();
            this.refs.messageInput.focus();
            var html = `<span contenteditable="false" emoji="${emoji}" class="emojiObject emoji-${emoji} emoji"></span>`;
            CursorManager.insertHtmlAtCursor(html);
        }
        return true;
    };

    onSelectAtUser = (user)=> {
        return true;
    };

    onEditableKeyUp = (e)=> {
        this.refs['at_list'].onKeyUp(e);
    };

    beforeSendMessage = (messageText)=> {
        var atUidList = [];
        var isAtAll = false;
        let sendText = replaceEmotionsTag(messageText);
        if (sendText.indexOf('@') > -1) {
            sendText = sendText.replace(/@[\w\s]+:/igm,function(t){
                if (t === '@channel:') {
                    isAtAll = true;
                    return "<@Session>";
                }else {
                    var name = t.replace("@","").replace(":","");
                    const atData = InitDataStore.getUIDByAtText(name);
                    if (atData) {
                        let atFormatData = atData.isgroup ? `<@G${atData.id}>` : `<@U${atData.id}>`;
                        atUidList.push(atData.id);
                        return atFormatData;
                    }
                }
                return t;
            });
        }
        return {sendText, atUidList, isAtAll};
    };

    onKeyDown = e => {

        var shouldIgnoreInputEvent = this.refs["at_list"].onKeyDown(e);

        if (shouldIgnoreInputEvent && e.keyCode === ENTER_KEY_CODE) {
            e.preventDefault();
            return;
        }
        if (e.keyCode !== ENTER_KEY_CODE) return;

        if (e.keyCode === ENTER_KEY_CODE && e.shiftKey) {
            return;
        }
        e.preventDefault();
        this.sendMessage();
    };


    sendMessage = ()=> {
        const {sessionid, sessiontype} = this.props;
        let data = ReactDOM.findDOMNode(this.refs['messageInput']).innerHTML;
        if (!data.replace(/(^\s*)|(\s*$)/g, "")) {
            return;
        }

        if (this.props.onSendMessage) {
            this.props.onSendMessage();
        }

        var {sendText,atUidList,isAtAll} = this.beforeSendMessage(data);

        const {editingMsg} = this.props;
        if (editingMsg) {
            EditTextMsgCmd({
                editingMsg: editingMsg,
                text: sendText
            });
        } else {
            SendTextMsgCmd({
                sessionid: sessionid,
                sessiontype: sessiontype,
                atUid: atUidList,
                atAll: isAtAll,
                text: sendText
            }).finally(this.afterSendMessage);
        }
        return false;
    };


    afterSendMessage = () => {
        const inputNode = ReactDOM.findDOMNode(this.refs.messageInput);
        if (inputNode) {
            inputNode.innerHTML = '';
        }
    };


    onFilesQueued = (files)=> {
        if (files.length === 1) {
            if (!this.refs.singleFileRef) {
                this.setState({dialogType: 'dlg-singleFile', files: files});
            } else {
                this.refs.singleFileRef.postMessage(files[0], this.getAttachmentUploader());
            }
        } else {
            if (!this.refs.batchFileRef) {
                this.setState({dialogType: 'dlg-batchFile', files: files});
            } else {
                this.refs.batchFileRef.postMessage(files, this.getAttachmentUploader());
            }
        }
    };

    onUploadError = (file, reason)=> {
        let fileQueue = this.getAttachmentUploader().getFiles('queued');
        if (fileQueue.length === 0) {
            this.closeFileDialog();
        }
    };

    onPaste(e) {
        //粘贴的时候,去出标签.
        var text = e.clipboardData.getData("text");
        if (text) {
            e.preventDefault();
            var fakeElement = document.createElement("textarea");
            fakeElement.textContent = text;
            text = fakeElement.innerHTML;
            text = text.replace(/\n/g, "<br/>");
            var isFirefox = navigator.userAgent.indexOf("Firefox") > 0;
            if (isFirefox) {
                CursorManager.insertHtmlAtCursor(text);
            } else {
                CursorManager.insertHtmlAtCursor("<span>" + text + "</span>");
            }
        }
    }

    cancelFile(file) {
        this.getAttachmentUploader().removeFile(file.id, true);
    }

    getAttachmentUploader() {
        return this.refs.attachmentUploader.uploader;
    }

    getInputPanel() {
        return ReactDOM.findDOMNode(this.refs.messageInput);
    }

    render() {
        let dialog = null;
        const locale = this.props.locale.MESSAGES;
        if (this.state.dialogType === 'dlg-singleFile') {
            dialog = <UploadSingleFileDialog ref="singleFileRef" show={true} file={this.state.files[0]}
                                             uploader={this.getAttachmentUploader()}/>;
        } else if (this.state.dialogType === 'dlg-batchFile') {
            dialog = <UploadBatchFileDialog ref="batchFileRef" show={true} files={this.state.files}
                                            uploader={this.getAttachmentUploader()}/>;
        }

        return (

            <div className="msg-inputview-container">

                <form action="#" ref="msgForm" className="msg-form-input">

                    <div className="input-toolbar">
                        <div className="emoji-select" onMouseDown={(e)=>{e.preventDefault();return false;}}>
                            <EmojifyComposer placement="top" id="emojiPopover"
                                             beforePopup={this.beforePopupEmojify.bind(this)}
                                             onItemSelect={this.onEmojiSelect}/>
                        </div>
                        <div className="input-opt" id="input-opt">
                            <WebUploaderButton ref="attachmentUploader"
                                               className="select-attachment"
                                               eventPrefix="onmessagefile"
                                               onUploadSuccess={this.onFileUploaded}
                                               onFilesQueued={this.onFilesQueued}>
                                <span className="eficon-ic_attachments"></span>
                            </WebUploaderButton>
                        </div>
                        <div className="search-tips">
                            {locale.globalSearchTips}
                        </div>
                    </div>


                    <AtUserList ref="at_list"
                                locale={locale}
                                onSelectAtUser={this.onSelectAtUser.bind(this)}
                                getInputPanel={this.getInputPanel.bind(this)}
                                sessionid={this.props.sessionid}
                                sessiontype={this.props.sessiontype}></AtUserList>

                    <div contentEditable={true}
                         maxLength={2000}
                         autoFocus
                         ref="messageInput"
                         autoCorrect="off"
                         defaultValue={this.props.defaultValue}
                         onKeyDown={this.onKeyDown}
                         spellCheck="true"
                         className="form-control messageinput messageInputContentEditable"
                         id="messageInput"
                         onPaste={this.onPaste.bind(this)}
                         onKeyUp={this.onEditableKeyUp}>
                    </div>

                    <div className="send-button" onClick={()=>{this.sendMessage()}}>
                        <div className="eficon-4"></div>
                    </div>

                </form>
                {dialog}
            </div>);
    }

}
