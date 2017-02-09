export const EnumReceiveStatus = {
    Sent: 1,
    //Received: 2,
    Read: 3
};

export const EnumSendingStatus = {
    ClientSending: -1, // 客户端正在提交请求
    ClientSendFailed: -2, // 客户端提交请求失败
    ClientEditing: -4, // 客户端正在提交编辑请求
    ClientEditFailed: -5 // 客户端编辑请求提交失败
};
