import React from  'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import exposeLocale from '../../components/exposeLocale';
import {getDownloadUrl} from '../../utils/FileExtensionUtils';
import LoginStore from '../../core/stores/LoginStore';
import {ReactPropTypes} from '../../utils/schema';
import {FileMsgSchema} from '../../core/schemas/SearchStoreSchemas';
import gGlobalEventBus, {GLOBAL_EVENTS} from '../../core/dispatcher/GlobalEventBus';
import confirm from '../../components/popups/confirm';
import DeleteMsgCmd from '../../core/commands/messages/DeleteMsgCmd';

import '../view-components/action-list-popover-style.less';

const FILE_OPT = {
    OPEN_ORI:0,
    DOWNLOAD: 1,
    RENAME: 2,
    DELETE: 3
};

@exposeLocale(['COMMON'])
export default class FileOperationPopover extends React.Component{
                
    constructor(props){        
		super(props);
                
		this.state ={
            show:props.show};
	}

    static propTypes = {
        title:ReactPropTypes.string,
        show:ReactPropTypes.bool,
        onHideMenu:ReactPropTypes.func,        
        placement:ReactPropTypes.string,
        target: ReactPropTypes.func,
        msg: ReactPropTypes.ofSchema(FileMsgSchema).isRequired
    }

    componentWillUnmount(){        
        if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }        
    }  

    componentDidMount(){
        this._handleOnShow(this.state.show);       
    }

    componentDidUpdate(){        
    }    

    _handleOnShow(show){
        if(show){
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
            
            this.onDocClickListener = this.close.bind(this);
            document.addEventListener('click', this.onDocClickListener, false);
        }else{
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
        }

    }

    componentWillReceiveProps(props){        
        this._handleOnShow(props.show);

        this.setState({
            show:props.show});
    }    
    

    toggle() {
        this._handleOnShow(!this.state.show);
        this.setState({ show: !this.state.show });

    }

    close(e) {        
        if(!$(e.target).closest('.fileOperationPopover').hasClass('fileOperationPopover')){
            //关闭时移除监听
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }

            this.setState({ show: false });
            this.props.onHideMenu();            
        }
    }

    onRename=()=>{
        const file = this.props.msg;
        let fileInfo={
			fileUrl:file.fileUrl,
			name:file.fileName,
			author:file.senderName,
			time:Number(file.msgTime),
			uploaderuid:file.senderUid,
            resourceid:file.resourceid,
            sessiontype:file.sessiontype,
            filesize:file.filesize,
			type:file.filetype
		};

        gGlobalEventBus.emit(GLOBAL_EVENTS.ON_SHOW_FILE_DETAIL, {fileInfo:fileInfo, isEdited:true});
    }
    
    onDelete=()=>{        
        const message = this.props.msg;
        confirm({
                    title: gLocaleSettings.DIALOGS.DLG_DELETE_FILE.delFileTitle,
                    content: gLocaleSettings.DIALOGS.DLG_DELETE_FILE.delFileTip,
                    buttons: [{
                        className: 'button-simple',
                        label: gLocaleSettings.COMMON.cancelLabel,
                        onClick(dialog) {
                            dialog.close();
                        }
                    }, {
                        className: 'button-red',
                        label: gLocaleSettings.DIALOGS.DLG_DELETE_FILE.delFileBtnConfirm,
                        onClick(dialog) {
                            DeleteMsgCmd({
                                sessionid: message.sessionId,
                                sessiontype: message.sessionType,
                                msguuid: message.msgId,
                                msgsrvtime: message.msgTime
                            });
                            dialog.close();
                        }
                    }]
            });
    }

    onItemAction=(e)=>{
        let index = parseInt(e.target.getAttribute('data-index'));
        const msg = this.props.msg;
        switch (index) {
            case FILE_OPT.OPEN_ORI:
                window.open(msg.fileUrl);
                break;
            case FILE_OPT.DOWNLOAD:
                window.open(getDownloadUrl(msg.fileUrl));
                break;
            case FILE_OPT.RENAME:
                this.onRename();
                break;
            case FILE_OPT.DELETE:
                this.onDelete();
                break;        
            default:
                break;
        }
        this.setState({ show: false });
        this.props.onHideMenu();        
    }
 
	render(){

        const locale = this.state.locale;
        const {msg: {senderUid}} = this.props;
        const isMe = senderUid === LoginStore.getUID();

        let content = (
            <ul className="list-unstyled menu-items">                
                <li data-index ={FILE_OPT.OPEN_ORI} onClick={this.onItemAction}>                    
                    {locale.openOriginal}
                </li>
                <li data-index ={FILE_OPT.document} onClick={this.onItemAction}>
                    {locale.download}
                </li>
                {isMe&& <li data-index ={FILE_OPT.RENAME} onClick={this.onItemAction}>
                    {locale.rename}
                </li>}
                {isMe&& <li className="red-action" data-index ={FILE_OPT.DELETE} onClick={this.onItemAction}>
                    {locale.deleteFile}
                </li>}
            </ul>
        );

		return (
            <Overlay show={this.state.show} placement={this.props.placement}
                     onHide={() => this.setState({ show: false })}
                    target={() => this.props.target()} >
                <Popover id="fileOperationPopover" title={this.props.title} className="action-list-popover fileOperationPopover" >
                    <div className="menu-items-scroller">
                        {content}
                    </div>
                </Popover>
            </Overlay>
        );
    }
}

