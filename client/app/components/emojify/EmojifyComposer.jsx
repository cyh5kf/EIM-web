import React, {PropTypes} from 'react';
import EmojifyWrapper from './EmojifyWrapper';
import PureRenderComponent from '../PureRenderComponent';
import exposeLocale from '../exposeLocale';
import _ from 'underscore';

@exposeLocale(['EMOJI'])
export default class EmojifyComposer extends PureRenderComponent {

    static propTypes = {
        onItemSelect: PropTypes.func,
        placement: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        className: PropTypes.string
    }

    constructor(args) {
        super(args);
    }

    render(){
      return (<EmojifyWrapper {... _.extend(this.state.locale, this.props)} />);
    }
}
