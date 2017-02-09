import React, {PropTypes} from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import './MessageInputView.less';
import cursorManager from './CursorManager';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import ChannelsStore from '../../../core/stores/ChannelsStore';
import defAvatarImg from '../../../../static/images/default_user_avatar.png';
import RenderToBody from '../../../components/RenderToBody';
import {showStyle,hideStyle} from '../../../utils/JSXRenderUtils';
import OnlineStatusIndicator from '../../view-components/online-status-indicator/OnlineStatusIndicator';
import './AtUserList.less';


function getUserListAvatarStyle(atUser) {
    if (atUser.isAtChannel) {
        return {
            display: 'none'
        };
    }
    return {
        "backgroundImage": 'url(' + (atUser.avatar || defAvatarImg) + ')',
        "backgroundColor": "rgb(246, 246, 246)"
    };
}

function getCurrentCaret(root) {
    var range, n, r;
    var doc = root.document;
    var selection = doc.selection;
    var positionX = 0;
    var positionY = 0;
    if (selection && "Control" !== selection.type) {
        range = selection.createRange();
        range.collapse(!0);
        positionX = range.boundingLeft;
        positionY = range.boundingTop;
    }
    else if (root.getSelection && (selection = root.getSelection(),
        selection.rangeCount && (range = selection.getRangeAt(0).cloneRange(),
        range.getClientRects && (range.collapse(!0),
            n = range.getClientRects(),
        n.length > 0 && (r = n[0]),
            positionX = r.left,
            positionY = r.top),
        0 === positionX && 0 === positionY))) {
        var l = doc.createElement("span");
        if (l.getClientRects) {
            l.appendChild(doc.createTextNode("​")),
                range.insertNode(l),
                r = l.getClientRects()[0],
                positionX = r.left,
                positionY = r.top;
            var u = l.parentNode;
            u.removeChild(l),
                u.normalize()
        }
    }
    return {
        x: positionX,
        y: positionY
    }
}


export default class AtUserList extends PureRenderComponent {
    static propTypes = {
        sessionid: PropTypes.string.isRequired,
        sessiontype: PropTypes.number.isRequired,
        onSelectAtUser: PropTypes.func.isRequired,
        getInputPanel: PropTypes.func.isRequired
    };


    constructor(props) {
        super(...arguments);
        this.state = {
            hide: true,
            atSelectItem: null,
            atUsers: [],
            position: {}
        };
    }

    componentDidMount() {
        this.onDocClickListener = this.onClickDocument.bind(this);
        document.addEventListener('click', this.onDocClickListener, false);
    }

    componentWillUnmount() {
        if (this.onDocClickListener) {
            document.removeEventListener('click', this.onDocClickListener, false);
            this.onDocClickListener = null;
        }
    }


    onClickDocument(e) {
        var $eventTarget = $(e.target);
        //点击事件既不落在atList中,又不落在inputView中.
        var isInAtList = $eventTarget.closest('.atUserListContainer') || [];
        var isInMsgInputView = $eventTarget.closest('.messageInputContentEditable') || [];
        if (isInAtList.length === 0 && isInMsgInputView.length === 0) {
            this.hide();
        }
    }


    hide() {
        this.setState({
            hide: true
        })
    }

    show() {
        this.setState({
            hide: false
        })
    }

    visible() {
        var that = this;
        return that.state.atUsers.size > 0 && !that.state.hide
    }

    onKeyUp(e) {

        var codeArray = [9, 13, 27, 38, 40];
        var keyCode = e.keyCode;
        if (codeArray.indexOf(keyCode) > -1) {
            return;
        }


        this.detectShowAt(e);
    }


    filterUser(inputStr) {
        const {sessionid, sessiontype} = this.props;
        if (sessiontype === EnumSessionType.P2P) {
            return [];
        }

        const channel = ChannelsStore.getChannel(sessionid);
        var memberList = channel.getMemberList();
        this.filter = inputStr || "";
        this.setState({atSelectItem: 0});
        if (inputStr) {
            //console.log(inputStr);
            return memberList.filter(item=> {
                const realname = item.firstname + item.lastname;
                return item.username.indexOf(inputStr) > -1
                    || realname && realname.indexOf(inputStr) > -1
                    || item.email && item.email.indexOf(inputStr) > -1;
            });
        }
        return memberList;
    }

    appendListWithChannel(list) {
        var channel = {
            username: "@channel",
            isAtChannel: true
        };
        return list.push(channel);
    }

    detectShowAt() {
        var filterUser = this.filterUser.bind(this);

        var that = this;
        var t = cursorManager.currentSelection();
        var willShowList = false;
        if (t.startOffset === t.endOffset && t.endContainer.data) {
            var i = t.endOffset > 15 ? t.endOffset - 15 : 0;
            var o = t.endOffset;
            var a = t.endContainer.data.slice(i, o);
            var s = a.lastIndexOf("@");

            if (s >= 0) {
                var l = a.slice(s + 1) || "";
                if (/:$/gm.test(l.trim())) {
                    //以冒号结尾
                    willShowList = false;
                } else {
                    var u = that.appendListWithChannel(filterUser(l));
                    var userCount = u.length || u.size;
                    if (userCount > 0) {
                        willShowList = true;
                        var c = getCurrentCaret(window);
                        userCount = userCount > 10 ? 10 : userCount;
                        that.setState({
                            position: {
                                left: c.x + 10,
                                top: c.y - (32 * userCount) - 30
                            }
                        })
                    }
                    that.setAtUsers(u)
                }
            }
        }

        willShowList ? that.show() : that.hide()
    }

    setAtUsers(atUsers) {
        this.setState({
            atUsers: atUsers
        })
    }

    onKeyDown(e) {
        var that = this;
        if (!that.visible()) {
            return false;
        }

        if (that.state.atUsers && that.state.atUsers.size > 0) {
            //console.log('e.keyCode', e.keyCode);
            switch (e.keyCode) {
                case 27:
                    that.hide();
                    e.preventDefault();
                    break;
                case 13:
                    var selectUser = that.state.atUsers.get(that.state.atSelectItem);
                    that.insertUser(selectUser);
                    e.preventDefault();
                    break;
                case 9:  //tab
                case 38: //up
                case 40: //down
                    var linkNameList = document.getElementsByClassName("atUserListContent")[0];
                    var selectedItem = linkNameList.getElementsByClassName("selected")[0];
                    var isDownKey = false;
                    var isUpKey = false;
                    if (38 === e.keyCode && that.state.atSelectItem - 1 >= 0) {
                        that.setState({
                            atSelectItem: that.state.atSelectItem - 1
                        });
                        isUpKey = true;
                    }

                    if ((40 === e.keyCode || 9 === e.keyCode) && that.state.atUsers.size > that.state.atSelectItem + 1) {
                        that.setState({
                            atSelectItem: that.state.atSelectItem + 1
                        });
                        isDownKey = true;
                    }

                    if (isDownKey && selectedItem) {
                        var a = selectedItem.offsetTop + 2 * selectedItem.offsetHeight;
                        if (a > linkNameList.scrollTop + linkNameList.offsetHeight) {
                            linkNameList.scrollTop = a - linkNameList.offsetHeight + selectedItem.offsetHeight;
                        }
                    }

                    if (isUpKey && selectedItem) {
                        var s = selectedItem.offsetTop - 2 * selectedItem.offsetHeight;
                        if (s < linkNameList.scrollTop) {
                            linkNameList.scrollTop = s - selectedItem.offsetHeight
                        }
                    }

                    e.preventDefault()
            }
            return true;
        }
        return false;
    }


    onClickSelectItem(e, index, event) {
        this.setState({
            atSelectItem: index
        });
        this.insertUser(e);
        event.preventDefault();
    }


    insertUser(e) {
        var username = '';
        if (e.isAtChannel) {
            username = 'channel:';
        } else {
            username = e.username + ":";
        }


        var that = this;
        var inputPanel = that.props.getInputPanel();
        inputPanel.focus();

        var range = cursorManager.currentSelection();
        var i = range.endOffset > 15 ? range.endOffset - 15 : 0;
        var o = range.endOffset;
        var a = range.endContainer.data.slice(i, o);
        var s = a.lastIndexOf("@");
        var inputText = range.commonAncestorContainer.data;

        if (s >= 0) {
            var preText = inputText.slice(0, i + s);
            var endText = inputText.slice(preText.length + that.filter.length + 1);
            var space = " ";
            range.commonAncestorContainer.data = preText + space + '@' + username + space + endText;
            cursorManager.moveCaret(preText.length + username.length + 1 + 2);//2个space,1个@
        }
        that.hide();
        that.props.onSelectAtUser && that.props.onSelectAtUser(e);
    }


    render() {
        var that = this;
        var {sessiontype,locale} = that.props;
        if (sessiontype === EnumSessionType.P2P) {
            return <div></div>
        }

        var state = that.state;
        var atUsers = state.atUsers || [];
        var atSelectItem = state.atSelectItem || 0;
        var hide = state.hide;
        var atUserListStyle = {
            left: state.position.left,
            top: state.position.top
        };

        var atListLocale = locale.atList || {};

        return (
            <RenderToBody>
                <div className="atUserListContainer" style={{'display':hide?'none':'block'}}>
                    <div className="atUserList" style={atUserListStyle}>
                        <div className="atUserListHeader">
                            <span className="header_label">{atListLocale.headerMembers}</span>
                            <span className="search_term"></span>
                            <span className="header_help pull-right">
                                <b>tab</b>
                                <span>or</span>
                                <b>↑</b>
                                <b>↓</b>
                                <span>to navigate</span>
                                <b>↵</b>
                                <span>to select </span>
                                <b>esc</b>
                                <span>to dismiss</span>
                            </span>
                        </div>
                        <div className="atUserListContent">
                            <ul className="linkNameList" onMouseDown={(e)=>{e.preventDefault();return false;}}>
                                {
                                    atUsers.map(function (atUser, i) {

                                        var key = atUser.uid || "channel";
                                        var isAtChannel = atUser.isAtChannel || false;
                                        var avatarStyle = getUserListAvatarStyle(atUser);
                                        var isSelected = i === atSelectItem;
                                        var className = `atUserItem`;
                                        if (isSelected) {
                                            className += "  selected";
                                        }
                                        if (isAtChannel) {
                                            className += "  isAtChannel";
                                        }

                                        return (
                                            <li key={key} className={className}
                                                onClick={that.onClickSelectItem.bind(that,atUser,i)}>
                                                <div className="online-status-wrapper" style={showStyle(!isAtChannel)}>
                                                    <OnlineStatusIndicator
                                                        onlineStatus={(atUser && atUser.loginstatus) || 1 }/>
                                                </div>
                                                <span className="avatar"
                                                      style={showStyle(!isAtChannel,avatarStyle)}></span>
                                                <span className="username">{atUser.username}</span>
                                                <span className="desc" style={hideStyle(!isAtChannel)}>&nbsp;&nbsp;
                                                    Notify everyone in this channel.</span>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                        <div className="atUserListFooter"></div>
                    </div>
                </div>
            </RenderToBody>
        );
    }

}
