import React, {PropTypes} from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import Dialog from '../../components/dialog/Dialog';
import SessionPhotosStore from '../../core/stores/SessionPhotosStore';
import SessionPhotoAlbumDialog from './SessionPhotoAlbumDialog';
import {initCurrentSessionPhotoCmd, moveDisplayOrderCmd} from '../../core/commands/sessionPhotosCommands';
import exposePendingCmds from '../view-components/exposePendingCmds';

@exposePendingCmds([moveDisplayOrderCmd])
export default class SessionPhotoAlbumComposer extends PureRenderComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        sessionid: PropTypes.string.isRequired,
        sessiontype: PropTypes.number.isRequired
    };

    static open({fileMsg}) {
        initCurrentSessionPhotoCmd({fileMsg});
        Dialog.openDialog(SessionPhotoAlbumComposer, {
            sessionid: fileMsg.sessionid,
            sessiontype: fileMsg.sessiontype
        });
    }

    updateSessionPhotos = () => this.setState({
        sessionPhotos: SessionPhotosStore.getSessionPhotos(),
        status: SessionPhotosStore.getStatus()
    });

    componentWillMount() {
        this.updateSessionPhotos();
        SessionPhotosStore.addEventListener('change', this.updateSessionPhotos);
    }

    componentWillUnmount() {
        SessionPhotosStore.removeEventListener('change', this.updateSessionPhotos);
    }

    render() {
        return <SessionPhotoAlbumDialog {..._.pick(this.state, ['sessionPhotos', 'status', 'pendingCmds'])}
            {..._.pick(this.props, ['onClose', 'sessionid', 'sessiontype'])}/>;
    }
}

