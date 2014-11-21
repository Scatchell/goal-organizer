class RemoveLevel < ActiveRecord::Migration
  def change
    remove_column :goals, :level
  end
end
