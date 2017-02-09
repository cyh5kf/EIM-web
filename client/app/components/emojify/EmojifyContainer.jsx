import React from 'react';
import classnames from '../../utils/ClassNameUtils';

export default class EmofifyContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    handleOnSelect(e){
        if(this.props.onItemSelect){
            this.props.onItemSelect($(e.target).closest('li').attr('data-emoji'));
        }
    }

    render(){
        return (<div className="emoji-list"><ul className="emoji-container" ref="emojiContainer" onClick={(e)=>this.handleOnSelect(e)}>
            {
                this.props.datasource.map(function(emoji) {
                    return (<li className="emoji-li" key={emoji} data-emoji={emoji}>
                    <a title={':'+emoji+':'}><div className={classnames("emoji-"+ emoji,"emoji")}></div></a>
                    </li>);
                })
            }
            </ul>
        </div>);
    }
}
