require 'rails_helper'

RSpec.describe GoalsController, :type => :controller do

  describe 'Updating goals' do
    let(:test_title) { 'test' }

    it 'should create a goal if it does not exist' do
      parent_goal = create(:goal, title: 'parent_goal')

      expect {
        post :update, goal: {title: test_title, parent_title: parent_goal.title}
      }.to change(Goal, :count).by(1)

      expect(response).to have_http_status(:success)
      expected_hash = {action: 'created', title: 'test'}
      expect(response.body).to(eq(expected_hash.to_json))
    end

    it 'should update an existing goals title if it does exist' do
      parent_goal = create(:goal, title: 'parent_goal')

      create(:goal, title: test_title, parent: nil)

      expect {
        post :update, goal: {title: test_title, parent_title: parent_goal.title}
      }.to change(Goal, :count).by(0)

      expect(Goal.count).to eq(2)
      expect(Goal.last.title).to eq(test_title)
      expect(Goal.last.parent).to eq(parent_goal)

      expect(response).to have_http_status(:success)
      expect(response.body).to eq({action: 'updated', title: test_title}.to_json)
    end
  end

  describe 'Getting goals as json' do
    it 'should render all goals as json' do
      parent_goal = create(:goal, title: 'test-1')
      create(:goal, parent: parent_goal, title: 'test-2')

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      child_goal = goals[1]

      expect(goals[0]['title']).to eq('test-1')
      expect(goals[0]['children']).to eq([child_goal])
      expect(goals[0]['root']).to eq(true)

      expect(child_goal['title']).to eq('test-2')
      expect(child_goal['children']).to eq([])
      expect(child_goal['root']).to eq(false)
    end

    it 'should render multiple layers of goals correctly' do
      first_parent_goal_level_1 = create(:goal, title: 'test-1-parent')
      second_parent_goal_level_1 = create(:goal, title: 'test-2-parent')

      create(:goal, parent: second_parent_goal_level_1, title: 'test-5-child')
      first_child_goal_level_2 = create(:goal, parent: first_parent_goal_level_1, title: 'test-3-child')
      create(:goal, parent: first_parent_goal_level_1, title: 'test-4-child')

      child_goal_level_3 = create(:goal, parent: first_child_goal_level_2, title: 'test-6-child')
      create(:goal, parent: child_goal_level_3, title: 'test-7-child')

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      first_parent_goal = goals[0]
      expect(first_parent_goal['title']).to eq('test-1-parent')
      child_goal_level_2 = goals[3]
      expect(first_parent_goal['children']).to eq([child_goal_level_2, goals[4]])
      expect(first_parent_goal['root']).to eq(true)

      expect(child_goal_level_2['title']).to eq('test-3-child')
      obtained_child_goal_level_3 = goals[5]
      expect(child_goal_level_2['children']).to eq([obtained_child_goal_level_3])
      expect(child_goal_level_2['root']).to eq(false)

      expect(obtained_child_goal_level_3['title']).to eq('test-6-child')
      obtained_child_goal_level_4 = goals[6]
      expect(obtained_child_goal_level_3['children']).to eq([obtained_child_goal_level_4])
      expect(obtained_child_goal_level_3['root']).to eq(false)

      second_parent_goal = goals[1]
      expect(second_parent_goal['title']).to eq('test-2-parent')
      second_parent_child = goals[2]
      expect(second_parent_goal['children']).to eq([second_parent_child])
      expect(second_parent_goal['root']).to eq(true)
    end
  end

end
