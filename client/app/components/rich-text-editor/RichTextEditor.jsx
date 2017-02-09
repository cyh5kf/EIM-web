import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import _ from 'underscore';

import EmojifyComposer from '../emojify/EmojifyComposer';
import exposeLocale from '../exposeLocale';
import {createObjectURL} from '../../utils/FileUtils';

import './RichTextEditor.less';

const RE_EMOJI = /<img[^>]+class="[^"]*emoji-([^"\s]+)[^"]*"[^>]*>/gi;

@exposeLocale(['COMPONENTS', 'RICH_TEXT_EDITOR'])
export default class RichTextEditor extends React.Component {
    static propTypes = {
        defaultContentHtml: PropTypes.string
    };

    _editor = null

    shouldComponentUpdate() {
        return false;
    }

    getEditorHtml() {
        return this._editor.getHTML().replace(RE_EMOJI, ':$1:');
    }

    _insertEmoji(index, emoji) {
        // 使用预定义的'imageWithClass'格式插入表情
        this._editor.updateContents({
            ops: [{
                retain: index
            }, {
                insert: 1, // 1 代表img
                attributes: { imageWithClass: `emoji emoji-${emoji}` }
            }]
        });
    }

    _onEmojiItemSelect = (emoji) => {
        if(emoji){
            const editor = this._editor;
            editor.focus();
            const selection = editor.getSelection();
            if (selection) {
                const {start, end} = selection;
                editor.deleteText(start, end);
                this._insertEmoji(start, emoji);
            } else {
                this._insertEmoji(editor.getLength() - 1, emoji);
            }
        }
    }

    handleImageChange = e => {
        const files = e.target.files;
        if (files.length) {
            const editor = this._editor;
            editor.focus();
            const selection = editor.getSelection(),
                insertIndex = selection ? selection.start : editor.getLength() - 1;
            editor.insertEmbed(insertIndex, 'image', createObjectURL(files[0]));

            e.target.value = '';
        }
    }

    componentDidMount() {
        const {defaultContentHtml} = this.props;

        // 填坑: 初始化Quill前, 字体选项必须有一个option带有"selected"属性, 否则会导致图片选择出bug
        // (react只设置selected value, 但没有"selected"属性)
        const selectedOptionNode = findDOMNode(this.refs['selected-option']);
        selectedOptionNode.selected = true;
        selectedOptionNode.setAttribute('selected', 'true');

        // 直接将自定义格式写入Quill Format对象里以支持粘贴,
        // 因为在粘贴时Quill从editor.options中取得支持的格式, 而这些格式的配置只在Format对象里查找, (调用editor.addFormat不会更新editor.options, 没用)
        _.assign(Quill.require('format').FORMATS, {
            // 以下格式: 插入一个带指定class的图片, 用于实现表情
            imageWithClass: {
                type: 'embed',
                tag: 'IMG',
                attribute: 'class'
            }
        });
        this._editor = new Quill(findDOMNode(this.refs['content']), {
            theme: 'snow',
            modules: {
                toolbar: {container: findDOMNode(this.refs['toolbar'])},
                'link-tooltip': true
            },
            formats: Quill.DEFAULTS.formats.concat(['imageWithClass'])
        });


        if (defaultContentHtml) {
            this._editor.setHTML(defaultContentHtml);
        }
    }

    renderExtra() {
        return null;
    }

    render() {
        const {locale} = this.state;

        return (
            <div className="rich-text-editor">
                <div ref="toolbar" className="rte-toolbar">
                    <EmojifyComposer className="icon icon-richfile-button-active-expression" onItemSelect={this._onEmojiItemSelect} placement="bottom" id="rte-emojiPopover"/>
                    <label className="icon icon-richfile-button-active-picture image-selector" accept="image/*">
                        <input type="file" onChange={this.handleImageChange} accept="image/*"/>
                    </label>
                    <select className="ql-size">
                        <option ref="selected-option" value="14px">{locale.fontSizeContent}</option>
                        <option value="32px">{locale.fontSizeTitle_1}</option>
                        <option value="24px">{locale.fontSizeTitle_2}</option>
                        <option value="18px">{locale.fontSizeTitle_3}</option>
                    </select>
                    <span className="icon icon-richfile-button-active-b ql-bold"/>
                    <span className="icon icon-richfile-button-active-i ql-italic"/>
                    <span className="icon icon-richfile-button-active-underline ql-underline"/>
                    <span className="icon icon-richfile-button-active-strikethrough ql-strike"/>
                    <span className="icon icon-richfile-button-active-duanluo ql-list"/>
                    <span className="icon icon-richfile-button-active-bianhao ql-bullet"/>
                    <span className="icon icon-richfile-button-active-link ql-link"/>
                </div>

                <div ref="content" className="rte-content"></div>

                {this.renderExtra()}
            </div>
        );
    }
}
