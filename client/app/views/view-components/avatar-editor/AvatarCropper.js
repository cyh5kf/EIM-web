import React,{PropTypes} from 'react';
import exposeLocale from '../../../components/exposeLocale';
import _ from 'underscore';
import LoadingButton  from '../../../components/button/LoadingButton';
import FullScreenDialog from '../../../components/dialog/FullScreenDialog';
import Cropper from 'react-cropper';
import './cropper.css';


@exposeLocale(['DIALOGS', 'dlg-editUserinfo'])
export default class AvatarCropper extends FullScreenDialog {

    static propTypes = {
        show: PropTypes.bool.isRequired,
        thumb: PropTypes.string,
        loading:PropTypes.bool.isRequired,
        onButtonClick: PropTypes.func.isRequired
    };

    constructor(props){
        super(props);
        this.state = {
            preview:props.thumb,
            show:props.show
        };
        this.previewImageId = _.uniqueId('previewImageId');
    }

    componentWillReceiveProps(nextProps) {
        var show = nextProps.show;
        this.setState({show:show});
    }

    close(){
        this.onButtonClick('cancel');
    }

    onCrop=()=>{
        if (typeof this.refs.cropper.getCroppedCanvas() === 'undefined') {
            return;
        }
        this.setState({
            preview: this.refs.cropper.getCroppedCanvas().toDataURL()
        });
    };


    getPreviewBlob(){
        var dataURL = this.refs.cropper.getCroppedCanvas().toDataURL();
        let arr = dataURL.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    onButtonClick(btnName){
        var previewBlob = null;
        var cropperData = null;
        if(btnName==='ok'){
            previewBlob  = this.getPreviewBlob();
            cropperData = this.refs.cropper.getData(true)
        }
        var onButtonClick = this.props.onButtonClick;
        onButtonClick(btnName,previewBlob,cropperData);
    }

    renderContent(){
        var locale = this.state.locale;
        var {thumb,show,loading} = this.props;

        if(!show){
            return <div></div>
        }

        return (
            <div className="avatar-cropper">

                <div className="header"></div>

                <div className="content">

                    <div className="cropper-wrapper">
                        <Cropper
                            ref='cropper'
                            src= {thumb}
                            style={{height: 280, width: 382}}
                            aspectRatio={1}
                            guides={false}
                            zoomable={false}
                            preview={"#"+this.previewImageId}
                            crop={this.onCrop}
                        />
                    </div>
                    <div className="preview-wrapper">
                        <img src={this.state.preview} id={this.previewImageId} className="previewImage" />;
                    </div>

                    <div className="clearFloat"></div>
                </div>


                <div className="footer">
                    <button className="cancelCreate" onClick={this.onButtonClick.bind(this,'cancel')}>
                        {locale.cancelLabel}
                    </button>
                    <LoadingButton className="create" onClick={this.onButtonClick.bind(this,'ok')} loading={loading?1:0} >
                        {locale.confirmLabel}
                    </LoadingButton>
                </div>


            </div>
        );
    }
}