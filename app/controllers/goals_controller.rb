# todo Add creation of sibling/child goal by clicking of arrows
# todo add heirarchy (each goal should belong to ONE other goal)
# todo make goals formatting look nicer
class GoalsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def all
  end

  def index
    goals = Goal.all

    @goals = goals.map do |goal|
      goal.prepare_for_send
    end

    render json: @goals
  end

  def update
    # todo remove find by title, make find by unique id or title and all children, or something
    goal_json = goal_params
    already_existing_goal = Goal.find_by_title(goal_json[:title])

    if already_existing_goal
      already_existing_goal.update(add_parent_to_params(goal_json))
      render json: {action: 'updated', title: goal_json[:title]}
    else
      @goal = Goal.new(add_parent_to_params(goal_json))

      if @goal.save
        render json: {action: 'created', title: goal_json[:title]}
      else
        render json: goal_json, notice: 'Goal not saved!'
      end
    end
  end


  def goal_params
    params[:goal].permit(:title, :parent_title)
  end

  private
  def add_parent_to_params(goal_params)
    parent_goal = Goal.find_by_title(goal_params[:parent_title])
    goal_params.delete :parent_title
    goal_params[:parent] = parent_goal
    goal_params
  end
end
