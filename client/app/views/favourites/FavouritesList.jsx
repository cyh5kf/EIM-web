import React from 'react';
import exposeLocale from '../../components/exposeLocale';
import FavouritesMessageItem from './FavouritesMessageItem';

@exposeLocale(['COMMON'])
export default class FavouritesList extends React.Component {
    constructor(props) {
        super(props);
    }

    renderMessageListItem(locale,starredInfo,key) {
        return (
            <div className="message-item-wrapper" key={key}>
                <FavouritesMessageItem starredInfo={starredInfo} locale={locale}/>
            </div>);
    }


    render() {
        let content = [];
        const {dataSource, locale} = this.props;
        let that = this;
        dataSource.forEach(function (record, key) {
            let starredInfo = record;
            content.push(that.renderMessageListItem(locale,starredInfo,key));
        });

        return (
            <div className="mention_day_container_div">
                {content}
            </div>
        );
    }
}
