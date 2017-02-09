import React, {PropTypes} from 'react';

export default function ChannelName({channelData}) {
    return (
        <span className="channel-name">
            {channelData.ispublic ? '#' : <i className="ficon ficon_lock" style={{display: 'inline-block', verticalAlign: 'top'}}/>}
            {channelData.displayname}
        </span>
    );
}

ChannelName.propTypes = {
    channelData: PropTypes.shape({
        ispublic: PropTypes.bool.isRequired,
        displayname: PropTypes.string.isRequired
    }).isRequired
};
