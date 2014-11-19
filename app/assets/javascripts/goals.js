function Goal(data) {
    this.title = ko.observable(data.title);
    this.level = ko.observable(data.level);
}

function GoalListViewModel() {
    var self = this;

    self.goals = ko.observableArray([]);
    self.newGoalTitle = ko.observable();
    self.newGoalLevel = ko.observable();

    self.addGoal = function () {
        var goal = new Goal({title: self.newGoalTitle(), level: parseInt(self.newGoalLevel())});
        self.goals.push(goal);
        self.save(goal);

        self.newGoalTitle('');
        self.newGoalLevel('');
    };

    self.save = function (goal) {
        $.ajax("/goals/update", {
            data: ko.toJSON({goal: goal}),
            type: "post", contentType: "application/json",
            success: function (result) {
                $('#debug').text(result['created_title'] + ' -- was created');
            }
        });
    };

    self.loadAllGoals = function () {
        $.ajax("/goals/index", {
            type: "get", contentType: "application/json",
            success: function (allGoals) {
                var goalsList = allGoals.map(function(goal_data){
                    return new Goal(goal_data);
                });

                self.goals(goalsList);
            }
        });
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
