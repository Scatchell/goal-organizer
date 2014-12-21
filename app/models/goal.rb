class Goal < ActiveRecord::Base
  belongs_to :parent, class_name: 'Goal'

  after_initialize :default_values

  def prepare_for_send
    root = self.parent.nil?

    children_ordered_by_date = self.children.order(:created_at)
    children_goals = children_ordered_by_date.map do |child|
      child.prepare_for_send
    end

    {
        id: self.id,
        title: self.title,
        children: children_goals,
        root: root

    }
  end

  def destroy_goal_and_all_children
    self.children.each do |child|
      child.destroy_goal_and_all_children
    end

    self.destroy
  end

  def children
    Goal.where(parent: self)
  end

  def self.prepare_all_for_send
    goals = self.parent_goals

    goals.map do |goal|
      goal.prepare_for_send
    end
  end

  def self.select_reminder_parent_goal
    self.parent_goals.sample
  end

  def self.parent_goals
    Goal.where(parent: nil).order(:created_at)
  end

  def increment_worked_for_week_by(amount)
    self.worked_for_week += amount.to_i
    self.save
  end

  private
  DEFAULT_AMOUNT = 0

  def default_values
    self.worked_for_week ||= DEFAULT_AMOUNT
    self.total_amount_worked ||= DEFAULT_AMOUNT
  end

end
