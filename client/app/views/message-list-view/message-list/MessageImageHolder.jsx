import React from 'react';
import _ from 'underscore';
import SessionPhotoAlbumComposer from '../../session-photos/SessionPhotoAlbumComposer';
import MessageFileHolder from './MessageFileHolder';

const MAX_IMG_WIDTH = 360,
    MAX_IMG_HEIGHT = 360;

export default class MessageImageHolder extends MessageFileHolder {
    openImage = () => {
        this.setState({showMore:false});
        SessionPhotoAlbumComposer.open({
            fileMsg: this.props.message
        });
    }

    renderFileInfo() {
        const {message} = this.props;
        return <img src={message.fileurl} onClick={this.openImage}/>;
    }

    getRootNodeProps() {
        const baseProps = super.getRootNodeProps();
        const {message: {imgwidth, imgheight}} = this.props;
        let displayWidth = MAX_IMG_WIDTH,
            displayHeight = MAX_IMG_HEIGHT;
        if (imgwidth && imgheight) {
            if (imgwidth <= MAX_IMG_WIDTH && imgheight <= MAX_IMG_HEIGHT) {
                displayWidth = imgwidth;
                displayHeight = imgheight;
            } else if (imgwidth > MAX_IMG_WIDTH) {
                displayWidth = MAX_IMG_WIDTH;
                displayHeight = Math.round(imgheight * MAX_IMG_WIDTH / imgwidth);
            }
        }
        return _.assign(baseProps, {
            className: `${baseProps.className} image-msg`,
            style: {
                width: displayWidth,
                height: displayHeight
            }
        });
    }

}
