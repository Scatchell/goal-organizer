class Goal < ActiveRecord::Base
  belongs_to :parent, class_name: 'Goal'

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

end
