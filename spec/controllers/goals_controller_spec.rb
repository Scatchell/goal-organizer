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
      expected_hash = {created_title: 'test'}
      expect(response.body).to(eq(expected_hash.to_json))
    end

    it 'should update an existing goal if does exist' do
      parent_goal = create(:goal, title: 'parent_goal')

      create(:goal, title: test_title, parent: nil)

      expect {
        post :update, goal: {title: test_title, parent_title: parent_goal.title}
      }.to change(Goal, :count).by(0)

      expect(Goal.count).to eq(2)
      expect(Goal.last.title).to eq(test_title)
      expect(Goal.last.parent).to eq(parent_goal)

      expect(response).to have_http_status(:success)
      expect(response.body).to eq({updated_title: test_title}.to_json)
    end
  end

  describe 'Getting goals as json' do
    it 'should list all goals as json' do
      parent_goal = create(:goal, title: 'test-1')
      create(:goal, parent: parent_goal, title: 'test-2')

      get :index

      expect(response).to have_http_status(:success)

      goals = JSON.parse(response.body)

      expect(goals[0]['title']).to eq('test-1')
      expect(goals[0]['children']).to eq(['test-2'])
      expect(goals[0]['root']).to eq(true)

      expect(goals[1]['title']).to eq('test-2')
      expect(goals[1]['children']).to eq([])
      expect(goals[1]['root']).to eq(false)
    end
  end

end
