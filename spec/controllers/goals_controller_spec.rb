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

      expected_hash = {action: 'created', id: Goal.last.id}
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
      parent_goal = create(:goal, title: 'test-1', worked_for_week: 5)
      create(:goal, parent: parent_goal, title: 'test-2', total_amount_worked: 5)

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals.size).to eq(1)

      child_goal = goals.first['children'].first
      expect(child_goal['id']).to_not be_nil
      expect(child_goal['title']).to eq('test-2')
      expect(child_goal['children']).to eq([])
      expect(child_goal['workedForWeek']).to eq(0)
      expect(child_goal['totalAmountWorked']).to eq(5)
      expect(child_goal['root']).to eq(false)

      expect(goals[0]['id']).to_not be_nil
      expect(goals[0]['title']).to eq('test-1')
      expect(goals[0]['children']).to eq([child_goal])
      expect(goals[0]['workedForWeek']).to eq(5)
      expect(goals[0]['totalAmountWorked']).to eq(0)
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

      first_parent_goal = goals.select { |e| e['title'] == 'test-1-parent' }.first
      expect(first_parent_goal['title']).to eq('test-1-parent')
      expect(first_parent_goal['children'].size).to eq(2)
      first_parent_children_titles = first_parent_goal['children'].map { |e| e['title'] }
      expect(first_parent_children_titles).to contain_exactly(first_child_goal_level_2.title, second_child_goal_level_2.title)
      expect(first_parent_goal['root']).to eq(true)

      second_parent_goal = goals.select { |e| e['title'] == 'test-2-parent' }.first
      expect(second_parent_goal['title']).to eq('test-2-parent')
      expect(second_parent_goal['children'].size).to eq(1)
      second_parent_children_titles = second_parent_goal['children'].map { |e| e['title'] }
      expect(second_parent_children_titles).to eq(['test-5-child'])
      expect(second_parent_goal['root']).to eq(true)

      child_goal_level_2 = first_parent_goal['children'].select { |e| e['title'] == 'test-3-child' }.first
      expect(child_goal_level_2['title']).to eq('test-3-child')
      expect(child_goal_level_2['children'].size).to eq(1)
      expect(child_goal_level_2['children'][0]['title']).to eq('test-6-child')
      expect(child_goal_level_2['root']).to eq(false)


      obtained_child_goal_level_3 = child_goal_level_2['children'].select { |e| e['title'] == 'test-6-child' }.first
      expect(obtained_child_goal_level_3['title']).to eq('test-6-child')
      expect(obtained_child_goal_level_3['children'].size).to eq(1)
      expect(obtained_child_goal_level_3['children'][0]['title']).to eq('test-7-child')
      expect(obtained_child_goal_level_3['root']).to eq(false)
    end

    it 'should order parent goals based on the time of their creation' do
      first_goal = create(:goal, title: 'zzz', created_at: Time.now)
      second_goal = create(:goal, title: 'ddd', created_at: Time.now + 20)
      third_goal = create(:goal, title: 'aaa', created_at: Time.now + 40)

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals.size).to eq(3)

      first_retrieved_goal = goals.first
      expect(first_retrieved_goal['id']).to eq(first_goal.id)

      second_retrieved_goal = goals[1]
      expect(second_retrieved_goal['id']).to eq(second_goal.id)

      third_retrieved_goal = goals[2]
      expect(third_retrieved_goal['id']).to eq(third_goal.id)
    end

    it 'should order child goals based on the time of their creation' do
      parent_goal = create(:goal, title: 'parent-goal')

      first_goal = create(:goal, title: 'zzz', parent: parent_goal, created_at: Time.now)
      second_goal = create(:goal, title: 'ddd', parent: parent_goal, created_at: Time.now + 20)
      third_goal = create(:goal, title: 'aaa', parent: parent_goal, created_at: Time.now + 40)

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals.size).to eq(1)

      pp goals
      first_retrieved_goal = goals.first['children'].first
      expect(first_retrieved_goal['id']).to eq(first_goal.id)

      second_retrieved_goal = goals.first['children'][1]
      expect(second_retrieved_goal['id']).to eq(second_goal.id)

      third_retrieved_goal = goals.first['children'][2]
      expect(third_retrieved_goal['id']).to eq(third_goal.id)
    end

  end

  describe 'remove goals' do
    it 'should delete goals' do
      goal = create(:goal, title: 'goal')

      expect {
        delete :destroy, id: goal.id
      }.to change(Goal, :count).by(-1)

      expect(response).to have_http_status(:success)

      expected_hash = {action: 'deleted', id: goal.id}
      expect(response.body).to(eq(expected_hash.to_json))
    end

    it 'should delete goals and all their children' do
      parent_goal = create(:goal, title: 'parent-goal')
      child_goal_one = create(:goal, title: 'child-goal_one', parent: parent_goal)
      create(:goal, title: 'child-goal_two', parent: parent_goal)
      create(:goal, title: 'level-two-child-goal_one', parent: child_goal_one)

      expect {
        delete :destroy, id: parent_goal.id
      }.to change(Goal, :count).by(-4)

      expect(response).to have_http_status(:success)

      expected_hash = {action: 'deleted', id: parent_goal.id}
      expect(response.body).to(eq(expected_hash.to_json))
    end
  end

  describe 'choosing goals' do
    it 'should choose a random parent goal to remind user of' do
      parent_goal = create(:goal, title: 'goal1')

      get :random_parent_goal

      expect(response).to have_http_status(:success)

      goal_json = JSON.parse(response.body)

      expect(goal_json['id']).to eq(parent_goal.id)
      expect(goal_json['title']).to eq(parent_goal.title)
      expect(goal_json['children']).to eq([])
      expect(goal_json['root']).to eq(true)
    end
  end

  describe 'adding worked on time to goals' do
    let(:goal) { create(:goal) }

    it 'should create new goals with default amount worked for week of ZERO' do
      retrieved_goal = Goal.find(goal.id)
      expect(retrieved_goal.worked_for_week).to eq(0)
    end

    it 'should increase amount worked for week by 1' do
      put :worked_on_goal, id: goal.id, amount: 1

      expect(response).to have_http_status(:success)
      response_json = JSON.parse(response.body)

      expect(response_json['action']).to eq('updated_worked_on')
      expect(response_json['id']).to eq(goal.id)

      retrieved_goal = Goal.find(goal.id)
      expect(retrieved_goal.worked_for_week).to eq(1)
    end
  end
end
