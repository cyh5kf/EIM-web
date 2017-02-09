import React from 'react';
import Cropper from 'react-cropper';
import FullScreenDialog from '../../../../components/dialog/FullScreenDialog';
import exposeLocale from '../../../../components/exposeLocale';
import LoginStore from '../../../../core/stores/LoginStore';
import classnames from '../../../../utils/ClassNameUtils';

@exposeLocale(['DIALOGS', 'dlg-editUserinfo'])
export default class GroupLogoDialog extends FullScreenDialog{
    static propTypes = {
        ...FullScreenDialog.propTypes
    }

    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        name: 'dlg-editUserinfo'
    };

    constructor(props){
        super(props);
        this.state = {
            show: true,
            avatar: LoginStore.getAvatar(),
            panelType: 1
        };
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.show || this.props.show,
            avatar: LoginStore.getAvatar(),
            panelType: 1
        });
    }

    componentWillMount(){
        super.componentWillMount(...arguments);
    }

    componentWillUnmount(){
        super.componentWillUnmount(...arguments);
    }

    open(){
        super.open();
        this.setState({show:true});
    }

    close(){
        super.close();
        this.setState({panelType:1, thumb:null});
    }

    updateState(obj){
        this.setState(obj);
    }

    renderContent(){
        const locale = this.state.locale;
        return (
            <div className="info-container">
                <EditUserAvatarBox  show={true}
                                    locale = {locale}
                                    updateState={this.updateState.bind(this)}
                                    closeDialog={this.close.bind(this)}
                                    thumb={this.props.thumb}
                                    onCrop={this.props.onCrop}

                />
            </div>
        );
    }
}

class EditUserAvatarBox extends React.Component {
    static propTypes = {
        thumb: React.PropTypes.string,
        updateState: React.PropTypes.func,
        onCrop: React.PropTypes.func,
        closeDialog: React.PropTypes.func,
        show: React.PropTypes.bool,
        locale: React.PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {thumb:this.props.thumb, preview:this.props.thumb, show:props.show};
        this._crop = this._crop.bind(this);
    }

    componentWillReceiveProps(nextProps){
        this.setState({thumb:nextProps.thumb, preview:nextProps.thumb, show:nextProps.show});
    }

    togglePangel(panelType){
        this.props.updateState({'panelType': panelType, show:true});
    }


    _crop(){
        if (typeof this.refs.cropper.getCroppedCanvas() === 'undefined') {
            return;
        }
        this.setState({
            preview: this.refs.cropper.getCroppedCanvas().toDataURL()
        });
    }

    dataURLtoBlob(dataBase64) {
        let arr = dataBase64.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    doUpload(){
        let blob = this.dataURLtoBlob(this.refs.cropper.getCroppedCanvas().toDataURL());
        this.props.updateState({croperImage:blob, croperData: this.refs.cropper.getData(true)});
        this.props.onCrop(blob, this.refs.cropper.getData(true))
    }

    render(){
        const locale = this.props.locale;

        let imageNode = null;
        let previewImage = null;

        if(this.state.thumb){
            imageNode = <Cropper
                ref='cropper'
                src= {this.state.thumb}
                style={{height: 280, width: 382}}
                aspectRatio={1}
                guides={false}
                zoomable={false}
                preview=".previewImage"
                crop={this._crop} />

            previewImage =  <img src={this.state.preview} className="previewImage" />;
        }

        let hidden = this.state.show?'':'hidden';
        return (
            <div className={classnames("chargeUserHead-wrap", hidden)}>
                <div className="eim-deprecated eim-back-nor" onClick={this.props.closeDialog}></div>
                <div className="inner">
                    <div className="chargedContain">{imageNode}</div>
                    <div className="chargedImage" onClick={this.togglePangel.bind(this, 3)}>
                        {previewImage}
                    </div>
                </div>
                <div className="footer">
                    <div className="cancelCreate" onClick={this.props.closeDialog}>
                        {locale.cancelLabel}
                    </div>
                    <div className="create" onClick={()=>this.doUpload()}>
                        {locale.confirmLabel}
                    </div>
                </div>
            </div>
        );
    }
}