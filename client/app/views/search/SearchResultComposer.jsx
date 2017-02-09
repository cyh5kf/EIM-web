import React from  'react';
import immutable from 'immutable';

import PureRenderComponent from '../../components/PureRenderComponent';
import SearchResultView from './SearchResultView';
import EnumEventType from '../../core/enums/EnumEventType';
import SearchStore from '../../core/stores/SearchStore';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';
import ShareFileDetail from '../filemanger/ShareFileDetail';
import PanelHeader from '../right-panel/PanelHeader';

import './global-search-style.less';

const ItemsPerPage = 20;
let currentFilesIndex = 0;
let currentTextsIndex = 0;

export default class SearchResultComposer extends PureRenderComponent {
    updateMessages = (isMessageSearch) => {
        if(!isMessageSearch){
            return;
        }

        const searchMsgs = SearchStore.getSearchMessages();
        let textmsgs = searchMsgs.get('texts');
        let filemsgs = searchMsgs.get('files');

        let subTexts = immutable.List(),subFiles = immutable.List();
        //fcj.todo:按页取数据
        if(textmsgs && textmsgs.size > currentTextsIndex){
            if(textmsgs.size >= currentTextsIndex + ItemsPerPage){
                subTexts = textmsgs.slice(currentTextsIndex, currentTextsIndex+ItemsPerPage);
            }
            else{
                subTexts = textmsgs.slice(currentTextsIndex);
            }
        }

        if(filemsgs && filemsgs.size > currentFilesIndex){
            if(filemsgs.size >= currentFilesIndex + ItemsPerPage){
                subFiles = filemsgs.slice(currentFilesIndex, currentFilesIndex+ItemsPerPage);
            }
            else{
                subFiles = filemsgs.slice(currentFilesIndex);
            }
        }

        if((subTexts && subTexts.size > 0)
        || (subFiles && subFiles.size > 0)){
            //查询到结果，展示该界面
            this.props.onSwitchPanelByIndex(1);
        }

        this.setState({
            textMessages: subTexts,
            textsResultCount:(isNaN(searchMsgs.get('textsCount'))?0:searchMsgs.get('textsCount')),
            textsCurStart:currentTextsIndex,
            fileMessages: subFiles,
            filesResultCount:(isNaN(searchMsgs.get('filesCount'))?0:searchMsgs.get('filesCount')),
            filesCurStart:currentFilesIndex
        }); 
/*
        this.setState({
            textMessages: subTexts,
            textsPageCount:(Math.ceil(searchMsgs.get('textsCount')/ItemsPerPage)),
            textsCurPage:(1 + currentTextsIndex/ItemsPerPage),
            fileMessages: subFiles,
            filesPageCount:(Math.ceil(searchMsgs.get('filesCount')/ItemsPerPage)),
            filesCurPage:(1+ currentFilesIndex/ItemsPerPage)
        }); */       
    };

    clearSearch=()=>{        
        currentTextsIndex = 0;
        currentFilesIndex = 0;
    }

    componentWillMount() {
        this.setState({
            searchIndex:0,
            textMessages: immutable.List(),
            textsResultCount:0,
            textsCurStart:0,
            fileMessages: immutable.List(),
            filesResultCount:0,
            filesCurStart:0,
            isSubPage:false,
            displayFile:null
        });
        SearchStore.addEventListener('searchMessagesChange', this.updateMessages);
        gGlobalEventBus.addEventListener('onClearSearch', this.clearSearch);
        
    }

    componentWillUnmount() {
        SearchStore.removeEventListener('searchMessagesChange', this.updateMessages);
        gGlobalEventBus.removeEventListener('onClearSearch', this.clearSearch);
    }

    switchSearch(index){
        if(this.state.searchIndex !== index){
            gGlobalEventBus.emit('onSwitchSearch', index);
            this.setState({searchIndex:index});
        }
    }

    onSwitchIndex=(startIndex, type)=>{
        if (type === EnumEventType.TextMsg){
            currentTextsIndex = startIndex;
        }
        else{
            currentFilesIndex = startIndex;
        }
        
        //fcj.todo: 文件搜索时，还要带上ShareFile这种类型
        SearchStore.requestSeachedMessages(startIndex, type);
    }

    onShowFileDetail=({fileInfo})=>{
        this.setState({
            isSubPage:true,                       
            displayFile:fileInfo
        });
    }

    onShowMainPage=()=>{
        this.setState({
            isSubPage:false            
        });
    }
    
	render(){
        const locale = this.props.locale;
        const {textMessages, fileMessages, textsResultCount, textsCurStart, filesResultCount, filesCurStart, isSubPage} = this.state;

        //let activeLatest = (searchIndex === 0? " active":"");
        //let activeRela = (searchIndex === 1? " active":"");

        let title = null;
        if(isSubPage){
            title = (
                <PanelHeader title={locale.result} onClickAction={this.onShowMainPage} withBack={true} />                                    
            );
        }
        else{
            title = (
                 <div className="disp-block">
                    <PanelHeader title={locale.result} onClickAction={this.props.onHidePanel} withBack={false} />    
                                     
                    {/*fcj.todo: 排序方式
                    <span className="result-title disp-inblock">{locale.result}</span>
                    <span className={"result-relative disp-inblock"+ activeRela} onClick={this.switchSearch.bind(this, 1)}>{locale.relative}</span>
                    <span className={"result-latest disp-inblock"+ activeLatest} onClick={this.switchSearch.bind(this, 0)}>{locale.latest}</span>
                    */}
                </div> 
            );
        }
        
		return (
            <div className="inner-content search-result-composer disp-block">
               {title}  
                <div className={"panel-entity"+(isSubPage?" hidden":"")}>             
                    <SearchResultView textMessages={textMessages} fileMessages={fileMessages}
                    textsResultCount={textsResultCount} textsCurStart={textsCurStart} filesResultCount={filesResultCount} filesCurStart={filesCurStart}
                     locale={locale} onSwitchIndex={this.onSwitchIndex} onShowFileDetail={this.onShowFileDetail} />
                </div>
                {isSubPage && <div className="panel-entity">             
                    <div className="scroll-y-content">
                    <ShareFileDetail displayFile={this.state.displayFile} isNameEdit={false} />
                    </div>
                </div>
                }
            </div>
        );  
    }
}

