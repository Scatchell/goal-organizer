require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the GoalsHelper. For example:
#
# describe GoalsHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe GoalsHelper, :type => :helper do
  describe 'Goal amount worked for week aggregator' do
    it 'should reset the amount worked for week when aggregator is run' do
      goal_one = create(:goal, worked_for_week: 2)
      goal_two = create(:goal, worked_for_week: 3)

      helper.aggregate_amount_worked_for_week

      expect(retrieve_goal(goal_one).worked_for_week).to eq(0)
      expect(retrieve_goal(goal_two).worked_for_week).to eq(0)
    end

    it 'should add the amount worked for week to existing total' do
      goal_one = create(:goal, worked_for_week: 2)
      goal_two = create(:goal, worked_for_week: 3, total_amount_worked: 5)

      helper.aggregate_amount_worked_for_week

      expect(retrieve_goal(goal_one).total_amount_worked).to eq(2)
      expect(retrieve_goal(goal_two).total_amount_worked).to eq(8)
    end

    it 'should do nothing to total if goals have not been marked worked on in the week' do
      goal_one = create(:goal)
      goal_two = create(:goal, total_amount_worked: 5)

      helper.aggregate_amount_worked_for_week

      expect(retrieve_goal(goal_one).total_amount_worked).to eq(0)
      expect(retrieve_goal(goal_two).total_amount_worked).to eq(5)
    end
  end

  def retrieve_goal(goal)
    Goal.find(goal.id)
  end
end

