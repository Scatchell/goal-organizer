function Goal(data) {
    this.title = ko.observable(data.title);
    this.level = ko.observable(data.level);
}

function GoalListViewModel() {
    var self = this;

    self.goals = ko.observableArray([]);

    self.addGoal = function() {
        self.goals.push(new Goal({title: 'test', level: 1}))
    }
}

//var ajaxPost = function(data, success) {
//
//};
//
//var createAction: function(itemToCreate) {
//    var json_data = ko.toJS(itemToCreate);
//    $.ajax({
//        type: 'POST',
//        url: '/posts.json',
//        data: {
//            Wraps properties in a "post" property, easier to handle for Rails.
//                post: json_data
//},
//dataType: "json",
//    success: function(createdItem) {
//    viewModel.errors([]);
//    viewModel.setFlash('Post successfully created.');
//    viewModel.clearTempItem();
//    viewModel.showAction(createdItem);
//},
//error: function(msg) {
//    viewModel.errors(JSON.parse(msg.responseText));
//}
//});
