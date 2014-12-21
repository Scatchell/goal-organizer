# todo *important* add update functionality
# todo think about 'completion' of certain goals/tasks
# todo Add arrow images for creation of sibling/child goal?
# todo make goals formatting (css) look nicer
require 'pp'
class GoalsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def all
  end

  def index
    @goals = Goal.prepare_all_for_send

    render json: @goals
  end

  def update
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

  def random_parent_goal
    goal = Goal.select_reminder_parent_goal.prepare_for_send

    render json: goal
  end

  def reminder
  end


  def goal_params
    params[:goal].permit(:title, :parent_id, :id)
  end

  def worked_on_goal
    goal_worked_on = Goal.find(params[:id])

    goal_worked_on.increment_worked_for_week_by params[:amount]

    render nothing: true
  end

  private
  def add_parent_to_params(goal_params)
    parent_goal = Goal.find(goal_params[:parent_id]) if goal_params[:parent_id]
    goal_params.delete :parent_id
    goal_params[:parent] = parent_goal
    goal_params
  end
end
