import React from 'react';
import exposeLocale from '../../../components/exposeLocale';
//import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import StringUtils from '../../../utils/StringUtils';
import LoginStore from '../../../core/stores/LoginStore';
import ReactPropTypes from '../../../core/ReactPropTypes';

@exposeLocale(['DIALOGS', 'dlg-invitationResult'])
export default class InviteResultView extends PureRenderComponent {

    static propTypes = {
        onShowInviteRecordView: ReactPropTypes.func,
        onShowInviteInputView: ReactPropTypes.func,
        onCloseDialog: ReactPropTypes.func,
        dataSource: ReactPropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {};
    }


    /**
     * 部分成功 部分失败情况
     * From lijinxuan:
     *      蓝线下面是成功的,红线下面是失败的.(所有的成功的显示在上面，所有的失败的显示在下面)
     * @param resultData
     */
    sortResultDataByStatus(resultData){
        var successData = [];
        var errorData = [];
        var lastSuccessData = null;
        resultData.forEach(function(m){
            var failed = (m.status === 1);
            if(failed){
                errorData.push(m)
            }else {
                successData.push(m);
                lastSuccessData = m;
            }
        });
        lastSuccessData._isLastSuccessData = true;
        return successData.concat(errorData);
    }



    /**
     * 处理一下数据,方便渲染,避免在render方法中出现大量判断语句
     * @param locale
     * @param dataSource
     */
    parseResult(locale, dataSource) {

        var resultData = [];

        var failedCount = 0;
        var successCount = 0;
        if (dataSource) {
            dataSource.forEach(function (m) {
                var failed = (m.status === 1);
                resultData.push({
                    email: m.email,
                    status: m.status,
                    statusDesc: failed ? locale.owner : "OK"
                });
                if (failed) {
                    failedCount++;
                } else {
                    successCount++;
                }
            });
        }

        var totalCount = resultData.length;

        var status = '';
        var listStateTitle = '';
        var h1;
        var h2;
        if (successCount === totalCount) {
            status = 'success';
            listStateTitle = '';//全部成功,不需要,状态标题
            let companyName = LoginStore.getCompanyName();
            h1 = locale.successTitle;
            h2 = StringUtils.format(locale.successDesc, totalCount, companyName);
        }
        else if (failedCount === totalCount) {
            status = 'error';
            listStateTitle = locale.causeReasonLabel;
            h1 = locale.failedTitle;
            h2 = StringUtils.format(locale.failedDesc, totalCount);
        }
        else {
            status = 'partialSuccess';
            listStateTitle = 'Status';
            h1 = locale.partialSuccess;
            h2 = StringUtils.format(locale.partialSuccessDesc, totalCount,failedCount);
            resultData = this.sortResultDataByStatus(resultData);
        }

        return {
            h1: h1,
            h2: h2,
            status: status,
            listStateTitle: listStateTitle,
            resultData: resultData
        }
    }


    render() {
        var {locale} = this.state;
        var {onShowInviteRecordView,onShowInviteInputView,onCloseDialog,dataSource} = this.props;
        var result = this.parseResult(locale, dataSource);

        return (
            <div className="inviteResultView">

                <div className="title">
                    <h1><span className={result.status}></span>{result.h1}</h1>
                    <h2 dangerouslySetInnerHTML={{__html:result.h2}}></h2>
                </div>

                <div className={`result-list  ${result.status}`}>

                    <div className="result-title">
                        <div className="emailLabel">{locale.emailLabel}</div>
                        <div className="listStateTitle">{result.listStateTitle}</div>
                    </div>

                    <div className="result-content">
                        {result.resultData.map(function (member) {
                            var isLastSuccessData = member._isLastSuccessData?'isLastSuccess':'';
                            return (
                                <div className={`result-item ${isLastSuccessData}`} key={member.email}>
                                    <div className="email">{member.email}</div>
                                    <div className="statusDesc">{member.statusDesc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="oper-buttons">
                    <button onClick={onShowInviteRecordView}>{locale.invitingbutton}</button>
                    <button onClick={onShowInviteInputView}>{locale.continueInvite}</button>
                    <button onClick={onCloseDialog}>{locale.invitedbutton}</button>
                </div>
            </div>
        );
    }


}