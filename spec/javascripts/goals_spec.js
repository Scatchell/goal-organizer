// include spec/javascripts/helpers/some_helper_file.js and app/assets/javascripts/foo.js
//= require goals

describe('Goals', function () {
    it("should find parent of goal", function () {
        var goal3 = new Goal({title: 'test2', children: [], root: true});
        var goal2 = new Goal({title: 'test1', children: [goal3.title()]});
        var goal1 = new Goal({title: 'test', children: [goal2.title()]});

        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal1, goal2, goal3]);

        expect(goalListViewModel.findParentOf(goal3)).toBe(goal2);
    });

    it("should add new goal as a sibling to first level parent", function () {
        var goal = new Goal({title: 'test', children: [], root: true});
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal]);

        var newGoalTitle = 'new-goal-title';
        goal.newGoalTitle(newGoalTitle);
        goalListViewModel.addGoalAsSibling(goal);

        expect(goalListViewModel.goals().length).toBe(2);
        expect(goalListViewModel.goals()[1].title()).toBe(newGoalTitle);
        expect(goalListViewModel.goals()[1].level()).toBe(goal.level());
        expect(goalListViewModel.goals()[1].root()).toBe(true);
        expect(goalListViewModel.goals()[1].children()).toEqual([]);
    });

    it("should add new sibling goal at same level as original goal", function () {
        var childGoal = new Goal({title: 'test', children: []});
        childGoal.level(1);
        var parentGoal = new Goal({title: 'parent-goal', children: [childGoal.title()], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([parentGoal, childGoal]);

        childGoal.newGoalTitle('new-goal-title');
        goalListViewModel.addGoalAsSibling(childGoal);

        expect(goalListViewModel.goals()[2].title()).toBe('new-goal-title');
        expect(goalListViewModel.goals()[2].level()).toBe(1);
        expect(goalListViewModel.goals()[0].children()).toEqual(['test', 'new-goal-title']);
    });

    it("should add new child goal at one level deeper than original goal", function () {
        var originalGoal = new Goal({title: 'second-goal', children: []});
        originalGoal.level(1);
        var parentGoal = new Goal({title: 'parent-goal', children: [originalGoal.title()], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([parentGoal, originalGoal]);

        originalGoal.newGoalTitle('new-goal-title');
        goalListViewModel.addGoalAsChild(originalGoal);

        expect(goalListViewModel.goals()[2].level()).toBe(2);
        expect(goalListViewModel.goals()[1].children()).toEqual(['new-goal-title']);
    });

    it("should add new goal as a child", function () {
        var goal = new Goal({title: 'test', root: true});
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal]);

        goal.newGoalTitle('test-goal-title');
        goalListViewModel.addGoalAsChild(goal);

        expect(goalListViewModel.goals().length).toBe(2);

        expect(goalListViewModel.goals()[1].title()).toBe('test-goal-title');
        expect(goalListViewModel.goals()[1].children()).toEqual([]);

        expect(goalListViewModel.goals()[0].children()).toEqual(['test-goal-title']);
        expect(goalListViewModel.goals()[0].root()).toBe(true);
    });

    it("should initiate all goals at proper levels and with correct children", function () {
        var goal6 = new Goal({title: 'goal6', children: []});
        var goal5 = new Goal({title: 'goal5', children: [goal6]});
        var goal3 = new Goal({title: 'goal3', children: [goal5]});
        var goal1 = new Goal({title: 'goal1', children: [goal3], root: true});
        var goal4 = new Goal({title: 'goal4', children: []});
        var goal2 = new Goal({title: 'goal2', children: [goal4], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(0);
        expect(goalsWithLevel[0].children().length).toEqual(1);
        var firstLevelOneChild = goalsWithLevel[0].children()[0];
        expect(firstLevelOneChild.title()).toBe('goal3');

        expect(goalsWithLevel[1].level()).toBe(0);
        expect(goalsWithLevel[1].children().length).toEqual(1);
        var secondLevelOneChild = goalsWithLevel[1].children()[0];
        expect(secondLevelOneChild.title()).toBe('goal4');

        expect(secondLevelOneChild.level()).toBe(1);
        expect(secondLevelOneChild.children().length).toEqual(0);

        expect(firstLevelOneChild.level()).toBe(1);
        expect(firstLevelOneChild.children().length).toEqual(1);
        var firstLevelTwoChild = firstLevelOneChild.children()[0];
        expect(firstLevelTwoChild.title()).toEqual('goal5');

        expect(firstLevelTwoChild.level()).toBe(2);
        expect(firstLevelTwoChild.children().length).toEqual(1);
        var firstLevelThreeChild = firstLevelTwoChild.children()[0];
        expect(firstLevelThreeChild.title()).toEqual('goal6');

        expect(firstLevelThreeChild.level()).toBe(3);
        expect(firstLevelThreeChild.children().length).toEqual(0);


    });

    it("should give goals levels even if they are defined out of order", function () {
        var goal1 = new Goal({title: 'goal1', children: []});
        var goal2 = new Goal({title: 'goal2', children: [goal1], root: true});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal2]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(0);
        expect(goalsWithLevel[0].title()).toBe('goal2');
        var levelOneChild = goalsWithLevel[0].children()[0];

        expect(levelOneChild.title()).toBe('goal1');
        expect(levelOneChild.level()).toBe(1);
        expect(levelOneChild.children()).toEqual([]);
    });

    it("should convert goal with existing parent to parent style", function () {
        var goal1 = new Goal({title: 'goal1', children: []});
        var goal2 = new Goal({title: 'goal2', children: [goal1], root: true});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal2]);

        goalListViewModel.addLevelToGoals();

        var goal1ParentStyle = goalListViewModel.convertToParentStyle(goal2);

        expect(ko.toJSON(goal1ParentStyle)).toBe('{"title":"goal1","parent_title":"goal2"}');
    });

    it("should convert goal with null parent to parent style", function () {
        var goal1 = new Goal({title: 'goal1', chidren: []});
        var goal2 = new Goal({title: 'goal2', children: ['goal1'], root: true});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goalListViewModel.addLevelToGoals();

        var goal2ParentStyle = goalListViewModel.convertToParentStyle(goal2);

        expect(ko.toJSON(goal2ParentStyle)).toBe('{"title":"goal2"}');

    });

    it("should add first goal as root", function () {
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.firstGoalTitle = 'test';
        goalListViewModel.addFirstGoal();

        expect(goalListViewModel.goals()[0].children()).toEqual([]);
        expect(goalListViewModel.goals()[0].root()).toBe(true);
        expect(goalListViewModel.goals()[0].level()).toBe(0);
        expect(goalListViewModel.goals()[0].title()).toBe('test');
    });

    it("should know goal title is NOT in error when its name has not been taken", function () {
        var goal1 = new Goal({title: 'goal1', chidren: [], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1]);

        goal1.newGoalTitle('goal2');

        expect(goal1.hasError()).toBe(false);
    });

    it("should know when goal title is in error because it has already been taken", function () {
        var goal1 = new Goal({title: 'goal1', chidren: [], root: true});
        var goal2 = new Goal({title: 'goal2', chidren: [], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goal2.newGoalTitle('goal1');

        expect(goal2.hasError()).toBe(true);
    });

    it("should not be ready to add if goal has no new goal title", function () {
        var goal1 = new Goal({title: 'goal1', chidren: [], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1]);

        goal1.newGoalTitle('');

        expect(goal1.readyToAdd()).toBe(false);
    });


    it("should not be ready to add if goal is using already used name", function () {
        var goal1 = new Goal({title: 'goal1', chidren: [], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1]);

        goal1.newGoalTitle('title');
        goal1.hasError(true);

        expect(goal1.readyToAdd()).toBe(false);
    });

    it("should be ready to add if goal contains both new goal title and is not in error", function () {
        var goal1 = new Goal({title: 'goal1', chidren: [], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1]);

        goal1.newGoalTitle('title');
        goal1.hasError(false);

        expect(goal1.readyToAdd()).toBe(true);
    });
});