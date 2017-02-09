import React, {PropTypes} from 'react';
import exposeLocale from '../../components/exposeLocale';
import {GetMentionListCmd} from '../../core/commands/MentionCommands';
import LoginStore from '../../core/stores/LoginStore';
import MentionStore from '../../core/stores/MentionStore';
import ChannelMentionsList from './ChannelMentionsList';
import _ from 'underscore';
import MentionType from '../../core/enums/EnumMentionType';
import {createImmutableSchemaData} from '../../utils/schema';
import {MentionMsgListSchema} from '../../core/schemas/MessageSchemas';
import Loading from 'react-loading';
import ReactPropTypes from '../../core/ReactPropTypes';
import PanelHeader from '../right-panel/PanelHeader';
import {showStyle} from '../../utils/JSXRenderUtils';
import LoadMoreButton from '../../components/button/LoadMoreButton';

import './mentions.less';


class MentionsComponent extends React.Component {

    static propTypes = {
        isLastBatch: ReactPropTypes.bool,
        dataSource: ReactPropTypes.ofSchema(MentionMsgListSchema).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            visibleSelector: false,
            isLoadingMore: false,
            options: MentionStore.getMentionsOption() || {
                channelOption: false,
                groupOption: false
            }
        };
    }

    getMoreMentions(e) {
        var that = this;
        that.setState({isLoadingMore: true});
        GetMentionListCmd({
            uid: LoginStore.getUID(),
            asc: false,
            endTime: MentionStore.getLastTime(),
            limit: 10
        }).then(function () {
            that.setState({isLoadingMore: false});
        });
    }

    onSelect(e) {
        this.setState({visibleSelector: !this.state.visibleSelector});
    }

    clickCheckBox(option) {
        let mentioinOptions = _.extend(this.state.options, option);
        this.setState({options: mentioinOptions});
        MentionStore.setMentionsOption(mentioinOptions);
    }

    renderChannelMentionsList(dataSource) {
        if (dataSource && dataSource.size > 0) {
            var that = this;
            var content = [];
            let mentionList = MentionStore.filterNotMentions(dataSource, this.state.options.channelOption ? null : MentionType.All, this.state.options.groupOption ? null : MentionType.Group);
            MentionStore.groupByDate(mentionList).forEach(function (record, key) {
                content.push(<ChannelMentionsList parent={that} dataSource={record} key={key} date={key}/>);
            });
            return content;
        }
        return null;
    }

    render() {
        let that = this;
        let {isLoadingMore}  = that.state;
        let {locale,dataSource,isLastBatch} = that.props;
        var isHasContent = dataSource && dataSource.size > 0;

        return (
            <div className="flex_content_scroller">

                <div className="selectable_flex_pane_padder" style={showStyle(isHasContent)}>
                    <div id="member_mentions">
                        {that.renderChannelMentionsList(dataSource)}
                    </div>
                    <div style={showStyle(!isLastBatch)}>
                        <LoadMoreButton loading={isLoadingMore} text={locale.btnMore}
                                        onClick={that.getMoreMentions.bind(that)}/>
                    </div>
                </div>

                <div className="help" style={showStyle(!isHasContent)}>
                    <p>{locale.noMentionMe}</p>
                </div>

            </div>
        );
    }
}


@exposeLocale(['MENTIONS_ME'])
export default class MentionsListComposer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: createImmutableSchemaData(MentionMsgListSchema, []),
            isLastBatch: false,
            isLoading: true
        };
    }

    static propTypes = {
        onHidePanel: PropTypes.func.isRequired
    };

    _onMentionListChange = mentionInfo => {
        this.setState({
            dataSource: mentionInfo.mentionList,
            isLastBatch: mentionInfo.isLastBatch
        });
    };

    componentWillUnmount() {
        MentionStore.unbindWebsocketEvents();
        MentionStore.removeEventListener('updateMentionList', this._onMentionListChange);

    }

    componentWillMount() {
        MentionStore.bindWebsocketEvents();
        MentionStore.addEventListener('updateMentionList', this._onMentionListChange);

    }

    componentDidMount() {
        var that = this;
        that.setState({isLoading: true});
        GetMentionListCmd({
            uid: LoginStore.getUID(),
            asc: false,
            endTime: (new Date()).getTime(),
            limit: 25
        }).then(function () {
            that.setState({isLoading: false});
        });
    }

    render() {

        var {locale,dataSource,isLastBatch,isLoading} = this.state;

        return (
            <div className="max-panel-view mentions mission_global">
                <PanelHeader title={locale.title} onClickAction={this.props.onHidePanel} withBack={false}/>
                 <span className="loaddingGif" style={showStyle(isLoading)}>
                        <Loading type='spokes' color='#e3e3e3'/>
                        <span>loading ...</span>
                 </span>
                <div style={showStyle(!isLoading)}>
                    <MentionsComponent dataSource={dataSource} isLastBatch={isLastBatch} locale={locale}/>
                </div>
            </div>
        );
    }
}