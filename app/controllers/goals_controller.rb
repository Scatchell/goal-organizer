# todo Add arrow images for creation of sibling/child goal?
# todo make goals formatting (css) look nicer
require 'pp'
class GoalsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def all
  end

  def index
    goals = Goal.where(parent: nil)

    @goals = goals.map do |goal|
      goal.prepare_for_send
    end

    render json: @goals
  end

  def update
    # todo remove find by title, make find by unique id or title and all children, or something
    goal_json = goal_params
    already_existing_goal = Goal.find(goal_json[:id])

    if already_existing_goal
      already_existing_goal.update(add_parent_to_params(goal_json))
      render json: {action: 'updated', title: goal_json[:title]}
    else
      # todo do error message return handling
      render json: goal_json, notice: 'No goal found - cannot update!'
    end
  end


  def create
    # todo extract goal_json assignment to before filter?
    goal_json = goal_params
    @goal = Goal.new(add_parent_to_params(goal_json))

    if @goal.save
      render json: {action: 'created', id: @goal.id}
    else
      render json: @goal, notice: 'Goal not saved!'
    end
  end

  def destroy
    goal_to_destroy = Goal.find(params[:id])

    goal_to_destroy.destroy_goal_and_all_children

    render json: {action: 'deleted', id: goal_to_destroy.id}
  end


  def goal_params
    params[:goal].permit(:title, :parent_id, :id)
  end

  private
  def add_parent_to_params(goal_params)
    parent_goal = Goal.find(goal_params[:parent_id]) if goal_params[:parent_id]
    goal_params.delete :parent_id
    goal_params[:parent] = parent_goal
    goal_params
  end
end
