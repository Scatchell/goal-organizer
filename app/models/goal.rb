class Goal < ActiveRecord::Base
  belongs_to :parent, class_name: 'Goal'
end
