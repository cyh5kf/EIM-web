import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import {fileSizeToString, fileTypeByUrl} from '../../../utils/FileExtensionUtils';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';
import ReactPropTypes from '../../../core/ReactPropTypes';

export default class MessageFileHolder extends PureRenderComponent {
    static propTypes = {
        message: ReactPropTypes.ofSchema(MessageSchema).isRequired
    }

    getRootNodeProps() {
        return {
            className: 'message-item-content file-msg'
        };
    }

    renderFileInfo() {
        const {message} = this.props;
        return (
            <div className={`file-info type-${fileTypeByUrl(message.fileurl)}`}>
                <i className="file-icon"/>
                <div className="file-desc">
                    <div className="file-name">{message.filename}</div>
                    <div>{fileSizeToString(message.filesize)}</div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div {...this.getRootNodeProps()}>
                {this.renderFileInfo()}
            </div>
        );
    }
}
