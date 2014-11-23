//todo order goals based on parent (i.e. goals should show up only under their parent)

function Goal(data) {
    var self = this;

    this.title = ko.observable(data.title);
    this.children = ko.observableArray(data.children);
    this.root = ko.observable(false);
    this.level = ko.observable();

    this.setLevel = function (level) {
        if (level == 0) {
            self.root(true);
        }

        self.level(level);
    };

    if (data.root == true) {
        this.setLevel(0);
    }
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

    self.newGoalTextEmpty = function () {
        return self.newGoalTitle() == '';
    };

    self.addFirstGoal = function () {
        var goal = new Goal({title: self.newGoalTitle(), parent_title: null}, 0);
        goal.setLevel(0);
        addGoal(goal);
    };

    self.findParentOf = function (goalToSearchFor) {
        return self.goals().filter(function (goal) {
            return $.inArray(goalToSearchFor.title(), goal.children()) != -1;
        })[0];
    };

    self.findGoalByTitle = function (goalTitleToSearchFor) {
        return self.goals().filter(function (goal) {
            return goalTitleToSearchFor == goal.title();
        })[0];
    };

    self.addGoalAsSibling = function (goalToAddSiblingTo) {
        var goal = new Goal({title: self.newGoalTitle()});
        if (goalToAddSiblingTo.root() == false) {
            var parent = self.findParentOf(goalToAddSiblingTo);
            goal.setLevel(goalToAddSiblingTo.level());
            parent.children.push(goal.title());
        } else {
            goal.setLevel(0);
        }

        addGoal(goal);

        self.addLevelToGoals();
    };

    self.addGoalAsChild = function (goalToAddChildTo) {
        var goal = new Goal({title: self.newGoalTitle(), children: []});
        goal.setLevel(goalToAddChildTo.level() + 1);
        goalToAddChildTo.children.push(goal.title());

        addGoal(goal);

        self.addLevelToGoals();
    };

    self.convertToParentStyle = function (goal) {
        var parentGoal = self.findParentOf(goal);
        if (parentGoal) {
            goal.parent_title = parentGoal.title();
        }

        delete goal['level'];
        delete goal['children'];
        delete goal['root'];

        return goal;
    };

    self.save = function (goal) {
        $.ajax("/goals/update", {
            data: ko.toJSON({goal: self.convertToParentStyle(goal)}),
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

    self.pushChildGoals = function (goal, orderedGoalList, level) {
        level++;

        goal.children().forEach(function (childGoalTitle) {
            var foundGoal = self.findGoalByTitle(childGoalTitle);
            foundGoal.level(level);
            orderedGoalList.push(foundGoal);
            if (foundGoal.children().length > 0) {
                self.pushChildGoals(foundGoal, orderedGoalList, level);
            }
        });
    };

    self.addLevelToGoals = function () {
        var orderedGoalList = [];
        var parentGoals = [];
        self.goals().forEach(function (goal) {
            if (goal.root() == true) {
                parentGoals.push(goal);
            }
        });

        var level = 0;

        parentGoals.forEach(function (parentGoal) {
            orderedGoalList.push(parentGoal);
            self.pushChildGoals(parentGoal, orderedGoalList, level);
        });

        self.goals(orderedGoalList);
    };
}
