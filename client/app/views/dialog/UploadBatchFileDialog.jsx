import React from 'react';
import Dialog from '../../components/dialog/Dialog';
import _ from 'underscore';
import exposeLocale from '../../components/exposeLocale';

import './UploadBatchFileDialog.less';

@exposeLocale(['DIALOGS', 'dlg-batchFile'])
export default class UploadBatchFileDialog extends Dialog {
    static defaultProps = {
        ...Dialog.defaultProps,
        name: 'dlg-batchFile'
    }
    constructor(props) {
        super(props);
        let filenames = {};
        _.each(this.props.files, function(file){
            filenames[file.id] = file.name;
        });
        this.state = {show:this.props.show, files:this.props.files, filenames:filenames, uploader:this.props.uploader,imageThumbs:{}};
        this.getFileStateList();
    }

    postMessage(files, uploader){
        let filenames = {};
        _.each(files, function(file){
            filenames[file.id] = file.name;
        });
        this.setState({show:true, files:files, filenames: filenames, uploader:uploader});
        this.getFileStateList();
    }

    close(){
        this.setState({show:false, uploader:null, files:null, filenames:null,imageThumbs:{}});
    }

    onFileNameChange(e){
        let filenames = this.state.filenames;
        filenames[e.target.getAttribute('data-fileid')] = e.target.value;
    }

    toggle(){
        this.setState({show:!this.state.show});
    }

    renderCancelLabel(){
        return this.state.locale.cancelLabel;
    }

    renderConfirmLabel(){
        return this.state.locale.confirmLabel;
    }

    renderHeaderTitle(){
        return this.state.locale.title;
    }

    confirm(e){
        let files = this.state.files;
        let filenames = this.state.filenames;
         console.log(filenames);
        _.each(files, function(file){
            let suffix = file.name.substring(file.name.lastIndexOf('.'));
            let currentFileName = filenames[file.id];
            console.log(currentFileName);
            if(currentFileName.indexOf(suffix) === -1){
                file.name = currentFileName + suffix;
            }else{
                file.name = currentFileName;
            }
        });
        this.state.uploader.upload();
        this.toggle();
    }

    cancel(e){
        let self = this;
        _.each(this.state.files, function(file){
            self.state.uploader.removeFile(file.id, true);
        });
        this.close();
    }

    onCancelUpload(e){
        let fileid  = e.target.getAttribute('data-fileid');
        let filenames = this.state.filenames;
        let files = this.state.files;
        let newFiles  = [];
        _.each(files, function(file){
            if(file.id !== fileid){
                newFiles.push(file);
            }
        });
        delete filenames[fileid];
        this.state.uploader.removeFile(fileid, true);
        this.setState({show:newFiles.length > 0, files:newFiles, filenames:filenames});
    }

    refreshFileNames(e){
        let fileid = e.target.getAttribute('data-fileid');
        let filenames = this.state.filenames;
        filenames[fileid] = e.target.value;
        this.setState({filenames:filenames});
    }

    getFileStateList(){
        let files = this.state.files;
        let imageThumbs={};
        _.each(files, (function (file) {
            var imageThumb = null;
            this.props.uploader.makeThumb(file, function (error, ret) {
                if (ret) {
                    imageThumb = <img src={ret}/>;
                } else {
                    imageThumb = <div className="eim-deprecated eim-doc"></div>
                }
                imageThumbs[file.id]=imageThumb;
                this.setState({imageThumbs:imageThumbs});
            }.bind(this), 276, 276);

        }).bind(this));
    }
              


    renderContent(){
        let filestate = [];
        let filenames = this.state.filenames;
        let imageThumbs=this.state.imageThumbs;
        _.each(this.state.files, function(file){
            filestate.push({file:file, filename:filenames[file.id], imageThumb:imageThumbs[file.id]});
        });
        const locale = this.state.locale;
        let filelist = filestate.map((info, key)=>{
            return (
            <li key={info.file.id}>
                <div className="imageBox">
                    {info.imageThumb}
                </div>
                <div className="inputTextBox">
                    <input type="text" className="utitle" data-fileid={info.file.id} value={info.filename}
                     onChange={(e)=>this.refreshFileNames(e)} placeholder={locale.utitleInputPlaceholder}/>
                    <textarea type="text" className="desc" placeholder={locale.descriptionInputPlaceholder}></textarea>
                </div>
                <div className="deleteIcon" data-fileid={info.file.id} onClick={(e)=>this.onCancelUpload(e)}></div>
            </li>);
        });

        return (
            <div className="context">
                <ul className="uploadFileList">
                    {filelist}
                </ul>
           </div>
        );
    }
}
