require 'rails_helper'

RSpec.describe GoalsController, :type => :controller do

  describe 'Updating goals' do
    let(:test_title) { 'test' }

    it 'should create a goal if it does not exist' do
      parent_goal = create(:goal, title: 'parent_goal')

      expect {
        post :create, goal: {title: test_title, parent_id: parent_goal.id}
      }.to change(Goal, :count).by(1)

      expect(response).to have_http_status(:success)

      expected_hash = {action: 'created', title: 'test'}
      expect(response.body).to(eq(expected_hash.to_json))

      expect(Goal.last.title).to eq('test')
      expect(Goal.last.parent.title).to eq('parent_goal')
    end

    it 'should update an existing goals title if it does exist' do
      parent_goal = create(:goal, title: 'parent_goal')

      child_goal = create(:goal, title: test_title, parent: nil)

      new_title = 'new_title'
      expect {
        post :update, goal: {id: child_goal.id, title: new_title, parent_id: parent_goal.id}
      }.to change(Goal, :count).by(0)

      expect(Goal.count).to eq(2)
      expect(Goal.last.title).to eq(new_title)
      expect(Goal.last.parent).to eq(parent_goal)

      expect(response).to have_http_status(:success)
      expect(response.body).to eq({action: 'updated', title: new_title}.to_json)
    end
  end

  describe 'Getting goals as json' do
    it 'should render all goals as json' do
      parent_goal = create(:goal, title: 'test-1')
      create(:goal, parent: parent_goal, title: 'test-2')

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals.size).to eq(1)

      child_goal = goals.first['children'].first
      expect(child_goal['id']).to_not be_nil
      expect(child_goal['title']).to eq('test-2')
      expect(child_goal['children']).to eq([])
      expect(child_goal['root']).to eq(false)

      expect(goals[0]['id']).to_not be_nil
      expect(goals[0]['title']).to eq('test-1')
      expect(goals[0]['children']).to eq([child_goal])
      expect(goals[0]['root']).to eq(true)
    end

    it 'should render multiple layers of goals correctly' do
      first_parent_goal_level_1 = create(:goal, title: 'test-1-parent')
      second_parent_goal_level_1 = create(:goal, title: 'test-2-parent')

      create(:goal, parent: second_parent_goal_level_1, title: 'test-5-child')
      first_child_goal_level_2 = create(:goal, parent: first_parent_goal_level_1, title: 'test-3-child')
      second_child_goal_level_2 = create(:goal, parent: first_parent_goal_level_1, title: 'test-4-child')

      child_goal_level_3 = create(:goal, parent: first_child_goal_level_2, title: 'test-6-child')
      create(:goal, parent: child_goal_level_3, title: 'test-7-child')

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals.size).to eq(2)

      first_parent_goal = goals[0]
      expect(first_parent_goal['title']).to eq('test-1-parent')
      expect(first_parent_goal['children'].size).to eq(2)
      first_parent_children_titles = first_parent_goal['children'].map { |e| e['title'] }
      expect(first_parent_children_titles).to contain_exactly(first_child_goal_level_2.title, second_child_goal_level_2.title)
      expect(first_parent_goal['root']).to eq(true)

      second_parent_goal = goals[1]
      expect(second_parent_goal['title']).to eq('test-2-parent')
      expect(second_parent_goal['children'].size).to eq(1)
      second_parent_children_titles = second_parent_goal['children'].map { |e| e['title'] }
      expect(second_parent_children_titles).to eq(['test-5-child'])
      expect(second_parent_goal['root']).to eq(true)

      child_goal_level_2 = goals[0]['children'][0]
      expect(child_goal_level_2['title']).to eq('test-3-child')
      expect(child_goal_level_2['children'].size).to eq(1)
      expect(child_goal_level_2['children'][0]['title']).to eq('test-6-child')
      expect(child_goal_level_2['root']).to eq(false)


      obtained_child_goal_level_3 = child_goal_level_2['children'][0]
      expect(obtained_child_goal_level_3['title']).to eq('test-6-child')
      expect(obtained_child_goal_level_3['children'].size).to eq(1)
      expect(obtained_child_goal_level_3['children'][0]['title']).to eq('test-7-child')
      expect(obtained_child_goal_level_3['root']).to eq(false)
    end
  end

end
