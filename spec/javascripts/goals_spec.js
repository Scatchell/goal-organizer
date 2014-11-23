// include spec/javascripts/helpers/some_helper_file.js and app/assets/javascripts/foo.js
//= require goals
//1
//    2
//    3
//4
//    5
//        8
//6
//7
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
        goalListViewModel.newGoalTitle(newGoalTitle);
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

        goalListViewModel.newGoalTitle('new-goal-title');
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

        goalListViewModel.newGoalTitle('new-goal-title');
        goalListViewModel.addGoalAsChild(originalGoal);

        expect(goalListViewModel.goals()[2].level()).toBe(2);
        expect(goalListViewModel.goals()[1].children()).toEqual(['new-goal-title']);
    });

    it("should add new goal as a child", function () {
        var goal = new Goal({title: 'test', root: true});
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal]);

        goalListViewModel.newGoalTitle('test-goal-title');
        goalListViewModel.addGoalAsChild(goal);

        expect(goalListViewModel.goals().length).toBe(2);

        expect(goalListViewModel.goals()[1].title()).toBe('test-goal-title');
        expect(goalListViewModel.goals()[1].children()).toEqual([]);

        expect(goalListViewModel.goals()[0].children()).toEqual(['test-goal-title']);
        expect(goalListViewModel.goals()[0].root()).toBe(true);
    });

    //1
    //  3
    //     5
    //        6
    //2
    //  4

    it("should initiate all goals at proper levels and with correct children", function () {
        var goal6 = new Goal({title: 'goal6', children: []});
        var goal5 = new Goal({title: 'goal5', children: [goal6.title()]});
        var goal3 = new Goal({title: 'goal3', children: [goal5.title()]});
        var goal1 = new Goal({title: 'goal1', children: [goal3.title()], root: true});
        var goal4 = new Goal({title: 'goal4', children: []});
        var goal2 = new Goal({title: 'goal2', children: [goal4.title()], root: true});

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2, goal3, goal4, goal5, goal6]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(0);
        expect(goalsWithLevel[0].children()).toEqual(['goal3']);

        expect(goalsWithLevel[1].level()).toBe(1);
        expect(goalsWithLevel[1].children()).toEqual(['goal5']);

        expect(goalsWithLevel[2].level()).toBe(2);
        expect(goalsWithLevel[2].children()).toEqual(['goal6']);

        expect(goalsWithLevel[3].level()).toBe(3);
        expect(goalsWithLevel[3].children()).toEqual([]);

        expect(goalsWithLevel[4].level()).toBe(0);
        expect(goalsWithLevel[4].children()).toEqual(['goal4']);

        expect(goalsWithLevel[5].level()).toBe(1);
        expect(goalsWithLevel[5].children()).toEqual([]);


    });

    it("should give goals levels even if they are out of order", function () {
        var goal1 = new Goal({title: 'goal1', chidren: []});
        var goal2 = new Goal({title: 'goal2', children: ['goal1'], root: true});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(0);
        expect(goalsWithLevel[0].title()).toBe('goal2');
        expect(goalsWithLevel[0].children()).toEqual(['goal1']);

        expect(goalsWithLevel[1].level()).toBe(1);
        expect(goalsWithLevel[1].title()).toBe('goal1');
    });

    it("should convert goal with existing parent to parent style", function () {
        var goal1 = new Goal({title: 'goal1', chidren: []});
        var goal2 = new Goal({title: 'goal2', children: ['goal1'], root: true});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goalListViewModel.addLevelToGoals();

        var goal1ParentStyle = goalListViewModel.convertToParentStyle(goal1);

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
        goalListViewModel.newGoalTitle('test');
        goalListViewModel.addFirstGoal();

        expect(ko.toJSON(goalListViewModel.goals()[0])).toBe('{"title":"test","children":[],"root":true,"level":0}');
    });


    //it("should ", function () {
    //    var goal = new Goal({title:'test', root: 1})
    //    var gvm = new GoalListViewModel();
    //    var test = gvm.convertToParentStyle(goal);
    //    expect(test.level).toBe(undefined);
    //});
});