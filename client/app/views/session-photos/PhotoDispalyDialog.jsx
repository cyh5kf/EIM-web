import React from 'react';
import _ from 'underscore';
import moment from 'moment';
import PureRenderComponent from '../../components/PureRenderComponent';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import ReactPropTypes from '../../core/ReactPropTypes';
import LoginStore from '../../core/stores/LoginStore';

import './SessionPhotoAlbumDialog.less';

const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE= 27;

class PhotoDispalyDialogContent extends PureRenderComponent {
    static propTypes = {
        imageFile: ReactPropTypes.object.isRequired,
        onClose: ReactPropTypes.func.isRequired
    };

    componentWillMount() {
        this.setState({
            zoomInImage: false,
            width: 0,
            naturalWidth: 0,
            canZoom: false,
            showNameEdit:false
        });
    }

    componentWillReceiveProps(nextProps) {
       //
    }

    handleCurrentImageClick = e => {
        if(!this.state.canZoom){
            return;
        }

        const {zoomInImage} = this.state;
        if (zoomInImage) {
            this.setState({
                zoomInImage: false
            });
        } else {            
            if (this.state.canZoom) {
                this.setState({
                    zoomInImage: true
                });
            }
        }
    };

    handleCurrentImageLoad = e => {
        const imgEl = e.target;
        const canZoom = imgEl.naturalWidth > imgEl.clientWidth;
            this.setState({
                    width: imgEl.clientWidth,
                    naturalWidth: imgEl.naturalWidth,
                    canZoom: canZoom                
                });                    
    };

     onEditName=()=>{
        this.setState({
            showNameEdit:true
        });

        setTimeout(function() {            
                document.getElementById("name-edit").focus();
            }, 50);  
    };

    _onKeyDonw=(e)=>{
        if(e.keyCode === ENTER_KEY_CODE && !e.shiftKey){
            this.onNameEditDone();
        }
        else if(e.keyCode === ESC_KEY_CODE){
            this.onNameEditCancel();
        }
    };

    onNameEditCancel=()=>{
        this.setState({
            showNameEdit:false
        });
    };

    
    onNameEditDone=()=>{
        //let name = document.getElementById("name-edit").value;
        //fcj.todo
        //SetGroupTopicCmd(this.state.channel,topic);
        this.setState({
            showNameEdit:false
        });
    };

    _renderPreviewContent() {
        const {imageFile, onClose} = this.props,
            {zoomInImage, canZoom} = this.state,  
            sender = null;    
        const mSenderTime = moment(imageFile.time);   
        
        let isMe = (imageFile.uploaderuid === LoginStore.getUID());
        let nameEditIcon = (isMe?(<i className="icon icon-global-button-action-write"></i>):null);
        let editContainer = null;
        if(isMe){
            editContainer = (
                            <div className={"edit-container"+(this.state.showNameEdit?"":" hidden")}>                                
                                <textarea type="text" id="name-edit" className="name-edit" maxLength="100" onBlur={this.onNameEditCancel} onKeyDown={this._onKeyDonw} defaultValue={""}></textarea>     
                                <span className="edit-note">Enter to submit,Esc to cancel</span>                          
                            </div> 
                        );
        }     
                    
        return (
            <div className="img-preview-container">                
                <div className={`img-preview-item current-item ${zoomInImage ? 'zoom-in-img' : ''} ${canZoom ? 'can-zoom' : ''}`}>
                        <div className="img-wrapper">
                            <img onLoad={this.handleCurrentImageLoad} onClick={this.handleCurrentImageClick}
                                 className="preview-img" src={imageFile && imageFile.fileUrl || ''}/>
                        </div>
                        <div className="preview-item-info">
                            <i className="btn-star icon icon-header-button-action-collect"/>
                            <div className="sender-avatar disp-inblock"
                                 style={sender && sender.avatar && {backgroundImage: `url(${sender.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center'} || {}}></div>
                            <div className="preview-details disp-inblock">
                                <div className={"img-name"+(isMe?" can-edit":"")}  onClick={this.onEditName}>
                                    <span dangerouslySetInnerHTML={{__html: imageFile.name}}></span>
                                    {nameEditIcon}
                                </div>
                                {editContainer}                                
                                <div className="sender-info">
                                    <span className="sender-name">{imageFile.author}</span>
                                    <span className="send-time">{mSenderTime.format('h:mm')}{mSenderTime.hour() >= 12 ? 'PM' : 'AM'}</span>
                                </div>
                            </div>
                            <i className="btn-close icon icon-global-button-action-closeblack" onClick={onClose}/>
                        </div>
                    </div>             
            </div>
        );
    }

    render() {
        return (
            <span>
                {this._renderPreviewContent()}                
            </span>
        )
    }
}

export default class PhotoDispalyDialog extends FullScreenDialog {
    static propTypes = {
        ...FullScreenDialog.propTypes,
        imageFile:ReactPropTypes.object.isRequired
    };
    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        className: 'dlg-imageFilePreview'
    };

    onClose = () => this.close();

    renderContent() {
        return <PhotoDispalyDialogContent {..._.pick(this.props, ['imageFile'])}
            onClose={this.onClose}/>
    }
}
