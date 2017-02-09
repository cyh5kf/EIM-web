import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from '../../components/dialog/Dialog';
import exposeLocale from '../../components/exposeLocale';

import './UploadSingleFileDialog.less';

@exposeLocale(['DIALOGS', 'dlg-singleFile'])
export default class UploadSingleFileDialog extends Dialog {
    static defaultProps = {
        ...Dialog.defaultProps,
        name: 'dlg-singleFile'
    };

    constructor(props) {
        super(props);
        this.state = {
            show:this.props.show,
            file:this.props.file,
            filename:this.props.file.name,
            uploader:this.props.uploader,
            isImage:false
        };
    }

    close(e){
        if(this.state.file){
            this.state.uploader.removeFile(this.state.file.id, true);
        }
        this.setState({show:false, file:null, filename:null, uploader:null, imageThumb:null});
    }

    postMessage(file, uploader){
        let ext = file.ext.toLowerCase();
        let isImage = ext&&/(png|jpg|jpeg|bmp|gif)$/.test(ext);
        this.setState({file:file, filename:file.name, uploader:uploader, show:true,isImage:isImage});
        this.state.uploader.makeThumb( this.state.file, ( error, ret )=>{
            let imageThumb = isImage?<img src={ret} />:<div className="eim-deprecated eim-doc"></div>;
            this.setState({imageThumb:imageThumb});
        }, 276, 276);
    }

    toggle(){
        this.setState({show:!this.state.show});
    }

    onFileNameChange(e){
         this.setState({filename:ReactDOM.findDOMNode(this.refs.filename).value});
    }

    componentWillMount(){
        super.componentWillMount(...arguments);
        if(this.state.file){
            let ext = this.state.file.ext.toLowerCase();
            let isImage = ext&&/(png|jpg|jpeg|bmp|gif)$/.test(ext);
            this.state.uploader.makeThumb( this.state.file, ( error, ret )=>{
                let imageThumb = isImage?<img src={ret} />:<div className="eim-deprecated eim-doc"></div>;
                this.setState({imageThumb:imageThumb,isImage:isImage});
            }, 276, 276);
        }
    }

    confirm(e){
        let file = this.state.file;
        var suffix = file.name.substring(file.name.lastIndexOf('.'));
        if(this.state.filename){
            if(this.state.filename.indexOf(suffix) === -1){
                file.name = this.state.filename + suffix;
            }else{
                file.name = this.state.filename;
            }
        }
        file.filedesc = ReactDOM.findDOMNode(this.refs.description).value;
        this.state.uploader.upload();
        this.toggle();
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

    renderContent(){
        let image = this.state.isImage?'':'file';
        const locale = this.state.locale;
        return (
            <div className="context">
                <div className="leftMenuBox">
                    <div className={"imageBox "+image}>
                       {this.state.imageThumb}
                    </div>
                </div>
                <div className="rightContentBox">
                    <div className="labelText">{locale.utitleLabelText}</div>
                    <div className="titleBox">
                        <input type="text" className="utitle" ref="filename" value={this.state.filename} onChange={this.onFileNameChange.bind(this)} placeholder={locale.utitleInputPlaceholder}/>
                    </div>
                    <div className="labelText">{locale.descLabelText}<span className="descText">{locale.remark}</span></div>
                    <div className="descBox">
                        <textarea className="udesc" ref="description" placeholder={locale.descriptionInputPlaceholder}></textarea>
                    </div>
                </div>
           </div>
        );
    }
}
