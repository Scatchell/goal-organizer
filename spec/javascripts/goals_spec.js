// include spec/javascripts/helpers/some_helper_file.js and app/assets/javascripts/foo.js
//= require goals
describe('Goals', function() {
    it("should add new goal as a sibling to first level parent", function() {
        var goal = new Goal({title: 'test', parent_title: null}, 0);
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal]);

        var newGoalTitle = 'new-goal-title';
        goalListViewModel.newGoalTitle(newGoalTitle);
        goalListViewModel.addGoalAsSibling(goal);
        expect(goalListViewModel.goals().length).toBe(2);
        expect(goalListViewModel.goals()[1].title()).toBe(newGoalTitle);
        expect(goalListViewModel.goals()[1].level()).toBe(goal.level());
        expect(goalListViewModel.goals()[1].parent_title()).toBe(null);
    });

    it("should add new sibling goal at same level as original goal", function() {
        var parentGoal = new Goal({title: 'parent-goal', parent_title: null}, 0);
        var goal = new Goal({title: 'test', parent_title: parentGoal.title()}, 1);

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([parentGoal, goal]);

        goalListViewModel.newGoalTitle('new-goal-title');
        goalListViewModel.addGoalAsSibling(goal);

        expect(goalListViewModel.goals()[2].level()).toBe(1);
        expect(goalListViewModel.goals()[2].parent_title()).toBe('parent-goal');
    });

    it("should add new child goal at one level deeper than original goal", function() {
        var parentGoal = new Goal({title: 'parent-goal', parent_title: null}, 0);
        var goal = new Goal({title: 'second-goal', parent_title: parentGoal.title()}, 1);

        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([parentGoal, goal]);

        goalListViewModel.newGoalTitle('new-goal-title');
        goalListViewModel.addGoalAsChild(goal);

        expect(goalListViewModel.goals()[2].level()).toBe(2);
        expect(goalListViewModel.goals()[2].parent_title()).toBe('second-goal');
    });

    it("should add new goal as a child", function() {
        var goal = new Goal({title: 'test', parent_title: null});
        var goalListViewModel = new GoalListViewModel();
        goalListViewModel.goals([goal]);

        goalListViewModel.newGoalTitle('test-goal-title');
        goalListViewModel.addGoalAsChild(goal);
        expect(goalListViewModel.goals().length).toBe(2);
        expect(goalListViewModel.goals()[1].title()).toBe('test-goal-title');
        expect(goalListViewModel.goals()[1].parent_title()).toBe('test');
    });


    it("should initiate all goals at proper levels", function() {
        var goal1 = new Goal({title: 'goal1', parent_title: null});
        var goal2 = new Goal({title: 'goal2', parent_title: null});

        var goal3 = new Goal({title: 'goal3', parent_title: goal1.title()});
        var goal4 = new Goal({title: 'goal4', parent_title: goal1.title()});

        var goal5 = new Goal({title: 'goal5', parent_title: goal4.title()});

        var goal6 = new Goal({title: 'goal6', parent_title: goal5.title()});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2, goal3, goal4, goal5, goal6]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(0);
        expect(goalsWithLevel[1].level()).toBe(0);
        expect(goalsWithLevel[2].level()).toBe(1);
        expect(goalsWithLevel[3].level()).toBe(1);
        expect(goalsWithLevel[4].level()).toBe(2);
        expect(goalsWithLevel[5].level()).toBe(3);
    });

    it("should give goals levels even if they are out of order", function() {
        var goal1 = new Goal({title: 'goal1', parent_title: 'goal2'});
        var goal2 = new Goal({title: 'goal2', parent_title: null});


        var goalListViewModel = new GoalListViewModel();

        goalListViewModel.goals([goal1, goal2]);

        goalListViewModel.addLevelToGoals();

        var goalsWithLevel = goalListViewModel.goals();

        expect(goalsWithLevel[0].level()).toBe(1);
        expect(goalsWithLevel[1].level()).toBe(0);
    });

});