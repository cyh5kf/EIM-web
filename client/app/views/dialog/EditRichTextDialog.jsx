import React from 'react';
import StringUtils from '../../utils/StringUtils';
import toast from '../../components/popups/toast';
import LoginStore from '../../core/stores/LoginStore';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import exposeLocale from '../../components/exposeLocale';
import EimRichTextEditor from '../view-components/eim-rich-text-editor/EimRichTextEditor';

@exposeLocale(['DIALOGS', 'dlg-editRichText'])
export default class EditRichTextDialog extends FullScreenDialog {
    constructor(props) {
        super(...arguments);
        this.state = {show:true,richText:'',issigned:false};
    }

    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        className: 'dlg-richTextEditBox'
    }

    textChanged=(e)=>{
        this.setState({richTitle:e.target.value});
    }

    isSignedChanged=()=>{
        this.setState({issigned:!this.state.issigned});
    }

    onSubmit = () => {
        var locale = this.state.locale;
        var title = this.state.richTitle;
        if (!title){
            toast(locale.inputTitleLab);
        }

        this.refs.rte.getEditorHtml()
            .then(contentHtml => {
                if (!contentHtml) {
                    toast(locale.inputContentLab);
                }

                this.props.onSubmit({
                    title,
                    content: contentHtml
                });
            })
            .then(() => this.close());
    }

    renderContent(){
        let state = this.state;
        let locale = state.locale;
        let checkCss = this.state.issigned?"ficon_star":"ficon_star_o";
        let savedMsg = StringUtils.format(locale.savedMsg,LoginStore.getUserName());
        let avatar = <div className="avatar"></div>;
        return (
            <div className="context">
                <div className="header">
                    <div className="floatLeft savedLine hidden">
                        <div className="signRichText">
                            <div className={checkCss} onClick={this.isSignedChanged}></div>
                        </div>
                        <div className="savedButton" onClick={this.onSubmit}>{locale.shareLabel}</div>
                    </div>
                    <div className="floatRight buttonList">
                        <button className="share" onClick={this.onSubmit}>{locale.sendLabel}</button>
                        <button className="view hidden"><div className="ficon ficon_ellipsis"></div></button>
                        <button className="conversation hidden"><div className="ficon ficon_comment_o"></div></button>
                    </div>
                </div>
                <div className="articleContext">
                    <div className="avatarLine">
                        <div className="avatarBox floatLeft">
                            {avatar}
                        </div>
                        <div className="savedMsgBox floatLeft">
                            <div className="savedMsg">{savedMsg}<a to="#" className="yourFiles">{locale.yourFiles}</a></div>
                            <div className="inputTitleLine">
                                <input type="text" className="inputTitle" placeholder={locale.inputTitleLab} onChange={this.textChanged} value={state.richTitle}/>
                            </div>
                        </div>
                    </div>
                    <div className="richTextLine">
                        <EimRichTextEditor ref="rte"/>
                    </div>
                </div>
            </div>
        );
    }
}

