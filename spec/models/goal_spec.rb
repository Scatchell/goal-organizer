require 'rails_helper'

RSpec.describe Goal, :type => :model do
  it 'should select a random parent goal' do
    create(:goal)
    create(:goal)
    create(:goal)

    reminder_goal = Goal.select_reminder_parent_goal
    expect(reminder_goal).to be_a(Goal)
  end
end
