export default {
    dataList(){
        var locale = gLocaleSettings.DIALOGS['dlg-accountInfo'].timezoneData;
        var timezoneList = [
        {
            "id": "0",
            "name": locale.E0
        },
        {
            "id": "60",
            "name": locale.E1
        },
        {
            "id": "120",
            "name": locale.E2
        },
        {
            "id": "180",
            "name": locale.E3
        },
        {
            "id": "240",
            "name": locale.E4
        },
        {
            "id": "300",
            "name": locale.E5
        },
        {
            "id": "360",
            "name": locale.E6
        },
        {
            "id": "420",
            "name": locale.E7
        },
        {
            "id": "480",
            "name": locale.E8
        },
        {
            "id": "540",
            "name": locale.E9
        },
        {
            "id": "600",
            "name": locale.E10
        },
        {
            "id": "660",
            "name": locale.E11
        },
        {
            "id": "720",
            "name": locale.E12
        },
        {
            "id": "-720",
            "name": locale.W12
        },
        {
            "id": "-660",
            "name": locale.W11
        },
        {
            "id": "-600",
            "name": locale.W10
        },
        {
            "id": "-540",
            "name": locale.W9
        },
        {
            "id": "-480",
            "name": locale.W8
        },
        {
            "id": "-420",
            "name": locale.W7
        },
        {
            "id": "-360",
            "name": locale.W6
        },
        {
            "id": "-300",
            "name": locale.W5
        },
        {
            "id": "-240",
            "name": locale.W4
        }];
        return timezoneList;
    }
}