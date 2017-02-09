import React, {PropTypes} from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import PureRenderComponent from '../PureRenderComponent';
import EnumKeyCode from '../../utils/enums/EnumKeyCode';
import classnames from '../../utils/ClassNameUtils';

import './SearchInput.less';


export default class SearchInput extends PureRenderComponent {
    static propTypes = {
        value: PropTypes.string,
        onValueChange: PropTypes.func,
        onSearch: PropTypes.func,

        placeholder: PropTypes.string
    };

    handleChange = e => {
        const {onValueChange} = this.props;
        onValueChange && onValueChange(e.target.value);
    };

    handleKeyDown = e => {
        if (e.keyCode === EnumKeyCode.ENTER) {
            const {onSearch} = this.props;
            onSearch && onSearch(e.target.value);
        }
    };

    render() {
        const {value, placeholder} = this.props;
        return (
            <div className={classnames("wg-search-input", this.props.className)}>
                <div className={classnames("search-icon icon icon-createchannel-listview-search", this.props.iconClass)}></div>
                <FormControl value={value} onChange={this.handleChange} onKeyDown={this.handleKeyDown} type="text" placeholder={placeholder || ''}/>
            </div>
        );
    }
}
