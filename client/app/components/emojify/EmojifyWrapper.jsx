import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import emojify from 'emojify.js';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import EmojifyContainer from './EmojifyContainer';
import EmojifyResource from './EmojifyResource';
import EmojifyConfig from './EmojifyConfig';

import './EmojifyWrapper.less';

emojify.setConfig({tag_type: EmojifyConfig.tagType, img_dir: EmojifyConfig.imgURI, mode: EmojifyConfig.mode});

export default class EmojifyWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeKey: 1};
    }

    componentWillMount() {
       this.setState({
           showOverlay: false
       });
    }

    onItemSelect(emoji){
        if (this.props.onItemSelect(emoji) !== false) {
            this.toggleOverlayVisible();
        }
    }

    renderTab(activeKey, group, groupData){
        return <Tab key={activeKey} eventKey={activeKey} title={group}>
                    <EmojifyContainer datasource={groupData} onItemSelect={(emoji)=>this.onItemSelect(emoji)}/>
                </Tab>;

    }

    onGroupChanged(activeKey, e) {
        this.setState({activeKey: activeKey});
    }

    toggleOverlayVisible = (e) => {

        if(!this.state.showOverlay){
            var beforePopup = this.props.beforePopup;
            if(_.isFunction(beforePopup)){
                beforePopup();
            }
        }

        this.setState({showOverlay: !this.state.showOverlay});
        return false;
    };

    render() {
        let tabs = [];
        let self = this;
        let index = 1;
        let {showOverlay} = this.state;
        _.map(EmojifyResource, (groupData, groupKey)=>{
            tabs.push(self.renderTab(index, this.props[groupKey], groupData));
            index++;
        });
        return (<span className={`emojify-wrapper ${this.props.className || ''}`}
                      onMouseDown={()=>{return false;}}
            >
                {showOverlay && <Overlay show={showOverlay} rootClose onHide={this.toggleOverlayVisible} placement={this.props.placement}
                        target={() => ReactDOM.findDOMNode(this.refs.target)}
                         >
                            <Popover id={this.props.id} title={this.props.title} className="emojiPopover"  >
                            <Tabs id="emojiTab" defaultActiveKey={this.state.activeKey} onSelect={this.onGroupChanged}>
                            {tabs}
                            </Tabs>
                        </Popover>
                    </Overlay>
                }
                <i className="eficon-ic_emoji_001" ref="target" onClick={this.toggleOverlayVisible}/>
            </span>
        );
    }
}
