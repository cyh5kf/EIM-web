import React, {PropTypes} from 'react';
import _ from 'underscore';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';

import './confirm.less';

class ConfirmDialog extends Dialog {
    static propTypes = {
        ...Dialog.propTypes,
        title: PropTypes.node.isRequired,
        content: PropTypes.node.isRequired,
        buttons: PropTypes.arrayOf(PropTypes.shape({
            className: PropTypes.string,
            label: PropTypes.node,
            onClick: PropTypes.func.isRequired
        })).isRequired
    }
    static defaultProps = {
        ...Dialog.defaultProps,
        name: 'dlg-confirm'
    }
    handleBtnClick = e => {
        const idx = parseInt(e.currentTarget.dataset.idx),
            {buttons} = this.props;
        buttons[idx].onClick(this);
    }
    renderHeaderTitle() {
        return this.props.title;
    }
    renderFooter() {
        const {buttons} = this.props;
        return (
            <div className="footer-content">
                {buttons.map((btn, idx) => (
                    <Button key={`key-${idx}`} {..._.omit(btn, ['onClick', 'label'])} data-idx={idx} onClick={this.handleBtnClick}>{btn.label}</Button>
                ))}
            </div>
        );
    }
    renderContent() {
        return this.props.content;
    }
}

export default function confirm({title, content, buttons, className = ''}) {
    Dialog.openDialog(ConfirmDialog, {
        className: '',
        title,
        content,
        buttons
    });
}