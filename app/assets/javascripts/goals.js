function Goal(data) {
    var self = this;

    this.id = ko.observable(data.id);
    this.title = ko.observable(data.title);
    this.children = ko.observableArray(data.children);
    this.root = ko.observable(false);
    this.level = ko.observable();
    this.newGoalTitle = ko.observable();
    this.hasError = ko.observable();
    this.readyToAdd = ko.computed(function () {
        return (self.newGoalTitle() && !self.hasError()) ? true : false;
    });

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

    this.goals = ko.observableArray([]);

    this.firstGoalTitle = ko.observable();

    this.errorMessage = 'This goal name has already been taken';

    self.firstGoalOnEnterKey = function (element, domEvent) {
        console.log(self.firstGoalTitle());
        if (self.firstGoalTitle()) {
            if (domEvent.keyCode === 13) {
                self.addFirstGoal();
            }
        }
        return true;
    };

    self.addFirstGoal = function () {
        var goal = new Goal({title: self.firstGoalTitle(), parent_title: null, root: true});

        self.firstGoalTitle('');

        self.goals.push(goal);
        self.createNewGoal(goal);
    };

    self.findParentOf = function (goalToSearchFor) {
        var flattenedGoals = self.flattenGoals(self.goals());

        var goalsWithMatchingChild = flattenedGoals.filter(function (goal) {
            var childrenGoalIds = goal.children().map(function (childGoal) {
                return childGoal.id();
            });

            return $.inArray(goalToSearchFor.id(), childrenGoalIds) != -1;
        });


        return goalsWithMatchingChild[0];
    };

    self.flattenGoals = function (goals, listOfGoals) {
        if (listOfGoals == undefined) {
            listOfGoals = [];
        }

        goals.forEach(function (goal) {
            listOfGoals.push(goal);
            if (goal.children().length > 0) {
                self.flattenGoals(goal.children(), listOfGoals);
            }
        });

        return listOfGoals;
    };

    self.findGoalByTitle = function (goalTitleToSearchFor) {
        return self.goals().filter(function (goal) {
            return goalTitleToSearchFor == goal.title();
        })[0];
    };

    self.newGoalKeyCommands = function (goal, domEvent) {
        if (goal.readyToAdd()) {
            if (domEvent.keyCode == 13 && event.shiftKey) {
                self.addGoalAsSibling(goal);
            } else if (domEvent.keyCode == 13) {
                self.addGoalAsChild(goal);
            }
        }
        return true;
    };

    self.addGoalAsSibling = function (goalToAddSiblingTo) {
        var goal = new Goal({title: goalToAddSiblingTo.newGoalTitle()});

        if (goalToAddSiblingTo.root() == false) {
            var parent = self.findParentOf(goalToAddSiblingTo);
            goal.setLevel(goalToAddSiblingTo.level());
            parent.children.push(goal);
        } else {
            //executed only if goal to add sibling of is a root goal
            goal.setLevel(0);
            self.goals.push(goal);
        }

        self.createNewGoal(goal);
        goalToAddSiblingTo.newGoalTitle('');
    };

    self.addGoalAsChild = function (goalToAddChildTo) {
        var goal = new Goal({title: goalToAddChildTo.newGoalTitle()});
        goal.setLevel(goalToAddChildTo.level() + 1);
        goalToAddChildTo.children.push(goal);

        self.createNewGoal(goal);
        goalToAddChildTo.newGoalTitle('');
    };

    self.convertToParentStyle = function (goal) {
        var newGoalParentStyle = {};
        newGoalParentStyle.id = goal.id();
        newGoalParentStyle.title = goal.title();

        var parentGoal = self.findParentOf(goal);
        if (parentGoal) {
            newGoalParentStyle.parent_id = parentGoal.id();
        }


        return newGoalParentStyle;
    };

    self.createNewGoal = function (goal) {
        $.ajax("/goals/create", {
            data: ko.toJSON({goal: self.convertToParentStyle(goal)}),
            type: "post", contentType: "application/json",
            success: function (result) {
                $('#debug').text(result['action'] + '--' + result['id']);
                //todo add some loading state so goal is not ready to add until receives id response?
                goal.id(result['id']);
                self.makeGoalsEditable();
            }
        });
    };

    self.removeGoal = function (goal) {
        $.ajax("/goals/" + goal.id(), {
            type: "delete",
            success: function (result) {
                $('#debug').text(result['action'] + '--' + result['id']);
                self.removeGoalFromGoalsList(goal);
            }
        });
    };

    self.removeGoalFromGoalsList = function (goal) {
        if (goal.root()) {
            self.goals.remove(goal);
        } else {
            var goalParent = self.findParentOf(goal);
            goalParent.children.remove(goal);
        }
    };

    self.loadAllGoals = function () {
        $.ajax("/goals/index", {
            type: "get", contentType: "application/json",
            success: function (allGoals) {
                var goalsList = self.mapGoals(allGoals);

                self.goals(goalsList);

                self.addLevelToGoals();

                self.makeGoalsEditable();
            }
        });
    };

    self.makeGoalsEditable = function () {
        $('.goal-title').editable('/goals/update');
    };

    self.mapGoals = function (goals) {
        var mappedGoals = [];

        goals.forEach(function (singleGoal) {
            if (singleGoal.children.length > 0) {
                singleGoal.children = self.mapGoals(singleGoal.children);
            }

            mappedGoals.push(new Goal(singleGoal));
        });

        return mappedGoals;
    };

    self.pushChildGoals = function (goal, level) {
        level++;

        goal.children().forEach(function (childGoal) {
            childGoal.level(level);

            if (childGoal.children().length > 0) {
                self.pushChildGoals(childGoal, level);
            }
        });
    };

    self.addLevelToGoals = function () {
        var parentGoals = [];
        self.goals().forEach(function (goal) {
            if (goal.root() == true) {
                parentGoals.push(goal);
            }
        });

        var level = 0;

        parentGoals.forEach(function (parentGoal) {
            self.pushChildGoals(parentGoal, level);
        });
    };

    this.goalCount = ko.computed(function () {
        return self.flattenGoals(self.goals()).length;
    });

}

