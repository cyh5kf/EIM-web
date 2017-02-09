import React, {PropTypes} from 'react';
import exposeLocale from '../../components/exposeLocale';
import {QueryStarredMsgCmd,QueryMoreStarredMsgCmd} from '../../core/commands/FavouritesCommands';
import LoginStore from '../../core/stores/LoginStore';
import FavouritesStore, {FAVOURITES_EVENTS} from '../../core/stores/FavouritesStore';
import FavouritesList from './FavouritesList';
import exposePendingCmds from '../view-components/exposePendingCmds';
import Loading from 'react-loading';
import PanelHeader from '../right-panel/PanelHeader';
import LoadMoreButton from '../../components/button/LoadMoreButton';
import './favourites.less';

@exposeLocale(['FAVOURITES'])
@exposePendingCmds([QueryStarredMsgCmd])
export default class FavouritesListComposer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLastBatch: false,
            isLoadingMore: false
        };
    }

    static propTypes = {
        onHidePanel: PropTypes.func.isRequired
    };

    getStarredMsgData =()=> {
        var data = FavouritesStore.getStarredMsg();
        this.setState({dataSource: data.favouritesList || [], isLastBatch: data.isLastBatch});
    }

    componentWillUnmount(){
        FavouritesStore.removeEventListener(FAVOURITES_EVENTS.QUERYSTARREDMSG, this.getStarredMsgData);
    }

    componentWillMount(){
        FavouritesStore.addEventListener(FAVOURITES_EVENTS.QUERYSTARREDMSG, this.getStarredMsgData);
    }

    componentDidMount(){
        QueryStarredMsgCmd({
            uid: LoginStore.getUID(),
            endTime: (new Date()).getTime(),
            limit: 20
        });
    }

    render(){
        let content = null,
        {locale,dataSource,isLastBatch,pendingCmds}=this.state;
        if (pendingCmds.isPending(QueryStarredMsgCmd)) {
            content = (
                <span className="loaddingGif">
                    <Loading type='spokes' color='#e3e3e3'/>
                    <span>loading ...</span>
                </span>
            );
        }else{
            content = (
                <FavouritesComponent dataSource={dataSource} isLastBatch={isLastBatch} locale={locale} />
            );
        }

        return (
            <div className="favourites favourites_global">
                <div className="panel" >
                    <PanelHeader title={locale.title} onClickAction={this.props.onHidePanel} withBack={false} />
                    {content}
                </div>
            </div>
        );
    }
}



class FavouritesComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    static propTypes={

    }

    getMoreMentions(){
        var that = this;
        that.setState({isLoadingMore: true});
        QueryMoreStarredMsgCmd({
            uid: LoginStore.getUID(),
            endTime: FavouritesStore.getLastTime(),
            msgUuid: FavouritesStore.getMsgUuid(),
            limit: 20
        }).then(function () {
            that.setState({isLoadingMore: false});
        });
    }


    render(){
        const {locale,dataSource,isLastBatch} = this.props;
        let favouritesComposer=null, content= null;
        let isLoadingMore  = this.state.isLoadingMore;
        if (dataSource.size>0) {
            let that = this;
            content = <FavouritesList dataSource={dataSource} locale={locale} parent={that} />;

            favouritesComposer = (
                <div className="selectable_flex_pane_padder">
                    <div className="member_mentions">
                        {content}
                    </div>
                    {isLastBatch && (<div className="emptySpace"></div>)}
                    {!isLastBatch && (
                        <div className="flexpane_load_more" >
                            <LoadMoreButton loading={isLoadingMore} text={locale.btnMore}
                            onClick={that.getMoreMentions.bind(that)}/>
                        </div>
                    )}
                </div>
            );
        }else{
            favouritesComposer =(
                <div className="help">
                    <p>{locale.noFavouritesMsg}</p>
                </div>
            );
        }


        return (
            <div className="flex_content_scroller" >
                {favouritesComposer}
            </div>
        );
    }
}



