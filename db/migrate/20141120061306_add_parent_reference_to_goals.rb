class AddParentReferenceToGoals < ActiveRecord::Migration
  def change
    add_belongs_to :goals, :parent, index: true
  end
end
