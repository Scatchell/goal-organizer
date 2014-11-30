class Goal < ActiveRecord::Base
  belongs_to :parent, class_name: 'Goal'

  def prepare_for_send
    root = self.parent.nil?
    children = Goal.where(parent: self)
    children_goals = children.map do |child|
      child.prepare_for_send
    end

    {
        title: self.title,
        children: children_goals,
        root: root

    }
  end

end
