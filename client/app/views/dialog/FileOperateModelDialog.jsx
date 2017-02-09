import React from 'react';
import classnames from '../../utils/ClassNameUtils';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';

export default class FileOperateModelDialog extends React.Component{

    constructor(props){
        super(props);
        this.state = {show:this.props.show};
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.show !== this.props.show){
            this.setState({show:nextProps.show});
        }
    }

    _close(e){
        // this.setState({show:false});
        e.preventDefault();
        gGlobalEventBus.emit("personalInfoEvent", false);
    }

    switchDisplayBox(e){
    }

    // _LogoutAccount(e){
    //     LoginActionsCreators.logoutAccount();
    // }

    render() {
        var showBox = this.props.show?'':'hidden';
        return (
            <div className={classnames('file-operate-mask',showBox)}>
                <div className="file-opt-content">
                    <div className="arrow bottom"></div>
                    <ul className="menuList">
                        <li className="cell">
                            转发文件
                        </li><li className="cell">
                            复制链接
                        </li><li className="cell">
                            打开源文件
                        </li><li className="cell">
                            重命名文件
                        </li><li className="cell">
                            创建公共链接
                        </li><li className="cell">
                            删除文件
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
