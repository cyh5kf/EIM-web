import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import immutable from 'immutable';
import moment from 'moment';
import PureRenderComponent from '../../components/PureRenderComponent';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import Loading from '../../components/loading/Loading';
import ReactPropTypes from '../../core/ReactPropTypes';
import LoginStore from '../../core/stores/LoginStore';
import {SessionPhotoListSchema, DisplayStatusSchema} from '../../core/schemas/SessionPhotosSchemas';
import {moveDisplayOrderCmd} from '../../core/commands/sessionPhotosCommands';
import exposeLocale from '../../components/exposeLocale';

import './SessionPhotoAlbumDialog.less';

const MOVE_DIR_FORWARD = 'forward',
    MOVE_DIR_BACKWARD = 'backward';

const getInList = (list, idx) => idx < 0 ? null : list.get(idx);
const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE= 27;

class SessionPhotoAlbumDialogContent extends PureRenderComponent {
    static propTypes = {
        sessionPhotos: ReactPropTypes.ofSchema(SessionPhotoListSchema).isRequired,
        status: ReactPropTypes.ofSchema(DisplayStatusSchema).isRequired,
        pendingCmds: ReactPropTypes.pendingCmds.isRequired,
        onClose: ReactPropTypes.func.isRequired,
        sessionid: ReactPropTypes.string.isRequired,
        sessiontype: ReactPropTypes.number.isRequired,
        locale: ReactPropTypes.ofLocale().isRequired
    };

    getDisplayOrderOverflow() {
        const {sessionPhotos, status: {displayOrder, zeroOrderIndex}} = this.props,
            displayIndex = displayOrder + zeroOrderIndex;
        return {
            forwardOverflow: displayIndex >= sessionPhotos.size,
            backwardOverflow: displayIndex < 0
        };
    }

    move({forward = true}) {
        const {sessionPhotos, pendingCmds, sessionid, sessiontype, status: {displayOrder, zeroOrderIndex, noPhotosForward, noPhotosBackward}} = this.props,
            displayIndex = displayOrder + zeroOrderIndex,
            cannotMoveForward = displayIndex > sessionPhotos.size - 1 || (displayIndex === sessionPhotos.size - 1 && noPhotosForward),
            cannotMoveBackward = displayIndex < 0 || (displayIndex === 0 && noPhotosBackward);
        if (!(this.state.movingDirection || (forward && cannotMoveForward) || (!forward && cannotMoveBackward))) {
            moveDisplayOrderCmd({
                forward, sessionid, sessiontype,
                isLoadingPhotos: pendingCmds.isPending(moveDisplayOrderCmd, forward ? 'forward' : 'backward')
            });
        }
    }

    handleForwardClick = () => {
        this.move({forward: true});
    };
    handleBackwardClick = () => {
        this.move({forward: false});
    };

    componentWillMount() {
        this.setState({
            movingDirection: '',
            movingActive: false,
            zoomInImage: false,
            imgSizeCache: immutable.Map(), // key 为 msguuid
            showNameEdit:false
        });
    }

    componentWillReceiveProps(nextProps) {
        const {status: {displayOrder, zeroOrderIndex}, sessionPhotos} = this.props,
            {sessionPhotos: nextPhotos, status: {displayOrder: nextOrder, zeroOrderIndex: nextZeroOrderIndex}} = nextProps,
            displayPhoto = getInList(sessionPhotos, displayOrder + zeroOrderIndex),
            nextDisplayPhoto = getInList(nextPhotos, nextOrder + nextZeroOrderIndex);
        let movingDirection = '';
        if (displayOrder !== nextOrder && displayPhoto && nextDisplayPhoto) {
            movingDirection = displayOrder < nextOrder ? MOVE_DIR_FORWARD : MOVE_DIR_BACKWARD;
        } else if (displayOrder === nextOrder && !displayPhoto && nextDisplayPhoto) {
            movingDirection = displayOrder + zeroOrderIndex < 0 ? MOVE_DIR_BACKWARD : MOVE_DIR_FORWARD;
        }

        if (movingDirection) {
            // move 动画
            this.setState({
                movingDirection,
                movingActive: false
            }, () => {
                getComputedStyle(ReactDOM.findDOMNode(this)).left; // 强制浏览器应用样式, 以达到transition效果
                this.setState({
                    movingActive: true
                });
            });
            setTimeout(() => this.setState({
                movingDirection: '',
                movingActive: false
            }), 500);
        }
    }

    handleCurrentImageClick = e => {
        const {zoomInImage} = this.state;
        if (zoomInImage) {
            this.setState({
                zoomInImage: false
            });
        } else {
            const sizeCache = this.state.imgSizeCache.get(e.target.dataset.msguuid);
            if (sizeCache && sizeCache.get('canZoom')) {
                this.setState({
                    zoomInImage: true
                });
            }
        }
    };

    handleCurrentImageLoad = e => {
        const {imgSizeCache} = this.state,
            imgEl = e.target,
            msguuid = imgEl.dataset.msguuid;
        if (!imgSizeCache.get(msguuid)) {
            const canZoom = imgEl.naturalWidth > imgEl.clientWidth;
            this.setState({
                imgSizeCache: this.state.imgSizeCache.set(msguuid, immutable.Map({
                    width: imgEl.clientWidth,
                    naturalWidth: imgEl.naturalWidth,
                    canZoom: canZoom
                }))
            })
        }
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
       // let name = document.getElementById("name-edit").value;
        //fcj.todo
        //SetGroupTopicCmd(this.state.channel,topic);
        this.setState({
            showNameEdit:false
        });
    };

    _renderPreviewContent(displayIndex, cls = '') {
        const {sessionPhotos, onClose, locale} = this.props,
            {zoomInImage, imgSizeCache} = this.state,
            prevPhoto = getInList(sessionPhotos, displayIndex - 1),
            currPhoto = getInList(sessionPhotos, displayIndex),
            nextPhoto = getInList(sessionPhotos, displayIndex + 1),
            getPreviewItem = (photo, position) => {
                const isCurrent = position === 'current-item',
                    sizeCache = imgSizeCache.get(photo.resource.msguuid),
                    canZoom = sizeCache && sizeCache.get('canZoom'),
                    mSenderTime = moment(photo.resource.gmtcreate || photo.resource.clientSendTime),
                    dateTextSenderTime = mSenderTime.format('MMM Do'),
                    dateTextNow = moment(Date.now()).format('MMM Do'),
                    senderTimeLabel = (dateTextSenderTime === dateTextNow ? locale.COMMON.today : dateTextSenderTime) +
                            ' ' + mSenderTime.format('h:mm A');

                    let isMe = (photo.resource.uploaderuid === LoginStore.getUID());
                    let nameEditIcon = (isMe?(<i className="icon icon-global-button-action-write"></i>):null);
                    let editContainer = null;
                    if(isMe){
                        editContainer = (
                            <div className={"edit-container"+(this.state.showNameEdit?"":" hidden")}>                                
                                <textarea type="text" id="name-edit" className="name-edit" maxLength="100" onBlur={this.onNameEditCancel} onKeyDown={this._onKeyDonw} defaultValue={photo.resource.resfile.filename}></textarea>     
                                <span className="edit-note">Enter to submit,Esc to cancel</span>                          
                            </div> 
                        );
                    }       
                return (
                    <div className={`img-preview-item ${position} ${isCurrent && zoomInImage ? 'zoom-in-img' : ''} ${canZoom ? 'can-zoom' : ''}`}>
                        <div className="img-wrapper">
                            <img data-msguuid={photo.resource.msguuid} onLoad={isCurrent && this.handleCurrentImageLoad} onClick={isCurrent && this.handleCurrentImageClick}
                                 className="preview-img" src={photo && photo.resource.resfile.fileurl || ''}/>
                        </div>
                        <div className="preview-item-info">
                            <i className="btn-star icon icon-header-button-action-collect"/>
                            <div className="sender-avatar disp-inblock"
                                 style={photo.avatar && {backgroundImage: `url(${photo.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center'} || {}}></div>
                            <div className="preview-details disp-inblock">
                                <div className={"img-name"+(isMe?" can-edit":"")}  onClick={this.onEditName}>
                                    {photo.resource.resfile.filename}
                                    {nameEditIcon}
                                </div>
                                {editContainer}
                                <div className="sender-info">
                                    <span className="sender-name">{photo.username}</span>
                                    <span className="send-time">{senderTimeLabel}</span>
                                </div>
                            </div>
                            <i className="btn-close icon icon-global-button-action-closeblack" onClick={onClose}/>
                        </div>
                    </div>
                );
            };

        return (
            <div className={`img-preview-container ${cls}`}>
                {!!prevPhoto && getPreviewItem(prevPhoto, 'previous-item')}
                {!!currPhoto && getPreviewItem(currPhoto, 'current-item')}
                {!!nextPhoto && getPreviewItem(nextPhoto, 'next-item')}
            </div>
        );
    }

    render() {
        const {sessionPhotos, status: {displayOrder, zeroOrderIndex, noPhotosForward, noPhotosBackward}} = this.props,
            {movingDirection, movingActive} = this.state,
            displayIndex = displayOrder + zeroOrderIndex,
            maxDisplayIndex = sessionPhotos.size - 1,
            {forwardOverflow, backwardOverflow} = this.getDisplayOrderOverflow();
        let actualDisplayIndex = displayIndex,
            contentClasses = [];
        if (movingDirection) {
            actualDisplayIndex = movingDirection === MOVE_DIR_FORWARD ? (actualDisplayIndex - 1) : (actualDisplayIndex + 1);
            contentClasses.push('prepare-moving');
            if (movingActive) {
                contentClasses.push(`moving-${movingDirection}`)
            }
        } else {
            if (actualDisplayIndex > maxDisplayIndex) {
                actualDisplayIndex = maxDisplayIndex;
            } else if (actualDisplayIndex < 0) {
                actualDisplayIndex = 0;
            }
        }

        return (
            <span>
                {this._renderPreviewContent(actualDisplayIndex, contentClasses.join(' '))}
                {(forwardOverflow || backwardOverflow) && <div className="rc-loading"><Loading type="spokes" color="#BCBEBE" width="180" height="180" delay={500}/></div>}
                <button className={`pager-btn page-back-btn ${noPhotosBackward && (displayIndex <= 0) ? 'disabled-pager' : ''}`}
                     onClick={this.handleBackwardClick}>
                    <div className="ficon_wrapper">
                        <i className="ficon ficon_arrow_large_left"/>
                    </div>
                </button>
                <button className={`pager-btn page-forward-btn ${noPhotosForward && (displayIndex >= maxDisplayIndex) ? 'disabled-pager' : ''}`}
                     onClick={this.handleForwardClick}>
                    <div className="ficon_wrapper">
                        <i className="ficon ficon_arrow_large_right"/>
                    </div>
                </button>
            </span>
        )
    }
}

@exposeLocale()
export default class SessionPhotoAlbumDialog extends FullScreenDialog {
    static propTypes = {
        ...FullScreenDialog.propTypes,
        sessionPhotos: ReactPropTypes.ofSchema(SessionPhotoListSchema),
        status: ReactPropTypes.ofSchema(DisplayStatusSchema),
        pendingCmds: ReactPropTypes.pendingCmds.isRequired,
        sessionid: ReactPropTypes.string.isRequired,
        sessiontype: ReactPropTypes.number.isRequired
    };
    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        className: 'dlg-imageFilePreview'
    };

    onClose = () => this.close();

    renderContent() {
        return <SessionPhotoAlbumDialogContent {..._.pick(this.props, ['sessionPhotos', 'status', 'pendingCmds', 'sessionid', 'sessiontype'])}
            locale={this.state.locale}
            onClose={this.onClose}/>
    }
}
