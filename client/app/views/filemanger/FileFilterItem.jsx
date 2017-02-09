import React from 'react';
import ReactDOM from 'react-dom';
import {isPictureByUrl,fileTypeByUrl, fileSizeToString} from '../../utils/FileExtensionUtils';
import {ReactPropTypes} from '../../utils/schema';
import {FileMsgSchema} from '../../core/schemas/SearchStoreSchemas';
import moment from 'moment';
import PhotoDispalyComposer from '../session-photos/PhotoDispalyComposer';
import FileOperationPopover from './FileOperationPopover';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import FileShareDialog from '../dialog/message-share/FileShareDialog';
import exposeLocale from '../../components/exposeLocale';
import './FileFilterItem.less';

@exposeLocale(['COMMON'])
export default class FileFilterItem extends React.Component{
	static propTypes = {
		msg: ReactPropTypes.ofSchema(FileMsgSchema).isRequired,
		onJumpToMsg:ReactPropTypes.func.isRequired,
		onShowFileDetail:ReactPropTypes.func.isRequired
	};

	constructor(props){
		super(props);
		
		this.state ={
					showActionMenu:false
				};
	}

	onShareFile=()=>{
		if (!this._shareDlgOpened) {
                FileShareDialog.open(this.props.msg,(() => this._shareDlgOpened = false));
                this._shareDlgOpened = true;
            }		
	}

	onFileStar=()=>{
		//
	}
	
	_onShowOperate=()=>{
		this.setState({
			showActionMenu:true
		});
	}

	onHideMenu=()=>{
		this.setState({
			showActionMenu:false
		});
	}

	onDisplayFile=(e)=>{		
		if(e.target.getAttribute('data-action') === "file-operate"
		|| e.target.getAttribute('data-action') === "jumptomsg"){
			return;
		}

		const msg = this.props.msg;
		
		let fileInfo={
			fileUrl:msg.fileUrl,
			name:msg.fileName,
			author:msg.senderName,
			time:Number(msg.msgTime),
			uploaderuid:msg.senderUid,
			filesize:msg.filesize,
			type:""
		};

		if (isPictureByUrl(msg.fileUrl)) {			
			PhotoDispalyComposer.open({imageFile:fileInfo});
		}
		else{
			//fcj.todo: 文件详情展示
			this.props.onShowFileDetail({fileInfo:fileInfo, isEdited: false});
		}	
	}

	onJumpToMsg=()=>{
			this.props.onJumpToMsg(this.props.msg);
		}

	getTatget=()=>{
        return ReactDOM.findDOMNode(this.refs.optTarget);
    }
	
	render(){

		const {msg: {fileUrl,sessionName, senderName, msgTime,fileName, filesize}} = this.props;
		const {locale} = this.state;

		let fileType = (
				<i className={"file-item-type "+ fileTypeByUrl(fileUrl)} />
			);

		const mMsgTime = moment(Number(msgTime));	
		let date = null;
        if(TimeZoneUtils.isCurrentYear(msgTime)){
            date = mMsgTime.format('MMM Do');
        }
		else{
			date = mMsgTime.format('LL')
		}

		let actionMenu = null;
		if(this.state.showActionMenu){
			actionMenu = (				
				<FileOperationPopover placement="left" key="FileOperationPopover"
                target = {this.getTatget}
                show = {this.state.showActionMenu}                
                onHideMenu = {this.onHideMenu}
				msg = {this.props.msg}				
				/>
			);	
		}		

		//fcj.todo: sessionName可能为空，应当直接根据sessionId取sessionName
		
		return (			
			<div className="search-file-item" onClick={this.onDisplayFile}>
				{fileType}
                <span className="file-item-info">
					<span className ="file-name"><span dangerouslySetInnerHTML={{__html: fileName}}></span></span>
					<span className="file-info-1">
						<span className ="file-author">{senderName}</span>
						<span className ="file-size">{fileSizeToString(filesize)}</span>
					</span>
					<span className="file-info-2">
						<span className ="file-time">{date} {mMsgTime.format('h:mm')}{mMsgTime.hour() >= 12 ? 'PM' : 'AM'}</span>					
						<span className="share-info">
							{locale.sharedin}
							<span className="file-share-label" data-action="jumptomsg" onClick={this.onJumpToMsg}>
								{sessionName}
							</span>
						</span>
					</span>
				</span>	
				<div className="btn-container">
					<div className="operate" data-action="file-operate" onClick={this.onShareFile}>
						<i className ="operate-icon eficon-26" data-action="file-operate" onClick={this.onShareFile}></i>  
					</div>
					<div className="operate" data-action="file-operate" ref="optTarget" onClick={this._onShowOperate.bind(this)}> 
						<i className ="operate-icon eficon-27" data-action="file-operate" onClick={this._onShowOperate.bind(this)}></i>				
					</div>	
					{/*<div className="operate" data-action="file-operate" onClick={this.onFileStar}>
						<i className ="operate-icon icon icon-header-button-action-collect" data-action="file-operate" onClick={this.onFileStar}></i>  
					</div>*/}
				</div>
				{actionMenu}
            </div>						
		);
	}
}
