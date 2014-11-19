require 'rails_helper'

RSpec.describe GoalsController, :type => :controller do

  describe 'Updating goals' do
    it 'should create a goal if it doesnt exist' do
      test_title = 'test'

      expect {
        post :update, goal: {title: test_title, level: 0}
      }.to change(Goal, :count).by(1)

      expect(response).to have_http_status(:success)
      expect(response.body).to eq("{\"created_title\":\"test\"}")
    end

    it 'should update an existing goal if does exist' do
      test_title = 'test'

      create(:goal, title: test_title, level: 1)

      expect(Goal.count).to eq(1)

      expect {
        post :update, goal: {title: test_title, level: 0}
      }.to change(Goal, :count).by(0)

      expect(Goal.count).to eq(1)
      expect(Goal.last.title).to eq(test_title)
      expect(Goal.last.level).to eq(0)

      expect(response).to have_http_status(:success)
      expect(response.body).to eq("{\"updated_title\":\"#{test_title}\"}")
    end
  end

end
