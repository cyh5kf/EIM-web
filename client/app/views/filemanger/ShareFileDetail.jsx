import React, {PropTypes} from  'react';
import {RenameFileCmd} from '../../core/commands/channel/GroupInfoCommands';
import StringUtils from '../../utils/StringUtils';
import exposeLocale from '../../components/exposeLocale';

@exposeLocale(['COMMON','filedetails'])
export default class ShareFileDetail extends React.Component{
    static propTypes = {
        isNameEdit: PropTypes.bool.isRequired,
        displayFile: PropTypes.object.isRequired,
        onEditDone: PropTypes.func
    };

     constructor(props){
        super(props);
        this.state={isNameEdit:props.isNameEdit};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({isNameEdit:nextProps.isNameEdit});

        if(nextProps.isNameEdit){
            setTimeout(function() {            
                document.getElementById("file-edit-title-input").focus();
            }, 50);  
        }
    }

    onSaveName=()=>{
        if(!this.props.onEditDone){
            return;
        }

        let newName = document.getElementById("file-edit-title-input").value;

        //fcj.todo:
        RenameFileCmd(this.props.displayFile.uploaderuid,
            this.props.displayFile.resourceid,newName,
            (Number(this.props.displayFile.sessiontype)===0));                     

        this.props.onEditDone(newName);
    }

    render(){        
        const showEdit = this.state.isNameEdit; 
        const file = this.props.displayFile;
        const locale = this.state.locale;

        let filesize = "";
        if(file.filesize){
            let size = parseInt(file.filesize);
            if(size < 1024){
                filesize = size + "B";
            }
            else if(size < 1024 * 1024){
                filesize = Math.round(size/1024) + "KB";
            }
            else{
                filesize = Math.round(size/(1024*1024))+ "MB";
            }
        }

        return (
            <div className="view-content disp-block file-detail-view">
                <div className={"file-title-container"+(showEdit?" hidden":"")}>
                    <div className="flexpane-file-title">
                        <a className="file-type-icon"></a>
                        <span className="sender-name">{file.author}</span>
                        <span className="file-name-title">
                            <a className="file-name"><span dangerouslySetInnerHTML={{__html: file.name}}></span></a>
                        </span>
                        <ul className="file-action-list">
                            <li className="file-action-item disp-inblock">
                                <a className="icon icon-message-button-action-download download" href={file.fileUrl}></a>
                            </li>
                            {/*fcj<li className="file-action-item disp-inblock">
                                <a className="icon icon-message-button-action-download new-window"></a>
                            </li>*/}
                            <li className="file-action-item disp-inblock">
                                <a className="icon icon-message-button-action-more40 more"></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={"file-edit-title-container"+(showEdit?"":" hidden")}>
                    <input type="text" id="file-edit-title-input" className="file-edit-title-input" defaultValue={StringUtils.htmlToText(file.name)}></input>
                    <p className="btn-container">
                        <i className="btn-common cancel" onClick={()=>this.setState({isNameEdit:false})}>{locale.cancel}</i>
                        <i className="btn-common confirm" onClick={this.onSaveName}>{locale.saveChanges}</i>
                    </p>
                </div>
                <div className="file-container"> 
                    <a className="file-header" href={file.fileUrl}>
                        <i className="file-header-icon">
                            <i className="icon icon-download"></i>
                        </i>
                        <h4 className="file-header-title"><span dangerouslySetInnerHTML={{__html: file.name}}></span></h4>
                        <p className="file-header-meta">
                            <span className="meta-size">{filesize}</span>
                            <span className="meta-hover-placement">
                                <span className="meta-type">{locale.binary}</span>
                                <span className="meta-hover">{locale.clicktodl}</span>
                            </span>
                        </p>
                    </a>
                </div>
            </div>
        );
    }
}
