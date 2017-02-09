import React from 'react';

let propTypes = {
        name: React.PropTypes.string
    }

let defaultProps = {
        name: ''
    }

export default class Composer extends React.Component{

    constructor(props) {
        super(props);
    }

    dispose(){

    }


}

Composer.propTypes = propTypes;
Composer.defaultProps = defaultProps;
