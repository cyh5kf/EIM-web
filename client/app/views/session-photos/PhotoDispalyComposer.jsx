import React, {PropTypes} from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import Dialog from '../../components/dialog/Dialog';
import PhotoDispalyDialog from './PhotoDispalyDialog';

export default class PhotoDispalyComposer extends PureRenderComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired
    };
    static open({imageFile}) {                
        Dialog.openDialog(PhotoDispalyComposer, {
            imageFile
        });
    }

    render() {
        return <PhotoDispalyDialog {..._.pick(this.props, ['imageFile'])} onClose={this.props.onClose}/>;
    }
}

