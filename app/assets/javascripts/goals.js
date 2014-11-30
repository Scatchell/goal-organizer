function Goal(data) {
    var self = this;

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

    this.firstGoalTitle = '';

    //todo refactor this computed function? At least extract some methods....(I'd do it now but it's really late)
    //todo this computer function should be removed when we move away from title matching
    ko.computed(function () {
        var nonEmptyNewGoalTitles = self.goals().filter(function (goal) {
            goal.hasError(false);
            //return only where newGoalTitle exists
            return goal.newGoalTitle();
        });


        self.goals().forEach(function (goal) {
            var matchedGoal = null;

            nonEmptyNewGoalTitles.forEach(function (nonEmptyNewGoal) {
                if (nonEmptyNewGoal.newGoalTitle() == goal.title()) {
                    matchedGoal = nonEmptyNewGoal;
                }
            });

            if (matchedGoal) {
                matchedGoal.hasError(true);
            }
        });

    }, this);

    this.errorMessage = 'This goal name has already been taken';

    function addGoal(goal) {
        self.goals.push(goal);
        self.save(goal);
    }

    self.newGoalTextEmpty = function () {
        return self.newGoalTitle() == '';
    };

    self.firstGoalOnEnterKey = function (element, domEvent) {
        if (self.firstGoalTitle) {
            if (domEvent.keyCode === 13) {
                self.addFirstGoal();
            }
        }
        return true;
    };

    self.addFirstGoal = function () {
        var goal = new Goal({title: self.firstGoalTitle, parent_title: null, root: true});

        self.firstGoalTitle = '';

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

    self.newChildOnEnterKey = function (goal, domEvent) {
        if (goal.readyToAdd()) {
            if (domEvent.keyCode === 13) {
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
            parent.children.push(goal.title());
        } else {
            goal.setLevel(0);
        }

        addGoal(goal);
        goalToAddSiblingTo.newGoalTitle('');
    };

    self.addGoalAsChild = function (goalToAddChildTo) {
        var goal = new Goal({title: goalToAddChildTo.newGoalTitle(), children: []});
        goal.setLevel(goalToAddChildTo.level() + 1);
        goalToAddChildTo.children.push(goal.title());

        addGoal(goal);
        goalToAddChildTo.newGoalTitle('');
    };

    self.convertToParentStyle = function (goal) {
        var newGoalParentStyle = {};
        newGoalParentStyle.title = goal.title();
        var parentGoal = self.findParentOf(goal);
        if (parentGoal) {
            newGoalParentStyle.parent_title = parentGoal.title();
        }


        return newGoalParentStyle;
    };

    self.save = function (goal) {
        $.ajax("/goals/update", {
            data: ko.toJSON({goal: self.convertToParentStyle(goal)}),
            type: "post", contentType: "application/json",
            success: function (result) {
                $('#debug').text(result['action'] + '--' + result['title']);
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
}
