export default {
	ChannelName: "1",
	CreateName: "2",
	CreateDate: "3",
	MostToFewestMember:"4",
	FewestToMostMember:"5",
	dataList(){
		var locale = gLocaleSettings.CHANNEL_BROWSE.sortedOptions;
		return [{
					id: this.ChannelName,
					name: locale.option1
				},
				{
					id: this.CreateName,
					name: locale.option2
				},
				{
					id: this.CreateDate,
					name: locale.option3
				},
				{
					id: this.MostToFewestMember,
					name: locale.option4
				},
				{
					id: this.FewestToMostMember,
					name: locale.option5
				}
			];
	}
};
