import React, {PropTypes} from 'react';
import Loading from 'react-loading';
import exposeLocale from '../../components/exposeLocale';
import PureRenderComponent from '../PureRenderComponent';
import './Loading.less';

export const LOADING_STATUS = {
    HideLoad: 0,
    Loading: 1,
    Loaded: 2
}

@exposeLocale(['SAVING_LOADING'])
export default class SavingLoading extends PureRenderComponent {
    constructor(props){
        super(...arguments);
        this.state={loading:LOADING_STATUS.HideLoad,show:false};
    }

    static propTypes = {
        className: PropTypes.string
    }

    changeLoad(loading){
        this.setState({loading:loading,show:true});
    }

    load(){
        this.setState({loading:LOADING_STATUS.Loading,show:true});
    }

    loaded(){
        this.setState({loading:LOADING_STATUS.Loaded,show:true});
    }

    hideLoad(){
        this.setState({show:false});
    }

    quickHideLoad(){
        this.setState({loading:LOADING_STATUS.HideLoad,show:false});
    }

    render() {
        const {className} = this.props;
        const {loading,locale,show} = this.state;
        const showCss = show?'':'hideLoading';
        return (loading!==LOADING_STATUS.HideLoad&&<div className={`loading-saving ${className} ${showCss}`}>
                    {loading===LOADING_STATUS.Loading && <Loading delay={200} type='spokes' color='#36a64f'/>}
                    {loading===LOADING_STATUS.Loading && locale.savingLabel}
                    {loading===LOADING_STATUS.Loaded && <i className="ficon_check_circle_o"/>}
                    {loading===LOADING_STATUS.Loaded && locale.savedLabel}
                </div>
        );
    }
}
