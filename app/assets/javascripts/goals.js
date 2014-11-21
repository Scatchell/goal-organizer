function Goal(data, goalLevel) {
    this.title = ko.observable(data.title);
    this.parent_title = ko.observable(data.parent_title);

    this.setLevel = function (level) {
        this.level = ko.observable(level);
    };

    this.setLevel(goalLevel);
}

function GoalListViewModel() {
    var self = this;

    self.goals = ko.observableArray([]);
    self.newGoalTitle = ko.observable();

    function addGoal(goal) {
        self.goals.push(goal);
        self.save(goal);

        self.newGoalTitle('');
    }

    self.addFirstGoal = function () {
        var goal = new Goal({title: self.newGoalTitle(), parent_title: null}, 0);
        addGoal(goal);
    };

    self.addGoalAsSibling = function (originalGoal) {
        var goalLevel = originalGoal.level();

        var goal = new Goal({title: self.newGoalTitle(), parent_title: originalGoal.parent_title()}, goalLevel);
        addGoal(goal);
    };

    self.addGoalAsChild = function (originalGoal) {
        var goalLevel = originalGoal.level() + 1;

        var goal = new Goal({title: self.newGoalTitle(), parent_title: originalGoal.title()}, goalLevel);
        addGoal(goal);
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
    //todo titles of goals MUST be unique!

    self.loadAllGoals = function () {
        $.ajax("/goals/index", {
            type: "get", contentType: "application/json",
            success: function (allGoals) {
                var goalsList = allGoals.map(function (goal_data) {
                    return new Goal(goal_data);
                });

                self.goals(goalsList);

                self.addLevelToGoals();
            }
        });
    };

    self.addLevelToGoals = function () {
        function goalsWithoutLevels(goals) {
            var goalsWithLevelsNotSet = goals.filter(function (goal) {
                return goal.level() == undefined;
            });

            return !(goalsWithLevelsNotSet.length == 0);
        }

        function findParentGoal(goals, parentTitle) {
            return goals.filter(function (goal) {
                return goal.title() == parentTitle;
            })[0];
        }

        while (goalsWithoutLevels(self.goals())) {
            self.goals().forEach(function (goal) {
                if (goal.parent_title() == null) {
                    goal.level(0);
                } else {
                    var parentGoal = findParentGoal(self.goals(), goal.parent_title());
                    if (parentGoal.level() != undefined) {
                        goal.level(parentGoal.level() + 1);
                    }
                }
            });
        }
    };
}
