class GoalsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def all
  end

  def index
    @goals = Goal.all

    render json: @goals
  end

  def update
    already_existing_goal = Goal.find_by_title(goal_params[:title])
    if already_existing_goal
      already_existing_goal.update(goal_params)
      render json: {updated_title: goal_params[:title]}
    else
      @goal = Goal.new(goal_params)

      if @goal.save
        render json: {created_title: goal_params[:title]}
      else
        render json: goal_params, notice: 'Goal not saved!'
      end
    end
  end


  def goal_params
    params[:goal].permit(:title, :level)
  end
end
